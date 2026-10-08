import type { BankQuestion } from "@/types/ali/questionBank";
import { selectRemediationAction, type RemediationAction, type RemediationContext } from "./remediationPolicy";

/**
 * CSSE Completion, Priority 1 -- live remediation inside a Practice session.
 *
 * What was wired before: the session was generated once, up front, as a fixed list. A wrong answer changed nothing
 * about what the learner saw next, and `remediationPolicy.ts` only fired from the dashboard's "rebuilding"
 * regression signal, with five of its six inputs hardcoded false.
 *
 * What this adds (Practice only -- Mock never imports this module):
 *  - a session-local outcome log, from which "consecutive failures in this question family" is a real signal;
 *  - the support ladder: strategic hint -> worked reasoning -> explicit re-teaching, escalating only on repeated
 *    failure in the SAME family, and never revealing the live question's answer before submission;
 *  - queue reordering so a failed family is not immediately re-served: the next item comes from a different
 *    family where one exists (a different structure, not the same skeleton with new numbers);
 *  - `deriveFamilyCapabilities`, which supplies the remediation policy's previously hardcoded-false inputs from
 *    the real question bank where the bank can answer them.
 *
 * Honesty rules: a "family" is used as a conservative stand-in for a "skeleton" (a family can hold several
 * skeletons), so the ladder may escalate slightly early rather than claim a specific misconception. Angel does not
 * diagnose WHY an answer was wrong here; the support offered is deliberately the broader strategy.
 * `hasPrerequisiteCompetencyWithWeakEvidence` stays false: the only prerequisite graph in the codebase
 * (COMPETENCY_RELATIONSHIPS) has no edges for the CSSE MR/RC/WC competencies, so it cannot answer the question.
 */

export interface SessionOutcome {
  questionId: string;
  familyId?: string;
  competencyId?: string;
  correct: boolean;
  supportTier: "independent" | "supported";
}

/** Real, bank-derived facts about a family (see deriveFamilyCapabilities). */
export interface FamilyCapabilities {
  hasMultipleBlueprints: boolean;
  hasAlternativeRepresentation: boolean;
  hasMisconceptionTargeted: boolean;
}

type PromptMeta = { blueprintId?: unknown; contextTag?: unknown; representationType?: unknown };

/**
 * Derives what the real question bank can say about each family. All three facts are about the AVAILABLE
 * content, never about the learner's reasoning:
 *  - hasMultipleBlueprints: the family's items come from more than one blueprint id;
 *  - hasAlternativeRepresentation: more than one context tag / representation type among its items;
 *  - hasMisconceptionTargeted: at least one item carries authored misconception text.
 */
export function deriveFamilyCapabilities(bank: BankQuestion[]): Map<string, FamilyCapabilities> {
  const blueprints = new Map<string, Set<string>>();
  const representations = new Map<string, Set<string>>();
  const misconception = new Set<string>();
  const families = new Set<string>();
  for (const q of bank) {
    const f = q.familyId;
    if (!f) continue;
    families.add(f);
    const meta = (q.prompt ?? {}) as PromptMeta;
    if (typeof meta.blueprintId === "string") (blueprints.get(f) ?? blueprints.set(f, new Set()).get(f)!).add(meta.blueprintId);
    const rep = typeof meta.contextTag === "string" ? meta.contextTag : typeof meta.representationType === "string" ? meta.representationType : undefined;
    if (rep) (representations.get(f) ?? representations.set(f, new Set()).get(f)!).add(rep);
    if (q.addressesMisconception && q.addressesMisconception.trim()) misconception.add(f);
  }
  const out = new Map<string, FamilyCapabilities>();
  for (const f of families) {
    out.set(f, {
      hasMultipleBlueprints: (blueprints.get(f)?.size ?? 0) > 1,
      hasAlternativeRepresentation: (representations.get(f)?.size ?? 0) > 1,
      hasMisconceptionTargeted: misconception.has(f),
    });
  }
  return out;
}

/**
 * The trailing run of wrong answers in a family, most recent first. A correct answer in the family ends the run;
 * attempts in other families neither extend nor break it (the run is about this family).
 */
export function consecutiveFamilyFailures(log: SessionOutcome[], familyId: string | undefined): number {
  if (!familyId) return 0;
  let n = 0;
  for (let i = log.length - 1; i >= 0; i--) {
    const o = log[i];
    if (o.familyId !== familyId) continue;
    if (o.correct) break;
    n++;
  }
  return n;
}

export type SupportStep = "none" | "strategic_hint" | "worked_reasoning" | "explicit_reteach";

export interface InSessionSupportPlan {
  step: SupportStep;
  /** The remediation policy's own recommendation for the same evidence -- recorded for transparency and tests. */
  policyAction: RemediationAction;
  consecutiveFailures: number;
}

export interface SupportInput {
  consecutiveFailures: number;
  /** A worked example / worked method exists for this family (safe, separate scenario -- never the live answer). */
  hasWorkedContent: boolean;
  /** A full lesson exists for this family's competency. */
  hasFullLesson: boolean;
  capabilities?: FamilyCapabilities;
}

export function planInSessionSupport(input: SupportInput): InSessionSupportPlan {
  const { consecutiveFailures: n, hasWorkedContent, hasFullLesson, capabilities } = input;
  const context: RemediationContext = {
    consecutiveFailuresOnSameSkeleton: n,
    hasFullLessonAvailable: hasFullLesson,
    hasPrerequisiteCompetencyWithWeakEvidence: false,
    hasMisconceptionTargetedBlueprintAvailable: capabilities?.hasMisconceptionTargeted ?? false,
    hasAlternativeRepresentationAvailable: capabilities?.hasAlternativeRepresentation ?? false,
    hasMultipleBlueprintsInFamily: capabilities?.hasMultipleBlueprints ?? false,
  };
  const policyAction = selectRemediationAction(context);

  let step: SupportStep = "none";
  if (n >= 3 && hasFullLesson) step = "explicit_reteach";
  else if (n >= 2 && hasWorkedContent) step = "worked_reasoning";
  else if (n >= 3 && hasWorkedContent) step = "worked_reasoning";
  else if (n >= 1) step = "strategic_hint";
  return { step, policyAction, consecutiveFailures: n };
}

export interface QueueItem {
  id: string;
  familyId?: string;
  competencyId?: string;
}

/**
 * After a wrong answer, avoid immediately re-serving the same family: if the next remaining item is from the
 * failed family and a remaining item from a different family exists, bring the earliest such item forward
 * (preferring the same competency, so the skill stays in focus). Relative order of everything else is kept and
 * no item is added or dropped -- session length is unchanged. A no-op when there is nothing to swap with.
 */
export function reorderRemainingAfterFailure<T extends QueueItem>(
  remaining: T[],
  failed: { familyId?: string; competencyId?: string }
): T[] {
  if (!failed.familyId || remaining.length < 2) return remaining;
  if (remaining[0].familyId !== failed.familyId) return remaining;
  const sameCompetency = remaining.findIndex(
    (q, i) => i > 0 && q.familyId !== failed.familyId && failed.competencyId !== undefined && q.competencyId === failed.competencyId
  );
  const anyDifferent = remaining.findIndex((q, i) => i > 0 && q.familyId !== failed.familyId);
  const pick = sameCompetency !== -1 ? sameCompetency : anyDifferent;
  if (pick === -1) return remaining;
  const next = remaining.slice();
  const [item] = next.splice(pick, 1);
  next.unshift(item);
  return next;
}
