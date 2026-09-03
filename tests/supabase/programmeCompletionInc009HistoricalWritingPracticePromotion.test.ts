import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isMockEligibleCandidate } from "../../lib/ali/mockEligibility";

/**
 * Programme Completion Increment 009 — migration 204, the historical-row
 * (newplace + mistakelearned) independently_validated -> practice_eligible
 * promotion, explicitly Founder-authorised.
 */

const sql = fs.readFileSync("supabase/migrations/204_programme_completion_inc009_historical_writing_practice_promotion.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const EXPECTED_2_IDS = ["mock-writing-newplace-01", "mock-writing-mistakelearned-01"];

test("exact 2-prompt allow-list: v_target_ids contains exactly newplace and mistakelearned, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(ids.length, 2);
  assert.deepEqual(ids.sort(), [...EXPECTED_2_IDS].sort());
});

test("mindchange, kindness, cookopinion (Mock-origin, Protected Reserve) and screentime (Revise) never appear in this migration's executable SQL", () => {
  const excluded = ["mock-writing-mindchange-01", "mock-writing-kindness-01", "mock-writing-cookopinion-01", "mock-writing-screentime-01"];
  for (const id of excluded) assert.ok(!executable.includes(id), `${id} must not appear in migration 204`);
});

test("source status required is 'independently_validated' -- a transition never attempted before this migration in this codebase's history", () => {
  const preconditionBlock = executable.match(/select count\(\*\) into v_pending_count[\s\S]*?subject = 'writing';/)![0];
  assert.match(preconditionBlock, /eligibility_status = 'independently_validated'/);
  const updateBlock = executable.match(/update public\.ali_question_bank[\s\S]*?eligibility_status = 'independently_validated';/)![0];
  assert.match(updateBlock, /where id = any\(v_target_ids\)/);
});

test("resulting status is exactly 'practice_eligible'; no new review decision is written (no insert into ali_family_review anywhere)", () => {
  const setStatements = [...executable.matchAll(/set eligibility_status = '(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(setStatements, ["practice_eligible"]);
  assert.ok(!/insert into\s+public\.ali_family_review/i.test(executable));
});

test("no content-field UPDATE: the only column ever SET by this migration is eligibility_status", () => {
  const setClauses = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(setClauses), new Set(["eligibility_status"]));
});

test("fails safely: exactly one RAISE EXCEPTION and exactly two RAISE NOTICE branches, matching the established fail-closed pattern", () => {
  assert.equal((executable.match(/raise exception/g) || []).length, 1);
  assert.equal((executable.match(/raise notice/g) || []).length, 2);
});

test("wrapped in a single begin/commit transaction, not-applied disclosure present", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
  assert.match(sql, /NOT APPLIED\. Founder must apply/);
});

test("Mock eligibility gate continues to reject practice_eligible content", () => {
  for (const id of EXPECTED_2_IDS) {
    const afterPromotion = { eligibilityStatus: "practice_eligible" as const, active: true, subject: "writing" as const, pathway: ["csse" as const] };
    assert.equal(isMockEligibleCandidate(afterPromotion, "writing", "csse"), false, `${id} must still be rejected by the Mock eligibility gate`);
  }
});
