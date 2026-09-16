import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair, recovery-path defect — production
 * evidence (Vercel runtime logs, POST /api/mock-reading-scoring, 400,
 * `{"stage":"ownership","reason":"wrong_form"}`) proved that although
 * migration 251 widened mock_claim_reading_scoring_work()/mock_persist_
 * reading_scoring() and lib/mockAttempt/workspace.ts's own
 * isReadingScoringRecoveryEligible() to accept english-full-mock-v1, this
 * route's OWN redundant pre-check (`attempt.form_id !==
 * "reading-comprehension-mock-1"`) was never updated to match — so every
 * genuinely-eligible English Full Mock recovery request was rejected here,
 * before ever reaching the already-correct database layer. Source-text
 * assertions, matching this repository's own established convention for
 * this server-only route (see tests/app/mockReadingScoringObservability.
 * test.ts's own docstring for why).
 */

const ROUTE = readFileSync("app/api/mock-reading-scoring/route.ts", "utf8");

test("the route now selects attempt_type alongside form_id, needed to distinguish the two eligible (attempt_type, form_id) pairs", () => {
  assert.match(ROUTE, /\.select\("id, status, form_id, attempt_type"\)/);
});

test("the eligibility check accepts BOTH reading-comprehension-mock-1 AND (full_mock, english-full-mock-v1) -- additive, matching every other widened site in this codebase", () => {
  assert.match(
    ROUTE,
    /const isEligibleForm =\s*\n\s*attempt\.form_id === "reading-comprehension-mock-1" \|\|\s*\n\s*\(attempt\.attempt_type === "full_mock" && attempt\.form_id === "english-full-mock-v1"\);/
  );
  assert.match(ROUTE, /if \(!isEligibleForm\) \{/);
});

test("Reading Comprehension Mock 1's own original literal is preserved exactly, never removed or replaced", () => {
  assert.match(ROUTE, /attempt\.form_id === "reading-comprehension-mock-1"/);
});

test("a rejected form still logs the same bounded 'wrong_form' ownership-stage event and returns 400 -- only the eligibility condition changed, not the failure contract", () => {
  const rejectionBlock = ROUTE.match(/if \(!isEligibleForm\) \{([\s\S]*?)\n {2}\}/);
  assert.ok(rejectionBlock, "expected the isEligibleForm rejection block");
  assert.match(rejectionBlock![1], /logScoringEvent\(attemptId, "ownership", "failure", "wrong_form"\);/);
  assert.match(rejectionBlock![1], /status: 400/);
});

test("the status/not_submitted guard is untouched by this fix", () => {
  assert.match(ROUTE, /if \(attempt\.status !== "submitted"\) \{/);
});
