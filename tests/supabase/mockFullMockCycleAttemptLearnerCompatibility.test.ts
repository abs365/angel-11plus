import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock Form-Assembly Gate (Decision 161). Structural
 * tests against migration 107's own SQL text, matching this project's
 * established migration-testing convention (see
 * tests/supabase/mockCycleGovernanceArchitecture.test.ts, Decision 135's
 * own precedent). Live, end-to-end proof requires the Founder to apply
 * this migration first.
 */

const sql = fs.readFileSync("supabase/migrations/107_mock_full_mock_cycle_attempt_learner_compatibility.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("creates exactly one new function, mock_get_open_cycle -- no other Mock cycle function (mock_start_new_cycle, mock_authorise_extra_cycle, mock_create_cycle_attempt, mock_cycle_is_open) is touched", () => {
  const untouched = ["mock_start_new_cycle", "mock_authorise_extra_cycle", "mock_create_cycle_attempt", "mock_cycle_is_open"];
  for (const fn of untouched) {
    assert.ok(!executable.includes(`function public.${fn}(`), `migration 107 must not touch ${fn}`);
  }
  assert.match(executable, /create or replace function public\.mock_get_open_cycle\(\)/);
});

test("creates or alters no table, column, policy, or trigger -- purely function-level, additive", () => {
  assert.ok(!/create table|alter table|create policy|drop policy|create trigger|create or replace trigger/i.test(executable));
});

test("does not touch mock_get_question, mock_get_attempt_grouping, or any other migration-106 function (separate concern, same Decision)", () => {
  assert.ok(!executable.includes("mock_get_question"));
  assert.ok(!executable.includes("mock_get_attempt_grouping"));
});

test("mock_get_open_cycle is SECURITY DEFINER, derives identity from auth.uid(), and returns null (not an exception) when no profile or no open cycle exists", () => {
  const body = executable.match(/create or replace function public\.mock_get_open_cycle\(\)[\s\S]*?\$\$;/)![0];
  assert.match(body, /security definer/);
  assert.match(body, /auth\.uid\(\)/);
  assert.match(body, /if v_profile_id is null then\s*\n\s*return null;/);
  assert.ok(!/raise exception/.test(body), "mock_get_open_cycle must never raise -- null is the honest 'no open cycle' answer, matching mock_get_active_form's own established discipline");
});

test("mock_get_open_cycle reuses mock_cycle_is_open(uuid) unchanged -- it does not re-implement the open/closed computation", () => {
  const body = executable.match(/create or replace function public\.mock_get_open_cycle\(\)[\s\S]*?\$\$;/)![0];
  assert.match(body, /public\.mock_cycle_is_open\(c\.id\)/);
  // No independent submitted-count/subject computation duplicated here.
  assert.ok(!/v_maths_submitted|v_english_submitted/.test(body));
});

test("mock_get_open_cycle's own query is scoped to the caller's own profile_id and orders by created_at desc, limit 1 -- exactly mock_start_new_cycle/mock_authorise_extra_cycle's own established open-cycle-lookup pattern, not a new one", () => {
  const body = executable.match(/create or replace function public\.mock_get_open_cycle\(\)[\s\S]*?\$\$;/)![0];
  assert.match(body, /where c\.profile_id = v_profile_id/);
  assert.match(body, /order by c\.created_at desc/);
  assert.match(body, /limit 1/);
});

test("mock_get_open_cycle's grants: authenticated only, anon explicitly revoked; mock_cycle_is_open remains ungranted (this migration never grants it)", () => {
  assert.match(executable, /revoke all on function public\.mock_get_open_cycle\(\) from public;/);
  assert.match(executable, /grant execute on function public\.mock_get_open_cycle\(\) to authenticated;/);
  assert.ok(!/grant execute on function public\.mock_cycle_is_open/.test(executable), "mock_cycle_is_open must remain internal, never granted");
});

test("no cadence, cycle-mutation, or open/closed-computation change: no interval literal, no INSERT into ali_mock_cycle, no attempt/form mutation anywhere in this migration's real SQL", () => {
  assert.ok(!/interval/.test(executable));
  assert.ok(!/insert into public\.ali_mock_cycle/.test(executable));
  assert.ok(!/insert into public\.ali_mock_attempt/.test(executable));
  assert.ok(!/insert into public\.ali_mock_form/.test(executable));
});

test("does not touch eligibility_status, ali_question_bank, or ali_family_review", () => {
  assert.ok(!executable.includes("eligibility_status"));
  assert.ok(!executable.includes("ali_question_bank"));
  assert.ok(!executable.includes("ali_family_review"));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not-applied disclosure present in the raw file header, and explicitly names its dependency on migration 085", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migration 085/);
});

test("the migration's own header explicitly discloses the root finding (mock_create_attempt's full_mock guard, migration 085's own prior disclosure) and the form-readiness precondition (ali_mock_form.subject must be non-null) -- not silently assumed", () => {
  assert.match(sql, /full_mock/);
  assert.match(sql, /subject = 'mathematics'/);
});
