import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { CompetencyId, QuestionTypeId } from "./types";
import { fetchQuestionBank } from "@/lib/ali/questionBank";
import { fetchStudentHistory, ensureAdaptiveState } from "@/lib/ali/history";
import { selectQuestions } from "@/lib/ali/selection";
import { generateExplanation } from "@/lib/ali/explainability";
import { competencyLabel } from "@/lib/ali/labels";
import { getTargetExamDate } from "@/lib/progress";
import { getRecommendations } from "./educationalIntelligenceService";
import { QUESTION_TYPE_PRIMARY_COMPETENCY, getQuestionTypesForCompetency } from "./assessmentBrainMap";
import { getPracticeArea, type PracticeAreaId } from "./practiceContent";
import { classifyRetrievalStage, computeFamilyExposure, groupingKeyOf, passageGroupingKeyOf, type FamilyExposure } from "@/lib/ali/exposureIntelligence";

/**
 * Personalised Session Generation (Sprint 3, ANGEL-CSSE-002A). Single entry
 * point replacing static "fetch every tagged question" selection in
 * app/learning-intelligence/practice/[area]/page.tsx.
 *
 * Founder Decision (recorded here, not re-litigated per sprint): competency
 * ranking below uses ONLY Educational State, Evidence Confidence, review
 * history, and examination relevance — exactly what getRecommendations()
 * already computes. Cross-competency prerequisite ranking is intentionally
 * excluded: LEARNING_ENGINE_V1.md explicitly and repeatedly forbids
 * asserting cross-competency prerequisite/developmental relationships
 * ("no asset in this evidence base could support such a claim"), and the one
 * schema field that could carry it (BankQuestion.transferLinks) is
 * unpopulated in every real seeded row. Reconsider only after a separately-
 * approved, evidence-backed dependency model exists.
 *
 * Reuses lib/ali/selection.ts's selectQuestions() completely unmodified —
 * the real, tested cooldown/weak-skill-override/mastered-resurface engine
 * already built for the old ALI/GL adaptive mocks. The only new work is
 * feeding it a CSSE-correct priority signal (getRecommendations(), already
 * fixed for Question-Type-ID resolution in Sprint 2) instead of the coarse,
 * old-model-only deriveWeakCompetencies() signal that engine was built with.
 *
 * Family Choice Pilot (controlled implementation increment) — the
 * `familyFocusCompetencyId` parameter is the choice-injection point
 * ASSESSMENT_TO_LEARNING_CLOSED_LOOP_DESIGN.md identified. It is optional
 * and additive: every existing caller (the live Practice pages) omits it
 * and this function behaves exactly as before, byte-for-byte. When a
 * caller does pass one (today, only the isolated
 * app/learning-intelligence/founder-validation/family-choice route), its
 * Question Types are unioned into the same `weakSkills` set
 * selectQuestions() already accepts from Angel's own evidence-based
 * `priority` — never replacing it, never generating a fabricated
 * RecommendationCandidate, never touching result.ordered/explanations
 * (Angel's own recommendation stays exactly what it already was). Two
 * honesty constraints, both real:
 *   1. Wellbeing-veto-aware — if `result.vetoedCompetencyCodes` (computed
 *      by the unmodified Tier 0 mechanism, WP-21A) already contains the
 *      chosen competency, this function refuses to inject it. The
 *      wellbeing veto is the one mechanism this pilot must never be able
 *      to bypass, by design, with no override path of any kind.
 *   2. Area-scoped — if the chosen competency has no Question Types
 *      tagged in this practice area's content, injection is a harmless
 *      no-op (weakSkills.add() on codes that never appear in `tagged`),
 *      and `familyFocus.applied` reports `false` honestly rather than
 *      claiming an effect that couldn't happen.
 */

/** Capped at 1 review-due competency per session — a disclosed judgement
 * call, not a limitation of the underlying signal — so a genuine review
 * doesn't crowd out every other priority in a small session. */
const REVIEW_SLOT_CAP = 1;

export interface SessionActivity {
  question: BankQuestion;
  /** Plain-English, learner-facing reason this activity was selected (Deliverable 5 — Explainable Session Planning). Never a raw competency/tier code. */
  explanation: string;
}

