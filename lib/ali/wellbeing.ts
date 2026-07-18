import type {
  WellbeingSignalInput,
  WellbeingSignalResult,
} from "@/types/ali/wellbeing";

/**
 * Work Package WP-21A (IWP-002) — the real Wellbeing Signal evaluator,
 * implementing the three conditions WP-21_WELLBEING_DESIGN.md §6 named and
 * WELLBEING_SIGNAL_CONTRACT.md §3 formalised as thresholds. Pure function,
 * no I/O — matches every other lib/ali/* module's convention.
 *
 * Governing constraint (Programme Decision APD-042, Educational Scope
 * Protection): this function supports learning-behaviour pacing only. It
 * never diagnoses, never infers a medical or psychological condition,
 * never performs safeguarding assessment, and never proposes third-party
 * contact — its only possible outputs are a pacing veto (or not) and a
 * plain, non-clinical parent-facing phrase already fixed by
 * types/ali/wellbeing.ts.
 *
 * Calibration provenance (APD-017/APD-022/APD-041): none of the three
 * conditions below have been validated against real learner data — this
 * is stated in WP-21 and WELLBEING_SIGNAL_CONTRACT.md and is not upgraded
 * by this implementation existing.
 */

/** WP-21 §6 Condition A. Provisional — see CALIBRATION_TRACEABILITY_REGISTER.md. */
const COMPOUNDING_FAILURE_THRESHOLD = 3;

/**
 * Condition A — Compounding failure. Requires *all* of: at least
 * COMPOUNDING_FAILURE_THRESHOLD recent attempts recorded for this specific
 * competency, every one of the most recent N being incorrect, and the
 * competency not being the learner's first-ever contact with it.
 *
 * "Not the learner's first-ever contact" (WP-21 §6's own phrasing) is
 * operationalised here as `currentEducationalState !== "exploring"` —
 * "exploring" (WP-08) is specifically the state a competency holds at
 * Insufficient Evidence / first contact, so excluding it is the most
 * direct reading of WP-21's intent available from the signals this
 * contract actually defines. This is a judgement call, documented as one,
 * not an unstated assumption.
 */
function checkCompoundingFailure(input: WellbeingSignalInput): boolean {
  const relevant = input.recentAttempts.filter(
    (a) => a.competencyCode === input.competencyCode
  );
  if (relevant.length < COMPOUNDING_FAILURE_THRESHOLD) return false;

  const mostRecent = relevant.slice(-COMPOUNDING_FAILURE_THRESHOLD);
  const allIncorrect = mostRecent.every((a) => !a.correct);
  if (!allIncorrect) return false;

  return input.currentEducationalState !== "exploring";
}

/**
 * Condition B — Mastery reversal amid low engagement. Requires *both*
 * signals together (compounding evidence, per Programme Decision APD-044
 * item 5) — neither the Educational State reverting alone, nor a negative
 * Learning Gain trend alone, is sufficient on its own.
 */
function checkMasteryReversalLowEngagement(input: WellbeingSignalInput): boolean {
  return input.currentEducationalState === "rebuilding" && input.learningGainTrend === "negative";
}

/**
 * Condition C — Session abandonment pattern. The underlying data capture
 * (session start/completion tracking) does not exist anywhere in this
 * codebase and is explicitly out of scope for WP-21A (Programme Decision
 * APD-044 item 9) — this function still implements the *evaluation logic*
 * WELLBEING_SIGNAL_CONTRACT.md §3 defines, because the contract already
 * specifies it and a future capture implementation should not also need
 * to write this check. Critically: `sessionAbandonmentCount === undefined`
 * (the real, current, permanent state of this input until capture is
 * built) must never be coerced to 0 or treated as "checked and found
 * false" — the condition is genuinely unevaluable, and this function
 * returns `false` for "does not fire," which is correct, but the
 * *reason* it returns false (no data, not "data says no") is the
 * important distinction preserved by the `!== undefined` guard below.
 */
function checkSessionAbandonmentPattern(input: WellbeingSignalInput): boolean {
  if (input.sessionAbandonmentCount === undefined) return false;
  return input.sessionAbandonmentCount >= 2;
}

export function computeWellbeingSignal(
  input: WellbeingSignalInput
): WellbeingSignalResult {
  if (checkCompoundingFailure(input)) {
    return { veto: true, reason: "compounding-failure", parentFacingSignal: "may benefit from a lighter week" };
  }

  if (checkMasteryReversalLowEngagement(input)) {
    return {
      veto: true,
      reason: "mastery-reversal-low-engagement",
      parentFacingSignal: "may benefit from a lighter week",
    };
  }

  if (checkSessionAbandonmentPattern(input)) {
    return {
      veto: true,
      reason: "session-abandonment-pattern",
      parentFacingSignal: "may benefit from a lighter week",
    };
  }

  // No condition fired. Distinguish genuinely insufficient evidence (no
  // parent-facing claim at all, matching the Insufficient Evidence tier's
  // own honesty elsewhere in this programme) from "evaluated, no concern
  // found" (a real, positive "steady" signal) — never silently collapsing
  // the two into one default.
  const hasAnyEvidence =
    input.recentAttempts.length > 0 || input.currentEducationalState !== "exploring";

  return {
    veto: false,
    reason: null,
    parentFacingSignal: hasAnyEvidence ? "steady" : null,
  };
}
