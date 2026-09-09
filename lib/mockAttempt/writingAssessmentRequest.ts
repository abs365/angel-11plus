import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Migration 245 — mirrors lib/mockAttempt/readingScoringRequest.ts's own
 * established pattern exactly (this codebase's one sanctioned way to
 * fire an authenticated, bounded-outcome, never-throwing request to a
 * Mock-adjacent API route): authenticate via the caller's own forwarded
 * session token, never inspect/trust the response body beyond a bounded
 * reason string, always resolve rather than throw.
 */
export type WritingAssessmentRequestOutcome =
  | { ok: true; status: number }
  | { ok: false; status: number | null; reason: string };

const BOUNDED_REASON_MAX_LENGTH = 120;

async function boundedFailureReason(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    const candidate =
      body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `http_${response.status}`;
    return candidate.slice(0, BOUNDED_REASON_MAX_LENGTH);
  } catch {
    return `http_${response.status}`;
  }
}

/**
 * Requests that a submitted attempt's pending Writing responses be
 * assessed. Safe to call more than once for the same attempt: the
 * underlying mock_persist_writing_assessment() RPC (migration 245) is
 * idempotent per (attempt, question) — a repeat call simply finds no
 * remaining `requires_manual_marking` Writing outcomes and returns
 * `alreadyComplete: true` without any new AI call.
 */
export async function requestMockWritingAssessment(
  supabase: SupabaseClient<Database> | null,
  attemptId: string
): Promise<WritingAssessmentRequestOutcome> {
  if (!supabase) return { ok: false, status: null, reason: "no_client" };
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { ok: false, status: null, reason: "no_session" };

    const response = await fetch("/api/mock-writing-assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ attemptId }),
    });
    if (!response.ok) {
      return { ok: false, status: response.status, reason: await boundedFailureReason(response) };
    }
    return { ok: true, status: response.status };
  } catch {
    return { ok: false, status: null, reason: "network_error" };
  }
}

export function logWritingAssessmentRequestOutcome(outcome: WritingAssessmentRequestOutcome): void {
  if (outcome.ok) return;
  console.warn("[MockExam] Writing assessment request did not succeed (non-blocking):", outcome.status, outcome.reason);
}
