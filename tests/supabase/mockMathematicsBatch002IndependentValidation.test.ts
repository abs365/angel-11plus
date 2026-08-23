import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isMockEligibleCandidate } from "../../lib/ali/mockEligibility";

/**
 * Mock Programme Increment 004, Batch 002, Independent Validation
 * Promotion (Decision 149). Structural tests against migration 094's own
 * SQL text, mirroring tests/supabase/mockMathematicsBatch001IndependentValidation.test.ts's
 * own established convention (migration 090, Decision 143) exactly, plus
 * the explicit Decision-148-grouping-field-immutability proof this
 * task's own directive additionally requires.
 */

const sql = fs.readFileSync("supabase/migrations/094_mock_mathematics_batch002_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const EXPECTED_20_IDS = [
  "mock-mr04-percentchange-01", "mock-mr04-percentchange-02",
  "mock-mr04-reversepercent-01", "mock-mr04-reversepercent-02",
  "mock-mr06-sumdiff-01", "mock-mr06-sumdiff-02",
  "mock-mr06-multiplerelation-01", "mock-mr06-multiplerelation-02",
  "mock-mr07-triangleanglesum-01", "mock-mr07-triangleanglesum-02",
  "mock-mr07-isoscelesproperty-01", "mock-mr07-isoscelesproperty-02",
  "mock-mr10-forwardschedule-01", "mock-mr10-forwardschedule-02",
  "mock-mr10-reverseschedule-01", "mock-mr10-reverseschedule-02",
  "mock-mr11-truefalsejudgement-01", "mock-mr11-truefalsejudgement-02",
  "mock-mr11-propertysearch-01", "mock-mr11-propertysearch-02",
];

const EXPECTED_10_FAMILIES = [
  "mock-mr04-percentchange", "mock-mr04-reversepercent",
  "mock-mr06-sumdiff", "mock-mr06-multiplerelation",
  "mock-mr07-triangleanglesum", "mock-mr07-isoscelesproperty",
  "mock-mr10-forwardschedule", "mock-mr10-reverseschedule",
  "mock-mr11-truefalsejudgement", "mock-mr11-propertysearch",
];

test("exact 20-question allow-list: v_target_ids contains exactly the 20 migration-091 IDs, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(ids.length, 20);
  assert.deepEqual(ids.sort(), [...EXPECTED_20_IDS].sort());
});

test("exact ten-family membership: v_target_families contains exactly the 10 approved families, no more no less", () => {
  const match = executable.match(/v_target_families constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const families = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(families.length, 10);
  assert.deepEqual(families.sort(), [...EXPECTED_10_FAMILIES].sort());
});

test("required source status: the precondition count and the UPDATE's own WHERE clause both require eligibility_status = 'authentic_assessment_candidate' before touching a row", () => {
  const preconditionBlock = executable.match(/select count\(\*\) into v_pending_count[\s\S]*?family_id = any\(v_target_families\);/)![0];
  assert.match(preconditionBlock, /eligibility_status = 'authentic_assessment_candidate'/);
  assert.match(preconditionBlock, /active = true/);
  assert.match(preconditionBlock, /family_id = any\(v_target_families\)/);

  const updateBlock = executable.match(/update public\.ali_question_bank[\s\S]*?eligibility_status = 'authentic_assessment_candidate';/)![0];
  assert.match(updateBlock, /where id = any\(v_target_ids\)/);
  assert.match(updateBlock, /and eligibility_status = 'authentic_assessment_candidate';/);
});

test("resulting status is exactly 'independently_validated' -- the only value this migration ever SETs", () => {
  const setStatements = [...executable.matchAll(/set eligibility_status = '(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(setStatements, ["independently_validated"]);
});

test("no mock_eligible transition anywhere in this migration's real SQL", () => {
  assert.ok(!/set eligibility_status = 'mock_eligible'/.test(executable));
  assert.ok(!executable.includes("mock_eligible"));
});

test("no content-field UPDATE: the only column ever SET by this migration is eligibility_status -- no answer/prompt/explanation/family_id/provenance/content_version column is touched", () => {
  const setClauses = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(setClauses), new Set(["eligibility_status"]));
});

test("the 4 Decision 148 grouping columns (question_group_id, group_order, subpart_label, marking_mode) are never referenced anywhere in this migration's real SQL -- explicit immutability, not merely implied by the generic SET-clause check above", () => {
  for (const column of ["question_group_id", "group_order", "subpart_label", "marking_mode"]) {
    assert.ok(!executable.includes(column), `unexpected reference to "${column}" -- Batch 002 must remain unretrofitted standalone content`);
  }
});

test("no ali_family_review mutation: this migration never mentions that table at all in its real SQL", () => {
  assert.ok(!executable.includes("ali_family_review"));
});

test("no ali_mock_form mutation: this migration never mentions that table at all in its real SQL", () => {
  assert.ok(!executable.includes("ali_mock_form"));
});

test("touches only public.ali_question_bank -- no other table appears in any FROM/UPDATE/INSERT/DELETE clause", () => {
  assert.ok(!/\binsert into\b|\bdelete from\b/i.test(executable));
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
});

test("fails safely: exactly one RAISE EXCEPTION guarding the unexpected-state branch, exactly two RAISE NOTICE guarding the two safe branches (apply, already-applied)", () => {
  assert.equal((executable.match(/raise exception/g) || []).length, 1);
  assert.equal((executable.match(/raise notice/g) || []).length, 2);
});

test("idempotent structure: the already-independently_validated branch is a no-op (no UPDATE statement inside it)", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_validated_count = 20 then[\s\S]*?else/)![0];
  assert.ok(!/update /i.test(alreadyAppliedBranch));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
});

test("zero overlap with Batch 001's own 18 target IDs -- Batch 001 cannot be accidentally re-touched by this migration", () => {
  const BATCH_001_IDS = [
    "mock-mr02-invdiv-01", "mock-mr02-invdiv-02", "mock-mr02-invdiv-03",
    "mock-mr02-twostep-01", "mock-mr02-twostep-02", "mock-mr02-twostep-03",
    "mock-mr03-unitconv-01", "mock-mr03-unitconv-02", "mock-mr03-unitconv-03",
    "mock-mr09-data-01", "mock-mr09-data-02", "mock-mr09-data-03",
    "mock-mr05-forward-01", "mock-mr05-forward-02",
    "mock-mr05-inverse-01", "mock-mr05-inverse-02",
    "mock-mr13-bestvalue-01", "mock-mr13-bestvalue-02",
  ];
  const overlap = EXPECTED_20_IDS.filter((id) => BATCH_001_IDS.includes(id));
  assert.deepEqual(overlap, []);
});

test("Mock eligibility gate continues to reject independently_validated content -- proven against the real, unmodified isMockEligibleCandidate() function, not merely asserted true by this migration's own intent", () => {
  for (const id of EXPECTED_20_IDS) {
    const afterPromotion = { eligibilityStatus: "independently_validated" as const, active: true, subject: "maths" as const, pathway: ["csse" as const] };
    assert.equal(
      isMockEligibleCandidate(afterPromotion, "maths", "csse"),
      false,
      `${id}: independently_validated must still be rejected by the Mock eligibility gate -- only mock_eligible qualifies`
    );
  }
});
