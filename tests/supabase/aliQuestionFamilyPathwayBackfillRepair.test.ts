import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Question Factory Wave 2 — Migration 231 (ali_question_family pathway
 * backfill repair). Structural/logic assertions against the migration's
 * own SQL text, matching this repository's established convention for a
 * NOT APPLIED migration. Proves the SQL statement SHAPE avoids the exact
 * multi-dimensional-array indexing defect migration 228 had (see
 * tests/lib/ali/pathwayAggregation.test.ts for the correctness oracle
 * proving the intended flatten/deduplicate/sort ALGORITHM itself).
 */

const MIGRATION = readFileSync("supabase/migrations/231_ali_question_family_pathway_backfill_repair.sql", "utf8");
const EXECUTABLE = MIGRATION.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");

test("wrapped in a single begin/commit transaction", () => {
  assert.match(EXECUTABLE, /^\s*begin;/m);
  assert.match(EXECUTABLE, /commit;\s*$/m);
});

test("not-applied disclosure present in the raw file header", () => {
  assert.match(MIGRATION, /NOT APPLIED\. Generated for Founder review/);
});

test("migration 228 is not edited -- this is a forward-only repair, disclosed as such in the header", () => {
  assert.match(MIGRATION, /migration\s*\n?--?\s*228 is NOT edited/);
});

test("the migration 228 defect (single-subscript indexing into a multi-dimensional array_agg result) never reappears -- no (array_agg(...))[N] pattern anywhere in this migration", () => {
  assert.doesNotMatch(EXECUTABLE, /\(array_agg\([^)]*\)\)\[\d+\]/);
});

test("pathway values are flattened via unnest() BEFORE aggregation -- array_agg operates over a scalar column, never a nested array, avoiding the multi-dimensional-array trap entirely", () => {
  assert.match(EXECUTABLE, /cross join lateral unnest\(coalesce\(b\.pathway, '\{\}'::text\[\]\)\) as p/);
  assert.match(EXECUTABLE, /array_agg\(distinct p order by p\)/);
});

test("the ONLY statement that writes data is a single UPDATE targeting ali_question_family, and it touches only pathways/updated_at -- no other column, and no other table", () => {
  const updateStatements = [...EXECUTABLE.matchAll(/update public\.(\w+)\b/g)];
  assert.equal(updateStatements.length, 1, "expected exactly one UPDATE statement in this migration");
  assert.equal(updateStatements[0][1], "ali_question_family");

  const setClause = EXECUTABLE.match(/set\s+pathways = [\s\S]*?,\s*\n\s*updated_at = now\(\)/)?.[0] ?? "";
  assert.ok(setClause.length > 0, "expected the SET clause to cover exactly pathways and updated_at");
  assert.doesNotMatch(setClause, /family_id|subject|competency_ids|skills|question_types|difficulty_range|generation_strategy|review_status|production_eligible|row_count/);
});

test("no INSERT, DELETE, DROP, or ALTER statement exists anywhere in this migration -- purely a targeted value correction", () => {
  assert.doesNotMatch(EXECUTABLE, /\binsert\s+into\b/i);
  assert.doesNotMatch(EXECUTABLE, /\bdelete\s+from\b/i);
  assert.doesNotMatch(EXECUTABLE, /\bdrop\s+\w+/i);
  assert.doesNotMatch(EXECUTABLE, /\balter\s+table\b/i);
});

test("reads only from ali_question_bank (the repair's authoritative source, same as migration 228) or ali_question_family (the sanity-check DO block reading back its own result) -- no other table is queried", () => {
  const fromReferences = [...EXECUTABLE.matchAll(/from public\.(\w+)/g)].map((m) => m[1]);
  assert.ok(fromReferences.includes("ali_question_bank"), "expected at least one read from ali_question_bank");
  for (const t of fromReferences) {
    assert.ok(["ali_question_bank", "ali_question_family"].includes(t), `unexpected table read: ${t}`);
  }
});

test("no RLS, GRANT, REVOKE, or policy statement of any kind -- security posture is completely untouched", () => {
  assert.doesNotMatch(EXECUTABLE, /\bgrant\b|\brevoke\b|create policy|drop policy|row level security/i);
});

test("fails closed with a RAISE EXCEPTION if any family with a genuinely non-empty source pathway still resolves to an empty array after the repair -- never silently declares success on a partial fix", () => {
  assert.match(EXECUTABLE, /raise exception 'Migration 231: % family record\(s\) still show an empty pathways array/);
});

test("does not touch learner responses, attempts, reports, question text, marks, or family ids -- verified structurally (no reference to any Mock/attempt table, no write to any ali_question_bank column, no write to ali_question_family.family_id)", () => {
  assert.doesNotMatch(EXECUTABLE, /ali_mock_attempt|ali_mock_attempt_answer|ali_mock_attempt_report/);
  assert.doesNotMatch(EXECUTABLE, /update public\.ali_question_bank/);
  assert.doesNotMatch(EXECUTABLE, /set\s+family_id\s*=/);
});

test("does not touch or reference migration 230's candidate lifecycle objects", () => {
  assert.doesNotMatch(EXECUTABLE, /ali_question_candidate|submit_question_candidate|review_question_candidate|publish_question_candidate/);
});
