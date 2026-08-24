import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Protected Mock Content Isolation and Security Correction (Decision 152).
 * Structural tests against migration 100's own SQL text (testable without
 * a live database, matching migration 069's own established
 * migration-testing convention -- see tests/supabase/
 * mockSealedContentRls.test.ts, mirrored here). Live pre/post-application
 * verification is a separate, later Founder step (this migration is NOT
 * applied by this session).
 */

const sql = fs.readFileSync("supabase/migrations/100_protected_mock_content_practice_isolation.sql", "utf8");
const executable = sql
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n");

test("the migration drops and recreates ali_question_bank_select_all, matching every prior RLS migration's own idempotent convention", () => {
  assert.match(executable, /drop policy if exists ali_question_bank_select_all on public\.ali_question_bank;/);
  assert.match(executable, /create policy ali_question_bank_select_all on public\.ali_question_bank for select to anon, authenticated/);
});

test("the new policy predicate is a positive allow-list of exactly practice_eligible, not a blacklist", () => {
  assert.match(executable, /using \(eligibility_status = 'practice_eligible' or public\.is_current_user_admin\(\)\);/);
  assert.ok(!/is distinct from/.test(executable), "must not retain migration 084's blacklist-shaped predicate");
});

test("the predicate structurally excludes every Mock-governance-track status, not just mock_eligible", () => {
  for (const protectedStatus of ["authentic_assessment_candidate", "independently_validated", "mock_eligible", "provisional"]) {
    assert.ok(!executable.includes(`eligibility_status = '${protectedStatus}'`), `the allow-list predicate must never explicitly admit ${protectedStatus}`);
  }
});

test("admin access is preserved via the same is_current_user_admin() function every other admin-gated policy in this codebase already uses", () => {
  assert.match(executable, /public\.is_current_user_admin\(\)/);
});

test("the migration touches ali_question_bank only -- never ali_passage_bank, never ali_family_review, never any other table", () => {
  const tableReferences = [...executable.matchAll(/on public\.(\w+)/g)].map((m) => m[1]);
  assert.deepEqual(new Set(tableReferences), new Set(["ali_question_bank"]));
});

test("the migration never sets or changes eligibility_status, or any other row content -- it is a read-policy change only, no data mutation", () => {
  assert.ok(!/set\s+eligibility_status/i.test(executable), "must not be an UPDATE/data migration");
  assert.ok(!/insert into/i.test(executable), "must not insert any row");
  assert.ok(!/delete from/i.test(executable), "must not delete any row");
  assert.ok(!/update\s+/i.test(executable), "must not be an UPDATE of any kind");
});

test("the migration creates, alters, or grants no function -- a pure RLS policy change, so the anon-EXECUTE-privilege defect class from migrations 071/073/086 does not apply here", () => {
  assert.ok(!/create\s+(or\s+replace\s+)?function/i.test(executable), "must not define any function");
  assert.ok(!/grant\s+execute/i.test(executable), "must not grant execute on anything");
  assert.ok(!/revoke\s+execute/i.test(executable), "must not need to revoke execute -- no function is created");
});

test("the migration does not touch migrations 095-099's own content -- no reference to Batch 003 or English Batch 001 target IDs", () => {
  assert.ok(!/mock-mr01-directcalc|mock-mr08-rotation|mock-mr12-reversemean|mock-mr01mr10-costumeschedule/.test(executable));
  assert.ok(!/mock-eng-boathouse|mock-writing-mindchange|mock-writing-kindness|mock-writing-cookopinion/.test(executable));
});

test("the migration is wrapped in a single begin/commit transaction", () => {
  const beginCount = (executable.match(/\bbegin;/g) || []).length;
  const commitCount = (executable.match(/\bcommit;/g) || []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});

test("not-applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED/);
});
