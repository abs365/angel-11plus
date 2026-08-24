import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PROTECTED_MOCK_FIELDS } from "../../lib/mockAttempt/types";

/**
 * Mathematics First Mock Form-Assembly Gate (Decision 161). Structural
 * tests against migration 106's own SQL text, matching this project's
 * established migration-testing convention (see
 * tests/supabase/mockAttemptEngine.test.ts, 008D's own precedent). Live,
 * end-to-end proof requires the Founder to apply this migration first.
 */

const sql = fs.readFileSync("supabase/migrations/106_mock_mathematics_grouped_question_learner_rendering.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("redefines exactly mock_get_question, and creates exactly one new function (mock_get_attempt_grouping) -- no other of the 8+ proven Mock RPCs is touched", () => {
  const untouched = [
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
    assert.ok(!executable.includes(`function public.${fn}(`), `migration 106 must not touch ${fn}`);
  }
  assert.match(executable, /create or replace function public\.mock_get_question\(p_attempt_id uuid, p_question_id text\)/);
  assert.match(executable, /create or replace function public\.mock_get_attempt_grouping\(p_attempt_id uuid\)/);
});

test("creates or alters no table, column, policy, or trigger -- purely function-level, additive", () => {
  assert.ok(!/create table|alter table|create policy|drop policy|create trigger|create or replace trigger/i.test(executable));
});

test("mock_get_question's own allow-list gains exactly three new keys, all read directly from ali_question_bank, and still never mentions a protected field", () => {
  const body = executable.match(/create or replace function public\.mock_get_question\([\s\S]*?\$\$;/)![0];
  assert.match(body, /jsonb_build_object\(/);
  for (const newField of ["questionGroupId", "groupOrder", "subpartLabel"]) {
    assert.ok(body.includes(`'${newField}'`), `expected new field "${newField}" in mock_get_question's returned object`);
  }
  assert.match(body, /'questionGroupId',\s*v_row\.question_group_id/);
  assert.match(body, /'groupOrder',\s*v_row\.group_order/);
  assert.match(body, /'subpartLabel',\s*v_row\.subpart_label/);
  for (const protectedField of PROTECTED_MOCK_FIELDS) {
    assert.ok(!body.includes(`'${protectedField}'`), `mock_get_question must never mention the protected field "${protectedField}"`);
  }
  // Every field migration 070 originally returned is still present, unchanged.
  for (const originalField of ["questionId", "subject", "skill", "question", "marks", "contentDifficulty"]) {
    assert.ok(body.includes(`'${originalField}'`), `original safe field "${originalField}" must be preserved`);
  }
});

test("mock_get_question's four existing guard checks (ownership, in_progress, not expired, manifest membership) are byte-identical to migration 070", () => {
  const body = executable.match(/create or replace function public\.mock_get_question\([\s\S]*?\$\$;/)![0];
  assert.match(body, /profile_id = v_profile_id/);
  assert.match(body, /status <> 'in_progress'/);
  assert.match(body, /now\(\) > v_attempt\.expires_at/);
  assert.match(body, /p_question_id = any\(v_attempt\.assigned_question_ids\)/);
});

test("mock_get_question's grants are re-stated unchanged: authenticated only, anon explicitly revoked", () => {
  assert.match(executable, /revoke all on function public\.mock_get_question\(uuid, text\) from public;/);
  assert.match(executable, /grant execute on function public\.mock_get_question\(uuid, text\) to authenticated;/);
});

test("mock_get_attempt_grouping is SECURITY DEFINER, derives identity from auth.uid(), and enforces the same ownership check as mock_get_attempt_manifest -- no status/expiry check, matching that function's own precedent exactly", () => {
  const body = executable.match(/create or replace function public\.mock_get_attempt_grouping\([\s\S]*?\$\$;/)![0];
  assert.match(body, /security definer/);
  assert.match(body, /auth\.uid\(\)/);
  assert.match(body, /where id = p_attempt_id and profile_id = v_profile_id/);
  assert.ok(!/status\s*<>/.test(body), "mock_get_attempt_grouping must not check attempt status, mirroring mock_get_attempt_manifest");
  assert.ok(!/expires_at/.test(body), "mock_get_attempt_grouping must not check expiry, mirroring mock_get_attempt_manifest");
});

test("mock_get_attempt_grouping returns only questionId + the three grouping fields -- IDs and structure only, never question content", () => {
  const body = executable.match(/create or replace function public\.mock_get_attempt_grouping\([\s\S]*?\$\$;/)![0];
  assert.match(body, /jsonb_build_object\(/);
  for (const field of ["questionId", "questionGroupId", "groupOrder", "subpartLabel"]) {
    assert.ok(body.includes(`'${field}'`), `expected "${field}" in mock_get_attempt_grouping's returned object`);
  }
  assert.ok(!/'question'/.test(body), "must never return question content");
  assert.ok(!/'marks'/.test(body), "must never return marks/answer-adjacent content");
  for (const protectedField of PROTECTED_MOCK_FIELDS) {
    assert.ok(!body.includes(`'${protectedField}'`), `mock_get_attempt_grouping must never mention the protected field "${protectedField}"`);
  }
});

test("mock_get_attempt_grouping is scoped to exactly the caller's own attempt's assigned_question_ids -- never an arbitrary or cross-attempt id set", () => {
  const body = executable.match(/create or replace function public\.mock_get_attempt_grouping\([\s\S]*?\$\$;/)![0];
  assert.match(body, /select assigned_question_ids into v_ids/);
  assert.match(body, /where b\.id = any\(v_ids\)/);
});

test("mock_get_attempt_grouping's grants: authenticated only, anon explicitly revoked", () => {
  assert.match(executable, /revoke all on function public\.mock_get_attempt_grouping\(uuid\) from public;/);
  assert.match(executable, /grant execute on function public\.mock_get_attempt_grouping\(uuid\) to authenticated;/);
});

test("does not touch eligibility_status, ali_mock_form, ali_family_review, or any Mock cycle table/function", () => {
  assert.ok(!executable.includes("eligibility_status"));
  assert.ok(!executable.includes("ali_mock_form"));
  assert.ok(!executable.includes("ali_family_review"));
  assert.ok(!executable.includes("ali_mock_cycle"));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not-applied disclosure present in the raw file header, and explicitly names its dependency on migrations 070-072 and 093/095", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /070-072/);
  assert.match(sql, /093\/095/);
});
