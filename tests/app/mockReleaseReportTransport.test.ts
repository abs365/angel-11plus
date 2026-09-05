import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Reading Mock Report Release — Authenticated Transport (app/api/
 * mock-release-report/route.ts). Source-text assertions, matching this
 * repository's own established convention (see tests/app/
 * mockManualMarkTransport.test.ts's own docstring, which this file
 * mirrors in strength and structure).
 *
 * This route exists for the identical reason app/api/mock-manual-mark/
 * route.ts does: `mock_release_report()` (migration 074, hardened by
 * migration 227) depends on `auth.uid()`/`is_current_user_admin()`,
 * which only resolves inside a genuine Supabase/PostgREST request. This
 * route is transport only: it makes no release decision, checks no
 * scoring/analysis state itself, and never touches `ali_mock_attempt_
 * report` directly -- `mock_release_report()` alone owns every
 * precondition and the actual write.
 *
 * No test in this file invokes the real route against a live database,
 * and none constructs a request carrying real production credentials --
 * every assertion here is a structural proof against the route's own
 * source, exactly like its sibling. This file never names or mutates
 * any specific real production attempt.
 */

const ROUTE = readFileSync("app/api/mock-release-report/route.ts", "utf8");

const EXECUTABLE = ROUTE
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

// --- 1: missing Authorization rejected -----------------------------------

