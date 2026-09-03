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
 * Decision 217 (Mathematics Mock 1 attempt-resume remediation) — mirrors
 * `mock_get_resumable_attempt()` (migration 149) exactly. `status` is
 * always `"assigned"` or `"in_progress"` — that RPC's own live query
 * never returns a `"submitted"` row (see that migration's own header for
 * why `"ready"`/`"expired"` are schema-permitted but never actually
 * produced by any real code path). `isExpired` is computed server-side
 * against the database's own clock, never trusted from any client value.
 */
export interface ResumableMockAttempt {
  attemptId: string;
  status: "assigned" | "in_progress";
  startedAt: string | null;
  expiresAt: string | null;
  isExpired: boolean;
}

/**
 * Structured Assessment Stimulus (Decision 170) — the smallest additive
 * content shape for an optional shared data table attached to a
 * question's own `prompt` jsonb (as `prompt.stimulus`). NOT a new
 * database column: `prompt` is already jsonb, so an absent/null
 * `stimulus` key is indistinguishable from "no stimulus," and every
 * existing row (which never sets this key) behaves exactly as before.
 * `type` is a discriminator deliberately kept a literal union of one
 * member today ("table") so a future stimulus kind (never built in this
 * increment — no diagrams, images, or charts) can be added without
 * redesigning this shape or any code that already switches on `type`.
 */
export interface MockTableStimulus {
  type: "table";
  /** Optional visible caption; when absent, callers must still give the table an accessible name (see components/mockAttempt/DataTableStimulus.tsx). */
  caption?: string;
  headers: string[];
  rows: string[][];
}

export type MockStimulus = MockTableStimulus;

/**
 * The exact, hand-picked field set mock_get_question() (migration 070,
 * extended by migration 106, extended by migration 115) returns — never
 * a superset. Every field here corresponds to a real column in that
 * function's own jsonb_build_object() call; a field must be added to
 * BOTH places together, never just one, or this type would silently
 * drift from what the server actually returns.
 */
export interface MockQuestionPayload {
  questionId: string;
  subject: string;
  skill: string;
  question: unknown; // jsonb prompt.question — string or rich content, not narrowed further here
  marks: number;
  contentDifficulty: string;
  /**
   * Migration 106 — the id shared by every subpart of one displayed
   * numbered question (e.g. mock-mr01mr10-costumeschedule-01), or null
   * for a standalone question. Mirrors ali_question_bank.question_group_id
   * exactly (migration 093).
   */
  questionGroupId: string | null;
  /** Migration 106 — 1-based order of this subpart within its group, or null for a standalone question. */
  groupOrder: number | null;
  /** Migration 106 — the subpart's own display label (e.g. "(a)"), or null for a standalone question. */
  subpartLabel: string | null;
  /**
   * Migration 115 — optional structured stimulus (currently only a data
   * table) read from `prompt.stimulus`, `null` for every row that
   * doesn't set it (every row before this migration, and every row
   * since that has no shared dataset). NOT answer-adjacent — the
   * stimulus is the material the question is ABOUT, shown to the
   * learner before they answer, exactly like `question` itself; it is
   * deliberately absent from PROTECTED_MOCK_FIELDS below. Unvalidated
   * at this type level (`unknown`-adjacent by construction, since it
   * comes straight off jsonb) — see lib/mockAttempt/workspace.ts's own
   * isValidTableStimulus() for the real, tested validation every render
   * site must call before trusting this shape.
   */
  stimulus: MockStimulus | null;
  /**
   * Migration 122 (Decision 180) — optional explicit shared-stem content
   * contract, read straight from `prompt.sharedStem`, `null` for every
   * row that has never set it (every row before this migration, and
   * every row since with no genuinely identical shared-scenario prefix
   * across its group). NOT derived by parsing/diffing `question` text at
   * render time — that was explicitly rejected as a fragile heuristic
   * (Decision 180). A group only renders its shared stem once, and each
   * subpart's own distinguishing tail, when EVERY payload in the group
   * carries the identical non-empty `sharedStem` value AND that value is
   * an exact prefix of that payload's own `question` text — see
   * lib/mockAttempt/workspace.ts's own resolveGroupSharedStem(), the
   * single fail-safe gate every render site must use. Any group that
   * doesn't meet this exactly falls back to full per-subpart rendering,
   * unchanged from before this migration.
   */
  sharedStem: string | null;
}

/**
 * Migration 106 — one attempt's full grouping structure, IDs and
 * grouping identity only, never question content. Returned by
 * mock_get_attempt_grouping(), mirroring mock_get_attempt_manifest()'s
 * own "IDs only" discipline exactly, extended by the same three fields
 * as MockQuestionPayload above.
 */
export interface MockManifestGroupingEntry {
  questionId: string;
  questionGroupId: string | null;
  groupOrder: number | null;
  subpartLabel: string | null;
}

