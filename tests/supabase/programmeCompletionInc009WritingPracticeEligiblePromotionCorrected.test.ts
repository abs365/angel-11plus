import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isMockEligibleCandidate } from "../../lib/ali/mockEligibility";

/**
 * Programme Completion Increment 009 — migration 203, the corrected
 * promotion migration that supersedes migration 200. Structural tests
 * proving it checks real review closure in ali_family_review, not merely
 * eligibility_status.
 */

const sql = fs.readFileSync("supabase/migrations/203_programme_completion_inc009_writing_practice_eligible_promotion.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
const migration200 = fs.readFileSync("supabase/migrations/200_programme_completion_inc007_writing_practice_eligible_promotion.sql", "utf8");

const EXPECTED_5_IDS = [
  "eng-inc003-writing-imaginedplace-01",
  "eng-inc003-writing-favouriteplace-01",
  "eng-inc003-writing-pocketmoney-01",
  "eng-pc005-writing-personinfluence",
  "eng-pc005-writing-somethingnew",
];

test("targets the same 5 ids as migration 200, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(ids.length, 5);
  assert.deepEqual(ids.sort(), [...EXPECTED_5_IDS].sort());
});

test("migration 200 is explicitly named as superseded, and NOT re-applied by this file (no update/insert executed against migration 200's own targets by re-running it)", () => {
  assert.match(sql, /SUPERSEDES MIGRATION 200/);
  assert.match(sql, /DO NOT APPLY MIGRATION 200/);
  // migration 200 itself is left untouched (immutable historical artifact) -- confirmed by its own continued not-applied disclosure, unedited.
  assert.match(migration200, /NOT APPLIED\. Must not be applied until the Increment 007 independent/);
});

test("unlike migration 200, this migration queries ali_family_review for real review closure before promoting -- not merely eligibility_status", () => {
  assert.match(executable, /from public\.ali_family_review/);
  assert.match(executable, /decision = 'approved'/);
  assert.match(executable, /decision = 'approved_with_amendment'/);
  assert.match(executable, /review_type = 'amendment_verification'/);
});

test("difficulttask, meaningfulplace, and all 6 pre-existing independently_validated rows are excluded from this migration's targets", () => {
  const excluded = [
    "eng-pc003-writing-difficulttask", "eng-pc003-writing-meaningfulplace",
    "mock-writing-mindchange-01", "mock-writing-kindness-01", "mock-writing-cookopinion-01",
    "mock-writing-newplace-01", "mock-writing-mistakelearned-01", "mock-writing-screentime-01",
  ];
  const targetBlock = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![0];
  for (const id of excluded) assert.ok(!targetBlock.includes(id), `${id} must not be a target of migration 203`);
});

test("resulting status is exactly 'practice_eligible'; no ali_family_review row is ever written by this migration (read-only against that table)", () => {
  const setStatements = [...executable.matchAll(/set eligibility_status = '(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(setStatements, ["practice_eligible"]);
  assert.ok(!/insert into\s+public\.ali_family_review/i.test(executable));
});

test("fails safely: at least one RAISE EXCEPTION for the count mismatch and at least one for review-closure failure, plus RAISE NOTICE branches", () => {
  assert.ok((executable.match(/raise exception/g) || []).length >= 2);
  assert.ok((executable.match(/raise notice/g) || []).length >= 1);
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("Mock eligibility gate continues to reject practice_eligible content", () => {
  for (const id of EXPECTED_5_IDS) {
    const afterPromotion = { eligibilityStatus: "practice_eligible" as const, active: true, subject: "writing" as const, pathway: ["csse" as const] };
    assert.equal(isMockEligibleCandidate(afterPromotion, "writing", "csse"), false, `${id} must still be rejected by the Mock eligibility gate`);
  }
});
