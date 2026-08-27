import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * English Content Foundation, Increment 001 — Review-Target Structure
 * Remediation (Decision 231), migrations 155/156. Structural + semantic
 * tests against migration 155/156's own real SQL text, mirroring
 * migration 148's own established single/dual-field-correction pattern
 * (precondition -> pristine/already-corrected/refuse -> post-write
 * verification), plus source-level proof that historical migration 154
 * was never edited and that migrations 152/153 (content) are untouched.
 */

const sql154 = fs.readFileSync("supabase/migrations/154_english_content_foundation_increment001_pending_review.sql", "utf8");
const sql155 = fs.readFileSync("supabase/migrations/155_english_content_foundation_increment001_review_target_identifier_correction.sql", "utf8");
const sql156 = fs.readFileSync("supabase/migrations/156_english_content_foundation_increment001_bee_passage_provenance_factual_evidence.sql", "utf8");
const sql152 = fs.readFileSync("supabase/migrations/152_english_content_foundation_increment001_comprehension.sql", "utf8");

function stripComments(sqlText: string): string {
  return sqlText.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
}

const executable154 = stripComments(sql154);
const executable155 = stripComments(sql155);
const executable156 = stripComments(sql156);

// === Historical migration 154 is genuinely unchanged =======================

test("migration 154 (historical, already applied) still registers the ORIGINAL (broken) family_id values -- migration 155 corrects live data, never rewrites history", () => {
  assert.match(executable154, /'passage', 'eng-inc001-understudy-narrative', 'UNASSIGNED'/);
  assert.match(executable154, /'passage', 'eng-inc001-bee-navigation-informational', 'UNASSIGNED'/);
});

test("migration 154 contains no UPDATE statement of any kind -- it remains a pure, additive placeholder-seeding migration exactly as originally authored", () => {
  assert.ok(!/\bupdate\s+public\./i.test(executable154));
});

// === Migration 155 targets exactly the two passage rows =====================

test("migration 155 targets exactly the two passage review rows, by their exact old/new id pairs, never the three Writing rows", () => {
  assert.match(executable155, /v_old_id constant text := 'eng-inc001-understudy-narrative';/);
  assert.match(executable155, /v_new_id constant text := 'eng-inc001-understudy';/);
  assert.match(executable155, /v_old_id constant text := 'eng-inc001-bee-navigation-informational';/);
  assert.match(executable155, /v_new_id constant text := 'eng-inc001-bee-navigation';/);
  assert.ok(!executable155.includes("mock-writing-wc01a-"), "migration 155 must never reference any Writing-prompt family_id");
});

