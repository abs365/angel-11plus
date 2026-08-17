import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Increment 008D, Post-Migration Security Hardening
 * Reconciliation — the Founder's own authenticated catalogue evidence
 * proved TWO findings (anon execute on the 5 RPCs; unconditional anon/
 * authenticated SELECT on ali_mock_form's own sealed question_manifest).
 * Migration 071 (revised in place, never applied) fixes both. These
 * tests cover all 14 items the directive's own Part 6 requires,
 * structurally where the fact is provable from the SQL text alone.
 */

const sql = fs.readFileSync("supabase/migrations/071_mock_attempt_functions_revoke_anon.sql", "utf8");
const executable = sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");

// 1-5. anon cannot invoke any of the 5 functions.
test("1-5. revokes execute from anon on all 5 mock attempt functions, exact signatures matching migration 070", () => {
  const expected = [
    "mock_create_attempt(text, text)",
    "mock_start_attempt(uuid, integer)",
    "mock_get_question(uuid, text)",
    "mock_submit_answer(uuid, text, jsonb)",
    "mock_submit_attempt(uuid)",
  ];
  for (const fn of expected) {
    assert.match(executable, new RegExp(`revoke execute on function public\\.${fn.replace(/[()]/g, "\\$&")} from anon;`));
  }
});

// 6-7. anon and ordinary authenticated cannot enumerate ali_mock_form.
test("6-7. drops ali_mock_form_select_all entirely -- no SELECT policy remains for anon or ordinary authenticated", () => {
  assert.match(executable, /drop policy if exists ali_mock_form_select_all on public\.ali_mock_form;/);
  // No new "for select to anon" or "for select to authenticated" policy is created on ali_mock_form anywhere in this migration.
  assert.ok(!/create policy[\s\S]*?ali_mock_form[\s\S]*?for select/i.test(executable), "no replacement SELECT policy may be added for ordinary roles");
});

// 8. authenticated learner can still use authorised Mock RPCs.
test("8. does NOT revoke execute from authenticated on any of the 5 functions", () => {
  assert.ok(!/revoke execute on function[\s\S]*?from authenticated;/i.test(executable), "authenticated must retain execute -- each function's own ownership checks are the enforcement point");
});

// 9. admin can still manage/review forms.
test("9. does not touch ali_mock_form_admin_write -- admin access to forms is preserved unchanged", () => {
  assert.ok(!/ali_mock_form_admin_write/.test(executable), "the admin-write policy must not be dropped or recreated by this migration -- it is left entirely alone");
});

// 10-11. learner-owned attempt/answer SELECT policies untouched.
test("10-11. does not touch ali_mock_attempt or ali_mock_attempt_answer's own ownership policies", () => {
  assert.ok(!/ali_mock_attempt_select_own/.test(executable));
  assert.ok(!/ali_mock_attempt_answer_select_own/.test(executable));
});

// 12. another learner's attempt remains inaccessible -- unaffected, since
// mock_get_question/mock_submit_answer's own ownership checks (migration
// 070, unmodified) are the enforcement point, not touched here.
test("12. function bodies (ownership/state checks) are not modified -- only execute grants are revoked", () => {
  assert.ok(!/create or replace function/i.test(executable), "this migration must never redefine a function body, only its grants and one policy");
});

test("touches no table structure, no eligibility_status, no ali_question_bank or ali_passage_bank", () => {
  assert.ok(!/create table|alter table|drop table/i.test(executable));
  assert.ok(!/set\s+eligibility_status/i.test(executable));
  assert.ok(!/ali_question_bank|ali_passage_bank/.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});
