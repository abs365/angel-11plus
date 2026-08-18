import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Increment 008E — structural tests against migration 072's own
 * SQL text (testable without a live database, matching this project's
 * established migration-testing convention — see
 * tests/supabase/mockAttemptEngine.test.ts, 008D's own precedent). Live,
 * end-to-end proof requires the Founder to apply this migration first.
 */

const sql = fs.readFileSync("supabase/migrations/072_mock_lifecycle_and_reporting_foundation.sql", "utf8");
const executable = sql
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n");

test("does NOT redefine any of migration 070's 5 proven functions -- purely additive", () => {
  for (const fn of ["mock_create_attempt", "mock_start_attempt", "mock_get_question", "mock_submit_answer", "mock_submit_attempt"]) {
    assert.ok(
      !new RegExp(`create or replace function public\\.${fn}\\(`).test(executable),
      `must never redefine ${fn} -- 008D's proven architecture must not be touched`
    );
  }
});

test("does not touch ali_mock_form, ali_mock_attempt, or ali_mock_attempt_answer's own columns or policies", () => {
  assert.ok(!/alter table public\.ali_mock_form\b/.test(executable));
  assert.ok(!/alter table public\.ali_mock_attempt\s+(add|drop|alter)/i.test(executable), "must not add/drop/alter a column on the proven ali_mock_attempt table");
  assert.ok(!/ali_mock_form_select_all|ali_mock_form_admin_write|ali_mock_attempt_select_own|ali_mock_attempt_answer_select_own/.test(executable), "must not touch any existing policy from 070/071");
});

test("touches no content table -- no ali_question_bank, no ali_passage_bank, no eligibility_status", () => {
  assert.ok(!/ali_question_bank|ali_passage_bank/.test(executable));
  assert.ok(!/set\s+eligibility_status/i.test(executable));
});

test("seeds no real content -- no insert into ali_mock_form or ali_question_bank", () => {
  assert.ok(!/insert into public\.ali_mock_form/i.test(executable));
  assert.ok(!/insert into public\.ali_question_bank/i.test(executable));
});

test("RLS is enabled on both new tables", () => {
  for (const table of ["ali_mock_attempt_flag", "ali_mock_attempt_report"]) {
    assert.match(executable, new RegExp(`alter table public\\.${table} enable row level security;`));
  }
});

test("ali_mock_attempt_flag: read-your-own via real attempt ownership, no insert/update/delete policy for anon/authenticated", () => {
  assert.match(executable, /create policy ali_mock_attempt_flag_select_own on public\.ali_mock_attempt_flag for select to authenticated/);
  assert.ok(!/for (insert|update|delete)\s+to\s+(anon|authenticated)[\s\S]{0,200}ali_mock_attempt_flag\b/i.test(executable));
});

test("ali_mock_attempt_report: sealed until released -- the select policy requires report_release_state = 'released' AND real ownership, no insert/update/delete policy for anon/authenticated", () => {
  const policyMatch = executable.match(/create policy ali_mock_attempt_report_select_released[\s\S]*?;/);
  assert.ok(policyMatch, "expected policy not found");
  assert.match(policyMatch![0], /report_release_state = 'released'/);
  assert.match(policyMatch![0], /profile_id in \(select id from public\.profiles where auth_user_id = auth\.uid\(\)\)/);
  assert.ok(!/for (insert|update|delete)\s+to\s+(anon|authenticated)[\s\S]{0,200}ali_mock_attempt_report\b/i.test(executable));
});

test("ali_mock_attempt_report reserves the full 008E result data contract, every data column nullable (no not-null, no default value)", () => {
  const tableMatch = executable.match(/create table if not exists public\.ali_mock_attempt_report \(([\s\S]*?)\);/);
  assert.ok(tableMatch);
  const body = tableMatch![1];
  for (const column of [
    "overall",
    "subject_breakdown",
    "question_outcomes",
    "competency_evidence",
    "strengths",
    "weaknesses",
    "timing_evidence",
    "practice_comparison",
    "parent_explanation",
  ]) {
    const columnLine = body.split(",").find((line) => line.trim().startsWith(column));
    assert.ok(columnLine, `column ${column} not found`);
    assert.ok(!/not null|default/i.test(columnLine!), `${column} must stay nullable with no default -- no data is invented by this migration`);
  }
});

test("ali_mock_attempt_report's three state columns default to the correct not-yet-started values", () => {
  assert.match(executable, /scoring_state text not null default 'not_started' check \(scoring_state in \('not_started', 'scoring', 'scored', 'failed'\)\)/);
  assert.match(executable, /analysis_state text not null default 'not_started' check \(analysis_state in \('not_started', 'analysing', 'complete', 'failed'\)\)/);
  assert.match(executable, /report_release_state text not null default 'pending' check \(report_release_state in \('pending', 'released'\)\)/);
});

test("the report-init trigger fires only on the transition INTO 'submitted', never re-fires on an already-submitted row", () => {
  const fnMatch = executable.match(/create or replace function public\.mock_attempt_report_init\(\)[\s\S]*?\$\$;/);
  assert.ok(fnMatch);
  assert.match(fnMatch![0], /new\.status = 'submitted' and \(old\.status is distinct from 'submitted'\)/);
  assert.match(fnMatch![0], /insert into public\.ali_mock_attempt_report \(attempt_id\)/);
  assert.match(fnMatch![0], /on conflict \(attempt_id\) do nothing/);
  assert.match(executable, /create trigger mock_attempt_report_init_trigger\s+after update on public\.ali_mock_attempt/);
});

test("mock_get_active_form is SECURITY DEFINER and returns only form_id + attempt_type -- never question_manifest", () => {
  const fnMatch = executable.match(/create or replace function public\.mock_get_active_form\([\s\S]*?\$\$;/);
  assert.ok(fnMatch);
  const body = fnMatch![0];
  assert.match(body, /security definer/);
  assert.ok(!/question_manifest/.test(body), "must never select or return question_manifest -- that stays sealed");
  assert.match(body, /select f\.id, f\.attempt_type/);
  assert.match(body, /where f\.active = true/);
});

test("mock_get_attempt_manifest is SECURITY DEFINER, checks real ownership, and returns only the id array -- never any question content", () => {
  const fnMatch = executable.match(/create or replace function public\.mock_get_attempt_manifest\([\s\S]*?\$\$;/);
  assert.ok(fnMatch);
  const body = fnMatch![0];
  assert.match(body, /security definer/);
  assert.match(body, /auth\.uid\(\)/);
  assert.match(body, /profile_id = v_profile_id/);
  assert.match(body, /returns text\[\]/);
  assert.ok(!/ali_question_bank/.test(body), "must never touch ali_question_bank -- IDs only, from the attempt's own frozen column");
});

test("mock_set_flag is SECURITY DEFINER, derives identity from auth.uid(), and enforces the same four guards as mock_submit_answer", () => {
  const fnMatch = executable.match(/create or replace function public\.mock_set_flag\([\s\S]*?\$\$;/);
  assert.ok(fnMatch);
  const body = fnMatch![0];
  assert.match(body, /security definer/);
  assert.match(body, /auth\.uid\(\)/);
  assert.match(body, /profile_id = v_profile_id/);
  assert.match(body, /status <> 'in_progress'/);
  assert.match(body, /now\(\) > v_attempt\.expires_at/);
  assert.match(body, /p_question_id = any\(v_attempt\.assigned_question_ids\)/);
  assert.match(body, /returns void/);
});

test("execute grants for all three new functions are authenticated-only, never anon or public", () => {
  const newFunctions = ["mock_get_active_form", "mock_get_attempt_manifest", "mock_set_flag"];
  const grants = [...executable.matchAll(/grant execute on function public\.(\w+)\([^)]*\) to (\w+);/g)];
  const newFnGrants = grants.filter(([, name]) => newFunctions.includes(name));
  assert.equal(newFnGrants.length, 3);
  for (const [, , role] of newFnGrants) assert.equal(role, "authenticated");
  const revokes = executable.match(/revoke all on function public\.(mock_get_active_form|mock_get_attempt_manifest|mock_set_flag)\([^)]*\) from public;/g) || [];
  assert.equal(revokes.length, 3, "all three new functions must revoke the default public execute grant first");
});

test("no execute grant to anon anywhere in this migration", () => {
  assert.ok(!/to anon;/.test(executable));
});

test("the migration is wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("every CREATE is idempotent (IF NOT EXISTS / OR REPLACE / drop-first), matching this repository's established convention", () => {
  assert.ok(!/create table public\./.test(executable), "every CREATE TABLE must use IF NOT EXISTS");
  assert.match(executable, /drop trigger if exists mock_attempt_report_init_trigger on public\.ali_mock_attempt;/, "the trigger must be dropped first for idempotent re-application");
  assert.match(executable, /drop policy if exists ali_mock_attempt_flag_select_own/);
  assert.match(executable, /drop policy if exists ali_mock_attempt_report_select_released/);
});