/**
 * Programme Increment 008E — supabase/migrations/072_mock_lifecycle_and_
 * reporting_foundation.sql. Mirrors mock_get_active_form()'s exact
 * return shape: form_id + attempt_type (+ displayName, below) — never
 * question_manifest.
 *
 * displayName added in Programme Completion Increment 015 (migration
 * 214) — the real, form-metadata-driven identity mechanism replacing
 * route-specific hardcoded strings like the literal "Mathematics Mock 1"
 * found in app/mocks/page.tsx and app/learning-intelligence/mock-exam/
 * page.tsx. `null` when the form's own composition_provenance has no
 * displayName key yet (i.e. before migration 213/212 is applied to that
 * specific form) — every caller must treat null as "use a safe
 * fallback," never as an error.
 */
export interface ActiveMockForm {
  formId: string;
  attemptType: MockAttemptType;
  displayName: string | null;
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
 * Decision 223 (Mathematics Mock 1 Deterministic Mock Analysis Engine,
 * migration 151) — the evidence-strength classification a single
 * questionTypeId's own observed subparts support, per that migration's
 * own disclosed, symmetric, minimum-2-observations rule: fewer than 2
 * observed subparts can never produce `demonstrated_securely` or
 * `not_yet_demonstrated`/`developing`, regardless of correctness —
 * `insufficient_evidence` is the only honest classification. Mirrors
 * `mock_analyse_attempt()`'s own literal string values exactly.
 */
export type MockSkillEvidenceLevel = "demonstrated_securely" | "developing" | "not_yet_demonstrated" | "insufficient_evidence";

/**
 * Decision 223 — one questionTypeId's own full, deterministic evidence
 * record for a single attempt. `misconceptionNotes` are drawn only from
 * INCORRECT/unanswered rows' own `ali_question_bank.addresses_
 * misconception` text, capped at 2, and describe what the QUESTION is
 * designed to diagnose — never a claim about what the learner actually
 * did (see migration 151's own header). Never contains a stored correct
 * answer, `workingSteps`, or the learner's own response text.
 */
export interface MockSkillEvidenceEntry {
  questionTypeId: string;
  competencyId: string | null;
  marksAchieved: number;
  marksAvailable: number;
  percentage: number | null;
  subpartCount: number;
  correctCount: number;
  evidenceLevel: MockSkillEvidenceLevel;
  difficultyDistribution: { easy: number; medium: number; hard: number; challenge: number };
  misconceptionNotes: string[];
}

/** Decision 223 — a small, deterministic next-practice pointer; not yet wired to any live practice route (migration 151's own disclosed scope boundary). */
export interface MockNextPracticePriority {
  questionTypeId: string;
  competencyId: string | null;
}

/** Decision 223 — mock_analyse_attempt()'s own full structured output, stored in ali_mock_attempt_report.skill_evidence. */
export interface MockSkillEvidence {
  bySkill: MockSkillEvidenceEntry[];
  nextPracticePriorities: MockNextPracticePriority[];
}

/**
 * Mirrors ali_mock_attempt_report's own columns exactly. Only ever
 * readable once report_release_state = 'released' (the table's own RLS
 * policy enforces this server-side); every data field stays null until a
 * future scoring/analysis increment populates it — this type does not
 * claim any of these fields are computed today. `practiceComparison`
 * stays null in 008F specifically (named as deferred, not silently
 * omitted — see ALI_DECISION_LOG.md). `skillEvidence`/`analysisVersion`/
 * `analysedAt` (Decision 223, migration 151) are populated once
 * `analysisState === "complete"`; null otherwise, exactly like every
 * other field here before its own populating increment existed.
 */
export interface MockAttemptReport {
  attemptId: string;
  scoringState: MockScoringState;
  analysisState: MockAnalysisState;
  reportReleaseState: MockReportReleaseState;
  releasedAt: string | null;
  markingVersion: number | null;
  analysisVersion: number | null;
  analysedAt: string | null;
  overall: MockOverallResult | null;
  subjectBreakdown: MockSubjectBreakdownEntry[] | null;
  questionOutcomes: MockQuestionOutcome[] | null;
  competencyEvidence: MockCompetencyEvidenceEntry[] | null;
  strengths: MockStrengthOrPriorityEntry[] | null;
  weaknesses: MockStrengthOrPriorityEntry[] | null;
  skillEvidence: MockSkillEvidence | null;
  timingEvidence: MockTimingEvidence | null;
  practiceComparison: unknown | null;
  parentExplanation: string | null;
}

/**
 * Mock Governance Architecture Increment 001 (Decision 135) —
 * supabase/migrations/085_mock_cycle_governance_architecture.sql. One row
 * per Full Mock sitting; a Mathematics attempt and an English attempt
 * (both attempt_type "full_mock") may link to the same cycle via the
 * attempt's own new, nullable cycleId. 'scheduled' is the normal
 * ~14-day-gated cadence; 'parent_override' is the Founder-authorised
 * additional sitting (Decision 49/135) — persistently distinguishable,
 * never inferred.
 */
export type MockCycleInitiatedBy = "scheduled" | "parent_override";

export type MockCycleSubject = "mathematics" | "english";

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
