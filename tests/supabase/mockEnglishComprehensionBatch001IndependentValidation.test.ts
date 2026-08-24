import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isMockEligibleCandidate } from "../../lib/ali/mockEligibility";

/**
 * Mock Programme Increment 006 — English Comprehension Batch 001,
 * Independent Validation Promotion (Decision 158, Phase A). Structural
 * tests against migration 102's own SQL text, mirroring the discipline
 * tests/supabase/mockMathematicsBatch00{1,2}IndependentValidation.test.ts
 * already established, extended for this migration's own two-table
 * scope (ali_question_bank + ali_passage_bank) — a deliberate,
 * explicitly-disclosed scope decision (see the migration's own header
 * comment), so these tests prove both halves are promoted together,
 * atomically, and nothing else.
 */

const sql = fs.readFileSync("supabase/migrations/102_mock_english_comprehension_batch001_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const EXPECTED_13_IDS = [
  "mock-eng-boathouse-q01", "mock-eng-boathouse-q02", "mock-eng-boathouse-q03",
  "mock-eng-boathouse-q04", "mock-eng-boathouse-q05", "mock-eng-boathouse-q06",
  "mock-eng-boathouse-q07", "mock-eng-boathouse-q08", "mock-eng-boathouse-q09",
  "mock-eng-boathouse-q10", "mock-eng-boathouse-q11",
  "mock-eng-boathouse-q12a", "mock-eng-boathouse-q12b",
];

test("exact 13-question allow-list: v_target_ids contains exactly the 13 migration-097 question rows, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(ids.length, 13);
  assert.deepEqual(ids.sort(), [...EXPECTED_13_IDS].sort());
});

test("the question-row precondition and UPDATE both scope by learning_unit_id = mock-eng-boathouse, not by a bare id list alone", () => {
  const preconditionBlock = executable.match(/select count\(\*\) into v_pending_count[\s\S]*?learning_unit_id = 'mock-eng-boathouse';/)![0];
  assert.match(preconditionBlock, /eligibility_status = 'authentic_assessment_candidate'/);
  assert.match(preconditionBlock, /active = true/);
  assert.match(preconditionBlock, /learning_unit_id = 'mock-eng-boathouse'/);
});

test("the passage row is promoted via its own, independently-guarded assertion-and-refuse block on ali_passage_bank, scoped to exactly id = mock-eng-boathouse", () => {
  const passageBlock = executable.match(/from public\.ali_passage_bank[\s\S]*?commit;/)![0];
  assert.match(passageBlock, /id = 'mock-eng-boathouse'/);
  assert.match(passageBlock, /eligibility_status = 'authentic_assessment_candidate'/);
});

test("resulting status is exactly 'independently_validated' -- the only value this migration ever SETs, on both tables", () => {
  const setStatements = [...executable.matchAll(/set eligibility_status = '(\w+)'/g)].map((m) => m[1]);
  assert.equal(setStatements.length, 2, "exactly one SET on ali_question_bank and one on ali_passage_bank");
  assert.deepEqual(new Set(setStatements), new Set(["independently_validated"]));
});

test("no mock_eligible transition anywhere in this migration's real SQL", () => {
  assert.ok(!/set eligibility_status = 'mock_eligible'/.test(executable));
  assert.ok(!executable.includes("mock_eligible"));
});

test("no content-field UPDATE on either table -- the only column ever SET anywhere is eligibility_status", () => {
  const setClauses = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(setClauses), new Set(["eligibility_status"]));
});

test("passage association and grouping columns are never touched: learning_unit_id, question_group_id, group_order, subpart_label, marking_mode, original_text, word_count, review_state are never SET", () => {
  for (const column of ["question_group_id", "group_order", "subpart_label", "marking_mode", "original_text", "word_count", "review_state"]) {
    assert.ok(!new RegExp(`set\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
  // learning_unit_id appears legitimately in WHERE clauses (scoping), just never after SET.
  assert.ok(!/set\s+learning_unit_id\s*=/i.test(executable));
});

test("no ali_family_review mutation: this migration never mentions that table at all in its real SQL", () => {
  assert.ok(!executable.includes("ali_family_review"));
});

test("no ali_mock_form mutation: this migration never mentions that table at all in its real SQL", () => {
  assert.ok(!executable.includes("ali_mock_form"));
});

test("touches only ali_question_bank and ali_passage_bank -- no other table appears in any FROM/UPDATE/INSERT/DELETE clause", () => {
  assert.ok(!/\binsert into\b|\bdelete from\b/i.test(executable));
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank", "ali_passage_bank"]));
});

test("fails safely: exactly two RAISE EXCEPTION statements (one per table's own guard), exactly four RAISE NOTICE statements (apply/already-applied, per table)", () => {
  assert.equal((executable.match(/raise exception/g) || []).length, 2);
  assert.equal((executable.match(/raise notice/g) || []).length, 4);
});

test("both halves share the same single begin/commit transaction -- the question set and its passage are promoted together or not at all", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
});

test("the migration's own header explicitly discloses the 13-vs-14-row scope decision, not a silent deviation from the directive's stated 13/26 figures", () => {
  assert.match(sql, /DELIBERATE SCOPE DECISION, DISCLOSED EXPLICITLY/);
  assert.match(sql, /promotes 14 English rows, not 13/);
});

test("Mock eligibility gate continues to reject independently_validated content -- proven against the real, unmodified isMockEligibleCandidate() function", () => {
  for (const id of EXPECTED_13_IDS) {
    const afterPromotion = { eligibilityStatus: "independently_validated" as const, active: true, subject: "english" as const, pathway: ["csse" as const] };
    assert.equal(
      isMockEligibleCandidate(afterPromotion, "english", "csse"),
      false,
      `${id}: independently_validated must still be rejected by the Mock eligibility gate -- only mock_eligible qualifies`
    );
  }
});
