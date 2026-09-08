import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Synonym Multi-Select Marking Contract Incident -- Bounded Data Repair.
 * Structural tests against migration 240's own raw SQL text, mirroring
 * this repository's established convention (migration238's own test
 * file) for an unapplied migration. No live Postgres connection is
 * available in this environment.
 */

const SQL_PATH = "supabase/migrations/240_synonym_marking_contract_data_repair.sql";
const sql = fs.readFileSync(SQL_PATH, "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
const doBlock = executable.match(/do \$\$([\s\S]*?)\$\$;/)![1];

test("wrapped in a single begin/commit transaction, and discloses NOT APPLIED", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
  assert.match(sql, /NOT APPLIED\. Generated for Founder review and manual application/);
});

test("no table, function, or RLS policy is created, altered, or dropped -- pure data repair", () => {
  assert.doesNotMatch(executable, /create table|alter table|drop table/i);
  assert.doesNotMatch(executable, /create policy|drop policy|enable row level security|disable row level security/i);
  assert.doesNotMatch(executable, /create or replace function|create function|drop function/i);
});

test("preflight asserts exactly 20 and raises before the UPDATE runs", () => {
  const preflightIndex = doBlock.indexOf("v_preflight_count <> 20");
  const updateIndex = doBlock.indexOf("update public.ali_question_bank");
  assert.ok(preflightIndex > -1, "preflight count check must exist");
  assert.ok(updateIndex > -1, "the UPDATE must exist");
  assert.ok(preflightIndex < updateIndex, "preflight check must run before the UPDATE");
  assert.match(doBlock, /if v_preflight_count <> 20 then\s*\n\s*raise exception/);
});

test("preflight requires the exact defect signature: qf- prefixed, english, wave1-fam-synonym-battery, already TIER6_MULTI_SELECT, marks genuinely absent, and internally consistent requiredSelectionCount/correctOptions", () => {
  const preflightBlock = doBlock.match(/select count\(\*\) into v_preflight_count[\s\S]*?;/)![0];
  assert.match(preflightBlock, /id like 'qf-%'/);
  assert.match(preflightBlock, /subject = 'english'/);
  assert.match(preflightBlock, /family_id = 'wave1-fam-synonym-battery'/);
  assert.match(preflightBlock, /\(prompt->>'validationTier'\) = 'TIER6_MULTI_SELECT'/);
  assert.match(preflightBlock, /\(prompt->>'marks'\) is null/, "must only match rows genuinely missing marks -- never overwrite an existing value");
  assert.match(preflightBlock, /jsonb_array_length\(prompt->'correctOptions'\) = \(prompt->>'requiredSelectionCount'\)::int/, "must require internal consistency before repairing, never repair a row whose own evidence disagrees with itself");
});

test("the UPDATE predicate is identical to the preflight predicate -- the same 20 rows counted are the same 20 rows touched", () => {
  const preflightPredicate = doBlock.match(/select count\(\*\) into v_preflight_count\s*\n\s*from public\.ali_question_bank\s*\n\s*(where[\s\S]*?);/)![1];
  const updatePredicate = doBlock.match(/update public\.ali_question_bank\s*\n\s*set prompt[\s\S]*?\n\s*(where[\s\S]*?);/)![1];
  const normalise = (s: string) => s.replace(/\s+/g, " ").trim();
  assert.equal(normalise(updatePredicate), normalise(preflightPredicate));
});

test("the repair merges marks from the row's own requiredSelectionCount -- no join, no invented value, additive jsonb merge only", () => {
  assert.match(doBlock, /set prompt = prompt \|\| jsonb_build_object\('marks', \(prompt->>'requiredSelectionCount'\)::int\)/);
  assert.doesNotMatch(doBlock, /from public\.ali_question_candidate/, "this repair needs no candidate join -- requiredSelectionCount is already correct on the published row itself");
});

test("post-UPDATE row count is asserted with get diagnostics and aborts on any mismatch from 20", () => {
  assert.match(doBlock, /get diagnostics v_updated = row_count;/);
  assert.match(doBlock, /if v_updated <> 20 then\s*\n\s*raise exception/);
});

test("cannot match Maths, Writing, Mock, the 72 other English rows, the 5 canary rows, or any pre-existing (non-qf-) row -- predicate is scoped to the exact defect signature, not a broad sweep", () => {
  const preflightBlock = doBlock.match(/select count\(\*\) into v_preflight_count[\s\S]*?;/)![0];
  // subject='english' + family_id='wave1-fam-synonym-battery' together exclude Maths, Writing, Mock, and every other English family.
  assert.match(preflightBlock, /subject = 'english'/);
  assert.match(preflightBlock, /family_id = 'wave1-fam-synonym-battery'/);
  // id like 'qf-%' excludes every pre-existing row, including the 6 already-working TIER6_MULTI_SELECT rows and the 11 pre-existing w1-/w2- rows sharing this family_id.
  assert.match(preflightBlock, /id like 'qf-%'/);
});

test("not idempotent by design -- re-running after success finds 0 rows (marks already present) and aborts, changing nothing", () => {
  assert.match(sql, /Not idempotent by design/);
  assert.match(sql, /re-running this migration after a\s*\n--\s*successful application will find 0 rows matching the preflight/);
});

test("the migration's own header discloses the exact incident and an explicit rollback plan", () => {
  assert.match(sql, /qf-eng-syn/i);
  assert.match(sql, /ROLLBACK/);
  assert.match(sql, /exactly 20 rows/i);
});
