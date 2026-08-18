import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { isValidMockQuestionPayload, isPayloadRedactionSafe } from "./redaction";
import type { ActiveMockForm, MockAttemptStatus, MockAttemptType, MockQuestionPayload } from "./types";

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
