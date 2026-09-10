import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { isValidMockQuestionPayload, isPayloadRedactionSafe } from "./redaction";
import type {
  ActiveMockForm,
  MockAttemptReport,
  MockAttemptStatus,
  MockAttemptType,
  MockManifestGroupingEntry,
  MockQuestionPayload,
  MockWritingAssessment,
  ResumableMockAttempt,
} from "./types";

/**
 * Programme Increment 008D — thin wrappers around the five
 * SECURITY DEFINER functions (migration 070). These are the ONLY
 * sanctioned way anything in this codebase may create/advance a Mock
 * attempt or retrieve Mock question content. No function here ever
 * issues a direct `.from("ali_question_bank")` query for Mock purposes —
 * every read/write goes through `supabase.rpc()`, which executes
 * server-side inside the database, never returning unredacted content to
 * the caller.
 */

export interface MockClientResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Since migration 085 (Decision 135), the server rejects attemptType
 * "full_mock" here unconditionally — a full_mock attempt must be created
 * through createMockCycleAttempt() below, as part of an owned, open,
 * cadence-gated Mock cycle. This function remains the correct call for
 * "timed_section"/"diagnostic_mock" attempts only, which stay uncycled.
 */
export async function createMockAttempt(
  supabase: SupabaseClient<Database>,
  formId: string,
  attemptType: "full_mock" | "timed_section" | "diagnostic_mock"
): Promise<MockClientResult<string>> {
  const { data, error } = await supabase.rpc("mock_create_attempt", { p_form_id: formId, p_attempt_type: attemptType });
  if (error) return { data: null, error: error.message };
  return { data: data as string, error: null };
}

