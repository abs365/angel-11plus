import type { BankQuestion } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Educational Increment 006, Parts 12-14 — exposure intelligence and
 * spaced retrieval. Reuses lib/ali/history.ts's real, existing
 * fetchStudentHistory() output unchanged (StudentQuestionHistoryRow) and
 * ali_question_bank's family_id — no new learner-history table, no
 * parallel learner model, exactly as instructed. All aggregation happens
 * in application code from data the app already fetches, not a new SQL
 * view.
 *
 * Retrieval-stage thresholds below are explicitly disclosed as
 * defensible provisional intervals, not scientifically calibrated
 * spacing (the directive's own instruction: "do not claim scientifically
 * exact intervals unless evidence supports them"). Configurable via
 * RETRIEVAL_INTERVAL_DAYS so a future increment can tune them once real
 * usage data exists.
 */
export const RETRIEVAL_INTERVAL_DAYS = {
  /** Below this many days since a family was last seen, a securely-mastered family is not yet due for a spaced check. */
  maintenanceWindow: 14,
};

export type RetrievalStage =
  | "NEW"
  | "IMMEDIATE_REMEDIATION"
  | "SHORT_TERM_RETRIEVAL"
  | "SPACED_RETRIEVAL"
  | "MASTERY_MAINTENANCE";

export interface FamilyExposure {
  familyId: string;
  /** Number of distinct items from this family the learner has attempted at least once. */
  count: number;
  lastExposureAt: string | null;
  lastOutcome: boolean | null;
  masteryState: StudentQuestionHistoryRow["masteryState"] | null;
}

/**
 * Aggregates a learner's real, existing per-item history into per-family
 * exposure, keyed by the MOST RECENTLY seen item in each family (so
 * "last exposure" genuinely means the family's own most recent contact,
 * not an arbitrary item within it).
 */
export function computeFamilyExposure(
  candidatePool: BankQuestion[],
  history: Map<string, StudentQuestionHistoryRow>
): Map<string, FamilyExposure> {
  const byFamily = new Map<string, FamilyExposure>();

  for (const q of candidatePool) {
    if (!q.familyId) continue;
    const row = history.get(q.id);
    if (!row || row.timesSeen === 0) continue;

    const existing = byFamily.get(q.familyId);
    if (!existing) {
      byFamily.set(q.familyId, {
        familyId: q.familyId,
        count: 1,
        lastExposureAt: row.lastPresentedAt,
        lastOutcome: row.lastAttemptCorrect,
        masteryState: row.masteryState,
      });
      continue;
    }

    existing.count += 1;
    if (!existing.lastExposureAt || row.lastPresentedAt > existing.lastExposureAt) {
      existing.lastExposureAt = row.lastPresentedAt;
      existing.lastOutcome = row.lastAttemptCorrect;
      existing.masteryState = row.masteryState;
    }
  }

  return byFamily;
}

function daysSince(isoDate: string, now: Date): number {
  return (now.getTime() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Classifies a family's retrieval stage, per the directive's 4-stage
 * policy (Part 13):
 *   A. IMMEDIATE_REMEDIATION — recent incorrect performance. Always
 *      prioritised for return, regardless of elapsed time, since a
 *      family the learner just got wrong should come back soon.
 *   B. SHORT_TERM_RETRIEVAL — correct so far but not yet secure
 *      (masteryState "learning"/"weak"). Moderate-high priority.
 *   C. SPACED_RETRIEVAL — securely mastered, and the maintenance window
 *      has elapsed: due for a genuine check-in.
 *   D. MASTERY_MAINTENANCE — securely mastered, recently confirmed:
 *      correctly deprioritised, never permanently suppressed (a family
 *      moves back to SPACED_RETRIEVAL once the window elapses again).
 */
export function classifyRetrievalStage(exposure: FamilyExposure | undefined, now: Date = new Date()): RetrievalStage {
  if (!exposure || exposure.count === 0) return "NEW";
  if (exposure.lastOutcome === false) return "IMMEDIATE_REMEDIATION";

  const isSecure = exposure.masteryState === "mastered";
  if (!isSecure) return "SHORT_TERM_RETRIEVAL";

  const elapsed = exposure.lastExposureAt ? daysSince(exposure.lastExposureAt, now) : Infinity;
  return elapsed >= RETRIEVAL_INTERVAL_DAYS.maintenanceWindow ? "SPACED_RETRIEVAL" : "MASTERY_MAINTENANCE";
}

/**
 * Selection-weight multiplier per stage (Part 14, anti-memorisation
 * selection) — never zero, so no family is permanently suppressed, per
 * the directive's explicit instruction. NEW and IMMEDIATE_REMEDIATION
 * are prioritised highest; MASTERY_MAINTENANCE is deprioritised but
 * remains selectable.
 */
export const RETRIEVAL_STAGE_WEIGHT: Record<RetrievalStage, number> = {
  NEW: 3,
  IMMEDIATE_REMEDIATION: 4,
  SHORT_TERM_RETRIEVAL: 2,
  SPACED_RETRIEVAL: 2,
  MASTERY_MAINTENANCE: 0.5,
};
