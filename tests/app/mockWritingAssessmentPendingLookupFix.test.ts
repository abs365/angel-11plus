import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair, recovery-path defect — production
 * evidence (Vercel runtime logs, POST /api/mock-writing-assessment, 404,
 * `{"error":"report_not_available"}`) proved this route's own direct read
 * of ali_mock_attempt_report (RLS-gated to "owner AND released") could
 * never succeed for an unreleased attempt — exactly the case this route
 * exists to help resolve. It now calls mock_get_pending_writing_
 * question_ids() (migration 253), which resolves ownership internally
 * and is readable regardless of release state. Source-text assertions,
 * matching this repository's own established convention for a server-
 * only route.
 */

const ROUTE = readFileSync("app/api/mock-writing-assessment/route.ts", "utf8");

test("the route no longer reads ali_mock_attempt_report directly for pending question ids", () => {
  assert.doesNotMatch(ROUTE, /\.from\("ali_mock_attempt_report"\)/);
});

test("the route calls mock_get_pending_writing_question_ids via the caller's own forwarded session, never a privileged connection", () => {
  assert.match(ROUTE, /callerClient\.rpc\("mock_get_pending_writing_question_ids", \{\s*\n\s*p_attempt_id: attemptId,\s*\n\s*\}\);/);
});

test("an RPC error still returns the same bounded 404 contract as before -- transport error shape unchanged", () => {
  assert.match(ROUTE, /if \(pendingError\) \{[\s\S]*?\n\s*return NextResponse\.json\(\{ error: "report_not_available" \}, \{ status: 404 \}\);/);
});

test("an empty pending list still returns the same 'alreadyComplete' shape as before", () => {
  assert.match(ROUTE, /if \(!pendingIds \|\| pendingIds\.length === 0\) \{[\s\S]*?\n\s*return NextResponse\.json\(\{ assessed: \[\], alreadyComplete: true \}\);/);
});

test("the actual write path (mock_persist_writing_assessment) is completely unchanged by this fix", () => {
  assert.match(ROUTE, /"mock_persist_writing_assessment", \{/);
});

test("this route still never uses a service-role or privileged connection", () => {
  assert.doesNotMatch(ROUTE, /service_role/i);
  assert.doesNotMatch(ROUTE, /MOCK_SCORING_DATABASE_URL/);
});
