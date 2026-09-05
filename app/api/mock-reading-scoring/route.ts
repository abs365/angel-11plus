import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { scoreReadingAttempt } from "@/lib/server/mockScoringAuthority";
import { classifyPersistGuard } from "@/lib/mockAttempt/persistGuardClassifier";

/**
 * Programme Completion Increment 016, Founder invocation-reliability
 * repair, Part B — the ONLY logging this route (or
 * lib/server/mockScoringAuthority.ts, which logs nothing at all) ever
 * emits. Every field is a fixed, developer-authored literal or an id/
 * status this route already trusted before this repair — never the
 * request body, never a database row's content, never the Authorization
 * header. `reason`, when present, is truncated defensively even though
 * every caller already passes a short literal, so a future caller adding
 * a new reason string can never accidentally grow this into an
 * unbounded log line.
 */
type ScoringLogStage = "config" | "auth" | "request" | "ownership" | "scorer";

function logScoringEvent(attemptId: string, stage: ScoringLogStage, outcome: "success" | "failure", reason?: string): void {
  console.log(
    JSON.stringify({
      scope: "mock-reading-scoring",
      attemptId,
      stage,
      outcome,
      reason: reason ? reason.slice(0, 200) : undefined,
      at: new Date().toISOString(),
    })
  );
}

/**
 * Increment 025 (Founder-approved, bounded observability only) — the
 * scorer catch previously reduced every exception to `err.name`, which a
 * production minified build renders as an uninformative mangled symbol
 * for any locally-defined error class (confirmed: `postgres`'s own
 * PostgresError sets `this.name = this.constructor.name`). Reads the same
 * class of fixed, non-secret Postgres wire-protocol diagnostic fields
 * (SQLSTATE code, severity, source routine) already documented in
 * `postgres`'s own PostgresError type, plus the bounded claim/compute/
 * persist stage tag `scoreReadingAttempt()` attaches to the error before
 * rethrowing it unmodified.
 *
 * `err.message` is passed to classifyPersistGuard() for in-process
 * comparison ONLY, against migration 219's own fixed RAISE EXCEPTION
 * templates — the message itself, and any interpolated attempt/question
 * id or count it carries, is never read or used here beyond that one
 * comparison, and never appears in this function's own return value. The
 * return value is diagnostic metadata only, still never returned to the
 * browser.
 */
function scorerExceptionDiagnostic(err: unknown): string {
  const stage =
    err && typeof err === "object" && "scoringStage" in err && typeof (err as { scoringStage: unknown }).scoringStage === "string"
      ? (err as { scoringStage: string }).scoringStage
      : "unknown";
  const guard = classifyPersistGuard(err instanceof Error ? err.message : undefined);
  if (err instanceof postgres.PostgresError) {
    return `exception:${err.code};severity:${err.severity};routine:${err.routine};stage:${stage};guard:${guard}`;
  }
  return `exception:${err instanceof Error ? err.name : "unknown"};severity:unknown;routine:unknown;stage:${stage};guard:${guard}`;
}

/**
 * Programme Completion Increment 016 — Authoritative Reading Comprehension
 * Scoring, the one HTTP surface a learner's own browser may call after a
 * genuine Reading Mock submission. Deliberately thin: this route's own
 * job is exactly one thing — confirm the CALLER genuinely owns the
 * attempt they're asking about, using the SAME RLS-scoped read every
 * other Mock read in this app already uses (the caller's own forwarded
 * access token, anon key, no elevated privilege at all) — then hand off
 * to lib/server/mockScoringAuthority.ts's own, separately-verified
 * (status/form/manifest/marks/TIER3) privileged operation. This route
 * itself asserts nothing about correctness, marks, or scoring state; it
 * only decides whether this caller is allowed to REQUEST that their own
 * attempt be processed — an ordinary web-app authorization check, not a
 * scoring-integrity boundary (that boundary lives entirely inside
 * migration 219's own functions, and holds regardless of what this route
 * does or fails to do).
 */
export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    logScoringEvent("unknown", "config", "failure", "not_configured");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    logScoringEvent("unknown", "auth", "failure", "missing_authorization");
    return NextResponse.json({ error: "Missing authorization." }, { status: 401 });
  }

  let attemptId: string;
  try {
    const body = await request.json();
    attemptId = body.attemptId;
  } catch {
    logScoringEvent("unknown", "request", "failure", "invalid_body");
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!attemptId || typeof attemptId !== "string") {
    logScoringEvent("unknown", "request", "failure", "missing_attempt_id");
    return NextResponse.json({ error: "attemptId is required." }, { status: 400 });
  }

  // RLS-scoped read using the caller's own forwarded session — the same
  // trust level as every other Mock read this app already performs
  // client-side, not the privileged scoring connection. A caller can only
  // ever see their own attempts here; this is ordinary RLS, unmodified.
  const learnerClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: attempt, error } = await learnerClient
    .from("ali_mock_attempt")
    .select("id, status, form_id")
    .eq("id", attemptId)
    .maybeSingle();

  if (error || !attempt) {
    logScoringEvent(attemptId, "ownership", "failure", "attempt_not_found");
    return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
  }
  if (attempt.status !== "submitted") {
    logScoringEvent(attemptId, "ownership", "failure", "not_submitted");
    return NextResponse.json({ error: "Attempt is not submitted." }, { status: 409 });
  }
  if (attempt.form_id !== "reading-comprehension-mock-1") {
    logScoringEvent(attemptId, "ownership", "failure", "wrong_form");
    return NextResponse.json({ error: "Not a Reading Comprehension Mock 1 attempt." }, { status: 400 });
  }

  // Founder invocation-reliability repair, Part B — every branch below is
  // now explicit and logged, including a thrown exception (a Postgres
  // connection failure, or any other unexpected error inside the
  // privileged scoring call), which previously propagated unhandled and
  // left zero trace anywhere. The browser is deliberately never given the
  // exception's own message (Section B: "do not expose internal database
  // errors or secrets to the browser") — only this bounded, generic
  // response; the real detail goes to logScoringEvent()'s own bounded
  // reason only.
  try {
    const result = await scoreReadingAttempt(attemptId);
    if (result.status === "unavailable") {
      logScoringEvent(attemptId, "scorer", "failure", "scorer_unavailable");
      return NextResponse.json({ error: "Scoring temporarily unavailable." }, { status: 503 });
    }
    if (result.status === "ineligible") {
      logScoringEvent(attemptId, "scorer", "failure", `ineligible:${result.reason}`);
      return NextResponse.json(result);
    }
    logScoringEvent(attemptId, "scorer", "success", result.status);
    return NextResponse.json(result);
  } catch (err) {
    logScoringEvent(attemptId, "scorer", "failure", scorerExceptionDiagnostic(err));
    return NextResponse.json({ error: "Scoring processing failed." }, { status: 502 });
  }
}
