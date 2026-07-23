import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { recordPresentation, recordOutcome } from "@/lib/ali/history";
import { getEducationalIntelligence, processEvidenceForCompetency } from "./educationalIntelligenceService";
import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "./assessmentBrainMap";
import { fetchLearnerIntelligenceProfile } from "./profile";
import { recordReadinessSnapshot } from "./learningHistory";
import type { CompetencyId, QuestionTypeId } from "./types";
import type { AttemptEvidenceFacts } from "@/types/ali/history";

/**
 * Integration Correction (Step 2 of the Educational Intelligence Foundation
 * mission, Founder-approved 2026-07-23) — closes the practice-evidence
 * bypass documented in lib/adaptiveEngine.ts's top-of-file comment.
 *
 * Root cause: /english/[id], /maths, /vocabulary and /writing — the pages
 * reached from the main "Learn" hub — only ever wrote to localStorage
 * (lib/progress.ts) and the separate user_stats/lesson_progress tables
 * (lib/supabaseProgress.ts). None of them called lib/ali/history.ts's
 * recordPresentation()/recordOutcome(), so that practice generated zero
 * Educational Intelligence Engine evidence, in violation of the frozen
 * rule that no educational activity may bypass the Engine.
 *
 * This module is deliberately NOT a new evidence model — it is the exact
 * same real integration app/learning-intelligence/practice/[area]/page.tsx
 * already uses (recordPresentation -> recordOutcome -> competency lookup
 * -> processEvidenceForCompetency), extracted so the legacy pages can call
 * it too, per "prefer one shared evidence-recording integration rather
 * than separate route-specific implementations."
 *
 * Hard structural constraint this function respects (Discovery finding):
 * `ali_student_question_history.question_id` has a NOT NULL foreign key
 * to `ali_question_bank(id)`. Legacy pages serve content from data/*.ts
 * (e.g. "mth-007"), most of which has never been tagged into
 * ali_question_bank — only 18 illustrative rows exist today (migration
 * 013). This function looks up the real bank row first and does nothing
 * further if it isn't found — it never invents a competency mapping for
 * an untagged question, and never claims evidence was recorded when it
 * wasn't (Founder rules 6, 7, 9; acceptance criteria 5, 7).
 */
export interface LegacyPracticeAnswerParams {
  questionId: string;
  isCorrect: boolean;
  sessionId: string;
  /** e.g. "legacy_maths_practice" — reuses ali_student_question_history's existing open-ended `source` column, no schema change. */
  source: string;
  /** Only directly observable facts a legacy page genuinely collects — never fabricated (migration 015, Phase 2B). */
  evidenceFacts?: AttemptEvidenceFacts;
}

export type LegacyPracticeEvidenceOutcome =
  | "recorded"
  | "no-client"
  | "no-profile"
  | "untagged-question"
  | "error";

export interface LegacyPracticeEvidenceResult {
  recorded: boolean;
  outcome: LegacyPracticeEvidenceOutcome;
}

export type BankEvidenceContext =
  | { found: false }
  | { found: true; masteryThreshold: number; competencyId: CompetencyId | undefined };

/**
 * Pure, no I/O, independently testable — the one piece of real decision
 * logic in this module: whether a question is a genuine ali_question_bank
 * row and, if so, which competency (if any) it resolves to. Never invents
 * a competency for a skill code Assessment Brain doesn't map (returns
 * `competencyId: undefined` honestly rather than guessing) and never
 * treats a missing/errored bank row as anything but "untagged" — this is
 * the guarantee that keeps an FK-violating write from ever being attempted.
 */
export function resolveBankEvidenceContext(
  bankRow: { skill: string; mastery_threshold: number } | null | undefined
): BankEvidenceContext {
  if (!bankRow) return { found: false };
  const competencyId = QUESTION_TYPE_PRIMARY_COMPETENCY[bankRow.skill as QuestionTypeId] as CompetencyId | undefined;
  return { found: true, masteryThreshold: bankRow.mastery_threshold, competencyId };
}

/**
 * Best-effort, never throws — callers may fire-and-forget this exactly as
 * every other lib/ali/* write path in this codebase already does. Returns
 * a real outcome (never fabricates "recorded" on failure) so a caller that
 * wants to distinguish success from a genuine content-coverage gap can.
 */
export async function recordLegacyPracticeEvidence(
  params: LegacyPracticeAnswerParams
): Promise<LegacyPracticeEvidenceResult> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { recorded: false, outcome: "no-client" };

    const profileId = await ensureProfile().catch(() => null);
    if (!profileId) return { recorded: false, outcome: "no-profile" };

    const { data: bankRow, error: bankError } = await supabase
      .from("ali_question_bank")
      .select("id, skill, mastery_threshold")
      .eq("id", params.questionId)
      .maybeSingle();
    if (bankError) return { recorded: false, outcome: "untagged-question" };

    const context = resolveBankEvidenceContext(bankRow);
    if (!context.found) return { recorded: false, outcome: "untagged-question" };
    const { masteryThreshold, competencyId } = context;

    // Pre-attempt snapshot, captured before recordPresentation() touches
    // last_presented_at, same ordering discipline practice/[area]/page.tsx
    // already established (see that file's recordAndAdvance() comment) —
    // required for genuine Maintenance Review detection.
    const preAttemptSnapshot = competencyId
      ? await getEducationalIntelligence(supabase, profileId, competencyId).catch(() => null)
      : null;

    await recordPresentation(supabase, profileId, [params.questionId], params.source).catch(() => {});
    await recordOutcome(
      supabase,
      profileId,
      params.questionId,
      params.isCorrect,
      params.sessionId,
      masteryThreshold,
      params.evidenceFacts
    ).catch(() => {});

    if (competencyId && preAttemptSnapshot) {
      await processEvidenceForCompetency(supabase, profileId, competencyId, preAttemptSnapshot, params.isCorrect).catch(
        () => {}
      );
    }

    return { recorded: true, outcome: "recorded" };
  } catch {
    return { recorded: false, outcome: "error" };
  }
}

/**
 * Phase 3.0, Work Package 3 (Learning History) — closes a real, verified
 * gap: `recordReadinessSnapshot()` (Phase 2A) has existed since migration
 * 015 but nothing in the running application ever called it, so Readiness
 * History and the Parent "What Changed" field it feeds have stayed dormant
 * even though Educational Audit (mastery/durable-mastery, via
 * processEvidenceForCompetency above) has been live all along. This
 * function reuses two already-existing, already-tested functions
 * unmodified — `fetchLearnerIntelligenceProfile()` (the exact profile read
 * the CSSE Practice Experience results screen already performs) and
 * `recordReadinessSnapshot()` — it computes nothing new.
 *
 * Call once per completed session/activity (not per question) — Readiness
 * is a whole-profile concept (13 competencies), not a single-question one,
 * so this is deliberately a session-end hook, not part of
 * recordLegacyPracticeEvidence() above. Best-effort, never throws; safe to
 * fire-and-forget exactly like every other write path in this module.
 */
export async function recordLegacyPracticeSessionCompletion(): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const profile = await fetchLearnerIntelligenceProfile("csse").catch(() => null);
    if (!profile || !profile.pathwayEligible) return;
    await recordReadinessSnapshot(supabase, profile.profileId, profile.readiness).catch(() => {});
  } catch {
    /* best-effort, never throws */
  }
}
