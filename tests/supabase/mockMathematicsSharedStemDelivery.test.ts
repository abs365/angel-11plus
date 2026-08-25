import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Shared-Scenario Presentation Correction — mock_get_question() Delivery
 * of prompt.sharedStem (Decision 180). Structural tests against
 * migration 122's own SQL text, mirroring migration 115's own
 * established test convention exactly.
 */

const sql = fs.readFileSync("supabase/migrations/122_mock_mathematics_shared_stem_delivery.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("redefines exactly mock_get_question -- no other Mock RPC is touched", () => {
  const untouched = [
    "mock_get_attempt_grouping", "mock_create_attempt", "mock_start_attempt", "mock_submit_answer",
    "mock_submit_attempt", "mock_get_attempt_manifest", "mock_set_flag", "mock_get_active_form",
    "mock_score_attempt", "mock_attempt_report_init", "mock_release_report", "mock_start_new_cycle",
    "mock_authorise_extra_cycle", "mock_create_cycle_attempt", "mock_cycle_is_open",
  ];
  for (const fn of untouched) {
    assert.ok(!executable.includes(`function public.${fn}(`), `migration 122 must not touch ${fn}`);
  }
  assert.match(executable, /create or replace function public\.mock_get_question\(p_attempt_id uuid, p_question_id text\)/);
});

test("the jsonb_build_object() allow-list gains exactly one new key, 'sharedStem', appended after 'stimulus' -- every prior key is byte-present in order", () => {
  const objectBlock = executable.match(/return jsonb_build_object\(([\s\S]*?)\);/)![1];
  const keys = [...objectBlock.matchAll(/^\s*'(\w+)',/gm)].map((m) => m[1]);
  assert.deepEqual(keys, [
    "questionId", "subject", "skill", "question", "marks", "contentDifficulty",
    "questionGroupId", "groupOrder", "subpartLabel", "stimulus", "sharedStem",
  ]);
  assert.match(objectBlock, /'sharedStem', v_row\.prompt->'sharedStem'\s*$/m);
});

test("ownership/status/expiry/manifest-membership checks are present and unchanged", () => {
  assert.match(executable, /where id = p_attempt_id and profile_id = v_profile_id/);
  assert.match(executable, /v_attempt\.status <> 'in_progress'/);
  assert.match(executable, /v_attempt\.expires_at is not null and now\(\) > v_attempt\.expires_at/);
  assert.match(executable, /not \(p_question_id = any\(v_attempt\.assigned_question_ids\)\)/);
});

test("no other table, column, index, or constraint is created or altered", () => {
  assert.ok(!/\bcreate table\b/i.test(executable));
  assert.ok(!/\balter table\b/i.test(executable));
  assert.ok(!/\bcreate index\b/i.test(executable));
  assert.ok(!/\bcreate policy\b|\balter policy\b/i.test(executable));
});

test("no PROTECTED_MOCK_FIELDS name is ever added to the allow-list", () => {
  const objectBlock = executable.match(/return jsonb_build_object\(([\s\S]*?)\);/)![1];
  for (const protectedKey of ["answer", "acceptedAnswers", "workingSteps", "explanation", "modelAnswer", "addressesMisconception", "reviewMetadata", "provenance"]) {
    assert.ok(!objectBlock.includes(`'${protectedKey}'`), `protected field "${protectedKey}" must never be added`);
  }
});

test("anon EXECUTE audit: revoke all from public appears before grant to authenticated, and 'anon' is never a grantee", () => {
  const revokeIndex = executable.indexOf("revoke all on function public.mock_get_question");
  const grantIndex = executable.indexOf("grant execute on function public.mock_get_question");
  assert.ok(revokeIndex >= 0);
  assert.ok(grantIndex >= 0);
  assert.ok(revokeIndex < grantIndex);
  assert.match(executable, /grant execute on function public\.mock_get_question\(uuid, text\) to authenticated;/);
  assert.ok(!/grant\s+execute\s+on\s+function[\s\S]*?to\s+anon\b/i.test(executable));
});

test("revoke targets public, not a narrower role", () => {
  assert.match(executable, /revoke all on function public\.mock_get_question\(uuid, text\) from public;/);
});

test("Practice and eligibility isolation: no practice_eligible or eligibility_status reference anywhere", () => {
  assert.ok(!executable.includes("practice_eligible"));
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

test("not applied disclosure present, documents its dependency on migrations 115 and 121", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migration 115/);
  assert.match(sql, /migration 121/);
});
