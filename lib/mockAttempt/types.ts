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
