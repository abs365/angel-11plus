import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Completion Increment 009 — migration 201's Founder review
 * decision persistence for the 7-row Writing batch. Structural tests
 * against the migration's own SQL text.
 */

const sql = fs.readFileSync("supabase/migrations/201_programme_completion_inc009_writing_founder_review_decisions.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const EXPECTED_FAMILY_IDS = [
  "eng-inc003-writing-wc01a-imaginedplace",
  "eng-inc003-writing-wc01a-favouriteplace",
  "eng-inc003-writing-wc01a-pocketmoney",
  "mock-writing-wc01a-difficulttask",
  "mock-writing-wc01a-meaningfulplace",
  "mock-writing-wc01a-personinfluence",
  "mock-writing-wc01a-somethingnew",
];

test("exactly 7 insert statements against ali_family_review, one per family_id", () => {
  const inserts = [...executable.matchAll(/insert into public\.ali_family_review/g)];
  assert.equal(inserts.length, 7);
  for (const familyId of EXPECTED_FAMILY_IDS) assert.ok(executable.includes(familyId), `expected ${familyId} to appear`);
});

test("reviewer is 'FOUNDER' for every row, never 'UNASSIGNED' or a fabricated identity", () => {
  const reviewers = [...executable.matchAll(/'writing_prompt', '[\w-]+', '([A-Z]+)'/g)].map((m) => m[1]);
  assert.equal(reviewers.length, 7);
  assert.ok(reviewers.every((r) => r === "FOUNDER"));
});

test("exactly 6 rows are plain 'approved', exactly 1 is 'approved_with_amendment' (somethingnew), matching the Founder's own decisions", () => {
  const decisions = [...executable.matchAll(/'(approved|approved_with_amendment)'::public\.family_review_decision/g)].map((m) => m[1]);
  assert.equal(decisions.length, 7);
  assert.equal(decisions.filter((d) => d === "approved").length, 6);
  assert.equal(decisions.filter((d) => d === "approved_with_amendment").length, 1);
});

test("the approved_with_amendment row's notes carry the exact Founder-specified disclosure sentence, and a real blank-line separator (migration 157's own database constraint)", () => {
  const block = executable.match(/mock-writing-wc01a-somethingnew'[\s\S]*?'mock_writing_prompt_independent_review'/)![0];
  assert.match(block, /Prospective self-projection is an Angel-original extrapolation within QT-WC-01a''s broader imagination\/opinion boundary, not a directly evidenced CSSE topic pattern\./);
  assert.match(block, /E'\\n\\n'/);
});

test("no learner-facing content is rewritten: no update against ali_question_bank anywhere in this migration", () => {
  assert.ok(!/update\s+public\.ali_question_bank/i.test(executable));
});

test("pocketmoney's approval is verified fail-closed against the live migration-173 checklist text before the insert can succeed", () => {
  const guard = executable.match(/do \$\$[\s\S]*?end \$\$;/)![0];
  assert.match(guard, /Say specifically what is genuinely appealing about EACH view/);
  assert.match(guard, /raise exception/);
});

test("every insert is idempotent via a 'where not exists' guard", () => {
  const whereNotExistsCount = (executable.match(/where not exists \(/g) || []).length;
  assert.equal(whereNotExistsCount, 7);
});

test("notes explicitly disclose this is NOT a live /admin-beta/review submission, for every row", () => {
  const occurrences = (executable.match(/Not represented as a live \/admin-beta\/review submission/g) || []).length;
  assert.equal(occurrences, 7);
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not-applied disclosure present", () => {
  assert.match(sql, /NOT APPLIED\. Founder must apply/);
});
