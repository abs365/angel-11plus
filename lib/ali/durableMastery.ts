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
 * Evaluates AEP-005 §10's three conditions for Durable Mastery.
 *
 * Condition 1 takes WP-06's `validated` output (lib/ali/masteryValidation.ts
 * — mastery_threshold met AND Confidence tier >= Moderate), not the raw
 * `mastery_state` string directly. This is a refinement made per Programme
 * Decision APD-025 (Derived State Hierarchy): Durable Mastery is the
 * strongest claim this whole architecture makes, and AEP-005 §9's own
 * principle — that a threshold-met-but-weakly-evidenced result "must not be
 * treated identically to a Moderate-or-above result for downstream
 * purposes" — applies with the most force here, not least. Consuming raw
 * `mastery_state` directly would let a Low-confidence mastery claim (e.g.
 * threshold met entirely on a guessable-format question, DEF-001) feed the
 * strongest claim in the system; consuming WP-06's `validated` boolean
 * closes that gap. A competency that failed a Maintenance Review has
 * already had its underlying mastery_state revoked by the existing,
 * unmodified mechanism (Decision 20/21) before this function is ever
 * called, so `validated` would already be false in that case too — no
 * separate failure handling is needed here.
 */
export function evaluateDurableMastery(
  validated: boolean,
  maintenanceReviews: MaintenanceReviewRecord[],
  transferCorroboration: TransferCorroboration
): boolean {
  if (!validated) return false;

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