export async function startMockAttempt(
  supabase: SupabaseClient<Database>,
  attemptId: string,
  durationMinutes = 60
): Promise<MockClientResult<{ status: MockAttemptStatus; startedAt: string; expiresAt: string }>> {
  const { data, error } = await supabase.rpc("mock_start_attempt", { p_attempt_id: attemptId, p_duration_minutes: durationMinutes });
  if (error) return { data: null, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { data: null, error: "No attempt state returned" };
  return { data: { status: row.status as MockAttemptStatus, startedAt: row.started_at, expiresAt: row.expires_at }, error: null };
}

/**
 * Fetches one question's redacted payload for an in-progress attempt.
 * Defence in depth: even though mock_get_question() is the real
 * enforcement boundary, the response is re-validated client-side
 * (shape + no protected fields) before being returned to any caller —
 * a malformed or unexpectedly-shaped response is treated as an error,
 * never silently rendered.
 */
export async function getMockQuestion(
  supabase: SupabaseClient<Database>,
  attemptId: string,
  questionId: string
): Promise<MockClientResult<MockQuestionPayload>> {
  const { data, error } = await supabase.rpc("mock_get_question", { p_attempt_id: attemptId, p_question_id: questionId });
  if (error) return { data: null, error: error.message };
  if (!isPayloadRedactionSafe(data)) return { data: null, error: "Refusing to return a payload containing a protected field" };
  if (!isValidMockQuestionPayload(data)) return { data: null, error: "Malformed question payload" };
  return { data, error: null };
}

export async function submitMockAnswer(
  supabase: SupabaseClient<Database>,
  attemptId: string,
  questionId: string,
  response: Record<string, unknown>
): Promise<MockClientResult<true>> {
  const { error } = await supabase.rpc("mock_submit_answer", { p_attempt_id: attemptId, p_question_id: questionId, p_response: response });
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

export async function submitMockAttempt(
  supabase: SupabaseClient<Database>,
  attemptId: string
): Promise<MockClientResult<{ status: MockAttemptStatus; submittedAt: string }>> {
  const { data, error } = await supabase.rpc("mock_submit_attempt", { p_attempt_id: attemptId });
  if (error) return { data: null, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { data: null, error: "No attempt state returned" };
  return { data: { status: row.status as MockAttemptStatus, submittedAt: row.submitted_at }, error: null };
}

/**
 * Programme Increment 008E — the learner-discovery gap named in migration
 * 072's own header: since ali_mock_form has no learner SELECT policy
 * (migration 071), this is the only way a client can learn whether a
 * Mock is currently available and which form_id to pass to
 * createMockAttempt(). Returns { data: null, error: null } (not an error)
 * when no active form exists — that is the expected, honest "no Mock
 * available yet" state while Mock Eligible remains 0, never a failure.
 */
export async function getActiveMockForm(
  supabase: SupabaseClient<Database>,
  attemptType: MockAttemptType,
  subject?: "mathematics" | "english"
): Promise<MockClientResult<ActiveMockForm | null>> {
  // Migration 245 — subject is optional and defaults to matching any
  // subject (the RPC's own p_subject default), so every existing call
  // site (both of app/mocks/page.tsx's own current calls) is completely
  // unaffected until it is deliberately updated to pass a subject.
  const { data, error } = await supabase.rpc("mock_get_active_form", { p_attempt_type: attemptType, p_subject: subject ?? null });
  if (error) return { data: null, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { data: null, error: null };
  return {
    data: { formId: row.form_id, attemptType: row.attempt_type as MockAttemptType, displayName: row.display_name ?? null },
    error: null,
  };
}

/**
 * Completion Assurance Programme, Completion B — the ONE authoritative
 * answer to "can Angel actually deliver this mock right now," derived
 * directly from getActiveMockForm()'s own result rather than a second,
 * hard-coded signal. A learner-facing "Available" claim must never be
 * shown unless this returns true — see app/mocks/page.tsx (the Mock
 * Centre entry card) and app/learning-intelligence/mock-exam/page.tsx
 * (the pre-instructions check), both of which call getActiveMockForm()
 * and pass its result straight through this same predicate, so the two
 * pages can never silently disagree about whether a mock exists. Errors
 * are treated as "not available" — a network/RPC failure must never be
 * mistaken for a real form.
 */
export function isMockFormAvailable(
  result: MockClientResult<ActiveMockForm | null>
): result is { data: ActiveMockForm; error: null } {
  return result.error === null && result.data !== null;
}

/**
 * Returns the caller's own attempt's assigned_question_ids, in order.
 * IDs only — never any question content. See migration 072's own header
 * ("Problem 1b") for why this exists as an RPC rather than a direct
 * `.from("ali_mock_attempt")` read RLS would already permit.
 */
export async function getMockAttemptManifest(
  supabase: SupabaseClient<Database>,
  attemptId: string
): Promise<MockClientResult<string[]>> {
  const { data, error } = await supabase.rpc("mock_get_attempt_manifest", { p_attempt_id: attemptId });
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

/**
 * Migration 106 (Decision 161) — the caller's own attempt's full
 * grouping structure, IDs and grouping identity only, never question
 * content. Called once, alongside getMockAttemptManifest(), when an
 * attempt starts, so the workspace can compute correct display-unit
 * counts and palette entries before the learner has visited every
 * question — see lib/mockAttempt/workspace.ts's own buildDisplayUnits().
 */
export async function getMockAttemptGrouping(
  supabase: SupabaseClient<Database>,
  attemptId: string
): Promise<MockClientResult<MockManifestGroupingEntry[]>> {
  const { data, error } = await supabase.rpc("mock_get_attempt_grouping", { p_attempt_id: attemptId });
  if (error) return { data: null, error: error.message };
  return { data: (data as MockManifestGroupingEntry[]) ?? [], error: null };
}

/**
 * Migration 149 (Decision 217, Mathematics Mock 1 attempt-resume
 * remediation) — the caller's own existing "assigned" or "in_progress"
 * attempt for a specific form, or `{ data: null, error: null }` (not an
 * error) if none exists — the caller must treat that as "no resumable
 * attempt, create a new one," the same "absence is not an error"
 * discipline `getActiveMockForm()` and `getOpenMockCycle()` already
 * establish. Never accepts or requires any learner-identity argument —
 * the server derives the caller's own identity from their own session.
 */
export async function getResumableMockAttempt(
  supabase: SupabaseClient<Database>,
  formId: string
): Promise<MockClientResult<ResumableMockAttempt | null>> {
  const { data, error } = await supabase.rpc("mock_get_resumable_attempt", { p_form_id: formId });
  if (error) return { data: null, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { data: null, error: null };
  if (row.status !== "assigned" && row.status !== "in_progress") {
    return { data: null, error: "Unexpected attempt status returned by mock_get_resumable_attempt" };
  }
  return {
    data: { attemptId: row.attempt_id, status: row.status, startedAt: row.started_at, expiresAt: row.expires_at, isExpired: row.is_expired },
    error: null,
  };
}

/**
 * Decision 217 (Mathematics Mock 1 attempt-resume remediation) — the
 * caller's own already-submitted responses for one attempt, keyed by
 * question id, value only (the same `{value: string}` shape
 * `submitMockAnswer()` itself writes). A direct, RLS-gated `.from()`
 * read, deliberately, not a wrapping RPC — mirroring
 * `getMockAttemptReport()`'s own established precedent exactly: a
 * learner's own submitted response text is not sensitive/protected
 * content (it is literally what they themselves typed), and the
 * existing `ali_mock_attempt_answer_select_own` RLS policy (migration
 * 070) already scopes every read to the caller's own attempts, so no
 * new RPC or policy is required. Returns an empty map (not an error)
 * for an attempt with no answers yet — the expected state for a
 * just-started attempt.
 */
export async function getMockAttemptAnswers(
  supabase: SupabaseClient<Database>,
  attemptId: string
): Promise<MockClientResult<Map<string, string>>> {
  const { data, error } = await supabase
    .from("ali_mock_attempt_answer")
    .select("question_id, response")
    .eq("attempt_id", attemptId);
  if (error) return { data: null, error: error.message };
  const answers = new Map<string, string>();
  for (const row of data ?? []) {
    const value = (row.response as { value?: unknown } | null)?.value;
    if (typeof value === "string" && value.length > 0) answers.set(row.question_id, value);
  }
  return { data: answers, error: null };
}

/**
 * Decision 220 (Mathematics Mock 1 report-release and discoverability
 * increment) — the caller's own past SUBMITTED attempts for one form,
 * newest first, id and submittedAt only. A direct, RLS-gated `.from()`
 * read, deliberately, not a wrapping RPC — mirroring
 * `getMockAttemptAnswers()`'s own established precedent exactly (see
 * `types/supabase.ts`'s own comment on the `ali_mock_attempt` Table
 * entry for why). Deliberately distinct from `getResumableMockAttempt()`
 * (migration 149), which only ever returns an `assigned`/`in_progress`
 * row: this is how a learner rediscovers a Mock they have already
 * finished, not one they are mid-way through. Returns an empty array
 * (not an error) when the caller has never submitted an attempt for this
 * form — the expected state before a first sitting.
 */
export async function getSubmittedMockAttempts(
  supabase: SupabaseClient<Database>,
  formId: string
): Promise<MockClientResult<{ attemptId: string; submittedAt: string }[]>> {
  const { data, error } = await supabase
    .from("ali_mock_attempt")
    .select("id, submitted_at")
    .eq("form_id", formId)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  const attempts = (data ?? [])
    .filter((row): row is { id: string; submitted_at: string } => row.submitted_at !== null)
    .map((row) => ({ attemptId: row.id, submittedAt: row.submitted_at }));
  return { data: attempts, error: null };
}

/**
 * Migration 107 (Decision 161) — the caller's own currently open Mock
 * cycle id, or null if none. See migration 107's own header for why this
 * exists: mock_start_new_cycle()/mock_authorise_extra_cycle() (migration
 * 085) each raise an exception if a cycle is already open rather than
 * returning it, and mock_cycle_is_open() is deliberately never granted
 * to authenticated. This is the sanctioned way a caller discovers an
 * existing open cycle BEFORE deciding whether to start a new one, rather
 * than triggering that exception just to find out.
 */
export async function getOpenMockCycle(
  supabase: SupabaseClient<Database>
): Promise<MockClientResult<string | null>> {
  const { data, error } = await supabase.rpc("mock_get_open_cycle");
  if (error) return { data: null, error: error.message };
  return { data: (data as string | null) ?? null, error: null };
}

/**
 * CSSE Two-Paper Mock, final production acceptance — a real, live P1
 * defect found during the real-learner walkthrough: getOpenMockCycle()
 * (above) deliberately, correctly returns null once BOTH subjects in a
 * cycle are submitted (it wraps mock_get_open_cycle(), which filters on
 * mock_cycle_is_open() — designed for a different question, "can a new
 * cycle be started," not "does this learner have a recent sitting worth
 * showing"). The sitting hub page relied on getOpenMockCycle() alone, so
 * a genuinely COMPLETE sitting rendered as if nothing had been started
 * at all — the exact opposite of correct.
 *
 * ali_mock_cycle already carries a full "read-your-own" RLS policy
 * (migration 085: `using (profile_id in (select id from profiles where
 * auth_user_id = auth.uid()))`), unconditioned on open/closed status —
 * so this is a direct, RLS-gated read (no new RPC, no migration needed),
 * matching this file's own established "direct read for owned records"
 * convention. Used as a fallback specifically when no OPEN cycle exists,
 * to find the most recent cycle regardless of completion state.
 */
export async function getMostRecentMockCycle(
  supabase: SupabaseClient<Database>
): Promise<MockClientResult<string | null>> {
  // ali_mock_cycle (migration 085) is not present in the generated
  // Database type (types/supabase.ts) even though it has long been
  // live in production -- this cast is an honest reflection of that
  // generated-type gap, mirroring this file's own established pattern
  // for a table the codegen hasn't caught up with (see
  // getMockWritingAssessments() above for the identical precedent).
  const { data, error } = await (
    supabase.from as unknown as (table: "ali_mock_cycle") => {
      select: (columns: string) => {
        order: (col: string, opts: { ascending: boolean }) => {
          limit: (n: number) => {
            maybeSingle: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
          };
        };
      };
    }
  )("ali_mock_cycle")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data: data?.id ?? null, error: null };
}

/**
 * CSSE Two-Paper Mock, pre-activation completion pass — one row per
 * attempt linked to a given cycle, the read-only building block a
 * sitting-level state reader needs. A direct, RLS-gated `.from()` read
 * (ali_mock_attempt_select_own, migration 070: read-your-own), matching
 * this file's own established "direct read for owned records" convention
 * (see getMockAttemptReport()/getMockWritingAssessments() above) —
 * deliberately NOT a new RPC, since mock_cycle_is_open() (migration 085)
 * is INTERNAL-ONLY by design and this file's own established precedent
 * is to derive sitting state from the owner's own already-readable
 * ali_mock_attempt rows rather than add a new privileged function for
 * something RLS already permits.
 */
export interface MockCycleAttemptRow {
  attemptId: string;
  subject: "mathematics" | "english" | null;
  status: MockAttemptStatus;
  submittedAt: string | null;
}

export async function getMockCycleAttempts(
  supabase: SupabaseClient<Database>,
  cycleId: string
): Promise<MockClientResult<MockCycleAttemptRow[]>> {
  // cycle_id/subject were added to ali_mock_attempt by migration 085;
  // types/supabase.ts's generated Row type for this table (above) does
  // not yet include them (confirmed by direct inspection this session)
  // -- an honest reflection of generated-type lag, matching migration
  // 245's own getMockWritingAssessments() cast precedent exactly. Remove
  // once types are regenerated against the live schema.
  const { data, error } = await (
    supabase.from as unknown as (table: "ali_mock_attempt") => {
      select: (columns: string) => {
        eq: (col: string, val: string) => Promise<{
          data: { id: string; subject: string | null; status: string; submitted_at: string | null }[] | null;
          error: { message: string } | null;
        }>;
      };
    }
  )("ali_mock_attempt")
    .select("id, subject, status, submitted_at")
    .eq("cycle_id", cycleId);
  if (error) return { data: null, error: error.message };
  const rows = (data ?? []).map(
    (r): MockCycleAttemptRow => ({
      attemptId: r.id,
      subject: r.subject === "mathematics" || r.subject === "english" ? r.subject : null,
      status: r.status as MockAttemptStatus,
      submittedAt: r.submitted_at,
    })
  );
  return { data: rows, error: null };
}

export async function setMockFlag(
  supabase: SupabaseClient<Database>,
  attemptId: string,
  questionId: string,
  flagged: boolean
): Promise<MockClientResult<true>> {
  const { error } = await supabase.rpc("mock_set_flag", { p_attempt_id: attemptId, p_question_id: questionId, p_flagged: flagged });
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

/**
 * Admin-only (enforced inside the SECURITY DEFINER function body via
 * is_current_user_admin(), migration 074) — report release cannot be
 * self-authorised by the learner. Calling this as an ordinary learner
 * fails exactly as if no execute grant existed at all.
 */
export async function releaseMockReport(
  supabase: SupabaseClient<Database>,
  attemptId: string
): Promise<MockClientResult<true>> {
  const { error } = await supabase.rpc("mock_release_report", { p_attempt_id: attemptId });
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

/**
 * CSSE Two-Paper Mock P1 Repair — admin-only (enforced inside the
 * SECURITY DEFINER function body via is_current_user_admin(), migration
 * 251), no parameter of any kind: the one named Mathematics acceptance
 * attempt id is a hardcoded literal inside the database function itself,
 * not passed from here — this is not a reusable/general backfill
 * capability. Calls the real, unmodified mock_analyse_attempt() for that
 * one attempt, whose scoring_state already reached 'scored' before
 * migration 250 restored automatic analysis invocation for future
 * attempts.
 */
export async function backfillNamedMathematicsAcceptanceAnalysis(
  supabase: SupabaseClient<Database>
): Promise<MockClientResult<true>> {
  const { error } = await supabase.rpc("mock_backfill_named_mathematics_acceptance_analysis");
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

/**
 * Reads a Mock attempt's own report — a direct, RLS-gated `.from()` read,
 * deliberately, not a wrapping RPC (see types/supabase.ts's own comment
 * on the ali_mock_attempt_report Table entry for why). Returns
 * { data: null, error: null } (not an error) both when no report row
 * exists yet and when it exists but is not yet released — RLS makes the
 * two cases indistinguishable from the client's own point of view, which
 * is the correct, intended behaviour: a caller must never be able to
 * infer "it exists but isn't released yet" from an error shape, only
 * from their own independent knowledge that they submitted an attempt.
 */
export async function getMockAttemptReport(
  supabase: SupabaseClient<Database>,
  attemptId: string
): Promise<MockClientResult<MockAttemptReport | null>> {
  const { data, error } = await supabase
    .from("ali_mock_attempt_report")
    .select("*")
    .eq("attempt_id", attemptId)
    .maybeSingle();
  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };
  return {
    data: {
      attemptId: data.attempt_id,
      scoringState: data.scoring_state as MockAttemptReport["scoringState"],
      analysisState: data.analysis_state as MockAttemptReport["analysisState"],
      reportReleaseState: data.report_release_state as MockAttemptReport["reportReleaseState"],
      releasedAt: data.released_at,
      markingVersion: data.marking_version,
      analysisVersion: data.analysis_version,
      analysedAt: data.analysed_at,
      skillEvidence: data.skill_evidence as MockAttemptReport["skillEvidence"],
      overall: data.overall as MockAttemptReport["overall"],
      subjectBreakdown: data.subject_breakdown as MockAttemptReport["subjectBreakdown"],
      questionOutcomes: data.question_outcomes as MockAttemptReport["questionOutcomes"],
      competencyEvidence: data.competency_evidence as MockAttemptReport["competencyEvidence"],
      strengths: data.strengths as MockAttemptReport["strengths"],
      weaknesses: data.weaknesses as MockAttemptReport["weaknesses"],
      timingEvidence: data.timing_evidence as MockAttemptReport["timingEvidence"],
      practiceComparison: data.practice_comparison,
      parentExplanation: data.parent_explanation,
    },
    error: null,
  };
}

/**
 * Migration 245 — the caller's own attempt's Writing assessment records,
 * a direct RLS-gated `.from()` read (ali_writing_assessment_select_own,
 * migration 245: read-your-own-or-admin), matching this file's own
 * established "direct read for owned records, RPC only for writes"
 * convention. Deliberately separate from getMockAttemptReport() — see
 * MockWritingAssessment's own doc comment for why this is never folded
 * into the report's own `overall`.
 */
interface AliWritingAssessmentRow {
  question_id: string;
  task_type: string;
  rubric_version: number;
  assessment_version: number;
  response_text: string;
  dimensions: MockWritingAssessment["dimensions"];
  overall_indicator: number;
  assessment_status: string;
  review_required_reasons: string[] | null;
  automated_model: string;
  automated_assessed_at: string;
  human_reviewed_at: string | null;
  human_review_notes: string | null;
  human_review_dimensions: MockWritingAssessment["dimensions"] | null;
}

export async function getMockWritingAssessments(
  supabase: SupabaseClient<Database>,
  attemptId: string
): Promise<MockClientResult<MockWritingAssessment[]>> {
  // Migration 245's ali_writing_assessment table is NOT YET APPLIED
  // (prepared for Founder review, per this repository's standing
  // convention) — types/supabase.ts is generated from the live schema
  // and genuinely cannot type a table that does not exist there yet.
  // This cast is an honest reflection of that fact, matching migration
  // 244's own established pattern; remove once migration 245 is applied
  // and types are regenerated.
  const { data, error } = await (
    supabase.from as unknown as (table: "ali_writing_assessment") => {
      select: (columns: string) => { eq: (col: string, val: string) => Promise<{ data: AliWritingAssessmentRow[] | null; error: { message: string } | null }> };
    }
  )("ali_writing_assessment")
    .select(
      "question_id, task_type, rubric_version, assessment_version, response_text, dimensions, overall_indicator, assessment_status, review_required_reasons, automated_model, automated_assessed_at, human_reviewed_at, human_review_notes, human_review_dimensions"
    )
    .eq("attempt_id", attemptId);
  if (error) return { data: null, error: error.message };
  const rows = (data ?? []).map(
    (r): MockWritingAssessment => ({
      questionId: r.question_id,
      taskType: r.task_type as "Q1" | "Q2",
      rubricVersion: r.rubric_version,
      assessmentVersion: r.assessment_version,
      responseText: r.response_text,
      dimensions: r.dimensions,
      overallIndicator: r.overall_indicator,
      assessmentStatus: r.assessment_status as "complete" | "review_required",
      reviewRequiredReasons: r.review_required_reasons,
      automatedModel: r.automated_model,
      automatedAssessedAt: r.automated_assessed_at,
      humanReviewedAt: r.human_reviewed_at,
      humanReviewNotes: r.human_review_notes,
      humanReviewDimensions: r.human_review_dimensions,
    })
  );
  return { data: rows, error: null };
}

/**
 * Migration 245 — admin-only (mock_review_writing_assessment()'s own
 * gate). The human-review safety net's one write path: records a
 * reviewer's own separate judgement alongside the untouched original
 * automated assessment, never replacing it.
 */
export async function reviewMockWritingAssessment(
  supabase: SupabaseClient<Database>,
  attemptId: string,
  questionId: string,
  humanReviewDimensions: unknown,
  humanReviewNotes: string
): Promise<MockClientResult<true>> {
  const { error } = await (
    supabase.rpc as unknown as (
      fn: "mock_review_writing_assessment",
      args: Record<string, unknown>
    ) => Promise<{ data: null; error: { message: string } | null }>
  )("mock_review_writing_assessment", {
    p_attempt_id: attemptId,
    p_question_id: questionId,
    p_human_review_dimensions: humanReviewDimensions,
    p_human_review_notes: humanReviewNotes,
  });
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

/**
 * Programme Completion Increment 016, Founder invocation-reliability
 * repair, Part C — a direct, owner-scoped `.from()` read of the attempt's
 * OWN lifecycle fields (status/attemptType/formId), never its report.
 * Matches getMockAttemptReport()'s own established "direct read for
 * attempt/report metadata, not a wrapping RPC" precedent (this file's own
 * docstring on that function), and reads only columns the existing
 * `ali_mock_attempt_select_own` RLS policy (migration 070) already
 * permits the owning learner to see regardless of submission/scoring
 * state — no RLS change of any kind. Exists so the mock-report page can
 * decide whether a bounded scoring-recovery request is even plausible
 * (lib/mockAttempt/workspace.ts's own isReadingScoringRecoveryEligible())
 * without needing anything this policy does not already grant.
 */
export async function getMockAttemptSummary(
  supabase: SupabaseClient<Database>,
  attemptId: string
): Promise<MockClientResult<{ status: MockAttemptStatus; attemptType: MockAttemptType; formId: string } | null>> {
  const { data, error } = await supabase
    .from("ali_mock_attempt")
    .select("status, attempt_type, form_id")
    .eq("id", attemptId)
    .maybeSingle();
  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };
  return {
    data: {
      status: data.status as MockAttemptStatus,
      attemptType: data.attempt_type as MockAttemptType,
      formId: data.form_id,
    },
    error: null,
  };
}

/**
 * Mock Governance Architecture Increment 001 (Decision 135) — thin
 * wrappers around the 3 new SECURITY DEFINER functions (migration 085).
 * Not yet wired into any route (Mock remains unavailable, mock_eligible
 * still 0) — declared here so a future increment's Parent Dashboard/Mock
 * UI work has the same sanctioned, RPC-only access pattern every other
 * Mock function in this file already established, rather than reaching
 * for a direct `.from()` call.
 */

/**
 * Creates a normal, cadence-gated Mock cycle. Fails (via the RPC error
 * channel, never a thrown exception) if a cycle is still open, or if the
 * ~14-day interval since the profile's own last scheduled cycle has not
 * yet elapsed — the server is the sole authority on both checks.
 */
export async function startNewMockCycle(
  supabase: SupabaseClient<Database>
): Promise<MockClientResult<string>> {
  const { data, error } = await supabase.rpc("mock_start_new_cycle");
  if (error) return { data: null, error: error.message };
  return { data: data as string, error: null };
}

/**
 * Creates a parent-authorised additional Mock cycle, bypassing the
 * cadence check only. Persisted as initiated_by = 'parent_override',
 * never merged with a normal 'scheduled' cycle. This function grants no
 * payment/entitlement capability and makes no commercial claim — see
 * migration 085's own header for the disclosed limitation that this
 * codebase has no separate parent identity, and Decision 135 for the
 * approved-but-unimplemented extra-cost principle. Callers of this
 * wrapper must only ever be reached from a genuine Parent Dashboard
 * control, never from the child-facing Mock-taking flow — this file
 * cannot enforce that by itself, only document it.
 */
export async function authoriseExtraMockCycle(
  supabase: SupabaseClient<Database>
): Promise<MockClientResult<string>> {
  const { data, error } = await supabase.rpc("mock_authorise_extra_cycle");
  if (error) return { data: null, error: error.message };
  return { data: data as string, error: null };
}

/**
 * Creates one subject-pure ("full_mock") attempt within an already-owned,
 * still-open cycle. The form must carry a non-null subject (Mathematics
 * or English) — a combined/legacy form is rejected server-side. Distinct
 * from createMockAttempt() above, which now refuses attemptType
 * "full_mock" entirely (migration 085) and remains the correct call only
 * for "timed_section"/"diagnostic_mock" (e.g. familiarisation) attempts,
 * which stay uncycled exactly as before.
 */
export async function createMockCycleAttempt(
  supabase: SupabaseClient<Database>,
  formId: string,
  cycleId: string
): Promise<MockClientResult<string>> {
  const { data, error } = await supabase.rpc("mock_create_cycle_attempt", { p_form_id: formId, p_cycle_id: cycleId });
  if (error) return { data: null, error: error.message };
  return { data: data as string, error: null };
}
