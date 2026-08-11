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
  /** Migration 015 (Phase 2B, Evidence Capture Layer) — see AttemptEvidenceFacts. */
  lastAttemptTimeSeconds: number | null;
  lastAttemptSkipped: boolean | null;
  lastAttemptAnswerChanged: boolean | null;
  lastAttemptFirstAnswer: string | null;
  lastAttemptFinalAnswer: string | null;
  lastAttemptConfidenceRating: number | null;
  lastAttemptWorkingShown: boolean | null;
  /** Migration 024 — write-once, set only when previously null. See lib/ali/history.ts's recordPresentation(). */
  firstSource: string | null;
  /** Migration 024 — "independent" | "supported" | null (older rows, pre-migration). See lib/ali/mastery.ts's applyAttemptOutcome(). */
  lastAttemptSupportTier: string | null;
}

/**
 * Evidence Capture Layer (Phase 2B, migration 015) — the directly
 * observable per-attempt facts a caller of recordOutcome() may optionally
 * supply. Deliberately facts, not interpretation: no error-type/category
 * field exists here, since a coded mistake taxonomy
 * (reasoning_type/common_mistake) remains explicitly not-yet-approved
 * (EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md §11). Every field optional —
 * omitting one records it as null (not collected this attempt), never a
 * fabricated default. Recording facts now means a future, separately
 * approved Mistake Intelligence work package can derive categories from
 * real historical data rather than starting from zero.
 */
export interface AttemptEvidenceFacts {
  timeTakenSeconds?: number;
  skipped?: boolean;
  answerChanged?: boolean;
  firstAnswer?: string;
  finalAnswer?: string;
  /** 1-5, only if the calling UI actually collects a self-reported rating. */
  confidenceRating?: number;
  workingShown?: boolean;
}

export interface StudentAdaptiveState {
  profileId: string;
  questionsPresentedCount: number;
}
