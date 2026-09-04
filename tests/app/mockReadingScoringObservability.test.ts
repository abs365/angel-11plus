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
