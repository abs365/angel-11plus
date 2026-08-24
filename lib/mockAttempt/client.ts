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
  attemptType: MockAttemptType
): Promise<MockClientResult<ActiveMockForm | null>> {
  const { data, error } = await supabase.rpc("mock_get_active_form", { p_attempt_type: attemptType });
  if (error) return { data: null, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { data: null, error: null };
  return { data: { formId: row.form_id, attemptType: row.attempt_type as MockAttemptType }, error: null };
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
