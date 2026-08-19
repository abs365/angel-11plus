import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { EducationalStateQuestionEvidence, EducationalState } from "@/types/ali/educationalState";
import { computeEducationalState } from "@/lib/ali/educationalState";
import { computeCompetencyConfidence } from "@/lib/ali/confidence";
import { validateCompetencyMastery } from "@/lib/ali/masteryValidation";
import { isMaintenanceReviewDue } from "@/lib/ali/durableMastery";
import { fetchDurableMasteryRecord } from "@/lib/ali/persistence/durableMasteryStore";

/**
 * Work Package WP-18 (IWP-002) — Educational State Runtime Integration.
 * Wires WP-08's computeEducationalState() (unmodified) to real
 * ali_question_bank + ali_student_question_history data via WP-17's
 * persistence adapters, plus two genuinely new aggregation rules this
 * work package introduces — documented explicitly as new, not silently
 * assumed to follow from an existing one, since no prior document
 * specifies how a multi-question competency's per-question mastery_state
 * or per-question last_presented_at should combine into one
 * competency-level signal.
 *
 * Per Programme Decision APD-039 (Persistence as an Adapter): every
 * function in this module either fetches/aggregates real data or calls an
 * existing, unmodified educational function — none of it contains new
 * educational reasoning. The two aggregation rules below are the
 * exception worth naming explicitly, since they are new *rules*, not pure
 * I/O — see each function's own docstring for why the specific rule was
 * chosen.
 */

interface StateHistoryRow {
  question_id: string;
  times_seen: number;
  distinct_correct_sessions: number;
  last_attempt_correct: boolean | null;
  mastery_state: string;
  last_presented_at: string;
  last_attempt_verified: boolean | null;
}
interface StateQuestionMeta {
  id: string;
  mastery_threshold: number;
  confidence_weight: number;
}

/**
 * New aggregation rule (WP-18): a competency's mastery_state is derived
 * from its constituent questions' individual mastery_state values, using
 * the same "any question qualifies" principle WP-06's thresholdMet check
 * already established for mastery threshold — "mastered" if any
 * constituent question is mastered, else "weak" if any is weak (mirroring
 * the existing per-question weak-skill detection this signal already
 * drives elsewhere, lib/replayEngine.ts), else "learning" if any has been
 * attempted at all, else "new".
 */
export function deriveCompetencyMasteryState(perQuestionStates: string[]): string {
  if (perQuestionStates.includes("mastered")) return "mastered";
  if (perQuestionStates.includes("weak")) return "weak";
  if (perQuestionStates.some((s) => s !== "new")) return "learning";
  return "new";
}

/**
 * New aggregation rule (WP-18): a competency's Maintenance Review is due
 * if ANY of its mastered questions individually qualifies per WP-07's
 * isMaintenanceReviewDue() — consistent with "mastered" itself being an
 * any-question signal (above), a review-due signal at the same "any"
 * granularity keeps the two rules consistent with each other rather than
 * introducing a different aggregation philosophy for a closely related
 * concept.
 */
export function deriveReviewDue(
  masteredQuestionLastPresentedAt: string[],
  now: Date
): boolean {
  return masteredQuestionLastPresentedAt.some((ts) => isMaintenanceReviewDue(ts, now));
}

/**
 * Defect correction (Sprint 1, ANGEL-CSSE-002A integration): accepts the
 * caller-resolved list of skill values (Question Type IDs for CSSE
 * competencies; a single-element `[competencyCode]` for the older ALI
 * system) rather than assuming `skill === competencyCode` — see
 * competencyEvidence.ts's identical correction for the full rationale. No
 * real caller existed before this fix (confirmed by repo-wide search).
 */
