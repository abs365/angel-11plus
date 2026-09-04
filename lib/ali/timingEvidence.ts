/**
 * Programme Increment 019, Part 17 — Speed/Accuracy Foundation.
 *
 * Increment 017/018's own audit found `ali_student_question_history.
 * last_attempt_time_seconds` (migration 015, "Phase 2B, Evidence Capture
 * Layer") already exists as a real, writable column — `recordOutcome()`'s
 * own `evidenceFacts.timeTakenSeconds` parameter (lib/ali/history.ts:188)
 * already persists it when supplied. What was actually missing, confirmed
 * by direct grep across this repository, was narrower than "no timing
 * capture exists at all": every real call site (the CSSE Practice page,
 * every adaptive-mock page, every test fixture) passes `undefined`/`null`
 * — the column is real, live, and permanently empty. No migration is
 * required for this foundation; see app/learning-intelligence/practice/
 * [area]/page.tsx's own new `questionShownAtRef` for the capture side.
 *
 * This module is the pure, testable half: given a real captured duration,
 * classify it — WITHOUT any arbitrary fixed "fast" threshold, per this
 * increment's own explicit instruction. Classification is always relative
 * to a real baseline (this question's, or this difficulty tier's, own
 * observed distribution) supplied by the caller; when no baseline exists
 * yet, this module reports that honestly rather than inventing one.
 */

/** One real captured (question, attempt) timing fact. `revisited` mirrors the existing `lastAttemptAnswerChanged` concept (migration 015) — never fabricated by this module. */
export interface QuestionTimingEvidence {
  questionId: string;
  /** Seconds, matching `last_attempt_time_seconds`'s own unit exactly — never milliseconds. */
  timeTakenSeconds: number;
  isCorrect: boolean;
}

/**
 * Computes a duration from two real timestamps, in seconds, floored at 0
 * (a clock skew or out-of-order event must never produce a negative
 * duration). Ceilinged at `maxPlausibleSeconds` (default 30 minutes) —
 * not discarded, but the CALLER (see the Practice page) is expected to
 * treat a value at the ceiling as "the learner was away, not genuinely
 * mid-question," per this increment's own explicit "must not silently
 * create misleading timing evidence" requirement. This function itself
 * never guesses WHY a duration is implausible, only bounds it.
 */
export function computeQuestionDurationSeconds(shownAtMs: number, answeredAtMs: number, maxPlausibleSeconds = 1800): number {
  const rawSeconds = Math.round((answeredAtMs - shownAtMs) / 1000);
  return Math.min(Math.max(rawSeconds, 0), maxPlausibleSeconds);
}

/**
 * True exactly when a captured duration hit the implausibility ceiling —
 * the caller's own signal to treat this attempt's timing as unreliable
 * (e.g. exclude it from a baseline, or from `recordOutcome()`'s own
 * `evidenceFacts` entirely) rather than as a genuine "very slow" data
 * point. Kept as its own named check so no caller re-derives the ceiling
 * value independently.
 */
export function isImplausibleDuration(timeTakenSeconds: number, maxPlausibleSeconds = 1800): boolean {
  return timeTakenSeconds >= maxPlausibleSeconds;
}

export type SpeedAccuracyLabel =
  | "accurate_fast"
  | "accurate_slow"
  | "fast_inaccurate"
  | "slow_inaccurate"
  | "insufficient_baseline";

/**
 * Classifies one real timing observation RELATIVE to a real baseline —
 * never against a fixed number of seconds. `baselineMedianSeconds` should
 * come from genuine observed data for the same question (or, failing
 * that, the same skill/difficulty tier) — this function accepts it as a
 * plain parameter and makes no assumption about how the caller computed
 * it, and returns `"insufficient_baseline"` honestly when none is
 * available, rather than defaulting to an arbitrary number.
 */
export function classifySpeedAccuracy(
  evidence: QuestionTimingEvidence,
  baselineMedianSeconds: number | null
): SpeedAccuracyLabel {
  if (baselineMedianSeconds === null || baselineMedianSeconds <= 0) return "insufficient_baseline";

  const isFast = evidence.timeTakenSeconds <= baselineMedianSeconds;
  if (evidence.isCorrect) return isFast ? "accurate_fast" : "accurate_slow";
  return isFast ? "fast_inaccurate" : "slow_inaccurate";
}

/**
 * The real median of a set of genuine observed durations for one question
 * (or one skill/difficulty group) — the only baseline this foundation
 * trusts. Callers must exclude implausible durations (see
 * `isImplausibleDuration`) before calling this, so a single "learner left
 * the tab open" outlier cannot skew the baseline every other learner is
 * measured against.
 */
export function computeMedianSeconds(observedSeconds: readonly number[]): number | null {
  if (observedSeconds.length === 0) return null;
  const sorted = [...observedSeconds].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
