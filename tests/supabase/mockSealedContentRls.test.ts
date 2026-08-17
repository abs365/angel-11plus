import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Increment 008C — Mock Security Foundation + Sealed Content
 * Firewall. Structural tests against migration 069's own SQL text
 * (testable without a live database, matching this project's own
 * established migration-testing convention). Live pre/post-application
 * verification is recorded separately in
 * ANGEL_008C_MOCK_SECURITY_FOUNDATION_AND_SEALED_CONTENT_FIREWALL_V1.md,
 * since a meaningful post-migration firewall test requires the Founder
 * to have applied the migration first (not performed by this increment)
 * and, eventually, real Mock Eligible content to test against (0 today).
 */

const sql = fs.readFileSync("supabase/migrations/069_mock_sealed_content_rls.sql", "utf8");
// Executable SQL only -- strips comment lines, so checks below reflect
// the actual statements, not prose that happens to mention the same words.
const executable = sql
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n");

test("the migration drops and recreates ali_question_bank_select_all, matching every prior RLS migration's own idempotent convention", () => {
  assert.match(executable, /drop policy if exists ali_question_bank_select_all on public\.ali_question_bank;/);
  assert.match(executable, /create policy ali_question_bank_select_all on public\.ali_question_bank for select to anon, authenticated/);
});

test("the new policy predicate excludes mock_eligible rows from anon/authenticated access", () => {
  assert.match(executable, /using \(eligibility_status is distinct from 'mock_eligible' or public\.is_current_user_admin\(\)\);/);
});

test("the predicate uses NULL-safe 'is distinct from', never a bare != that could silently deny a NULL-status row", () => {
  assert.ok(!/eligibility_status\s*!=\s*'mock_eligible'/.test(sql), "must not use a NULL-unsafe != comparison");
  assert.match(executable, /is distinct from 'mock_eligible'/);
});

test("admin access is preserved via the same is_current_user_admin() function every other admin-gated policy in this codebase already uses", () => {
  assert.match(executable, /public\.is_current_user_admin\(\)/);
});

test("the migration touches ali_question_bank only -- never ali_passage_bank, never ali_family_review, never any other table", () => {
  const tableReferences = [...executable.matchAll(/on public\.(\w+)/g)].map((m) => m[1]);
  assert.deepEqual(new Set(tableReferences), new Set(["ali_question_bank"]));
});

test("the migration never sets or changes eligibility_status -- it is a read-policy change only, no data mutation", () => {
  assert.ok(!/set\s+eligibility_status/i.test(executable), "must not be an UPDATE/data migration");
  assert.ok(!/insert into/i.test(executable), "must not insert any row");
  assert.ok(!/delete from/i.test(executable), "must not delete any row");
});

test("the migration is wrapped in a single begin/commit transaction", () => {
  const beginCount = (executable.match(/\bbegin;/g) || []).length;
  const commitCount = (executable.match(/\bcommit;/g) || []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});
