import type {
  MaintenanceReviewRecord,
  TransferCorroboration,
} from "@/types/ali/durableMastery";

/**
 * Work Package WP-07 (Implementation Programme) — Durable Mastery
 * Processing. Implements AEP-004 §9.6 / AEP-005 §10 / EAW-002 §8. This is a
 * batch/lower-frequency component by design — it must never sit on the
 * real-time critical path of an active practice or mock session (EAW-002
 * §8, §10), consistent with this project's standing "no live server
 * round-trips inside an exam runner" constraint.
 *
 * Calibration provenance (per Programme Decision APD-017/APD-022):
 * MAINTENANCE_REVIEW_INTERVAL_DAYS is the exact parameter
 * CALIBRATION_TRACEABILITY_REGISTER.md flagged as "Not yet implemented...
 * review trigger: before Durable Mastery Processing is implemented" — this
 * is that trigger being reached, and the value below is the provisional
 * assignment, not a final calibrated finding.
 */
const MAINTENANCE_REVIEW_INTERVAL_DAYS = 14;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Whether a mastered question/competency is due for a Maintenance Review —
 * a genuine calendar gap since it was last presented, computed directly
 * from `ali_student_question_history.last_presented_at` (a real, already-
 * captured timestamp — no new capture required). Pure function; `now` is
 * an explicit parameter so this is independently testable without relying
 * on the system clock.
 */
export function isMaintenanceReviewDue(lastPresentedAt: string, now: Date): boolean {
  const gapMs = now.getTime() - new Date(lastPresentedAt).getTime();
  const gapDays = gapMs / MS_PER_DAY;
  return gapDays >= MAINTENANCE_REVIEW_INTERVAL_DAYS;
}

/**
 * Evaluates AEP-005 §10's three conditions for Durable Mastery. Condition 1
 * (currently `mastered`) is read from the existing, unmodified
 * `mastery_state` mechanism (lib/ali/mastery.ts) — a competency that failed
 * a Maintenance Review has already had its mastery_state revoked by that
 * same existing mechanism (an ordinary incorrect attempt, per Decision
 * 20/21) before this function is ever called, so a failed review does not
 * need separate handling here: condition 1 already fails naturally.
 */
export function evaluateDurableMastery(
  masteryState: string,
  maintenanceReviews: MaintenanceReviewRecord[],
  transferCorroboration: TransferCorroboration
): boolean {
  const currentlyMastered = masteryState === "mastered";
  if (!currentlyMastered) return false;

  const survivedGenuineGapReview = maintenanceReviews.some(
    (r) => r.correct && r.daysSinceLastEvidence >= MAINTENANCE_REVIEW_INTERVAL_DAYS
  );
  if (!survivedGenuineGapReview) return false;

  // Condition 3 (AEP-005 §10): only required when a real transfer link
  // exists. `linkedCompetencyCode === null` means no strong link exists for
  // this competency (AEP-002 §10) — Durable Mastery then rests on
  // conditions 1-2 alone, per AEP-005 §10's explicit exception.
  if (transferCorroboration.linkedCompetencyCode !== null) {
    return transferCorroboration.corroborated === true;
  }

  return true;
}