async function fetchCompetencyStateEvidence(
  supabase: SupabaseClient<Database>,
  profileId: string,
  skillCodes: string[]
): Promise<{ evidence: EducationalStateQuestionEvidence[]; masteryState: string; reviewDue: boolean }> {
  if (skillCodes.length === 0) return { evidence: [], masteryState: "new", reviewDue: false };

  const { data: questions, error: questionsError } = await supabase
    .from("ali_question_bank")
    .select("id, mastery_threshold, confidence_weight")
    .in("skill", skillCodes);

  if (questionsError || !questions || questions.length === 0) {
    if (questionsError) console.warn("[ALI] fetchCompetencyStateEvidence (question lookup) failed:", questionsError.message);
    return { evidence: [], masteryState: "new", reviewDue: false };
  }

  const questionIds = questions.map((q: StateQuestionMeta) => q.id);
  // Stage 2 Educational Integrity Correction — select("*") rather than an
  // explicit column list, matching lib/ali/history.ts's recordOutcome()
  // resilience convention: a hand-picked list naming last_attempt_verified
  // would fail this entire query outright on a database that has not yet
  // applied migration 076, breaking Educational State computation for
  // every competency, not just this fix. select("*") degrades gracefully —
  // the column is simply absent (undefined) pre-migration, read as
  // verified=true below, identical to this function's pre-fix behaviour.
  const { data: history, error: historyError } = await supabase
    .from("ali_student_question_history")
    .select("*")
    .eq("profile_id", profileId)
    .in("question_id", questionIds);

  if (historyError) {
    console.warn("[ALI] fetchCompetencyStateEvidence (history lookup) failed:", historyError.message);
    return { evidence: [], masteryState: "new", reviewDue: false };
  }

  const historyByQuestionId = new Map((history ?? []).map((h: StateHistoryRow) => [h.question_id, h]));

  const evidence: EducationalStateQuestionEvidence[] = questions.map((q: StateQuestionMeta) => {
    const row = historyByQuestionId.get(q.id);
    return {
      questionId: q.id,
      timesSeen: row?.times_seen ?? 0,
      distinctCorrectSessions: row?.distinct_correct_sessions ?? 0,
      masteryThreshold: q.mastery_threshold,
      confidenceWeight: q.confidence_weight,
      lastAttemptCorrect: row?.last_attempt_correct ?? null,
      // Stage 2 Educational Integrity Correction — undefined (column not
      // yet migrated) and null (no attempt yet, or a genuine pre-migration
      // attempt with unknown provenance) both read as verified=true, the
      // conservative default that narrows evidence only where a real
      // self-assessed attempt is actually on record.
      verified: row?.last_attempt_verified ?? true,
    };
  });

  const perQuestionStates = (history ?? []).map((h: StateHistoryRow) => h.mastery_state);
  const masteryState = deriveCompetencyMasteryState(perQuestionStates);

  const masteredTimestamps = (history ?? [])
    .filter((h: StateHistoryRow) => h.mastery_state === "mastered")
    .map((h: StateHistoryRow) => h.last_presented_at);
  const reviewDue = deriveReviewDue(masteredTimestamps, new Date());

  return { evidence, masteryState, reviewDue };
}

/**
 * The full runtime pipeline: real data in, computeEducationalState()'s
 * real label out. Every educational function called here
 * (computeCompetencyConfidence, validateCompetencyMastery,
 * fetchDurableMasteryRecord, computeEducationalState) is unmodified from
 * its own work package.
 */
export async function computeRealEducationalState(
  supabase: SupabaseClient<Database>,
  profileId: string,
  competencyCode: string,
  skillCodes: string[] = [competencyCode]
): Promise<EducationalState> {
  const { evidence, masteryState, reviewDue } = await fetchCompetencyStateEvidence(
    supabase,
    profileId,
    skillCodes
  );

  const confidenceInput = { competencyCode, questions: evidence };
  const confidenceTier = computeCompetencyConfidence(confidenceInput);
  const { validated } = validateCompetencyMastery(confidenceInput);

  const durableRecord = await fetchDurableMasteryRecord(supabase, profileId, competencyCode);
  const durable = durableRecord?.durable ?? false;

  return computeEducationalState({
    competencyCode,
    questions: evidence,
    confidenceTier,
    masteryState,
    validated,
    durable,
    reviewDue,
  });
}
