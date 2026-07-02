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
 */
export function applyAttemptOutcome(
  current: MutableHistoryFields,
  isCorrect: boolean,
  sessionId: string,
  masteryThreshold: number
): MutableHistoryFields {
  const timesSeen = current.timesSeen + 1;
  const timesCorrect = current.timesCorrect + (isCorrect ? 1 : 0);

  const distinctCorrectSessions =
    isCorrect && current.lastCorrectSessionId !== sessionId
      ? current.distinctCorrectSessions + 1
      : current.distinctCorrectSessions;
  const lastCorrectSessionId = isCorrect ? sessionId : current.lastCorrectSessionId;

  const secondLastAttemptCorrect = current.lastAttemptCorrect;
  const lastAttemptCorrect = isCorrect;

  const lastTwoBothIncorrect = secondLastAttemptCorrect === false && lastAttemptCorrect === false;

  let masteryState: MasteryState;
  if (distinctCorrectSessions >= masteryThreshold && lastAttemptCorrect) {
    masteryState = "mastered";
  } else if (lastTwoBothIncorrect) {
    masteryState = "weak";
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
