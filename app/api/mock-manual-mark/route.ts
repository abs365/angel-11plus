import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Reading Mock Manual Marking — Authenticated Transport Only.
 *
 * This route exists for exactly one reason, proven in production before
 * it was written: `public.mock_apply_manual_mark()` (migration 227)
 * deliberately derives both the caller's admin authority
 * (`is_current_user_admin()`) and marker identity from `auth.uid()` —
 * which only resolves inside a genuine Supabase/PostgREST request
 * carrying the caller's own JWT. The Supabase Dashboard SQL Editor (and
 * any direct Postgres connection, including the one `lib/server/
 * mockScoringAuthority.ts` uses for `MOCK_SCORING_DATABASE_URL`) bypasses
 * PostgREST entirely, so `auth.uid()` is NULL there and the function
 * correctly, safely refuses every call from that channel. This route is
 * the smallest authenticated transport that reaches the function through
 * the channel it actually depends on — mirroring `/api/mock-reading-
 * scoring/route.ts`'s own exact established pattern: forward the
 * caller's own Authorization header into an anon-key client, so the RPC
 * executes under the caller's own real session, never a privileged one.
 *
 * This route makes NO marking decision of any kind. It does not compute
 * status, does not compute totals, does not touch `ali_mock_attempt_
 * report`/`ali_mock_manual_mark_audit`/`ali_mock_attempt_answer`/`ali_
 * mock_attempt` directly, and does not invoke `mock_analyse_attempt()`
 * separately — migration 227's own function owns all of that,
 * transactionally, regardless of who calls it or how. The ONLY
 * authority this route adds is bounded input shape validation, applied
 * BEFORE the RPC call so a malformed request never even reaches the
 * database; the canonical mark bound itself is deliberately NOT
 * duplicated here — `mock_apply_manual_mark()` alone derives that from
 * the live `ali_question_bank` row (see migration 227's own CORRECTION
 * HISTORY for why that authority must never live anywhere else).
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const QUESTION_ID_MAX_LENGTH = 200;

type ManualMarkLogStage = "config" | "auth" | "request" | "rpc";
type ManualMarkFailureCategory = "unauthenticated" | "forbidden" | "invalid_request" | "mark_rejected" | "server_error";

/**
 * The ONLY logging this route emits. Every field is a fixed literal or
 * an id/category this route already trusted before logging it — never
 * the request body, never a database row's content, never the
 * Authorization header, never a raw Postgres/PostgREST error message.
 * Mirrors `/api/mock-reading-scoring/route.ts`'s own `logScoringEvent()`
 * convention exactly (independently defined here, not imported — each
 * Mock API route in this codebase owns its own bounded logger).
 */
function logManualMarkEvent(attemptId: string, stage: ManualMarkLogStage, outcome: "success" | "failure", reason?: string): void {
  console.log(
    JSON.stringify({
      scope: "mock-manual-mark",
      attemptId,
      stage,
      outcome,
      reason: reason ? reason.slice(0, 200) : undefined,
      at: new Date().toISOString(),
    })
  );
}

/**
 * Classifies an RPC failure into one of the bounded categories the
 * caller may see — never the raw message itself. Matched only against
 * migration 227's own fixed, developer-authored admin-check message;
 * every other exception `mock_apply_manual_mark()` can raise is a
 * legitimate database-authoritative refusal of this specific mark
 * (already-resolved outcome, wrong scoring phase, mark out of bound,
 * stale marksAvailable, etc.) and is bucketed as `mark_rejected` — the
 * caller is told the mark was rejected, never why in raw form, matching
 * this route's own "no raw PostgreSQL exception message to the browser"
 * requirement. Rethrows (network-level, PostgREST-unreachable, or any
 * shape this route did not anticipate) are bucketed as `server_error`.
 */
function classifyManualMarkFailure(message: string | undefined | null): ManualMarkFailureCategory {
  if (message === "Only an admin may apply a manual Mock mark") return "forbidden";
  if (message === "Marker profile could not be resolved for the current session") return "forbidden";
  return "mark_rejected";
}

const FAILURE_STATUS: Record<ManualMarkFailureCategory, number> = {
  unauthenticated: 401,
  forbidden: 403,
  invalid_request: 400,
  mark_rejected: 409,
  server_error: 502,
};

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    logManualMarkEvent("unknown", "config", "failure", "not_configured");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    logManualMarkEvent("unknown", "auth", "failure", "missing_authorization");
    return NextResponse.json({ error: "unauthenticated" }, { status: FAILURE_STATUS.unauthenticated });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logManualMarkEvent("unknown", "request", "failure", "invalid_body");
    return NextResponse.json({ error: "invalid_request" }, { status: FAILURE_STATUS.invalid_request });
  }

  const { attemptId, questionId, marksAwarded } =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  if (typeof attemptId !== "string" || !UUID_PATTERN.test(attemptId)) {
    logManualMarkEvent("unknown", "request", "failure", "invalid_attempt_id");
    return NextResponse.json({ error: "invalid_request" }, { status: FAILURE_STATUS.invalid_request });
  }
  if (typeof questionId !== "string" || questionId.length === 0 || questionId.length > QUESTION_ID_MAX_LENGTH) {
    logManualMarkEvent(attemptId, "request", "failure", "invalid_question_id");
    return NextResponse.json({ error: "invalid_request" }, { status: FAILURE_STATUS.invalid_request });
  }
  if (typeof marksAwarded !== "number" || !Number.isFinite(marksAwarded) || marksAwarded < 0) {
    logManualMarkEvent(attemptId, "request", "failure", "invalid_marks_awarded");
    return NextResponse.json({ error: "invalid_request" }, { status: FAILURE_STATUS.invalid_request });
  }

  // The caller's own forwarded session — the identical anon-key +
  // forwarded-Authorization pattern every other Mock route in this app
  // already uses. The RPC below executes as THIS caller, under
  // mock_apply_manual_mark()'s own is_current_user_admin() gate and its
  // own auth.uid()-derived marker identity — never a privileged
  // connection, never a caller-supplied identity of any kind.
  const callerClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  try {
    const { data, error } = await callerClient.rpc("mock_apply_manual_mark", {
      p_attempt_id: attemptId,
      p_question_id: questionId,
      p_marks_awarded: marksAwarded,
    });

    if (error) {
      const category = classifyManualMarkFailure(error.message);
      logManualMarkEvent(attemptId, "rpc", "failure", category);
      return NextResponse.json({ error: category }, { status: FAILURE_STATUS[category] });
    }

    const result = data as { status?: unknown; requiresManualMarkingCount?: unknown } | null;
    logManualMarkEvent(attemptId, "rpc", "success", typeof result?.status === "string" ? result.status : undefined);
    return NextResponse.json({
      status: result?.status,
      requiresManualMarkingCount: result?.requiresManualMarkingCount,
    });
  } catch {
    // A thrown (not RPC-returned) error -- e.g. PostgREST unreachable.
    // Never the caller's problem to unwind in detail.
    logManualMarkEvent(attemptId, "rpc", "failure", "server_error");
    return NextResponse.json({ error: "server_error" }, { status: FAILURE_STATUS.server_error });
  }
}