/** Family Choice Pilot — honest report of what happened with a caller-supplied familyFocusCompetencyId, never a claim of effect that didn't occur. */
export interface FamilyFocusSessionInfo {
  competencyId: CompetencyId;
  label: string;
  /** True only when the competency was both un-vetoed AND relevant to this area's content, and was actually unioned into weakSkills this session. */
  applied: boolean;
  /** True when injection was withheld specifically because Tier 0 (WP-21A) currently vetoes this competency — the wellbeing veto is authoritative and was not bypassed. */
  wellbeingPaused: boolean;
}

export interface PersonalisedSession {
  activities: SessionActivity[];
  /** Parent/learner-facing overview of why today's session looks like this — reuses the same "parent" audience explanation Sprint 2 already wired for the Parent Dashboard, not new copy. Always describes Angel's own recommendation; never overwritten by a family choice. */
  summary: string;
  /** Present only when a caller passed familyFocusCompetencyId. Coexists with `summary` (Angel's own view) — never merges or overwrites it. */
  familyFocus?: FamilyFocusSessionInfo;
  /**
   * Educational Increment 007U, Part 3 (Problem B) — true only when this
   * area has zero Practice Eligible content right now (`activities` is
   * empty for that reason, not a genuine error). Lets a caller render a
   * distinct "not yet ready" state instead of a generic error/retry UI —
   * retrying cannot help here, and the previous unconditional `throw new
   * Error(session.summary)` surfaced `summary`'s internal wording
   * (migration numbers, "database") directly to the learner. `summary`
   * itself is also written to stay honest and non-technical either way,
   * so a caller that doesn't check this flag still shows a safe message.
   */
  noContentAvailable?: boolean;
}

/**
 * Family/Learning-Unit-aware Practice selection (Educational Increment
 * 004 §12; generalised beyond family_id in Educational Increment 007A —
 * English Scale Foundation). A pure post-processing pass over
 * selectQuestions()'s own output — deliberately NOT a change to
 * lib/ali/selection.ts's cooldown/weak-skill-override engine itself (real,
 * previously tested, reused unmodified from the old ALI/GL adaptive
 * mocks).
 *
 * Groups by `groupingKeyOf()` (lib/ali/exposureIntelligence.ts) —
 * `familyId` where populated (Mathematics sibling variants), falling back
 * to `learningUnitId` where it isn't (Reading Comprehension's shared
 * passage id). The fallback is inert for every subject where
 * `learningUnitId === id` (VR, Mathematics), so this is a genuine
 * generalisation, not new subject-specific behaviour: it keeps at most one
 * item per group within a single session, swapping the extra item(s) for
 * any not-yet-selected candidate from a different group. If no such
 * candidate exists (small pool, or every alternative already selected),
 * the repeat is left in place rather than forced — this is a genuine
 * diversity preference, not a hard constraint that could make a session
 * impossible to fill. Distinct from cross-session item-level cooldown
 * (lib/ali/selection.ts), which this does not touch or duplicate.
 *
 * `keyFn` defaults to `groupingKeyOf` — every existing caller's behaviour
 * is byte-for-byte unchanged. Educational Increment 007S calls this a
 * second time with `passageGroupingKeyOf` (lib/ali/exposureIntelligence.ts)
 * as a genuinely separate pass, so a session can be free of BOTH
 * family-level AND passage-level clustering — the same mechanism reused,
 * not a parallel selector.
 */
