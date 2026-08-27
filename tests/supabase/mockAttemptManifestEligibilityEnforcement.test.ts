import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock — Attempt-Creation Eligibility Enforcement
 * (Decision 210 Part 3/7, Decision 212). Structural tests against
 * migration 145's own SQL text.
 */

const sql = fs.readFileSync("supabase/migrations/145_mock_attempt_manifest_eligibility_enforcement.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("mock_validate_manifest_eligibility is created, never granted to anon/authenticated", () => {
  assert.match(executable, /create or replace function public\.mock_validate_manifest_eligibility\(p_question_ids text\[\]\)/);
  assert.match(executable, /revoke all on function public\.mock_validate_manifest_eligibility\(text\[\]\) from public;/);
  assert.ok(!/grant execute on function public\.mock_validate_manifest_eligibility/.test(executable), "must never be granted directly -- internal helper only");
});

test("helper rejects an empty/null manifest", () => {
  const fn = executable.match(/create or replace function public\.mock_validate_manifest_eligibility[\s\S]*?^\$\$;/m)![0];
  assert.match(fn, /array_length\(p_question_ids, 1\) is null/);
  assert.match(fn, /raise exception 'Manifest contains no questions/);
});

test("helper rejects a manifest containing a duplicate question id", () => {
  const fn = executable.match(/create or replace function public\.mock_validate_manifest_eligibility[\s\S]*?^\$\$;/m)![0];
  assert.match(fn, /array_length\(p_question_ids, 1\) - count\(distinct x\)/);
  assert.match(fn, /raise exception 'Manifest contains % duplicate question id/);
});

test("helper rejects any question id that is not mock_eligible AND active -- via not exists, so unknown ids are rejected too", () => {
  const fn = executable.match(/create or replace function public\.mock_validate_manifest_eligibility[\s\S]*?^\$\$;/m)![0];
  assert.match(fn, /not exists \(\s*\n\s*select 1 from public\.ali_question_bank q\s*\n\s*where q\.id = qid and q\.eligibility_status = 'mock_eligible' and q\.active = true\s*\n\s*\)/);
  assert.match(fn, /raise exception 'Manifest contains % question id\(s\) that are not mock_eligible and active/);
});

test("helper rejects a partially-selected grouped family, generic over question_group_id (never a hardcoded family name)", () => {
  const fn = executable.match(/create or replace function public\.mock_validate_manifest_eligibility[\s\S]*?^\$\$;/m)![0];
  assert.match(fn, /g\.included <> g\.total/);
  assert.match(fn, /raise exception 'Manifest includes % partially-selected grouped-question famil/);
  assert.ok(!/'mock-mr\d+-\w+'/.test(fn), "the group-completeness check must never reference a specific family id literal");
});

test("mock_create_attempt calls the new helper (perform) after fetching the manifest and before inserting the attempt", () => {
  const fnBlock = executable.match(/create or replace function public\.mock_create_attempt\(p_form_id text, p_attempt_type text\)[\s\S]*?^\$\$;/m)![0];
  const manifestFetchIndex = fnBlock.indexOf("select array(select jsonb_array_elements");
  const performIndex = fnBlock.indexOf("perform public.mock_validate_manifest_eligibility(v_question_ids);");
  const insertIndex = fnBlock.indexOf("insert into public.ali_mock_attempt");
  assert.ok(manifestFetchIndex >= 0 && performIndex >= 0 && insertIndex >= 0);
  assert.ok(manifestFetchIndex < performIndex && performIndex < insertIndex, "helper must be called after the manifest is fetched and before the attempt is inserted");
});

test("mock_create_cycle_attempt calls the new helper (perform) after fetching the manifest and before inserting the attempt", () => {
  const fnBlock = executable.match(/create or replace function public\.mock_create_cycle_attempt\(p_form_id text, p_cycle_id uuid\)[\s\S]*?^\$\$;/m)![0];
  const manifestFetchIndex = fnBlock.indexOf("select array(select jsonb_array_elements");
  const performIndex = fnBlock.indexOf("perform public.mock_validate_manifest_eligibility(v_question_ids);");
  const insertIndex = fnBlock.indexOf("insert into public.ali_mock_attempt");
  assert.ok(manifestFetchIndex >= 0 && performIndex >= 0 && insertIndex >= 0);
  assert.ok(manifestFetchIndex < performIndex && performIndex < insertIndex, "helper must be called after the manifest is fetched and before the attempt is inserted");
});

test("mock_create_attempt still refuses full_mock attempt_type before ever reaching the new helper (migration 085's own guard preserved unchanged)", () => {
  const fnBlock = executable.match(/create or replace function public\.mock_create_attempt\(p_form_id text, p_attempt_type text\)[\s\S]*?^\$\$;/m)![0];
  const fullMockGuardIndex = fnBlock.indexOf("if p_attempt_type = 'full_mock' then");
  const performIndex = fnBlock.indexOf("perform public.mock_validate_manifest_eligibility");
  assert.ok(fullMockGuardIndex >= 0 && fullMockGuardIndex < performIndex);
});

test("mock_create_cycle_attempt still enforces cycle ownership, cycle-open, subject-pure-form, and one-attempt-per-subject checks before the new helper (migration 085's own guards preserved unchanged)", () => {
  const fnBlock = executable.match(/create or replace function public\.mock_create_cycle_attempt\(p_form_id text, p_cycle_id uuid\)[\s\S]*?^\$\$;/m)![0];
  const performIndex = fnBlock.indexOf("perform public.mock_validate_manifest_eligibility");
  for (const guard of [
    "Cycle % not found for caller",
    "already complete",
    "is not a subject-pure Mathematics/English paper",
    "already has a % attempt",
  ]) {
    const idx = fnBlock.indexOf(guard);
    assert.ok(idx >= 0 && idx < performIndex, `expected guard "${guard}" to appear before the new helper call`);
  }
});

test("both amended functions keep their exact existing signature and grants (authenticated only, never anon)", () => {
  assert.match(executable, /revoke all on function public\.mock_create_attempt\(text, text\) from public;/);
  assert.match(executable, /grant execute on function public\.mock_create_attempt\(text, text\) to authenticated;/);
  assert.match(executable, /revoke all on function public\.mock_create_cycle_attempt\(text, uuid\) from public;/);
  assert.match(executable, /grant execute on function public\.mock_create_cycle_attempt\(text, uuid\) to authenticated;/);
  assert.ok(!/grant execute on function public\.mock_create_attempt\(text, text\) to anon/.test(executable));
  assert.ok(!/grant execute on function public\.mock_create_cycle_attempt\(text, uuid\) to anon/.test(executable));
});

test("no ali_mock_form row is inserted, updated, or deleted by this migration", () => {
  assert.ok(!/insert into public\.ali_mock_form/i.test(executable));
  assert.ok(!/update public\.ali_mock_form/i.test(executable));
  assert.ok(!/delete from public\.ali_mock_form/i.test(executable));
});

test("no ali_question_bank content or eligibility_status is ever written by this migration", () => {
  assert.ok(!/update public\.ali_question_bank/i.test(executable));
  assert.ok(!/insert into public\.ali_question_bank/i.test(executable));
});

test("no RLS policy is created or altered by this migration", () => {
  assert.ok(!/create policy|alter policy|drop policy/i.test(executable));
});

test("mock_get_question and mock_submit_answer are never modified by this migration (unchanged, no CREATE OR REPLACE for either)", () => {
  assert.ok(!/create or replace function public\.mock_get_question/i.test(executable));
  assert.ok(!/create or replace function public\.mock_submit_answer/i.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
});

test("header explicitly investigates and answers the governing directive's own YES/NO question", () => {
  assert.match(sql, /YES, a learner attempt could currently be created using question ids/);
});

test("every RAISE with a % placeholder supplies exactly one matching argument", () => {
  const raiseStatements = [...executable.matchAll(/raise exception\s+'([^']*(?:''[^']*)*)'((?:\s*,\s*(?:v_\w+|p_form_id|v_form\.subject))*)\s*;/g)];
  assert.ok(raiseStatements.length > 0);
  for (const [, message, args] of raiseStatements) {
    const placeholders = (message.match(/%/g) || []).length;
    const argCount = args ? (args.match(/(?:v_\w+|p_form_id|v_form\.subject)/g) || []).length : 0;
    assert.equal(placeholders, argCount, `RAISE message "${message}" has ${placeholders} placeholders but ${argCount} arguments`);
  }
});
