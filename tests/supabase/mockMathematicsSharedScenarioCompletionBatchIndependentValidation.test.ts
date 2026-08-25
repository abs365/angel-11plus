import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isMockEligibleCandidate } from "../../lib/ali/mockEligibility";

/**
 * Mathematics First Mock Minimum — Shared-Scenario Completion Batch,
 * Independent Validation Promotion (Decision 168/169/170/171).
 * Structural tests against migration 116's own SQL text, mirroring
 * tests/supabase/mockMathematicsFirstMockCompoundBatch001Independent
 * Validation.test.ts's own established convention (migration 111,
 * Decision 165) exactly.
 */

const sql = fs.readFileSync("supabase/migrations/116_mock_mathematics_shared_scenario_completion_batch_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const EXPECTED_4_IDS = [
  "mock-mr10-fairprep-01", "mock-mr10-fairprep-02",
  "mock-mr09-runningclub-01", "mock-mr09-runningclub-02",
];

const EXPECTED_2_FAMILIES = ["mock-mr10-fairprep", "mock-mr09-runningclub"];

test("exact 4-question allow-list: v_target_ids contains exactly the 4 migration-113 IDs, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(ids.length, 4);
  assert.deepEqual(ids.sort(), [...EXPECTED_4_IDS].sort());
});

test("exact two-family membership: v_target_families contains exactly the 2 approved families, no more no less", () => {
  const match = executable.match(/v_target_families constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const families = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(families.length, 2);
  assert.deepEqual(families.sort(), [...EXPECTED_2_FAMILIES].sort());
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

test("no mock_eligible transition anywhere in this migration's real SQL -- eligibility_status is never SET to mock_eligible; every other mention of the word is disclosure prose (RAISE NOTICE text), not executable state", () => {
  assert.ok(!/set eligibility_status = 'mock_eligible'/.test(executable));
  const nonNoticeExecutable = executable.replace(/raise notice '[^']*(?:''[^']*)*';/g, "");
  assert.ok(!nonNoticeExecutable.includes("mock_eligible"), "mock_eligible must not appear outside RAISE NOTICE disclosure text");
});

test("no content-field UPDATE: the only column ever SET by this migration is eligibility_status", () => {
  const setClauses = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(setClauses), new Set(["eligibility_status"]));
});

test("no content field is ever referenced as a SET target: prompt/answer/marks/stimulus/skill/difficulty/family_id/grouping columns are all read-only in this migration's real SQL", () => {
  for (const column of ["prompt", "answer", "marks", "stimulus", "skill", "content_difficulty", "family_id", "question_group_id", "group_order", "subpart_label", "marking_mode", "active"]) {
    assert.ok(!new RegExp(`\\bset\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("the 4 grouping/stimulus columns are never referenced anywhere in this migration's real SQL -- explicit immutability", () => {
  for (const column of ["question_group_id", "group_order", "subpart_label", "marking_mode", "stimulus"]) {
    assert.ok(!executable.includes(column), `unexpected reference to "${column}"`);
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
  const alreadyAppliedBranch = executable.match(/elsif v_already_validated_count = 4 then[\s\S]*?else/)![0];
  assert.ok(!/update /i.test(alreadyAppliedBranch));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header, and explicitly documents its dependency on migrations 113/114/115", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /113\/114\/115/);
});

test("the migration's own header explicitly records the Founder-supplied approval evidence (reviewer, decision, review_type, marker, date) -- not merely trusted from a UI screenshot", () => {
  assert.match(sql, /Ayobami Lawal/);
  assert.match(sql, /decision = 'approved'/);
  assert.match(sql, /mock_maths_independent_review/);
  assert.match(sql, /MOCK-SHARED-SCENARIO-COMPLETION-BATCH/);
  assert.match(sql, /2026-08-25/);
});

test("the migration's own header explicitly keeps the Mathematics Marking Integrity Gate open -- does not claim to resolve or waive it", () => {
  assert.match(sql, /MARKING INTEGRITY GATE.*REMAINS OPEN/);
  assert.match(sql, /does not change any mark, answer, or scoring behaviour/);
});

test("the header's own re-derived affected-row count is internally consistent: 20 rows / 10 already-mock_eligible families, plus exactly the 2 rows this migration promotes, totalling 22 rows / 12 families -- not a stale or inconsistent summary", () => {
  const collapsed = sql.replace(/\n--\s?/g, " ");
  assert.match(collapsed, /22 rows across 12 families/);
  assert.match(collapsed, /20 rows across 10 families already\s+mock_eligible today/);
  assert.match(collapsed, /mock-mr09-data-03 ×1/);
  assert.match(collapsed, /plus exactly the 2\s+rows this migration promotes/);
});

test("zero overlap with any prior batch's own target IDs -- no accidental re-touch of Batch 001/002/003, costumeschedule, mr09-data, or perimeterarea", () => {
  const PRIOR_IDS = [
    "mock-mr02-invdiv-01", "mock-mr02-invdiv-02", "mock-mr02-invdiv-03",
    "mock-mr02-twostep-01", "mock-mr02-twostep-02", "mock-mr02-twostep-03",
    "mock-mr03-unitconv-01", "mock-mr03-unitconv-02", "mock-mr03-unitconv-03",
    "mock-mr09-data-01", "mock-mr09-data-02", "mock-mr09-data-03",
    "mock-mr05-forward-01", "mock-mr05-forward-02",
    "mock-mr05-inverse-01", "mock-mr05-inverse-02",
    "mock-mr13-bestvalue-01", "mock-mr13-bestvalue-02",
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
    "mock-mr01-directcalc-01", "mock-mr01-directcalc-02",
    "mock-mr08-rotation-01", "mock-mr08-rotation-02",
    "mock-mr12-reversemean-01", "mock-mr12-reversemean-02",
    "mock-mr01mr10-costumeschedule-01a", "mock-mr01mr10-costumeschedule-01b",
    "mock-mr01mr10-costumeschedule-02a", "mock-mr01mr10-costumeschedule-02b",
    "mock-mr03mr07-perimeterarea-01a", "mock-mr03mr07-perimeterarea-01b",
    "mock-mr03mr07-perimeterarea-02a", "mock-mr03mr07-perimeterarea-02b",
  ];
  assert.deepEqual(EXPECTED_4_IDS.filter((id) => PRIOR_IDS.includes(id)), []);
});

test("Mock eligibility gate continues to reject independently_validated content -- proven against the real, unmodified isMockEligibleCandidate() function, not merely asserted true by this migration's own intent", () => {
  for (const id of EXPECTED_4_IDS) {
    const afterPromotion = { eligibilityStatus: "independently_validated" as const, active: true, subject: "maths" as const, pathway: ["csse" as const] };
    assert.equal(
      isMockEligibleCandidate(afterPromotion, "maths", "csse"),
      false,
      `${id}: independently_validated must still be rejected by the Mock eligibility gate -- only mock_eligible qualifies`
    );
  }
});
