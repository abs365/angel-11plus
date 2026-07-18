import type { EducationalState, EducationalStateInput } from "@/types/ali/educationalState";

/**
 * Work Package WP-08 (Implementation Programme) — Educational State
 * Coordination. Implements EAW-004 §3's 8-state model as a pure, derived
 * label — never independently stored, never shown to a learner or parent.
 *
 * Per Programme Decision APD-025 (Derived State Hierarchy) and this work
 * package's explicit "do not duplicate educational conclusions already
 * computed by upstream components" requirement: `confidenceTier` (WP-05),
 * `masteryState` (the existing, unmodified mechanism), `validated` (WP-06)
 * and `durable`/`reviewDue` (WP-07) are all consumed exactly as computed
 * upstream — none of the four is recomputed here. Only two genuinely new
 * derivations happen in this module, because no upstream layer already
 * exposes them: `recentlyRevoked` (a just-lost-mastery signal) and
 * `progressRatio` (how close un-mastered evidence is to its own
 * threshold) — both computed directly from real, already-captured
 * per-question fields, no new data capture required.
 */

/** Below this fraction of progress-toward-threshold, a competency is treated as early-stage practice rather than approaching mastery. Provisional (Programme Decision APD-017/APD-022 traceability applies — see CALIBRATION_TRACEABILITY_REGISTER.md). */
const APPROACHING_THRESHOLD_RATIO = 0.5;

function computeProgressRatio(questions: EducationalStateInput["questions"]): number {
  if (questions.length === 0) return 0;
  return Math.max(
    ...questions.map((q) => (q.masteryThreshold > 0 ? q.distinctCorrectSessions / q.masteryThreshold : 0))
  );
}

function computeRecentlyRevoked(questions: EducationalStateInput["questions"]): boolean {
  // A question that has already accumulated enough distinct correct
  // sessions to meet its own threshold, but whose most recent attempt was
  // wrong, is exactly the signature of mastery just having been revoked by
  // the existing, unmodified mechanism (Decision 20/21) — not a new
  // concept, a direct read of data that mechanism already produces.
  return questions.some(
    (q) => q.distinctCorrectSessions >= q.masteryThreshold && q.lastAttemptCorrect === false
  );
}

export function computeEducationalState(input: EducationalStateInput): EducationalState {
  const { questions, confidenceTier, masteryState, validated, durable, reviewDue } = input;

  // Highest priority: a competency that was mastery-eligible and has just
  // reverted must never be silently absorbed into an ordinary early-stage
  // label — it needs its own distinct coordination signal.
  if (computeRecentlyRevoked(questions)) return "rebuilding";

  // Reviewing applies to a Mastered or Durably Mastered competency whose
  // Maintenance Review has become due (EAW-004 §3) — checked before either
  // of those two labels so it correctly takes priority over both. Requires
  // `validated`, not just the raw masteryState, for the same reason the
  // next two branches do.
  if (reviewDue && ((masteryState === "mastered" && validated) || durable)) return "reviewing";

  if (durable) return "durably-mastered";

  // A raw masteryState of "mastered" is NOT sufficient on its own — per
  // AEP-005 §9 (the exact principle DEF-001 and WP-07's refinement both
  // already enforce), a mastered claim resting on low-confidence evidence
  // (e.g. threshold met entirely on a guessable-format question) must not
  // be treated as equivalent to a validated one. An unvalidated "mastered"
  // reading is coordinated as still Reinforcing, not Mastered — it has
  // real evidence, just not yet evidence strong enough to trust fully.
  if (masteryState === "mastered") {
    return validated ? "mastered" : "reinforcing";
  }

  if (confidenceTier === "insufficient") return "exploring";
  if (confidenceTier === "moderate") return "reinforcing";

  // confidenceTier === "low" (threshold not yet met by any question, or
  // capped there by a guessable-format result, per lib/ali/confidence.ts)
  const progressRatio = computeProgressRatio(questions);
  return progressRatio >= APPROACHING_THRESHOLD_RATIO ? "practising" : "building-knowledge";
}
