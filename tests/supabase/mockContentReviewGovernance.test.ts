import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mock Programme Increment 003 (Decision 139). Structural tests against
 * migration 087's own SQL text, matching this project's established
 * migration-testing convention (see tests/supabase/mockAttemptEngine.test.ts,
 * and the review_type-extension precedent in migrations 059/060/061).
 */

const sql = fs.readFileSync("supabase/migrations/087_mock_content_review_governance.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("extends review_type with exactly the 3 new Mock independent-review values, on top of every existing value -- no existing value removed", () => {
  assert.match(
    executable,
    /check \(review_type in \(\s*'content_review',\s*'maths_teaching_review',\s*'english_teaching_review',\s*'writing_teaching_review',\s*'mock_maths_independent_review',\s*'mock_english_passage_independent_review',\s*'mock_writing_prompt_independent_review'\s*\)\);/
  );
});

test("extends review_target_type with exactly one new value, writing_prompt, on top of the existing question_family/passage values", () => {
  assert.match(executable, /check \(review_target_type in \('question_family', 'passage', 'writing_prompt'\)\);/);
});

test("both constraints are dropped before being re-added, matching migrations 059/060/061's own idempotent pattern", () => {
  assert.match(executable, /drop constraint if exists ali_family_review_review_type_check;/);
  assert.match(executable, /drop constraint if exists ali_family_review_target_type_check;/);
});

test("does not add, alter, or drop any table, column, or index -- constraint/comment extension only", () => {
  assert.ok(!/create table|drop table|add column|drop column|create index|drop index/i.test(executable));
});

test("does not touch RLS -- no create/drop/alter policy, no enable/disable row level security", () => {
  assert.ok(!/create policy|drop policy|alter policy|row level security/i.test(executable));
});

test("does not introduce any new SQL function -- no CREATE FUNCTION anywhere, per the directive's own instruction to avoid a new privilege surface where a schema-only extension suffices", () => {
  assert.ok(!/create (or replace )?function/i.test(executable));
  assert.ok(!/\bgrant\b|\brevoke\b/i.test(executable));
});

test("does not touch eligibility_status, ali_question_bank, or ali_mock_form/ali_mock_attempt/ali_mock_cycle in any way", () => {
  assert.ok(!/eligibility_status/i.test(executable));
  assert.ok(!/ali_question_bank/i.test(executable));
  assert.ok(!/ali_mock_form|ali_mock_attempt|ali_mock_cycle/i.test(executable));
});

test("does not insert, update, or delete any row -- constraint/comment extension only, zero data mutation", () => {
  assert.ok(!/insert into|update\s+public\.|delete from/i.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
});

test("documents that eligibility_status is never written by application code or this migration -- the Practice-to-Mock isolation claim is stated, not merely implied", () => {
  assert.match(sql, /never touches\s*\n?--?\s*ali_question_bank\.eligibility_status/);
});