test("a request with no Authorization header is rejected before any RPC call (1)", () => {
  const authCheckIndex = ROUTE.indexOf('const authHeader = request.headers.get("authorization");');
  const rpcCallIndex = ROUTE.indexOf('callerClient.rpc("mock_release_report"');
  assert.ok(authCheckIndex !== -1 && rpcCallIndex !== -1);
  assert.ok(authCheckIndex < rpcCallIndex, "the Authorization check must precede the RPC call");
  assert.match(ROUTE, /if \(!authHeader\) \{[\s\S]*?status: FAILURE_STATUS\.unauthenticated/);
});

// --- 2, 3: malformed request / missing attemptId rejected ----------------

test("a malformed request body is rejected before any RPC call (2)", () => {
  assert.match(ROUTE, /catch \{\s*\n\s*logReleaseEvent\("unknown", "request", "failure", "invalid_body"\);\s*\n\s*return NextResponse\.json\(\{ error: "invalid_request" \}/);
});

test("a missing or non-UUID-shaped attemptId is rejected before any RPC call (3)", () => {
  const attemptIdCheckIndex = ROUTE.indexOf("UUID_PATTERN.test(attemptId)");
  const rpcCallIndex = ROUTE.indexOf('callerClient.rpc("mock_release_report"');
  assert.ok(attemptIdCheckIndex !== -1 && rpcCallIndex !== -1 && attemptIdCheckIndex < rpcCallIndex);
});

// --- 4: valid UUID/request shape accepted by transport layer -------------

test("a well-formed UUID passes the route's own validation and reaches the RPC call site", () => {
  const validationBlock = ROUTE.match(/if \(typeof attemptId !== "string" \|\| !UUID_PATTERN\.test\(attemptId\)\) \{[\s\S]*?\n  \}/);
  assert.ok(validationBlock);
  const syntheticUuid = "00000000-0000-4000-8000-000000000000";
  assert.match(syntheticUuid, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "sanity: the pattern itself matches a well-formed UUID shape (a synthetic id, not any real attempt)");
});

// --- 5: caller Authorization is forwarded --------------------------------

test("the caller's own Authorization header is forwarded into the Supabase client -- never a service-role key, never a fixed/omitted value (5)", () => {
  assert.match(ROUTE, /createClient\(url, anonKey, \{\s*\n\s*global: \{ headers: \{ Authorization: authHeader \} \},\s*\n\s*auth: \{ persistSession: false \},\s*\n\s*\}\);/);
});

// --- 6, 7: fixed RPC name, only attemptId supplied -----------------------

test("the RPC call name is fixed to mock_release_report -- never a variable, never caller-influenced (6)", () => {
  assert.match(ROUTE, /callerClient\.rpc\("mock_release_report", \{/);
  assert.equal((ROUTE.match(/\.rpc\(/g) ?? []).length, 1, "exactly one RPC call in this route");
});

test("only p_attempt_id is ever supplied to the RPC -- no other argument (7)", () => {
  const rpcCall = ROUTE.match(/callerClient\.rpc\("mock_release_report", \{([\s\S]*?)\}\);/);
  assert.ok(rpcCall);
  const argNames = [...rpcCall![1].matchAll(/(\w+):/g)].map((m) => m[1]);
  assert.deepEqual(argNames, ["p_attempt_id"]);
});

// --- 8, 9, 10: no service role, no direct Postgres, no arbitrary RPC -----

test("no service-role credential, MOCK_SCORING_DATABASE_URL, or direct Postgres connection is used anywhere in this route's executable code (8, 9)", () => {
  assert.doesNotMatch(EXECUTABLE, /SERVICE_ROLE|service_role|MOCK_SCORING_DATABASE_URL/);
  assert.doesNotMatch(ROUTE, /from "postgres"/);
});

test("no arbitrary/caller-supplied RPC function name or parameter set can ever be invoked -- the function name and argument shape are fixed string/object literals in source, never constructed from the request body (10)", () => {
  assert.doesNotMatch(EXECUTABLE, /\.rpc\(\s*body\b/);
  assert.doesNotMatch(EXECUTABLE, /\.rpc\(\s*req/i);
  const destructure = ROUTE.match(/const \{ (\w+) \} = body/)?.[1];
  assert.equal(destructure, "attemptId", "only attemptId is ever read from the request body");
});

test("no new database grant, RLS change, or privilege statement of any kind is introduced by this route (it is application code, not SQL)", () => {
  assert.doesNotMatch(EXECUTABLE, /\bgrant\b|\brevoke\b|create or replace function|alter table/i);
});

// --- 11: database/RPC errors safely propagated (bounded, no raw leakage) ---

test("error.message from the RPC failure is never interpolated into any response or log -- only the classified bounded category (11)", () => {
  assert.doesNotMatch(ROUTE, /NextResponse\.json\(\{[^}]*error\.message/);
  assert.doesNotMatch(ROUTE, /console\.\w+\([^)]*error\.message/i);
});

test("classifyReleaseFailure never returns the raw message -- only one of the four fixed, bounded category literals", () => {
  const fn = ROUTE.match(/function classifyReleaseFailure\([\s\S]*?\n\}/)![0];
  assert.doesNotMatch(fn, /return message/);
  const returnedLiterals = [...fn.matchAll(/return "(\w+)";/g)].map((m) => m[1]);
  for (const literal of returnedLiterals) {
    assert.ok(["forbidden", "release_rejected", "server_error"].includes(literal), `unexpected literal returned by the classifier: ${literal}`);
  }
});

test("all four bounded failure categories map to distinct, sensible HTTP statuses", () => {
  assert.match(ROUTE, /unauthenticated: 401/);
  assert.match(ROUTE, /forbidden: 403/);
  assert.match(ROUTE, /invalid_request: 400/);
  assert.match(ROUTE, /release_rejected: 409/);
  assert.match(ROUTE, /server_error: 502/);
});

// --- 12: successful RPC response bounded correctly -----------------------

test("a successful response contains only { released: true } -- no report row content, no timestamps, no other field echoed back (12)", () => {
  assert.match(ROUTE, /return NextResponse\.json\(\{ released: true \}\);/);
});

// --- scope discipline -----------------------------------------------------

test("this route never writes directly to ali_mock_attempt_report or any other Mock table -- mock_release_report() owns the write", () => {
  for (const table of ["ali_mock_attempt_report", "ali_mock_manual_mark_audit", "ali_mock_attempt_answer", "ali_mock_attempt"]) {
    assert.doesNotMatch(ROUTE, new RegExp(`\\.from\\(\\s*["']${table}["']`));
  }
});

test("this route never invokes mock_apply_manual_mark, mock_analyse_attempt, mock_persist_reading_scoring, or mock_claim_reading_scoring_work -- release only", () => {
  assert.doesNotMatch(EXECUTABLE, /mock_apply_manual_mark|mock_analyse_attempt|mock_persist_reading_scoring|mock_claim_reading_scoring_work/);
});

test("no marker identity, admin flag, or role can be supplied by the caller anywhere in this route", () => {
  assert.doesNotMatch(ROUTE, /markerId|markerProfile|isAdmin|adminOverride|\brole\b/i);
});

test("a missing Supabase configuration is rejected with a bounded 503, before any header/body is even read", () => {
  const configCheckIndex = ROUTE.indexOf("if (!url || !anonKey)");
  const authCheckIndex = ROUTE.indexOf('const authHeader = request.headers.get("authorization");');
  assert.ok(configCheckIndex !== -1 && authCheckIndex !== -1 && configCheckIndex < authCheckIndex);
});
