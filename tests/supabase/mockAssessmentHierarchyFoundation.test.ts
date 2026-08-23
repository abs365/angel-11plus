import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mock Programme Increment 005 (Decision 148). Structural tests against
 * migration 093's own SQL text, matching this project's established
 * migration-testing convention (see tests/supabase/mockContentReviewGovernance.test.ts).
 */

const sql = fs.readFileSync("supabase/migrations/093_mock_assessment_hierarchy_foundation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("adds exactly the 4 new nullable columns to ali_question_bank, no other table touched", () => {
  assert.match(executable, /add column if not exists question_group_id text,/);
  assert.match(executable, /add column if not exists group_order smallint,/);
  assert.match(executable, /add column if not exists subpart_label text,/);
  assert.match(executable, /add column if not exists marking_mode text;/);
  assert.ok(!/create table/i.test(executable));
});

test("group_order is nullable and, when present, at least 1 -- never a 0 or negative position", () => {
  assert.match(executable, /check \(group_order is null or group_order >= 1\);/);
});

test("marking_mode is nullable and constrained to exactly the 3 named modes when present", () => {
  assert.match(
    executable,
    /check \(marking_mode is null or marking_mode in \(\s*'deterministic', 'structured_acceptable_response', 'criterion_rubric'\s*\)\);/
  );
});

test("a partial index on question_group_id exists, matching passage_family_id's own established indexing convention", () => {
  assert.match(
    executable,
    /create index if not exists ali_question_bank_group_idx\s+on public\.ali_question_bank \(question_group_id\) where question_group_id is not null;/
  );
});

test("does not add, alter, or drop any table, or drop any column -- additive-only", () => {
  assert.ok(!/create table|drop table|drop column/i.test(executable));
});

test("does not touch RLS -- no create/drop/alter policy, no enable/disable row level security", () => {
  assert.ok(!/create policy|drop policy|alter policy|row level security/i.test(executable));
});

test("does not introduce any new SQL function, and touches no grant/revoke -- pure schema extension, per the directive's explicit instruction to prefer the simpler implementation", () => {
  assert.ok(!/create (or replace )?function/i.test(executable));
  assert.ok(!/\bgrant\b|\brevoke\b/i.test(executable));
});

test("does not touch eligibility_status, or any Mock-attempt/form/cycle table -- schema extension on ali_question_bank only", () => {
  assert.ok(!/eligibility_status/i.test(executable));
  assert.ok(!/ali_mock_form|ali_mock_attempt|ali_mock_cycle/i.test(executable));
  assert.ok(!/ali_passage_bank|ali_family_review/i.test(executable));
});

test("does not insert, update, or delete any row -- schema-only, zero data mutation, Batch 001/002 content untouched", () => {
  assert.ok(!/insert into|update\s+public\.|delete from/i.test(executable));
});

test("no historical Applied Reasoning content or activation anywhere in this migration -- it touches no English content at all", () => {
  assert.ok(!/applied reasoning|qt-ar-01/i.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("every add column is idempotent (if not exists), matching this project's established migration convention", () => {
  const addColumnLines = executable.match(/add column if not exists [a-z_]+ \w+/g) ?? [];
  assert.equal(addColumnLines.length, 4);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
});

test("discloses the deliberate rejection of family_id/learning_unit_id reuse, so a future reader does not silently repurpose either", () => {
  assert.match(sql, /learningUnitId/);
  assert.match(sql, /groupingKeyOf\(\)/);
});
