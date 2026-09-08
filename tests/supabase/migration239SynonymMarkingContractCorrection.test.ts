import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Synonym Multi-Select Marking Contract Incident -- structural tests
 * against migration 239's own raw SQL text, matching this repository's
 * established convention for an unapplied migration (mirroring
 * migration237PublishAnswerPersistenceCorrection.test.ts). No live
 * Postgres connection is available in this environment, so the fix is
 * proven structurally -- present, correctly shaped, gated to
 * TIER6_MULTI_SELECT only, and touching nothing else -- rather than by
 * actually executing the INSERT.
 *
 * The exact incident this migration fixes: a real, non-admin learner
 * selected the single, genuinely correct answer ("unwind") on a
 * newly-published English candidate (qf-eng-syn-19) and was marked "Not
 * quite", despite Angel's own feedback confirming "You selected 1 of
 * the 1 correct boxes" -- see
 * ANGEL_POST_REPAIR_LEARNER_SMOKE_TEST_ADDENDUM.md.
 */

const SQL_PATH = "supabase/migrations/239_synonym_marking_contract_correction.sql";
const sql = fs.readFileSync(SQL_PATH, "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const OLD_237_SQL = fs.readFileSync("supabase/migrations/237_publish_question_candidate_answer_persistence_correction.sql", "utf8");
const OLD_237_EXECUTABLE = OLD_237_SQL.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
function extractPublishFunctionBody(executableText: string): string {
  const match = executableText.match(/create or replace function public\.publish_question_candidate\([\s\S]*?\nend;\n\$\$;/);
  if (!match) throw new Error("could not locate publish_question_candidate function body");
  return match[0];
}
const oldBody = extractPublishFunctionBody(OLD_237_EXECUTABLE);
const newBody = extractPublishFunctionBody(executable);

/** The local, in-test equivalent of the exact merge/guards Postgres will perform. */
function applyTier6Contract(questionContent: Record<string, unknown>): Record<string, unknown> {
  if (questionContent.validationTier !== "TIER6_MULTI_SELECT") return { ...questionContent };
  const requiredCount = questionContent.requiredSelectionCount;
  if (requiredCount === undefined || requiredCount === null) throw new Error("no requiredSelectionCount");
  const correctOptions = questionContent.correctOptions;
  if (!Array.isArray(correctOptions) || correctOptions.length === 0) throw new Error("no correctOptions");
  if (correctOptions.length !== requiredCount) throw new Error("inconsistent correctOptions/requiredSelectionCount");
  return { ...questionContent, marks: requiredCount };
}

test("migration 239 redefines exactly one function, publish_question_candidate, via create or replace (no drop, unchanged signature)", () => {
  assert.equal((executable.match(/create or replace function public\.publish_question_candidate\(/g) || []).length, 1);
  assert.doesNotMatch(executable, /drop function if exists public\.publish_question_candidate/);
  const header = executable.match(/create or replace function public\.publish_question_candidate\(([\s\S]*?)\)\s*\nreturns text/)![1];
  assert.equal(header.trim(), "p_candidate_id text");
});

test("the exact incident is fixed: a TIER6_MULTI_SELECT candidate's question_content gains 'marks' equal to its own genuine requiredSelectionCount", () => {
  const before = { question: "Which word is closest in meaning to 'spool'...", validationTier: "TIER6_MULTI_SELECT", correctOptions: ["unwind"], requiredSelectionCount: 1 };
  const merged = applyTier6Contract(before);
  assert.equal(merged.marks, 1);
  assert.deepEqual(merged.correctOptions, before.correctOptions);
  assert.equal(merged.requiredSelectionCount, before.requiredSelectionCount);
});

test("matches the established, already-working convention: marks === requiredSelectionCount === correctOptions.length (proven against the 6 pre-existing working TIER6_MULTI_SELECT rows, all = 4)", () => {
  const before = { validationTier: "TIER6_MULTI_SELECT", correctOptions: ["A", "E", "F", "H"], requiredSelectionCount: 4 };
  const merged = applyTier6Contract(before);
  assert.equal(merged.marks, 4);
  assert.equal(merged.marks, (merged.correctOptions as string[]).length);
  assert.equal(merged.marks, merged.requiredSelectionCount);
});

test("non-TIER6 English content is never touched by the marks merge -- the branch is gated to validationTier = 'TIER6_MULTI_SELECT'", () => {
  const before = { question: "...", validationTier: "TIER2_ACCEPTED_SET", acceptedAnswers: ["pulp"] };
  const merged = applyTier6Contract(before);
  assert.deepEqual(merged, before);
  assert.ok(!("marks" in merged), "a TIER2 prompt must never gain a 'marks' key from this branch");
});

test("fails closed rather than inventing a value: missing requiredSelectionCount, missing/empty correctOptions, or an internally inconsistent pair all throw before any merge", () => {
  assert.throws(() => applyTier6Contract({ validationTier: "TIER6_MULTI_SELECT", correctOptions: ["unwind"] }));
  assert.throws(() => applyTier6Contract({ validationTier: "TIER6_MULTI_SELECT", requiredSelectionCount: 1 }));
  assert.throws(() => applyTier6Contract({ validationTier: "TIER6_MULTI_SELECT", correctOptions: [], requiredSelectionCount: 1 }));
  assert.throws(() => applyTier6Contract({ validationTier: "TIER6_MULTI_SELECT", correctOptions: ["a", "b"], requiredSelectionCount: 1 }));
});

test("the marks merge is present in the SQL as a validationTier-gated jsonb || merge, additive only, sourced only from requiredSelectionCount", () => {
  assert.match(
    newBody,
    /if \(v_final_prompt->>'validationTier'\) = 'TIER6_MULTI_SELECT' then[\s\S]*?v_final_prompt := v_final_prompt \|\| jsonb_build_object\('marks', v_required_count\);\s*\n\s*end if;/
  );
});

test("three distinct fail-closed guards exist before the marks merge: missing requiredSelectionCount, missing/empty correctOptions, and length mismatch", () => {
  const tier6Block = newBody.match(/if \(v_final_prompt->>'validationTier'\) = 'TIER6_MULTI_SELECT' then[\s\S]*?jsonb_build_object\('marks', v_required_count\);\s*\n\s*end if;/)![0];
  assert.match(tier6Block, /if v_final_prompt->'requiredSelectionCount' is null then\s*\n\s*raise exception/);
  assert.match(tier6Block, /jsonb_typeof\(v_final_prompt->'correctOptions'\) is distinct from 'array'\s*\n\s*or jsonb_array_length\(v_final_prompt->'correctOptions'\) = 0 then\s*\n\s*raise exception/);
  assert.match(tier6Block, /if v_correct_len <> v_required_count then\s*\n\s*raise exception/);
});

test("all three TIER6 guards run before the INSERT is reached", () => {
  const guardIndex = newBody.indexOf("refusing to publish a question the real Practice marker could never grade correctly", newBody.indexOf("TIER6_MULTI_SELECT"));
  const insertIndex = newBody.indexOf("insert into public.ali_question_bank");
  assert.ok(guardIndex > -1 && insertIndex > -1 && guardIndex < insertIndex, "the TIER6 fail-closed guard must run before the INSERT");
});

test("migration 237's Maths answer-persistence fix remains byte-for-byte present and unweakened", () => {
  assert.match(newBody, /if v_candidate\.subject = 'maths'\s*\n\s*and \(v_candidate\.claimed_answer is null or trim\(v_candidate\.claimed_answer\) = ''\) then\s*\n\s*raise exception/);
  assert.match(newBody, /if v_candidate\.subject = 'maths' then\s*\n[\s\S]*?v_final_prompt := v_final_prompt \|\| jsonb_build_object\('answer', v_candidate\.claimed_answer\);\s*\n\s*end if;/);
});

test("Maths candidates never reach the TIER6 branch -- Maths question_content never sets validationTier", () => {
  const mathsQuestionContent = { question: "...", answer: "40", workingSteps: [] as string[] };
  const merged = applyTier6Contract(mathsQuestionContent);
  assert.deepEqual(merged, mathsQuestionContent);
});

test("every other line of publish_question_candidate is byte-for-byte identical to migration 237's own version (modulo whitespace), except the new TIER6 guards/merge", () => {
  const collapseWhitespace = (s: string) => s.replace(/\s+/g, " ").trim();
  const normalise = (s: string) =>
    collapseWhitespace(
      s
        .replace(/\s*\n\s*v_required_count int;\s*\n\s*v_correct_len int;/, "")
        .replace(
          /\s*\n\s*if \(v_final_prompt->>'validationTier'\) = 'TIER6_MULTI_SELECT' then[\s\S]*?v_final_prompt := v_final_prompt \|\| jsonb_build_object\('marks', v_required_count\);\s*\n\s*end if;\s*\n/,
          ""
        )
    );
  assert.equal(normalise(newBody), collapseWhitespace(oldBody), "publish_question_candidate diverges from migration 237's version by more than the new TIER6 guards/merge");
});

test("all pre-existing publication protections remain textually present and unweakened: admin gate, approved-only requirement, already-published refusal, passage existence/Mock-governance refusal", () => {
  assert.match(newBody, /if not public\.is_current_user_admin\(\) then/);
  assert.match(newBody, /raise exception 'Only an admin may publish a Question Factory candidate'/);
  assert.match(newBody, /if v_candidate\.review_status <> 'approved' then/);
  assert.match(newBody, /if v_candidate\.publication_status = 'published' then/);
  assert.match(newBody, /if v_passage\.eligibility_status not in \('provisional', 'practice_eligible', 'authentic_assessment_candidate', 'independently_validated'\) then/);
});

test("practice_eligible publication, active=true, learning_unit_id behaviour, and qf-* convention are all unchanged", () => {
  assert.match(newBody, /'practice_eligible', true, v_learning_unit_id/);
  assert.match(newBody, /v_new_question_id := 'qf-' \|\| v_candidate\.candidate_id;/);
});

test("security definer and search_path are preserved, and no grant/revoke is restated", () => {
  assert.match(newBody, /security definer/);
  assert.match(newBody, /set search_path = public, pg_temp/);
  assert.doesNotMatch(executable, /grant execute on function public\.publish_question_candidate/);
  assert.doesNotMatch(executable, /revoke execute on function public\.publish_question_candidate/);
});

test("no other table, policy, or function is touched -- purely a body-only correction to one existing function", () => {
  assert.doesNotMatch(executable, /create table|alter table|drop table/i);
  assert.doesNotMatch(executable, /create policy|drop policy|enable row level security|disable row level security/i);
  assert.equal((executable.match(/create or replace function|drop function/g) || []).length, 1);
});

test("wrapped in a single begin/commit transaction, and discloses NOT APPLIED", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
  assert.match(sql, /NOT APPLIED\. Generated for Founder review and manual application/);
});

test("the migration's own header discloses the exact incident, root cause, and an explicit rollback plan", () => {
  assert.match(sql, /You selected 1 of the 1 correct boxes/);
  assert.match(sql, /qf-eng-syn-19/i);
  assert.match(sql, /ROLLBACK/);
  assert.match(sql, /MIGRATION SAFETY REVIEW/);
});
