import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Reading Mock Report Release — Authenticated Transport Only.
 *
 * Mirrors app/api/mock-manual-mark/route.ts's own exact rationale and
 * pattern: `public.mock_release_report()` (migration 074, hardened by
 * migration 227 to also require `analysis_state = 'complete'`)
 * deliberately derives admin authority from `auth.uid()` via `is_
 * current_user_admin()` -- which only resolves inside a genuine
 * Supabase/PostgREST request carrying the caller's own JWT. The
 * Supabase Dashboard SQL Editor (and any direct Postgres connection)
 * bypasses PostgREST entirely, so `auth.uid()` is NULL there and the
 * function correctly, safely refuses every call from that channel --
 * already proven this same session for `mock_apply_manual_mark()`.
 *
 * This route is transport only. It makes no release decision of any
 * kind: it does not check scoring_state/analysis_state itself, does not
 * touch `ali_mock_attempt_report` directly, and does not compute
 * anything -- `mock_release_report()` alone owns every precondition and
 * the actual write, exactly as it already did before this route existed.
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ReleaseLogStage = "config" | "auth" | "request" | "rpc";
type ReleaseFailureCategory = "unauthenticated" | "forbidden" | "invalid_request" | "release_rejected" | "server_error";

/**
 * The ONLY logging this route emits. Every field is a fixed literal or
 * an id/category this route already trusted before logging it -- never
 * the request body, never a database row's content, never the
 * Authorization header, never a raw Postgres/PostgREST error message.
 */
function logReleaseEvent(attemptId: string, stage: ReleaseLogStage, outcome: "success" | "failure", reason?: string): void {
  console.log(
    JSON.stringify({
      scope: "mock-release-report",
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
 * caller may see -- never the raw message itself. Matched only against
 * `mock_release_report()`'s own two fixed, developer-authored exception
 * messages (migration 074's admin check, migration 227's hardened
 * release-precondition check); anything else is bucketed as
 * `server_error`.
 */
function classifyReleaseFailure(message: string | undefined | null): ReleaseFailureCategory {
  if (message === "Only an admin may release a Mock report") return "forbidden";
  if (message?.startsWith("Report for attempt ") && message.includes("cannot be released")) return "release_rejected";
  return "server_error";
}

const FAILURE_STATUS: Record<ReleaseFailureCategory, number> = {
  unauthenticated: 401,
  forbidden: 403,
  invalid_request: 400,
  release_rejected: 409,
  server_error: 502,
};

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    logReleaseEvent("unknown", "config", "failure", "not_configured");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    logReleaseEvent("unknown", "auth", "failure", "missing_authorization");
    return NextResponse.json({ error: "unauthenticated" }, { status: FAILURE_STATUS.unauthenticated });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logReleaseEvent("unknown", "request", "failure", "invalid_body");
    return NextResponse.json({ error: "invalid_request" }, { status: FAILURE_STATUS.invalid_request });
  }

  const { attemptId } = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  if (typeof attemptId !== "string" || !UUID_PATTERN.test(attemptId)) {
    logReleaseEvent("unknown", "request", "failure", "invalid_attempt_id");
    return NextResponse.json({ error: "invalid_request" }, { status: FAILURE_STATUS.invalid_request });
  }

  // The caller's own forwarded session -- identical pattern to every
  // other Mock route in this app. The RPC executes as THIS caller,
  // under mock_release_report()'s own is_current_user_admin() gate --
  // never a privileged connection, never a caller-supplied identity.
  const callerClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  try {
    const { error } = await callerClient.rpc("mock_release_report", {
      p_attempt_id: attemptId,
    });

    if (error) {
      const category = classifyReleaseFailure(error.message);
      logReleaseEvent(attemptId, "rpc", "failure", category);
      return NextResponse.json({ error: category }, { status: FAILURE_STATUS[category] });
    }

    logReleaseEvent(attemptId, "rpc", "success");
    return NextResponse.json({ released: true });
  } catch {
    // A thrown (not RPC-returned) error -- e.g. PostgREST unreachable.
    // Never the caller's problem to unwind in detail.
    logReleaseEvent(attemptId, "rpc", "failure", "server_error");
    return NextResponse.json({ error: "server_error" }, { status: FAILURE_STATUS.server_error });
  }
}
