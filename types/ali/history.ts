export type MasteryState = "new" | "learning" | "mastered" | "weak";

export interface StudentQuestionHistoryRow {
  profileId: string;
  questionId: string;
  source: string;
  timesSeen: number;
  timesCorrect: number;
  distinctCorrectSessions: number;
  lastCorrectSessionId: string | null;
  lastPresentedAt: string;
  lastPresentedAtSequence: number;
  lastAttemptCorrect: boolean | null;
  secondLastAttemptCorrect: boolean | null;
  masteryState: MasteryState;
}

export interface StudentAdaptiveState {
  profileId: string;
  questionsPresentedCount: number;
}
