/**
 * Programme Increment 008D — Mock Attempt Engine + Secure Payload
 * Delivery + Exam Experience Foundation. Types mirror
 * supabase/migrations/070_mock_attempt_engine.sql exactly — this file
 * has no independent authority over the contract; if the migration
 * changes, this file must change with it, not the other way round.
 */

export type MockAttemptStatus = "assigned" | "ready" | "in_progress" | "submitted" | "expired";
export type MockAttemptType = "full_mock" | "timed_section" | "diagnostic_mock";

export interface MockAttempt {
  id: string;
  formId: string;
  attemptType: MockAttemptType;
  status: MockAttemptStatus;
  assignedQuestionIds: string[];
  currentSection: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  expiresAt: string | null;
}

/**
 * The exact, hand-picked field set mock_get_question() (migration 070)
 * returns — never a superset. Every field here corresponds to a real
 * column in that function's own jsonb_build_object() call; a field must
 * be added to BOTH places together, never just one, or this type would
 * silently drift from what the server actually returns.
 */
export interface MockQuestionPayload {
  questionId: string;
  subject: string;
  skill: string;
  question: unknown; // jsonb prompt.question — string or rich content, not narrowed further here
  marks: number;
  contentDifficulty: string;
}

/**
 * Programme Increment 008E — supabase/migrations/072_mock_lifecycle_and_
 * reporting_foundation.sql. Mirrors mock_get_active_form()'s exact
 * return shape: only form_id + attempt_type, never question_manifest.
 */
export interface ActiveMockForm {
  formId: string;
  attemptType: MockAttemptType;
}

export type MockScoringState = "not_started" | "scoring" | "scored" | "failed";
export type MockAnalysisState = "not_started" | "analysing" | "complete" | "failed";
export type MockReportReleaseState = "pending" | "released";

/**
 * Programme Increment 008F — supabase/migrations/074_mock_scoring_and_
 * report_release.sql. The exact, hand-picked outcome per question
 * mock_score_attempt() writes into ali_mock_attempt_report.question_
 * outcomes. Deliberately does NOT include the learner's own submitted
 * response text or the stored answer/model answer — Part 13's own "do
 * not log protected answer material unnecessarily" instruction, applied
 * even to a sealed-until-released row.
 */
export type MockQuestionOutcomeStatus = "correct" | "incorrect" | "unanswered" | "requires_manual_marking";

export interface MockQuestionOutcome {
  questionId: string;
  status: MockQuestionOutcomeStatus;
  marksAwarded: number | null;
  marksAvailable: number;
  /** The question's own skill/QuestionTypeId code (e.g. "QT-MR-01") — already delivered to the client via mock_get_question(), not a protected field. Null only when the manifest question no longer resolves to a real bank row. */
  questionTypeId: string | null;
}

/** Mirrors mock_score_attempt()'s own jsonb_build_object() for the `overall` column exactly. */
export interface MockOverallResult {
  rawMarksAchieved: number;
  rawMarksAvailable: number;
  /** Null whenever any question still requires manual marking — never computed against a partial total. */
  percentage: number | null;
  answeredCount: number;
  unansweredCount: number;
  correctCount: number;
  incorrectCount: number;
  requiresManualMarkingCount: number;
}

export interface MockSubjectBreakdownEntry {
  subject: string;
  marksAchieved: number;
  marksAvailable: number;
  percentage: number | null;
}

/**
 * A single Mock data point about one competency, explicitly tagged with
 * its own provenance. NEVER fed into ali_student_question_history or
 * processEvidenceForCompetency() by this increment (see migration 074's
 * own disclosed architecture decision) — this is the "boundary/adapter"
 * the 008F directive itself names as the correct fallback when the
 * shared evidence pipeline cannot yet safely consume a new evidence
 * source. Consumed only by Mock-specific reporting until a future
 * increment gives the shared pipeline a real provenance dimension.
 */
export interface MockCompetencyEvidenceEntry {
  competencyId: string;
  questionTypeId: string;
  source: "mock";
  correct: boolean;
  attemptId: string;
  formId: string;
  scoredAt: string;
}

export interface MockStrengthOrPriorityEntry {
  competencyId: string;
  questionCount: number;
  correctCount: number;
}

export interface MockTimingEvidence {
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  timeLimitSeconds: number | null;
}

/**
 * Mirrors ali_mock_attempt_report's own columns exactly. Only ever
 * readable once report_release_state = 'released' (the table's own RLS
 * policy enforces this server-side); every data field stays null until a
 * future scoring/analysis increment populates it — this type does not
 * claim any of these fields are computed today. `practiceComparison`
 * stays null in 008F specifically (named as deferred, not silently
 * omitted — see ALI_DECISION_LOG.md).
 */
export interface MockAttemptReport {
  attemptId: string;
  scoringState: MockScoringState;
  analysisState: MockAnalysisState;
  reportReleaseState: MockReportReleaseState;
  releasedAt: string | null;
  markingVersion: number | null;
  overall: MockOverallResult | null;
  subjectBreakdown: MockSubjectBreakdownEntry[] | null;
  questionOutcomes: MockQuestionOutcome[] | null;
  competencyEvidence: MockCompetencyEvidenceEntry[] | null;
  strengths: MockStrengthOrPriorityEntry[] | null;
  weaknesses: MockStrengthOrPriorityEntry[] | null;
  timingEvidence: MockTimingEvidence | null;
  practiceComparison: unknown | null;
  parentExplanation: string | null;
}

/**
 * Fields that must NEVER appear in a payload delivered to a learner
 * before their attempt's report is released — the field-level secrecy
 * boundary this increment exists to prove. Used directly by
 * lib/mockAttempt/redaction.ts's own assertion helper, and by its tests.
 */
export const PROTECTED_MOCK_FIELDS = [
  "answer",
  "acceptedAnswers",
  "accepted_answers",
  "workingSteps",
  "working_steps",
  "explanation",
  "modelAnswer",
  "model_answer",
  "addressesMisconception",
  "addresses_misconception",
  "reviewMetadata",
  "review_metadata",
  "provenance",
  "provenanceNotes",
] as const;
