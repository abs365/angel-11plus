import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair, recovery-path defect — production
 * evidence proved this route could return 200 with an empty `assessed`
 * array while leaving zero server-side trace of why: a failed OpenAI call
 * or a failed persist RPC were both silently `continue`d per item, with
 * no console output at all. Mirrors the sibling /api/mock-reading-scoring
 * route's own already-approved observability pattern (Increment 016)
 * exactly. Source-text assertions, matching this repository's own
 * established convention for this file.
 */

const ROUTE = readFileSync("app/api/mock-writing-assessment/route.ts", "utf8");

test("every meaningful stage logs a bounded operational event", () => {
  const stages = ["pending-lookup", "bank-lookup", "assess", "persist", "summary"];
  for (const stage of stages) {
    assert.match(ROUTE, new RegExp(`logWritingAssessmentEvent\\([^)]*"${stage}"`), `expected at least one logWritingAssessmentEvent(...) call for stage "${stage}"`);
  }
});

test("a failed OpenAI/assessment call for one item is now logged with a bounded reason, not silently swallowed", () => {
  const catchBlock = ROUTE.match(/} catch \(err\) \{([\s\S]*?)\n {6}continue;/);
  assert.ok(catchBlock, "expected the assess catch(err) block");
  assert.match(catchBlock![1], /logWritingAssessmentEvent\(attemptId, "assess", "failure", `\$\{questionId\}:\$\{err instanceof Error \? err\.message : "unknown"\}`\);/);
});

test("a failed persist RPC for one item is now logged with a bounded reason", () => {
  assert.match(ROUTE, /if \(persistError\) \{\s*\n\s*logWritingAssessmentEvent\(attemptId, "persist", "failure", `\$\{questionId\}:\$\{persistError\.message\}`\);/);
});

test("the logger never logs the learner's own response text, the OpenAI API key, or the Authorization header", () => {
  const helper = ROUTE.match(/function logWritingAssessmentEvent\([\s\S]*?\n\}/);
  assert.ok(helper);
  const body = helper![0];
  assert.doesNotMatch(body, /responseText/i);
  assert.doesNotMatch(body, /openAiKey/i);
  assert.doesNotMatch(body, /authHeader/i);
});

test("logged detail is defensively truncated, same discipline as the sibling reading-scoring route", () => {
  const helper = ROUTE.match(/function logWritingAssessmentEvent\([\s\S]*?\n\}/);
  assert.match(helper![0], /detail\.slice\(0, 200\)/);
});

test("this fix does not change any actual persistence behaviour -- the real write path is untouched", () => {
  assert.match(ROUTE, /"mock_persist_writing_assessment", \{/);
  assert.match(ROUTE, /results\.push\(\{ questionId, persisted: Boolean\(persisted\) && !persistError, assessmentStatus: assessment\.assessmentStatus \}\);/);
});

test("no service-role or privileged connection is introduced by this fix", () => {
  assert.doesNotMatch(ROUTE, /service_role/i);
  assert.doesNotMatch(ROUTE, /MOCK_SCORING_DATABASE_URL/);
});
