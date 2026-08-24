import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isMockEligibleCandidate } from "../../lib/ali/mockEligibility";

/**
 * Mock Programme Increment 006 — Continuous Writing Batch 001,
 * Independent Validation Promotion (Decision 158, Phase A). Structural
 * tests against migration 103's own SQL text, mirroring the discipline
 * tests/supabase/mockMathematicsBatch00{1,2,3}IndependentValidation.test.ts
 * already established.
 */

const sql = fs.readFileSync("supabase/migrations/103_mock_writing_batch001_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const EXPECTED_3_IDS = ["mock-writing-mindchange-01", "mock-writing-kindness-01", "mock-writing-cookopinion-01"];

test("exact 3-prompt allow-list: v_target_ids contains exactly the 3 migration-098 IDs, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(ids.length, 3);
  assert.deepEqual(ids.sort(), [...EXPECTED_3_IDS].sort());
});

test("required source status: the precondition count and the UPDATE's own WHERE clause both require eligibility_status = 'authentic_assessment_candidate' before touching a row, scoped by subject = 'writing'", () => {
  const preconditionBlock = executable.match(/select count\(\*\) into v_pending_count[\s\S]*?subject = 'writing';/)![0];
  assert.match(preconditionBlock, /eligibility_status = 'authentic_assessment_candidate'/);
  assert.match(preconditionBlock, /active = true/);
  assert.match(preconditionBlock, /subject = 'writing'/);

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

test("no content-field UPDATE: the only column ever SET by this migration is eligibility_status -- no prompt/checklist/family_id/provenance/content_version column is touched", () => {
  const setClauses = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(setClauses), new Set(["eligibility_status"]));
});

test("no AI-scoring identifier referenced anywhere -- the existing quarantine boundary (Decisions 47/60/61/106) is untouched", () => {
  assert.ok(!/writing-feedback\/route|WRITING_CORRECTNESS_THRESHOLD|supportTier/.test(executable));
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
  const alreadyAppliedBranch = executable.match(/elsif v_already_validated_count = 3 then[\s\S]*?else/)![0];
  assert.ok(!/update /i.test(alreadyAppliedBranch));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
});

test("does not overlap with the existing wrt-003 practice-eligible writing row -- migration 013's own row is never a target of this migration", () => {
  assert.ok(!executable.includes("wrt-003"));
});

test("Mock eligibility gate continues to reject independently_validated content -- proven against the real, unmodified isMockEligibleCandidate() function", () => {
  for (const id of EXPECTED_3_IDS) {
    const afterPromotion = { eligibilityStatus: "independently_validated" as const, active: true, subject: "writing" as const, pathway: ["csse" as const] };
    assert.equal(
      isMockEligibleCandidate(afterPromotion, "writing", "csse"),
      false,
      `${id}: independently_validated must still be rejected by the Mock eligibility gate -- only mock_eligible qualifies`
    );
  }
});
