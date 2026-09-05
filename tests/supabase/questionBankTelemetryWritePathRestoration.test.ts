import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Question Factory Wave 1, Phase 10 — Telemetry Write-Path Restoration.
 * Structural/logic assertions against migration 229's own SQL text,
 * matching this repository's own established convention for a NOT APPLIED
 * migration.
 */

const MIGRATION = readFileSync("supabase/migrations/229_question_bank_telemetry_write_path_restoration.sql", "utf8");

const EXECUTABLE = MIGRATION.split("\n")
  .filter((l) => !l.trimStart().startsWith("--"))
  .join("\n");

test("wrapped in a single begin/commit transaction", () => {
  assert.match(EXECUTABLE, /^\s*begin;/m);
  assert.match(EXECUTABLE, /commit;\s*$/m);
});

test("not-applied disclosure present in the raw file header", () => {
  assert.match(MIGRATION, /NOT APPLIED\. Generated for Founder review/);
});

test("grants UPDATE on exactly usage_count and avg_success_rate -- no other column", () => {
  const grantMatch = EXECUTABLE.match(/grant update \(([^)]+)\) on public\.ali_question_bank to authenticated;/);
  assert.ok(grantMatch, "expected a column-scoped GRANT UPDATE statement");
  const columns = grantMatch![1].split(",").map((c) => c.trim());
  assert.deepEqual(columns.sort(), ["avg_success_rate", "usage_count"]);
});

test("never grants UPDATE on prompt, answer, eligibility_status, or any other column -- migration 084's own boundary is not reopened", () => {
  assert.doesNotMatch(EXECUTABLE, /grant update \([^)]*\b(prompt|answer|eligibility_status|active|explanation)\b/i);
  // A single, unqualified table-wide grant would also reopen the boundary -- must never appear.
  assert.doesNotMatch(EXECUTABLE, /grant update on public\.ali_question_bank/i);
});

test("the new UPDATE policy's USING and WITH CHECK clauses both mirror the same eligibility-status/admin predicate -- never a wider gate for one clause than the other", () => {
  const usingMatch = EXECUTABLE.match(/using \((.+)\)\s*\n\s*with check \((.+)\)/);
  assert.ok(usingMatch, "expected both USING and WITH CHECK clauses");
  const [, usingClause, checkClause] = usingMatch!;
  assert.equal(usingClause.trim(), checkClause.trim());
  assert.match(usingClause, /eligibility_status is distinct from 'mock_eligible'/);
  assert.match(usingClause, /is_current_user_admin\(\)/);
});

test("the policy is idempotent -- drop-if-exists before create, matching this repository's own established convention", () => {
  assert.match(EXECUTABLE, /drop policy if exists ali_question_bank_telemetry_update on public\.ali_question_bank;/);
});

test("does not drop, alter, or narrow the existing SELECT policy from migrations 084/100", () => {
  assert.doesNotMatch(EXECUTABLE, /drop policy.*ali_question_bank_select/i);
  assert.doesNotMatch(EXECUTABLE, /for select/i);
});

test("no other table is touched -- this migration is scoped to ali_question_bank alone", () => {
  const tableReferences = [...EXECUTABLE.matchAll(/on public\.(\w+)/g)].map((m) => m[1]);
  for (const table of tableReferences) {
    assert.equal(table, "ali_question_bank");
  }
});

test("does not reference or touch any Mock scoring/release/manual-marking function or the family model migration", () => {
  assert.doesNotMatch(EXECUTABLE, /mock_release_report|mock_apply_manual_mark|mock_analyse_attempt|mock_score_attempt|mock_persist_reading_scoring|ali_question_family/);
});
