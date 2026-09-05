import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Reading Mock Manual Marking — Authenticated Transport (app/api/
 * mock-manual-mark/route.ts). Source-text assertions, matching this
 * repository's own established convention for a Next.js API route (see
 * tests/app/mockReadingScoringObservability.test.ts's own docstring).
 *
 * This route was created after production evidence proved the Supabase
 * SQL Editor is not a valid execution channel for `mock_apply_manual_
 * mark()` -- that function's own `is_current_user_admin()` gate and
 * marker-identity derivation both depend on `auth.uid()`, which only
 * resolves inside a genuine authenticated Supabase/PostgREST request.
 * This route is transport only: it makes no marking decision, computes
 * no status, no totals, and never invokes mock_analyse_attempt()
 * separately -- migration 227's own function owns all of that.
 */

const ROUTE = readFileSync("app/api/mock-manual-mark/route.ts", "utf8");

// Comments (this file's own explanatory JSDoc blocks, which legitimately
// name things like MOCK_SCORING_DATABASE_URL and mock_analyse_attempt()
// for context) are stripped before asserting anything about what the
// EXECUTABLE code does or doesn't reference -- matching this
// repository's own established convention for SQL migration tests.
const EXECUTABLE = ROUTE
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

// --- A: missing Authorization rejected -----------------------------------

test("a request with no Authorization header is rejected before any RPC call (A)", () => {
  const authCheckIndex = ROUTE.indexOf('const authHeader = request.headers.get("authorization");');
  const rpcCallIndex = ROUTE.indexOf('callerClient.rpc("mock_apply_manual_mark"');
  assert.ok(authCheckIndex !== -1 && rpcCallIndex !== -1);
  assert.ok(authCheckIndex < rpcCallIndex, "the Authorization check must precede the RPC call");
  assert.match(ROUTE, /if \(!authHeader\) \{[\s\S]*?status: FAILURE_STATUS\.unauthenticated/);
});

// --- B: malformed request rejected before RPC ----------------------------

test("attemptId, questionId, and marksAwarded are all validated before the RPC call -- a malformed request never reaches the database (B)", () => {
  const attemptIdCheckIndex = ROUTE.indexOf("UUID_PATTERN.test(attemptId)");
  const questionIdCheckIndex = ROUTE.indexOf("questionId.length > QUESTION_ID_MAX_LENGTH");
  const marksCheckIndex = ROUTE.indexOf("Number.isFinite(marksAwarded)");
  const rpcCallIndex = ROUTE.indexOf('callerClient.rpc("mock_apply_manual_mark"');
  assert.ok([attemptIdCheckIndex, questionIdCheckIndex, marksCheckIndex, rpcCallIndex].every((i) => i !== -1));
  assert.ok(attemptIdCheckIndex < rpcCallIndex && questionIdCheckIndex < rpcCallIndex && marksCheckIndex < rpcCallIndex);
});

test("marksAwarded must be a finite number >= 0 -- non-numeric, NaN, Infinity, and negative values are all rejected (B)", () => {
  assert.match(ROUTE, /typeof marksAwarded !== "number" \|\| !Number\.isFinite\(marksAwarded\) \|\| marksAwarded < 0/);
});

test("the route does NOT implement the canonical maximum mark bound -- only >= 0 is checked here; the upper bound remains exclusively the database's own authority (per migration 227's own CORRECTION HISTORY)", () => {
  assert.match(ROUTE, /marksAwarded < 0/, "the lower bound (>= 0) is expected and correct");
  assert.doesNotMatch(ROUTE, /marksAwarded\s*>\s*\d/, "no numeric upper-bound literal against marksAwarded should exist in this route -- that authority belongs exclusively to the database");
  assert.doesNotMatch(EXECUTABLE, /marksAvailable|canonical/i, "canonical-marks concepts must never appear in this transport-only route's executable code");
});

// --- C, I: no caller-supplied identity/authority of any kind -------------

test("only attemptId, questionId, and marksAwarded are ever destructured from the request body -- no marker identity, admin flag, or role of any kind can be supplied by the caller (C, I)", () => {
  const destructure = ROUTE.match(/const \{ ([^}]+) \} =\s*\n\s*body/)?.[1] ?? "";
  const fields = destructure.split(",").map((f) => f.trim());
  assert.deepEqual(fields.sort(), ["attemptId", "marksAwarded", "questionId"].sort());
});

test("no field resembling marker identity, admin flag, or role is read from the request body or forwarded to the RPC call anywhere in this file (C, I)", () => {
  assert.doesNotMatch(ROUTE, /markerId|markerProfile|isAdmin|adminOverride|\brole\b/i);
});

// --- D, E: correct execution channel, no privileged connection ----------

test("the route uses createClient with the caller's OWN forwarded Authorization header -- never a direct Postgres connection, never the postgres package (D)", () => {
  assert.doesNotMatch(ROUTE, /from "postgres"/, "must never import the postgres package -- that channel bypasses auth.uid() entirely, per this route's own header rationale");
  assert.match(ROUTE, /createClient\(url, anonKey, \{\s*\n\s*global: \{ headers: \{ Authorization: authHeader \} \},\s*\n\s*auth: \{ persistSession: false \},\s*\n\s*\}\);/);
});

