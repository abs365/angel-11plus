import type { MasteryState, StudentQuestionHistoryRow } from "@/types/ali/history";

type MutableHistoryFields = Pick<
  StudentQuestionHistoryRow,
  | "timesSeen"
  | "timesCorrect"
  | "distinctCorrectSessions"
  | "lastCorrectSessionId"
  | "lastAttemptCorrect"
  | "secondLastAttemptCorrect"
  | "masteryState"
>;

/**
 * Applies a new attempt outcome to a student's question-history row and
 * returns the fully updated mutable fields, pure (no I/O).
 *
 * Mastery is evidence-based across distinct sessions (ALI_DECISION_LOG.md
 * Decision 7), not a single correct answer or consecutive-within-one-sitting
 * streak:
 *   - `mastered`: correct in >= masteryThreshold distinct sessions AND the
 *     most recent attempt was correct. One wrong answer after mastery
 *     demotes mastered -> learning (evidence-based, revocable).
 *   - `weak`: the last 2 consecutive attempts (any session) were both
 *     incorrect — independent of mastery progress, still drives the
 *     weak-skill override in lib/ali/selection.ts.
 *   - `learning`: seen at least once, neither mastered nor weak.
 *   - `new`: never seen (not reachable from this function — call site only
 *     invokes this after a real attempt).
 *
 * `supportTier` (Mathematics Reference Vertical Remediation Gate §4,
 * migration 024) — defaults to "independent", the exact prior behaviour for
 * every existing caller. A "supported" outcome (correct only after guided
 * remediation/scaffolding, e.g. the Mathematics lesson's Guided Attempt
 * ladder) is real, truthful attempt evidence — timesSeen/timesCorrect/
 * lastAttemptCorrect always update — but must not, by itself, advance
 * distinct-session mastery progress or newly reach "mastered": a correct
 * answer received with help is not equivalent to first-attempt independent
 * evidence (GUIDED_LEARNING_REMEDIATION_REPORT.md). A supported wrong answer
 * still contributes to the "weak" signal — genuine difficulty is genuine
 * difficulty regardless of support tier. A supported correct answer neither
 * advances nor revokes an already-"mastered" state; it is orthogonal to it.
 */
export function applyAttemptOutcome(
  current: MutableHistoryFields,
  isCorrect: boolean,
  sessionId: string,
  masteryThreshold: number,
  supportTier: "independent" | "supported" = "independent"
): MutableHistoryFields {
  const timesSeen = current.timesSeen + 1;
  const timesCorrect = current.timesCorrect + (isCorrect ? 1 : 0);

  const countsTowardMastery = isCorrect && supportTier === "independent";
  const distinctCorrectSessions =
    countsTowardMastery && current.lastCorrectSessionId !== sessionId
      ? current.distinctCorrectSessions + 1
      : current.distinctCorrectSessions;
  const lastCorrectSessionId = countsTowardMastery ? sessionId : current.lastCorrectSessionId;

  const secondLastAttemptCorrect = current.lastAttemptCorrect;
  const lastAttemptCorrect = isCorrect;

  const lastTwoBothIncorrect = secondLastAttemptCorrect === false && lastAttemptCorrect === false;

  let masteryState: MasteryState;
  if (supportTier === "independent" && distinctCorrectSessions >= masteryThreshold && lastAttemptCorrect) {
    masteryState = "mastered";
  } else if (lastTwoBothIncorrect) {
    masteryState = "weak";
  } else if (supportTier === "supported" && isCorrect) {
    // Correct-with-help: real evidence an attempt happened, but not enough
    // on its own to move mastery state forward — leaves whatever state
    // already existed (neither newly "mastered" nor demoted from it).
    masteryState = current.masteryState;
  } else {
    masteryState = "learning";
  }

  return {
    timesSeen,
    timesCorrect,
    distinctCorrectSessions,
    lastCorrectSessionId,
    lastAttemptCorrect,
    secondLastAttemptCorrect,
    masteryState,
  };
}