export function reduceFamilyClustering(
  selected: BankQuestion[],
  candidatePool: BankQuestion[],
  keyFn: (q: BankQuestion) => string | undefined = groupingKeyOf
): BankQuestion[] {
  const familyCounts = new Map<string, number>();
  for (const q of selected) {
    const key = keyFn(q);
    if (!key) continue;
    familyCounts.set(key, (familyCounts.get(key) ?? 0) + 1);
  }
  const overRepresented = [...familyCounts.entries()].filter(([, count]) => count > 1);
  if (overRepresented.length === 0) return selected;

  const selectedIds = new Set(selected.map((q) => q.id));
  const result = [...selected];
  // Every group currently present in `result`, kept in sync as swaps
  // happen. Without this, a swap that resolves one over-represented
  // group could introduce a fresh collision with a *different* group
  // already sitting elsewhere in the session — the outer loop only
  // revisits groups that were over-represented in the original
  // selection, so a newly-introduced collision would otherwise go
  // undetected and unfixed.
  const presentGroups = new Set<string>();
  for (const q of result) {
    const key = keyFn(q);
    if (key) presentGroups.add(key);
  }

  for (const [groupKey, count] of overRepresented) {
    let excess = count - 1; // keep exactly one representative per group, swap the rest
    for (let i = result.length - 1; i >= 0 && excess > 0; i--) {
      if (keyFn(result[i]) !== groupKey) continue;
      // Prefer a candidate that is itself a distinct, real group not
      // already present anywhere in the session — a genuine
      // diversification signal — over an untagged (no group key)
      // candidate, which is merely "not this group" by omission. Only
      // fall back to an untagged candidate when no such alternative
      // exists, so the swap target isn't decided by pool array order.
      const replacement =
        candidatePool.find((c) => {
          const cKey = keyFn(c);
          return !selectedIds.has(c.id) && !!cKey && !presentGroups.has(cKey);
        }) ?? candidatePool.find((c) => !selectedIds.has(c.id) && keyFn(c) !== groupKey);
      if (!replacement) continue; // no distinct-group alternative available; leave the repeat
      selectedIds.delete(result[i].id);
      selectedIds.add(replacement.id);
      result[i] = replacement;
      const replacementKey = keyFn(replacement);
      if (replacementKey) presentGroups.add(replacementKey);
      excess--;
    }
  }
  return result;
}

/**
 * Anti-memorisation selection, spaced-retrieval-aware (Educational
 * Increment 006 Part 14). A second, independent additive swap pass after
 * reduceFamilyClustering() — deliberately kept separate rather than
 * merged into one function, so each pass's own behaviour stays testable
 * in isolation. Swaps a MASTERY_MAINTENANCE family (recently confirmed
 * secure, correctly deprioritised) for a NEW, IMMEDIATE_REMEDIATION, or
 * due SPACED_RETRIEVAL alternative when one exists and isn't already
 * selected — never a hard exclusion (a securely-mastered family can
 * still appear if no better alternative exists), matching the
 * directive's explicit "do not permanently suppress" instruction.
 *
 * `keyFn` defaults to `groupingKeyOf` — every existing caller's behaviour
 * is byte-for-byte unchanged. Educational Increment 007S calls this a
 * second time with `passageGroupingKeyOf`, using a passage-keyed exposure
 * map, so a recently-confirmed passage can be swapped out even when the
 * question asking about it belongs to a family that itself is NEW.
 */
export function applyRetrievalPriority(
  selected: BankQuestion[],
  candidatePool: BankQuestion[],
  exposureByFamily: Map<string, FamilyExposure>,
  now: Date = new Date(),
  keyFn: (q: BankQuestion) => string | undefined = groupingKeyOf
): BankQuestion[] {
  const stageOf = (q: BankQuestion): ReturnType<typeof classifyRetrievalStage> => {
    const key = keyFn(q);
    return classifyRetrievalStage(key ? exposureByFamily.get(key) : undefined, now);
  };

  const selectedIds = new Set(selected.map((q) => q.id));
  const result = [...selected];

  for (let i = 0; i < result.length; i++) {
    if (stageOf(result[i]) !== "MASTERY_MAINTENANCE") continue;
    const replacement = candidatePool.find((c) => {
      if (selectedIds.has(c.id)) return false;
      const stage = stageOf(c);
      return stage === "NEW" || stage === "IMMEDIATE_REMEDIATION" || stage === "SPACED_RETRIEVAL";
    });
    if (!replacement) continue; // no due/unseen alternative available; leave the maintenance item in place
    selectedIds.delete(result[i].id);
    selectedIds.add(replacement.id);
    result[i] = replacement;
  }

  return result;
}