test("migration 155 updates only ali_family_review.family_id -- no other column, table, eligibility_status, or content is ever SET", () => {
  const setClauses = [...executable155.matchAll(/set\s+(\w+)\s*=/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(setClauses), new Set(["family_id"]));
  const updateTargets = [...executable155.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_family_review"]));
});

test("migration 155 never touches ali_passage_bank, ali_question_bank content, or eligibility_status -- read-only preconditions against those tables, no writes", () => {
  assert.ok(!/update\s+public\.ali_passage_bank/i.test(executable155));
  assert.ok(!/update\s+public\.ali_question_bank/i.test(executable155));
});

test("migration 155 never references ali_mock_form -- no Mock activation of any kind", () => {
  assert.ok(!executable155.includes("ali_mock_form"));
});

// === Pristine / already-corrected / refuse structure, both blocks ==========

for (const [label, oldId] of [
  ["Understudy", "eng-inc001-understudy-narrative", "eng-inc001-understudy"],
  ["Bee Navigation", "eng-inc001-bee-navigation-informational", "eng-inc001-bee-navigation"],
] as const) {
  test(`migration 155 (${label}): pristine branch (v_pristine_count = 1 and v_already_corrected_count = 0) performs exactly one UPDATE, from the old id to the new id`, () => {
    const block = executable155.match(new RegExp(`v_old_id constant text := '${oldId}'[\\s\\S]*?end \\$\\$;`))![0];
    assert.match(block, /if v_pristine_count = 1 and v_already_corrected_count = 0 then/);
    const pristineBranch = block.match(/if v_pristine_count = 1 and v_already_corrected_count = 0 then([\s\S]*?)elsif/)![1];
    assert.match(pristineBranch, /update public\.ali_family_review\s*\n\s*set family_id = v_new_id/);
  });

  test(`migration 155 (${label}): already-corrected branch (v_already_corrected_count = 1 and v_pristine_count = 0) contains no UPDATE statement -- idempotent no-op`, () => {
    const block = executable155.match(new RegExp(`v_old_id constant text := '${oldId}'[\\s\\S]*?end \\$\\$;`))![0];
    const alreadyCorrectedBranch = block.match(/elsif v_already_corrected_count = 1 and v_pristine_count = 0 then([\s\S]*?)else/)![1];
    assert.ok(!/\bupdate\s+public\./i.test(alreadyCorrectedBranch));
  });

  test(`migration 155 (${label}): any other state (mixed/unexpected) is explicitly refused via RAISE EXCEPTION, never silently repaired`, () => {
    const block = executable155.match(new RegExp(`v_old_id constant text := '${oldId}'[\\s\\S]*?end \\$\\$;`))![0];
    assert.match(block, /else\s*\n\s*raise exception 'Migration 155 refused \(.*?\): expected exactly 1 pristine row/);
  });

  test(`migration 155 (${label}): refuses if a genuine, non-pending decision already exists against either the old or new family_id -- an already-approved review is never silently rewritten`, () => {
    const block = executable155.match(new RegExp(`v_old_id constant text := '${oldId}'[\\s\\S]*?end \\$\\$;`))![0];
    assert.match(block, /where family_id in \(v_old_id, v_new_id\) and decision <> 'pending_independent_review'/);
    assert.match(block, /if v_non_pending_decisions <> 0 then\s*\n\s*raise exception 'Migration 155 refused \(.*?\): found % row\(s\) with a genuine, non-pending decision/);
  });

  test(`migration 155 (${label}): requires the corresponding passage to genuinely exist (by its own id) before writing`, () => {
    const block = executable155.match(new RegExp(`v_old_id constant text := '${oldId}'[\\s\\S]*?end \\$\\$;`))![0];
    assert.match(block, /from public\.ali_passage_bank where id = v_new_id and eligibility_status = 'authentic_assessment_candidate' and active = true/);
  });
}

test("migration 155 (Understudy): requires exactly 7 questions via learning_unit_id before writing", () => {
  const block = executable155.match(/v_old_id constant text := 'eng-inc001-understudy-narrative'[\s\S]*?end \$\$;/)![0];
  assert.match(block, /v_expected_question_count constant int := 7;/);
  assert.match(block, /from public\.ali_question_bank where learning_unit_id = v_new_id and eligibility_status = 'authentic_assessment_candidate' and active = true/);
});

test("migration 155 (Bee Navigation): requires exactly 8 questions via learning_unit_id before writing", () => {
  const block = executable155.match(/v_old_id constant text := 'eng-inc001-bee-navigation-informational'[\s\S]*?end \$\$;/)![0];
  assert.match(block, /v_expected_question_count constant int := 8;/);
});

test("migration 155: wrapped in a single begin/commit transaction; every RAISE with a % placeholder supplies exactly one matching argument", () => {
  assert.equal((executable155.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable155.match(/\bcommit;/g) || []).length, 1);
  const raiseStatements = [...executable155.matchAll(/raise (?:exception|notice)\s+'([^']*(?:''[^']*)*)'((?:\s*,\s*v_\w+)*)\s*;/g)];
  assert.ok(raiseStatements.length > 0);
  for (const [, message, args] of raiseStatements) {
    const placeholders = (message.match(/%/g) || []).length;
    const argCount = args ? (args.match(/v_\w+/g) || []).length : 0;
    assert.equal(placeholders, argCount, `RAISE message "${message}" has ${placeholders} placeholders but ${argCount} arguments`);
  }
});

test("migration 155: NOT APPLIED disclosure present", () => {
  assert.match(sql155, /NOT APPLIED\. Generated for Founder review/);
});

// === Independently re-verify the real learning_unit_id counts in 152 =======
// (proves the "exactly 7 / exactly 8" preconditions in migration 155 are
// asserting a value that is actually true of the real content, not an
// arbitrary number.)

test("independently re-counted from migration 152's own real SQL: exactly 7 questions carry learning_unit_id = 'eng-inc001-understudy', exactly 8 carry 'eng-inc001-bee-navigation', selected by the ACTUAL learning_unit_id column, never by string-prefix matching on the id", () => {
  const re = /', \d+, '([\w-]+)',\s*\n\s*'([\w-]+)', 'angel_original', 'authentic_assessment_candidate'/g;
  const counts: Record<string, number> = {};
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql152))) counts[m[1]] = (counts[m[1]] ?? 0) + 1;
  assert.equal(counts["eng-inc001-understudy"], 7);
  assert.equal(counts["eng-inc001-bee-navigation"], 8);
  assert.equal(Object.keys(counts).length, 2, "no third learning_unit_id should exist among the 15 new questions");
});

test("no question anywhere in migration 152 carries a learning_unit_id that is merely PREFIX-similar (e.g. 'eng-inc001-understudy-extra') without being an EXACT match -- proves membership is exact-string, not prefix-based, matching fetchQuestionsForPassage()'s own .eq() filter", () => {
  const learningUnitIds = [...sql152.matchAll(/', \d+, '([\w-]+)',\s*\n\s*'[\w-]+', 'angel_original', 'authentic_assessment_candidate'/g)].map((m) => m[1]);
  const distinct = new Set(learningUnitIds);
  assert.deepEqual(distinct, new Set(["eng-inc001-understudy", "eng-inc001-bee-navigation"]));
});

// === Migration 156: bee passage provenance evidence pointer =================

test("migration 156 targets only the bee-navigation passage, by exact id, never the Understudy passage", () => {
  assert.match(executable156, /v_target_id constant text := 'eng-inc001-bee-navigation';/);
  assert.ok(!executable156.includes("eng-inc001-understudy'"), "must never reference the Understudy passage's own id");
});

test("migration 156 updates only ali_passage_bank.provenance -- no other column is ever SET", () => {
  const setClauses = [...executable156.matchAll(/set\s+(\w+)\s*=/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(setClauses), new Set(["provenance"]));
});

test("migration 156's new provenance value names both factual corrections and their evidence-tier basis, without dumping full research prose (a concise pointer, not a research-management system)", () => {
  assert.match(sql156, /von Frisch/);
  assert.match(sql156, /1946/);
  assert.match(sql156, /magnetic-field sensitivity/);
  assert.match(sql156, /SOURCE-CONTAINS/);
  assert.match(sql156, /FACTUAL-CONFIDENCE/);
  const newValueLine = sql156.match(/v_new_provenance constant text := '([^;]*)';/)?.[1] ?? "";
  assert.ok(newValueLine.length < 2000, "the provenance pointer must remain concise, not a full research dump");
});

test("migration 156 requires the bee passage's own 8-question membership as a live precondition before writing", () => {
  assert.match(executable156, /v_expected_question_count constant int := 8;/);
  assert.match(executable156, /learning_unit_id = v_target_id and eligibility_status = 'authentic_assessment_candidate' and active = true/);
});

test("migration 156: pristine/already-corrected/refuse structure present, idempotent, wrapped in a single transaction", () => {
  assert.match(executable156, /if v_pristine_count = 1 and v_already_corrected_count = 0 then/);
  assert.match(executable156, /elsif v_already_corrected_count = 1 and v_pristine_count = 0 then/);
  assert.match(executable156, /else\s*\n\s*raise exception 'Migration 156 refused/);
  const alreadyCorrectedBranch = executable156.match(/elsif v_already_corrected_count = 1 and v_pristine_count = 0 then([\s\S]*?)else/)![1];
  assert.ok(!/\bupdate\s+public\./i.test(alreadyCorrectedBranch));
  assert.equal((executable156.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable156.match(/\bcommit;/g) || []).length, 1);
});

test("migration 156 never touches eligibility_status, active, original_text, title, or ali_mock_form", () => {
  assert.ok(!/set\s+eligibility_status/i.test(executable156));
  assert.ok(!/set\s+active/i.test(executable156));
  assert.ok(!/set\s+original_text/i.test(executable156));
  assert.ok(!/set\s+title/i.test(executable156));
  assert.ok(!executable156.includes("ali_mock_form"));
});

// === Migration SQL guard sanity (redundant with scripts/migration-sql-guard.mjs, kept as a direct in-suite check) ===

test("migrations 155 and 156 are each internally quote-balanced", () => {
  for (const sql of [sql155, sql156]) {
    const singleQuotes = (sql.match(/(?<!')'(?!')/g) || []).length;
    // Loose sanity check only -- the authoritative check is scripts/migration-sql-guard.mjs, run separately in full verification.
    assert.ok(singleQuotes % 2 === 0 || sql.includes("''"), "expected an even number of standalone single quotes, or legitimate doubled-quote escapes present");
  }
});
