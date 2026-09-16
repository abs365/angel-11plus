import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * CSSE Two-Paper Mock P1 Repair, English Full Mock assessment completion —
 * the smallest safe admin transport for the existing, unmodified
 * mock_apply_manual_mark() (migration 227, widened to english-full-mock-v1
 * by migration 252) via its existing HTTP surface,
 * app/api/mock-manual-mark/route.ts. Mirrors lib/mockAttempt/
 * readingScoringRequest.ts's own established pattern exactly: the
 * caller's own current session token, read the normal, already-sanctioned
 * way every other Mock recovery request in this app already reads it
 * (supabase.auth.getSession()) — never persisted, never logged, never
 * exposed to the admin operator in any form. This module makes no marking
 * decision of any kind and asserts nothing about correctness; the database
 * remains the sole authority on whether a given mark is accepted.
 */

export type ManualMarkRequestOutcome =
  | { ok: true; status: number; requiresManualMarkingCount?: number }
  | { ok: false; status: number | null; reason: string };

const BOUNDED_REASON_MAX_LENGTH = 120;

/** Same bounded-reason discipline as readingScoringRequest.ts's own boundedFailureReason(). */
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
 * Applies exactly one governed manual mark via the existing
 * /api/mock-manual-mark route. Always resolves — never throws — with a
 * typed outcome; the database's own is_current_user_admin() gate and
 * mock_apply_manual_mark()'s own invariants (bounded mark, correct phase,
 * canonical marks match) are the entire authority here — this function
 * adds no judgement of its own.
 */
export async function applyManualMark(
  supabase: SupabaseClient<Database> | null,
  attemptId: string,
  questionId: string,
  marksAwarded: number
): Promise<ManualMarkRequestOutcome> {
  if (!supabase) return { ok: false, status: null, reason: "no_client" };
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { ok: false, status: null, reason: "no_session" };

    const response = await fetch("/api/mock-manual-mark", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ attemptId, questionId, marksAwarded }),
    });
    if (!response.ok) {
      return { ok: false, status: response.status, reason: await boundedFailureReason(response) };
    }
    const result = (await response.json().catch(() => null)) as { requiresManualMarkingCount?: unknown } | null;
    return {
      ok: true,
      status: response.status,
      requiresManualMarkingCount: typeof result?.requiresManualMarkingCount === "number" ? result.requiresManualMarkingCount : undefined,
    };
  } catch {
    return { ok: false, status: null, reason: "network_error" };
  }
}
