import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Structured Assessment Stimulus — mock_get_question() Delivery
 * (Decision 170). Structural tests against migration 115's own SQL
 * text, matching this project's established migration-testing
 * convention (see tests/supabase/mockMathematicsGroupedQuestionLearner
 * Rendering.test.ts, migration 106's own precedent). Live, end-to-end
 * proof requires the Founder to apply this migration first.
 */

const sql = fs.readFileSync("supabase/migrations/115_mock_mathematics_structured_stimulus.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("redefines exactly mock_get_question -- no other of the proven Mock RPCs is touched, including mock_get_attempt_grouping (content stays out of the grouping-identity-only function by design)", () => {
  const untouched = [
    "mock_get_attempt_grouping",
    "mock_create_attempt",
    "mock_start_attempt",
    "mock_submit_answer",
    "mock_submit_attempt",
    "mock_get_attempt_manifest",
    "mock_set_flag",
    "mock_get_active_form",
    "mock_score_attempt",
    "mock_attempt_report_init",
    "mock_release_report",
    "mock_start_new_cycle",
    "mock_authorise_extra_cycle",
    "mock_create_cycle_attempt",
    "mock_cycle_is_open",
  ];
  for (const fn of untouched) {
    assert.ok(!executable.includes(`function public.${fn}(`), `migration 115 must not touch ${fn}`);
  }
  assert.match(executable, /create or replace function public\.mock_get_question\(p_attempt_id uuid, p_question_id text\)/);
});

test("the jsonb_build_object() allow-list gains exactly one new key, 'stimulus', read from prompt->'stimulus' -- every prior key is byte-present", () => {
  const objectBlock = executable.match(/return jsonb_build_object\(([\s\S]*?)\);/)![1];
  const keys = [...objectBlock.matchAll(/^\s*'(\w+)',/gm)].map((m) => m[1]);
  assert.deepEqual(keys, [
    "questionId", "subject", "skill", "question", "marks", "contentDifficulty",
    "questionGroupId", "groupOrder", "subpartLabel", "stimulus",
  ]);
  assert.match(objectBlock, /'stimulus', v_row\.prompt->'stimulus'/);
});

test("ownership/status/expiry/manifest-membership checks are present and unchanged in wording from migration 106's own body", () => {
  assert.match(executable, /where id = p_attempt_id and profile_id = v_profile_id/);
  assert.match(executable, /v_attempt\.status <> 'in_progress'/);
  assert.match(executable, /v_attempt\.expires_at is not null and now\(\) > v_attempt\.expires_at/);
  assert.match(executable, /not \(p_question_id = any\(v_attempt\.assigned_question_ids\)\)/);
});

test("no other table, column, index, or constraint is created or altered -- this is a pure function redefinition", () => {
  assert.ok(!/\bcreate table\b/i.test(executable));
  assert.ok(!/\balter table\b/i.test(executable));
  assert.ok(!/\bcreate index\b/i.test(executable));
  assert.ok(!/\bcreate policy\b|\balter policy\b/i.test(executable));
});

test("no PROTECTED_MOCK_FIELDS name is ever added to the allow-list -- answer/workingSteps/explanation/modelAnswer/addressesMisconception/reviewMetadata/provenance never appear as jsonb_build_object keys", () => {
  const objectBlock = executable.match(/return jsonb_build_object\(([\s\S]*?)\);/)![1];
  for (const protectedKey of ["answer", "acceptedAnswers", "workingSteps", "explanation", "modelAnswer", "addressesMisconception", "reviewMetadata", "provenance"]) {
    assert.ok(!objectBlock.includes(`'${protectedKey}'`), `protected field "${protectedKey}" must never be added to mock_get_question()'s own allow-list`);
  }
});

test("anon EXECUTE audit: revoke all from public appears before grant to authenticated, and 'anon' is never named as a grantee anywhere in this file", () => {
  const revokeIndex = executable.indexOf("revoke all on function public.mock_get_question");
  const grantIndex = executable.indexOf("grant execute on function public.mock_get_question");
  assert.ok(revokeIndex >= 0, "expected an explicit revoke");
  assert.ok(grantIndex >= 0, "expected an explicit grant");
  assert.ok(revokeIndex < grantIndex, "revoke must precede grant");
  assert.match(executable, /grant execute on function public\.mock_get_question\(uuid, text\) to authenticated;/);
  assert.ok(!/grant\s+execute\s+on\s+function[\s\S]*?to\s+anon\b/i.test(executable), "anon must never be granted EXECUTE");
});

test("revoke targets public, not merely a narrower role -- the Founder's own instruction not to assume a bare revoke is sufficient is satisfied by 'revoke all ... from public'", () => {
  assert.match(executable, /revoke all on function public\.mock_get_question\(uuid, text\) from public;/);
});

test("Practice isolation: this migration never mentions practice_eligible or any Practice-only table/function", () => {
  assert.ok(!executable.includes("practice_eligible"));
  assert.ok(!executable.includes("learningEngine"));
});

test("Mock eligibility isolation: this migration never reads or writes eligibility_status", () => {
  assert.ok(!executable.includes("eligibility_status"));
});

test("does not create or touch ali_mock_form, ali_family_review, or ali_student_question_history", () => {
  for (const table of ["ali_mock_form", "ali_family_review", "ali_student_question_history"]) {
    assert.ok(!executable.includes(table));
  }
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present, and explicitly documents its dependency on migration 106 and its own required pairing with migrations 113/114", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migration 106/);
  assert.match(sql, /113\/114/);
});
