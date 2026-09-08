import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Published Answer Integrity Incident -- Bounded Data Repair. Structural
 * tests against migration 238's own raw SQL text (mirroring this
 * repository's established convention for an unapplied migration). No
 * live Postgres connection is available in this environment, so the
 * repair's fail-closed, exact-scope behaviour is proven structurally --
 * every predicate, every count assertion, every exclusion -- rather than
 * by actually executing the UPDATEs; live production verification is the
 * Founder's own read-back step after running this migration.
 *
 * The English repair corrects TWO defects in one merge (validationTier
 * AND correctOptions) -- the second (correctOptions holding the full
 * options list rather than just the correct one) was found only while
 * writing this repair's own regression tests
 * (tests/supabase/answerIntegrityRepairEndToEnd.test.ts), proving the
 * real TIER6_MULTI_SELECT dispatcher against the actual data. Left
 * uncorrected, fixing validationTier alone would have made EVERY
 * possible learner selection mark correct -- a silent weakening of
 * marking, not a fix.
 */

const SQL_PATH = "supabase/migrations/238_published_answer_integrity_data_repair.sql";
const sql = fs.readFileSync(SQL_PATH, "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
const doBlock = executable.match(/do \$\$([\s\S]*?)\$\$;/)![1];
const bankUpdates = doBlock.split(/(?=update public\.ali_question_bank b\s*\n)/).filter((s) => s.trim().startsWith("update public.ali_question_bank b"));
const mathsUpdateStatement = bankUpdates.find((s) => s.includes("jsonb_build_object('answer'"))!;
const englishUpdateStatement = bankUpdates.find((s) => s.includes("validationTier', 'TIER6_MULTI_SELECT'"))!;

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

test("preflight A (Maths) asserts exactly 313 and raises before any UPDATE runs", () => {
  const preflightAIndex = doBlock.indexOf("v_maths_preflight_count <> 313");
  const firstUpdateIndex = doBlock.indexOf("update public.ali_question_bank");
  assert.ok(preflightAIndex > -1, "Maths preflight count check must exist");
  assert.ok(firstUpdateIndex > -1, "an UPDATE must exist");
  assert.ok(preflightAIndex < firstUpdateIndex, "Maths preflight check must run before the first UPDATE");
  assert.match(doBlock, /if v_maths_preflight_count <> 313 then\s*\n\s*raise exception/);
});

test("preflight B (English synonym-battery) asserts exactly 20, and requires BOTH the wrong tier AND the wrong (non-single) correctOptions shape, joined to genuinely valid candidate distractor evidence", () => {
  assert.match(doBlock, /if v_english_preflight_count <> 20 then\s*\n\s*raise exception/);
  const preflightBlock = doBlock.match(/select count\(\*\) into v_english_preflight_count[\s\S]*?;/)![0];
  assert.match(preflightBlock, /\(b\.prompt->>'validationTier'\) = 'TIER1_EXACT_MATCH'/);
  assert.match(preflightBlock, /jsonb_array_length\(b\.prompt->'correctOptions'\) <> 1/, "must detect the exact wrong shape (not just 'non-empty') -- a full options list is a non-empty array too");
  assert.match(preflightBlock, /jsonb_typeof\(c\.distractors->'options'\) = 'array'/);
  assert.match(preflightBlock, /\(c\.distractors->>'correctOptionIndex'\)::int >= 0/);
  assert.match(preflightBlock, /\(c\.distractors->>'correctOptionIndex'\)::int < jsonb_array_length\(c\.distractors->'options'\)/);
});

test("combined preflight asserts exactly 333 total", () => {
  assert.match(doBlock, /if v_maths_preflight_count \+ v_english_preflight_count <> 333 then\s*\n\s*raise exception/);
});

test("post-UPDATE row counts are asserted via get diagnostics, aborting the transaction on any mismatch (313 Maths, 20 English)", () => {
  assert.match(doBlock, /get diagnostics v_maths_updated = row_count;\s*\n\s*if v_maths_updated <> 313 then\s*\n\s*raise exception/);
  assert.match(doBlock, /get diagnostics v_english_updated = row_count;\s*\n\s*if v_english_updated <> 20 then\s*\n\s*raise exception/);
});

test("Maths repair is scoped to published qf-* rows joined to their own real candidate via published_question_id, requiring a genuine non-empty claimed_answer", () => {
  const mathsUpdate = mathsUpdateStatement;
  assert.match(mathsUpdate, /c\.published_question_id = b\.id/);
  assert.match(mathsUpdate, /b\.id like 'qf-%'/);
  assert.match(mathsUpdate, /b\.subject = 'maths'/);
  assert.match(mathsUpdate, /c\.publication_status = 'published'/);
  assert.match(mathsUpdate, /\(b\.prompt->>'answer'\) is null/);
  assert.match(mathsUpdate, /c\.claimed_answer is not null/);
  assert.match(mathsUpdate, /trim\(c\.claimed_answer\) <> ''/);
});

test("Maths repair is an additive jsonb merge, never a replacement of the whole prompt", () => {
  assert.match(doBlock, /set prompt = b\.prompt \|\| jsonb_build_object\('answer', c\.claimed_answer\)/);
});

test("English repair corrects BOTH validationTier and correctOptions in one merge, deriving correctOptions from the candidate's own genuine distractors evidence -- never the full options list", () => {
  const englishUpdate = englishUpdateStatement;
  assert.match(englishUpdate, /jsonb_build_object\('validationTier', 'TIER6_MULTI_SELECT'\)/);
  assert.match(englishUpdate, /jsonb_build_object\('correctOptions', jsonb_build_array\(c\.distractors->'options'->\(c\.distractors->>'correctOptionIndex'\)::int\)\)/);
  assert.match(englishUpdate, /c\.published_question_id = b\.id/);
  assert.match(englishUpdate, /b\.id like 'qf-%'/);
  assert.match(englishUpdate, /b\.subject = 'english'/);
  assert.match(englishUpdate, /b\.family_id = 'wave1-fam-synonym-battery'/);
  assert.match(englishUpdate, /\(b\.prompt->>'validationTier'\) = 'TIER1_EXACT_MATCH'/);
  assert.match(englishUpdate, /jsonb_array_length\(b\.prompt->'correctOptions'\) <> 1/);
});

test("the correctOptions replacement is built as a single-element array (jsonb_build_array of exactly one index lookup), never the full distractors.options array", () => {
  const englishUpdate = englishUpdateStatement;
  assert.doesNotMatch(englishUpdate, /jsonb_build_object\('correctOptions', c\.distractors->'options'\)/, "must never assign the full options array as correctOptions -- that is the exact defect being repaired");
  assert.match(englishUpdate, /jsonb_build_array\(c\.distractors->'options'->\(c\.distractors->>'correctOptionIndex'\)::int\)/);
});

test("English repair requires requiredSelectionCount already present -- it is read, never written by this migration", () => {
  const englishUpdate = englishUpdateStatement;
  assert.match(englishUpdate, /\(b\.prompt->>'requiredSelectionCount'\) is not null/);
  const setPortion = englishUpdate.match(/set prompt = b\.prompt[\s\S]*?(?=\n\s*from)/)![0];
  assert.doesNotMatch(setPortion, /requiredSelectionCount/, "requiredSelectionCount must be read as a precondition, never written by this migration");
});

test("neither UPDATE can match a pre-existing (non-qf-prefixed) row, Mock, Writing, or any of the 30 unpublished historical calibration candidates", () => {
  const bankPredicates = doBlock.match(/\bb?\.?id like 'qf-%'/g) || [];
  assert.ok(bankPredicates.length >= 4, "every preflight count and every UPDATE must require the qf- prefix (2 preflights + 2 updates)");
  assert.doesNotMatch(doBlock, /pending_review/);
});

test("no audit/approval/publication-identity column is written by either UPDATE -- review_method, approval_basis, reviewer_id, candidate_id, published_question_id, family_id, difficulty, provenance, eligibility_status are all untouched", () => {
  const setClauses = doBlock.match(/\bset\s+prompt = b\.prompt[\s\S]*?(?=\n\s*(?:from|where))/g) || [];
  assert.equal(setClauses.length, 2, "expected exactly 2 UPDATE SET clauses (one Maths, one English)");
  for (const setClause of setClauses) {
    assert.doesNotMatch(setClause, /review_method|approval_basis|reviewer_id|review_timestamp|candidate_id|published_question_id|family_id|difficulty|provenance|eligibility_status/);
  }
});

test("no other table besides ali_question_bank is written by this migration; ali_question_candidate is read-only (joined for evidence, never updated)", () => {
  assert.doesNotMatch(doBlock, /update public\.ali_question_candidate/);
  assert.equal((doBlock.match(/update public\.ali_question_bank/g) || []).length, 2, "expected exactly 2 UPDATEs, both against ali_question_bank");
});

test("the migration's own header discloses all three defects, the exact expected counts (313/20/333), and an explicit rollback plan", () => {
  assert.match(sql, /\b313\b/);
  assert.match(sql, /\b20\b/);
  assert.match(sql, /\b333\b/);
  assert.match(sql, /correctOptions/);
  assert.match(sql, /full 4-option list|full options list|full list/i);
  assert.match(sql, /ROLLBACK/);
  assert.match(sql, /MIGRATION SAFETY REVIEW/);
});

test("the migration explicitly discloses it is not idempotent", () => {
  assert.match(sql, /[Nn]ot idempotent/);
});