test("no service-role credential or MOCK_SCORING_DATABASE_URL is referenced in this route's EXECUTABLE code (E) -- the header comment's own explanation of what NOT to use is expected and fine", () => {
  assert.doesNotMatch(EXECUTABLE, /SERVICE_ROLE|service_role|MOCK_SCORING_DATABASE_URL/);
});

test("only the public anon key and public Supabase URL env vars are read -- the same pair every other Mock route already uses", () => {
  assert.match(ROUTE, /process\.env\.NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(ROUTE, /process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY/);
});

// --- F: only the three approved RPC arguments ----------------------------

test("the RPC call supplies exactly p_attempt_id, p_question_id, and p_marks_awarded -- no other argument (F)", () => {
  const rpcCall = ROUTE.match(/callerClient\.rpc\("mock_apply_manual_mark", \{([\s\S]*?)\}\);/);
  assert.ok(rpcCall, "expected the mock_apply_manual_mark RPC call");
  const argNames = [...rpcCall![1].matchAll(/(\w+):/g)].map((m) => m[1]);
  assert.deepEqual(argNames.sort(), ["p_attempt_id", "p_marks_awarded", "p_question_id"].sort());
});

test("exactly one RPC call exists in this entire route -- no second invocation, no mock_analyse_attempt() called separately", () => {
  const rpcCalls = ROUTE.match(/\.rpc\(/g) ?? [];
  assert.equal(rpcCalls.length, 1);
  assert.doesNotMatch(EXECUTABLE, /mock_analyse_attempt|mock_release_report|mock_persist_reading_scoring|mock_claim_reading_scoring_work/, "this route's executable code must invoke only mock_apply_manual_mark, nothing else (the header comment's own mention of mock_analyse_attempt() for context is expected and fine)");
});

// --- G, H: bounded response shape, no raw error leakage ------------------

test("a successful response contains only status and requiresManualMarkingCount -- the bounded RPC result, nothing else (G)", () => {
  const successReturn = ROUTE.match(/return NextResponse\.json\(\{\s*\n\s*status: result\?\.status,\s*\n\s*requiresManualMarkingCount: result\?\.requiresManualMarkingCount,\s*\n\s*\}\);/);
  assert.ok(successReturn, "expected the bounded success response shape");
});

test("error.message from the RPC failure is never interpolated into any response -- only the classified bounded category (H)", () => {
  assert.doesNotMatch(ROUTE, /NextResponse\.json\(\{[^}]*error\.message/);
  assert.doesNotMatch(ROUTE, /NextResponse\.json\(\{[^}]*\$\{error/);
});

test("classifyManualMarkFailure never returns the raw message -- only one of the five fixed, bounded category literals (H)", () => {
  const fn = ROUTE.match(/function classifyManualMarkFailure\([\s\S]*?\n\}/)![0];
  assert.doesNotMatch(fn, /return message/);
  const returnedLiterals = [...fn.matchAll(/return "(\w+)";/g)].map((m) => m[1]);
  for (const literal of returnedLiterals) {
    assert.ok(["forbidden", "mark_rejected"].includes(literal), `unexpected literal returned by the classifier: ${literal}`);
  }
});

test("no stack trace, credential, or JWT is ever logged or returned -- logManualMarkEvent only ever receives fixed literals/categories/attemptId, never the Authorization header or request body", () => {
  const logger = ROUTE.match(/function logManualMarkEvent\([\s\S]*?\n\}/)![0];
  assert.doesNotMatch(logger, /authHeader|token|request\.json|body\./i);
  assert.doesNotMatch(ROUTE, /console\.\w+\([^)]*authHeader/i);
  assert.doesNotMatch(ROUTE, /console\.\w+\([^)]*error\.message/i, "raw error.message must never be logged either -- only the classified category");
});

// --- J: no direct writes, no second marking engine -----------------------

test("this route never writes directly to ali_mock_attempt_report, ali_mock_manual_mark_audit, ali_mock_attempt_answer, or ali_mock_attempt (J)", () => {
  for (const table of ["ali_mock_attempt_report", "ali_mock_manual_mark_audit", "ali_mock_attempt_answer", "ali_mock_attempt"]) {
    assert.doesNotMatch(ROUTE, new RegExp(`\\.from\\(\\s*["']${table}["']`), `must never directly touch ${table} -- mock_apply_manual_mark() owns all writes`);
  }
});

test("no marking status (correct/incorrect/partially_correct) is computed or referenced in this route -- that logic lives exclusively inside mock_apply_manual_mark() (J)", () => {
  assert.doesNotMatch(ROUTE, /"correct"|"incorrect"|"partially_correct"/);
});

// --- config / bounded failure categories ---------------------------------

test("all five bounded failure categories map to distinct, sensible HTTP statuses", () => {
  assert.match(ROUTE, /unauthenticated: 401/);
  assert.match(ROUTE, /forbidden: 403/);
  assert.match(ROUTE, /invalid_request: 400/);
  assert.match(ROUTE, /mark_rejected: 409/);
  assert.match(ROUTE, /server_error: 502/);
});

test("a missing Supabase configuration is rejected with a bounded 503, before any header/body is even read", () => {
  const configCheckIndex = ROUTE.indexOf("if (!url || !anonKey)");
  const authCheckIndex = ROUTE.indexOf('const authHeader = request.headers.get("authorization");');
  assert.ok(configCheckIndex !== -1 && authCheckIndex !== -1 && configCheckIndex < authCheckIndex);
});