function daysUntilFromTargetExamDate(now: Date): number | null {
  const targetIso = getTargetExamDate();
  if (!targetIso) return null;
  const diffMs = new Date(targetIso).getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/** Plain, honest captions for selection reasons that have no corresponding
 * RecommendationCandidate (mastered/durably-mastered competencies are
 * deliberately excluded from getRecommendations()'s output — Sprint 2's
 * judgement call 3 — so there is no candidate to generate real Engine text
 * from for these buckets). Never invents a confidence/evidence claim. */
function fallbackExplanation(reason: string): string {
  switch (reason) {
    case "unseen":
      return "New practice, building your first evidence here.";
    case "eligible-seen":
      return "A question you've worked on before, for more practice.";
    case "mastered-resurface":
      return "A quick refresher on something you've already mastered.";
    default:
      return "Extra practice to round out today's session.";
  }
}

/**
 * Decision 258 (Continuous Writing Practice Delivery Gap) — a real, live
 * check for whether a Practice area currently has ANY practice_eligible
 * content, reusing the exact same eligibility-filtered fetchQuestionBank()
 * call and "QT-" tagging predicate generatePersonalisedSession() below
 * already applies before its own noContentAvailable early-return. Exists
 * so app/learning-intelligence/practice/page.tsx (the area SELECTOR, one
 * step before a session is ever generated) can show an honest "being
 * prepared" state instead of presenting an area as available when it
 * cannot deliver anything — proven necessary because Continuous Writing's
 * 7 real QT-WC-01a prompts are all on the Mock-governance track
 * (authentic_assessment_candidate / independently_validated), never
 * practice_eligible (see fetchQuestionBank()'s own docstring, corrected
 * Decision 152). Generic across all three areas, not special-cased to
 * Writing: any area with zero practice_eligible tagged content reports
 * false here, and this reverses automatically the moment a Founder
 * decision actually promotes real content onto the Practice track.
 */
export async function areaHasPracticeContent(
  supabase: SupabaseClient<Database>,
  areaId: PracticeAreaId
): Promise<boolean> {
  const area = getPracticeArea(areaId);
  if (!area) return false;
  const bank = await fetchQuestionBank(supabase, area.subject, "csse");
  return bank.some((q) => q.skill.startsWith("QT-"));
}

export async function generatePersonalisedSession(
  supabase: SupabaseClient<Database>,
  profileId: string,
  areaId: PracticeAreaId,
  now: Date = new Date(),
  familyFocusCompetencyId?: CompetencyId
): Promise<PersonalisedSession> {
  const area = getPracticeArea(areaId);
  if (!area) {
    return { activities: [], summary: "Unknown practice area." };
  }

  const bank = await fetchQuestionBank(supabase, area.subject, "csse");
  const tagged = bank.filter((q) => q.skill.startsWith("QT-"));
  if (tagged.length === 0) {
    return {
      activities: [],
      summary: "This practice area is still being prepared and does not yet have questions ready for practice.",
      noContentAvailable: true,
    };
  }

  const competencyIds = new Set(
    tagged
      .map((q) => QUESTION_TYPE_PRIMARY_COMPETENCY[q.skill as QuestionTypeId])
      .filter((id): id is CompetencyId => Boolean(id))
  );

  const daysUntilExam = daysUntilFromTargetExamDate(now);
  const result = await getRecommendations(supabase, profileId, Array.from(competencyIds), now, daysUntilExam);

  const reviewDue = result.ordered.filter((c) => c.triggerReason === "review-due").slice(0, REVIEW_SLOT_CAP);
  const priority = result.ordered.filter((c) => c.triggerReason !== "review-due");

  const history = await fetchStudentHistory(supabase, profileId);
  const currentSequence = await ensureAdaptiveState(supabase, profileId);

  // Review Scheduling (Deliverable 3) — resolve a real, calendar-overdue
  // "review-due" candidate into an actual previously-mastered question,
  // reserved ahead of the general selection pool below. If no mastered
  // question exists yet for that competency, the candidate is simply
  // dropped here — never fabricated into a review activity that isn't real.
  const reviewActivities: SessionActivity[] = [];
  const reservedIds = new Set<string>();
  for (const candidate of reviewDue) {
    const skillCodes = getQuestionTypesForCompetency(candidate.competencyCode as CompetencyId);
    const masteredCandidates = tagged
      .filter((q) => skillCodes.includes(q.skill as QuestionTypeId) && history.get(q.id)?.masteryState === "mastered")
      .sort((a, b) => {
        const aTime = new Date(history.get(a.id)!.lastPresentedAt).getTime();
        const bTime = new Date(history.get(b.id)!.lastPresentedAt).getTime();
        return aTime - bTime; // oldest (most overdue) first
      });
    const question = masteredCandidates[0];
    if (!question) continue;

    reservedIds.add(question.id);
    reviewActivities.push({
      question,
      explanation: generateExplanation(candidate, "learner").text,
    });
  }

  // Competency Prioritisation -> question selection (Deliverables 1, 2, 4).
  // getRecommendations() already excludes mastered/durably-mastered
  // competencies (no honest trigger to recommend them), so `priority` is
  // simply "every competency the Engine currently flags," in its
  // already-computed rank order.
  const weakSkills = new Set<QuestionTypeId>(
    priority.flatMap((c) => getQuestionTypesForCompetency(c.competencyCode as CompetencyId))
  );

  // Family Choice Pilot — choice-injection point (see this module's
  // docstring). Computed after `weakSkills` so a family's choice is
  // additive, never a substitute for Angel's own evidence-based signal.
  let familyFocus: FamilyFocusSessionInfo | undefined;
  if (familyFocusCompetencyId) {
    const vetoed = result.vetoedCompetencyCodes.includes(familyFocusCompetencyId);
    const focusSkillCodes = getQuestionTypesForCompetency(familyFocusCompetencyId);
    const relevantToThisArea = focusSkillCodes.some((qt) => tagged.some((q) => q.skill === qt));
    const applied = !vetoed && relevantToThisArea;
    if (applied) {
      for (const qt of focusSkillCodes) weakSkills.add(qt);
    }
    familyFocus = {
      competencyId: familyFocusCompetencyId,
      label: competencyLabel(familyFocusCompetencyId),
      applied,
      wellbeingPaused: vetoed,
    };
  }

  const remainingSlots = Math.max(0, area.sessionSize - reviewActivities.length);
  const candidatePool = tagged.filter((q) => !reservedIds.has(q.id));
  const selection = selectQuestions(candidatePool, history, currentSequence, weakSkills, remainingSlots);
  const familyDiversifiedQuestions = reduceFamilyClustering(selection.questions, candidatePool);
  // Passage-level diversification (Educational Increment 007S, Part 4) —
  // a second, independent pass over the SAME reduceFamilyClustering()
  // mechanism, keyed by passageGroupingKeyOf() instead of groupingKeyOf().
  // Root cause (007R, re-confirmed live this increment): every named
  // English family now carries its own family_id, so the family-level pass
  // above can no longer see that two DIFFERENT families both draw on the
  // same passage — this pass restores that visibility without touching
  // Mathematics/VR behaviour (passageGroupingKeyOf() is undefined for
  // every non-English question, an inert no-op there, exactly like the
  // original family fallback's own documented inertness).
  const diversifiedQuestions = reduceFamilyClustering(familyDiversifiedQuestions, candidatePool, passageGroupingKeyOf);
  // Exposure intelligence / spaced retrieval (Educational Increment 006
  // Parts 12-14) — computed from the same real history this function
  // already fetched; no second history read, no parallel learner model.
  const familyExposure = computeFamilyExposure(candidatePool, history);
  const familyRetrievalPrioritisedQuestions = applyRetrievalPriority(diversifiedQuestions, candidatePool, familyExposure, now);
  // Passage-level spaced retrieval (007S, Part 4) — same generalisation
  // as above, applied to the cross-session deprioritisation pass too, so
  // a passage recently confirmed via ONE family can still deprioritise a
  // different, otherwise-NEW family that happens to share the same text.
  const passageExposure = computeFamilyExposure(candidatePool, history, passageGroupingKeyOf);
  const retrievalPrioritisedQuestions = applyRetrievalPriority(familyRetrievalPrioritisedQuestions, candidatePool, passageExposure, now, passageGroupingKeyOf);

  const candidateByCompetency = new Map(priority.map((c) => [c.competencyCode, c] as const));
  const priorityActivities: SessionActivity[] = retrievalPrioritisedQuestions.map((question) => {
    const trace = selection.trace.find((t) => t.questionId === question.id);
    const competencyId = QUESTION_TYPE_PRIMARY_COMPETENCY[question.skill as QuestionTypeId];
    const candidate = competencyId ? candidateByCompetency.get(competencyId) : undefined;
    const explanation = candidate
      ? generateExplanation(candidate, "learner").text
      : fallbackExplanation(trace?.selectionReason ?? "fallback-shortfall");
    return { question, explanation };
  });

  const topCandidate = result.ordered[0];
  const summary = topCandidate
    ? generateExplanation(topCandidate, "parent").text
    : "Today's session is a general practice mix across this area.";

  return { activities: [...reviewActivities, ...priorityActivities], summary, familyFocus };
}
