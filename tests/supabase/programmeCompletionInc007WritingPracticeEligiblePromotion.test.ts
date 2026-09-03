import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isMockEligibleCandidate } from "../../lib/ali/mockEligibility";

/**
 * Programme Completion Increment 007 — migration 200's Writing Practice
 * Eligibility Promotion (Part A: the 5 clean candidate-track rows).
 * Structural tests against migration 200's own SQL text, mirroring
 * tests/supabase/mockWritingBatch001IndependentValidation.test.ts's own
 * established discipline for this exact class of migration.
 */

const sql = fs.readFileSync("supabase/migrations/200_programme_completion_inc007_writing_practice_eligible_promotion.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const EXPECTED_5_IDS = [
  "eng-inc003-writing-imaginedplace-01",
  "eng-inc003-writing-favouriteplace-01",
  "eng-inc003-writing-pocketmoney-01",
  "eng-pc005-writing-personinfluence",
  "eng-pc005-writing-somethingnew",
];

test("exact 5-prompt allow-list: v_target_ids contains exactly the 5 recommended-for-Practice IDs, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(ids.length, 5);
  assert.deepEqual(ids.sort(), [...EXPECTED_5_IDS].sort());
});

test("neither Reserve-recommended row (difficulttask, meaningfulplace) nor any of the 6 pre-existing independently_validated rows is a target of this migration", () => {
  const excluded = [
    "eng-pc003-writing-difficulttask",
    "eng-pc003-writing-meaningfulplace",
    "mock-writing-mindchange-01",
    "mock-writing-kindness-01",
    "mock-writing-cookopinion-01",
    "mock-writing-newplace-01",
    "mock-writing-mistakelearned-01",
    "mock-writing-screentime-01",
    "wrt-003",
  ];
  for (const id of excluded) assert.ok(!executable.includes(id), `${id} must not appear in migration 200's executable SQL`);
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

test("resulting status is exactly 'practice_eligible' -- the only value this migration ever SETs, and the Mock-track statuses (independently_validated/mock_eligible) are skipped entirely", () => {
  const setStatements = [...executable.matchAll(/set eligibility_status = '(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(setStatements, ["practice_eligible"]);
  assert.ok(!executable.includes("independently_validated"));
  assert.ok(!executable.includes("mock_eligible"));
});

test("no content-field UPDATE: the only column ever SET by this migration is eligibility_status", () => {
  const setClauses = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(setClauses), new Set(["eligibility_status"]));
});

test("no ali_family_review mutation: this migration depends on real review evidence existing there, it never queries or writes to that table (the exception message's own prose mentions the table name for a human reader, which is fine -- no FROM/INSERT/UPDATE targets it)", () => {
  assert.ok(!/from\s+public\.ali_family_review|insert into\s+public\.ali_family_review|update\s+public\.ali_family_review/i.test(executable));
});

test("no ali_mock_form mutation, and no AI-scoring identifier referenced", () => {
  assert.ok(!executable.includes("ali_mock_form"));
  assert.ok(!/writing-feedback\/route|WRITING_CORRECTNESS_THRESHOLD|supportTier/.test(executable));
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

test("idempotent structure: the already-promoted branch is a no-op (no UPDATE statement inside it)", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_promoted_count = 5 then[\s\S]*?else/)![0];
  assert.ok(!/update /i.test(alreadyAppliedBranch));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not-applied disclosure present, and explicitly distinguishes this as prepared-in-advance, not evidence-backed like migration 181", () => {
  assert.match(sql, /NOT APPLIED\. Must not be applied until the Increment 007 independent/);
  assert.match(sql, /PREPARED IN ADVANCE of that evidence/);
});

test("Mock eligibility gate continues to reject practice_eligible content -- proven against the real, unmodified isMockEligibleCandidate() function (practice_eligible was never a Mock-track status to begin with)", () => {
  for (const id of EXPECTED_5_IDS) {
    const afterPromotion = { eligibilityStatus: "practice_eligible" as const, active: true, subject: "writing" as const, pathway: ["csse" as const] };
    assert.equal(
      isMockEligibleCandidate(afterPromotion, "writing", "csse"),
      false,
      `${id}: practice_eligible must still be rejected by the Mock eligibility gate -- only mock_eligible qualifies`
    );
  }
});
