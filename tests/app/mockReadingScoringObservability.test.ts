import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Founder invocation-reliability repair (Programme Completion Increment
 * 016) — Part B, server observability. Source-text assertions, matching
 * this repository's own established convention for a server-only DB-
 * touching route (see tests/lib/server/mockScoringAuthorityIncrement016.
 * test.ts's own docstring for why: the real guarantee is a genuine
 * Next.js production build/runtime, which this file cannot execute).
 *
 * Proves the exact defect the Founder's own investigation found and
 * ordered fixed: this route previously let scoreReadingAttempt() throw
 * unhandled, leaving zero server-side trace of any failure and returning
 * whatever Next.js's own default error handling produced. It now:
 *   - explicitly catches that exception;
 *   - logs one bounded, PII/secret-free operational event per outcome;
 *   - returns a bounded non-2xx response for a genuine processing
 *     failure, never the raw internal error.
 */

const ROUTE = readFileSync("app/api/mock-reading-scoring/route.ts", "utf8");

test("scoreReadingAttempt() is called inside a try/catch -- an exception can no longer propagate unhandled", () => {
  const tryBlock = ROUTE.match(/try \{[\s\S]*?const result = await scoreReadingAttempt\(attemptId\);[\s\S]*?\} catch \(err\) \{[\s\S]*?\}/);
  assert.ok(tryBlock, "the existing `const result = await scoreReadingAttempt(attemptId);` line must remain inside a try block with a matching catch");
});

test("a scorer exception returns a bounded, generic non-2xx response -- never the raw internal error message", () => {
  const catchBlock = ROUTE.match(/catch \(err\) \{([\s\S]*?)\n\}/);
  assert.ok(catchBlock, "expected a catch (err) block");
  const body = catchBlock![1];
  assert.match(body, /status: 502/);
  assert.doesNotMatch(body, /err\.message/, "must never return the raw exception message to the browser");
  assert.doesNotMatch(body, /err\}/, "must never interpolate the raw exception object into the response");
});

test("every rejection branch logs a bounded operational event before returning", () => {
  const stages = ["config", "auth", "request", "ownership", "scorer"];
  for (const stage of stages) {
    assert.match(ROUTE, new RegExp(`logScoringEvent\\([^)]*"${stage}"`), `expected at least one logScoringEvent(...) call for stage "${stage}"`);
  }
});

test("logScoringEvent never logs the Authorization header, a token, or any request/response body content", () => {
  const helper = ROUTE.match(/function logScoringEvent\([\s\S]*?\n\}/);
  assert.ok(helper);
  const body = helper![0];
  assert.doesNotMatch(body, /authHeader/i);
  assert.doesNotMatch(body, /token/i);
  assert.doesNotMatch(body, /request\.json|body\./);
});

test("a scorer 'unavailable' result now returns a bounded non-2xx response instead of a silent 200", () => {
  assert.match(
    ROUTE,
    /if \(result\.status === "unavailable"\) \{\s*\n\s*logScoringEvent\(attemptId, "scorer", "failure", "scorer_unavailable"\);\s*\n\s*return NextResponse\.json\(\{ error: "Scoring temporarily unavailable\." \}, \{ status: 503 \}\);/
  );
});

test("scoring success and ineligible results are still returned as before -- this repair changes failure handling only", () => {
  assert.match(ROUTE, /if \(result\.status === "ineligible"\) \{[\s\S]*?return NextResponse\.json\(result\);/);
  assert.match(ROUTE, /logScoringEvent\(attemptId, "scorer", "success", result\.status\);\s*\n\s*return NextResponse\.json\(result\);/);
});

test("the route's own ownership/auth/config guards (Founder-approved, unmodified in this repair) are still present unchanged", () => {
  assert.match(ROUTE, /attempt\.status !== "submitted"/);
  assert.match(ROUTE, /attempt\.form_id !== "reading-comprehension-mock-1"/);
  assert.match(ROUTE, /const result = await scoreReadingAttempt\(attemptId\);/);
  assert.doesNotMatch(ROUTE, /service_role/i);
});

/**
 * Increment 025 (Founder-approved, bounded observability only) — the
 * fresh production diagnostic found that a minified build collapses
 * `err.name` to an uninformative mangled symbol for any `postgres`
 * PostgresError (`this.name = this.constructor.name`, confirmed against
 * the installed `postgres` package's own source). These tests prove the
 * replacement diagnostic reads only fixed, non-secret Postgres fields,
 * still never reaches the browser, and still never regresses the
 * existing bounded-response contract this suite already established.
 */
test("a Postgres-classed scorer exception is diagnosed via code/severity/routine, not just err.name", () => {
  const helper = ROUTE.match(/function scorerExceptionDiagnostic\([\s\S]*?\n\}/);
  assert.ok(helper, "expected a scorerExceptionDiagnostic(err) helper");
  const body = helper![0];
  assert.match(body, /instanceof postgres\.PostgresError/);
  assert.match(body, /err\.code/);
  assert.match(body, /err\.severity/);
  assert.match(body, /err\.routine/);
});

test("a non-Postgres scorer exception safely falls back to err.name -- the pre-025 behaviour, not a regression", () => {
  const helper = ROUTE.match(/function scorerExceptionDiagnostic\([\s\S]*?\n\}/);
  const body = helper![0];
  assert.match(body, /err instanceof Error \? err\.name : "unknown"/);
});

test("the scoring stage (claim/compute/persist) is included in the exception diagnostic", () => {
  const helper = ROUTE.match(/function scorerExceptionDiagnostic\([\s\S]*?\n\}/);
  const body = helper![0];
  assert.match(body, /scoringStage/);
  assert.match(body, /stage:\$\{stage\}/);
});

test("scorerExceptionDiagnostic never reads err.message -- a Postgres message can echo query context, deliberately excluded", () => {
  const helper = ROUTE.match(/function scorerExceptionDiagnostic\([\s\S]*?\n\}/);
  const body = helper![0];
  assert.doesNotMatch(body, /err\.message/);
});

test("scorerExceptionDiagnostic never references the scoring credential, a connection string, or any token/password field", () => {
  const helper = ROUTE.match(/function scorerExceptionDiagnostic\([\s\S]*?\n\}/);
  const body = helper![0];
  assert.doesNotMatch(body, /MOCK_SCORING_DATABASE_URL|connectionString|password|token/i);
});

test("the 502 scorer-exception response is still the same bounded, generic body -- the new diagnostic only changes what is logged, never what is returned", () => {
  const catchBlock = ROUTE.match(/catch \(err\) \{([\s\S]*?)\n  \}/);
  assert.ok(catchBlock, "expected the scorer catch (err) block");
  const body = catchBlock![1];
  assert.match(body, /scorerExceptionDiagnostic\(err\)/);
  assert.match(body, /status: 502/);
  assert.match(body, /error: "Scoring processing failed\."/);
  assert.doesNotMatch(body, /err\.code|err\.severity|err\.routine/, "raw error fields must only be read inside scorerExceptionDiagnostic, never inlined into the response body");
});
