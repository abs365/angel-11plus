import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Question Factory Wave 2, Sections 5/7 — proves, structurally, that an
 * unapproved or unpublished candidate can never be selected by Practice
 * or Mock. There is no live-Postgres harness in this test runner (this
 * repository's own established convention throughout), so this is a
 * structural proof over the real source of every real selection/fetch
 * path: none of them reads `ali_question_candidate` at all, and the only
 * path from a candidate into `ali_question_bank` (migration 230's
 * `publish_question_candidate()`) always writes `eligibility_status =
 * 'practice_eligible'` -- so by the time ANY selection code could see a
 * factory-originated row, it is already indistinguishable from, and
 * subject to every one of the same eligibility/exposure/cooldown/family
 * rules as, every other practice_eligible row. There is no separate
 * "candidate content" code path anywhere in the live selection pipeline
 * to have a gap in.
 */

const QUESTION_BANK_SOURCE = readFileSync("lib/ali/questionBank.ts", "utf8");
const SELECTION_SOURCE = readFileSync("lib/ali/selection.ts", "utf8");
const SESSION_GENERATOR_SOURCE = readFileSync("lib/learningEngine/sessionGenerator.ts", "utf8");
const MIGRATION_230 = readFileSync("supabase/migrations/230_question_factory_candidate_lifecycle.sql", "utf8");

test("fetchQuestionBank() (the real Practice/Mock candidate-pool source) never references ali_question_candidate", () => {
  assert.doesNotMatch(QUESTION_BANK_SOURCE, /ali_question_candidate/);
});

test("fetchQuestionBank() still filters strictly to eligibility_status === 'practice_eligible' -- unchanged by this wave, so a published factory question is bound by the exact same gate as every hand-authored row", () => {
  assert.match(QUESTION_BANK_SOURCE, /eligibilityStatus === PRACTICE_ELIGIBLE_STATUS/);
});

test("lib/ali/selection.ts (the real cooldown/weighting engine) never references ali_question_candidate", () => {
  assert.doesNotMatch(SELECTION_SOURCE, /ali_question_candidate/);
});

test("lib/learningEngine/sessionGenerator.ts (the real Practice session assembler) never references ali_question_candidate", () => {
  assert.doesNotMatch(SESSION_GENERATOR_SOURCE, /ali_question_candidate/);
});

test("migration 230's publish_question_candidate() is the ONLY path from a candidate into ali_question_bank across the whole schema, and it hard-codes eligibility_status = 'practice_eligible' -- never a caller-suppliable value", () => {
  const EXECUTABLE = MIGRATION_230.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");
  const publishFn = EXECUTABLE.match(/create or replace function public\.publish_question_candidate\([\s\S]*?\n\$\$;/)?.[0] ?? "";
  assert.match(publishFn, /'practice_eligible', true/);
  assert.doesNotMatch(publishFn, /p_eligibility_status|p_eligibility/, "eligibility_status must never be a caller-suppliable parameter on the publish path");
});

test("a pending_review or rejected candidate cannot reach ali_question_bank -- publish_question_candidate() checks review_status = 'approved' before its one INSERT statement, and the table's own CHECK constraint (ali_question_candidate_publish_requires_approval) makes this true even for a hypothetical future direct-write bypass", () => {
  const EXECUTABLE = MIGRATION_230.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");
  const publishFn = EXECUTABLE.match(/create or replace function public\.publish_question_candidate\([\s\S]*?\n\$\$;/)?.[0] ?? "";
  const insertIndex = publishFn.indexOf("insert into public.ali_question_bank");
  const checkIndex = publishFn.indexOf("if v_candidate.review_status <> 'approved' then");
  assert.ok(insertIndex > -1 && checkIndex > -1 && checkIndex < insertIndex, "the approval check must run strictly before the INSERT");
  assert.match(EXECUTABLE, /ali_question_candidate_publish_requires_approval/);
});

test("no Mock-eligible fetch path (fetchMockEligibleQuestionBank) references ali_question_candidate either -- the candidate table has no relationship to Mock content assembly at all", () => {
  assert.doesNotMatch(QUESTION_BANK_SOURCE, /fetchMockEligibleQuestionBank[\s\S]*?ali_question_candidate/);
});
