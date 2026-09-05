import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Question Factory Wave 2, Section 1 (Migration Safety Gate) — Telemetry
 * Write-Path Restoration, CORRECTED. Structural/logic assertions against
 * migration 229's own SQL text, matching this repository's own
 * established convention for a NOT APPLIED migration.
 *
 * Wave 1's original design (a raw column-scoped GRANT UPDATE + an RLS
 * policy gating only which ROWS could be touched, never what VALUE was
 * written) was rejected by the Wave 2 safety gate: it would have let any
 * authenticated client bypass recordOutcome()'s own increment logic
 * entirely via a direct PostgREST call and write an arbitrary
 * usage_count/avg_success_rate value. This file tests the corrected
 * design: a single, narrow, SECURITY DEFINER RPC, no raw table grant at
 * all -- the same pattern this schema already uses for every other
 * learner-callable write (mock_submit_answer, migration 070).
 */

const MIGRATION = readFileSync("supabase/migrations/229_question_bank_telemetry_write_path_restoration.sql", "utf8");

const EXECUTABLE = MIGRATION.split("\n")
  .filter((l) => !l.trimStart().startsWith("--"))
  .join("\n");

function extractFunctionBody(source: string, name: string): string {
  const match = source.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`));
  if (!match) throw new Error(`function ${name} not found`);
  return match[0];
}

test("wrapped in a single begin/commit transaction", () => {
  assert.match(EXECUTABLE, /^\s*begin;/m);
  assert.match(EXECUTABLE, /commit;\s*$/m);
});

test("not-applied disclosure present in the raw file header", () => {
  assert.match(MIGRATION, /NOT APPLIED\. Generated for Founder review/);
});

test("correction history is disclosed in the raw file header, per this repository's established unapplied-migration correction convention", () => {
  assert.match(MIGRATION, /CORRECTION HISTORY/);
  assert.match(MIGRATION, /arbitrary outcome write/i);
});

test("NO raw GRANT UPDATE and NO new RLS policy on ali_question_bank -- the corrected design touches only a new function", () => {
  assert.doesNotMatch(EXECUTABLE, /grant update/i);
  assert.doesNotMatch(EXECUTABLE, /create policy/i);
  assert.doesNotMatch(EXECUTABLE, /alter table public\.ali_question_bank/i);
});

test("creates exactly one new function, record_question_bank_telemetry, security definer with a safe search_path", () => {
  const fn = extractFunctionBody(EXECUTABLE, "record_question_bank_telemetry");
  assert.match(fn, /security definer/);
  assert.match(fn, /set search_path = public, pg_temp/);
});

test("the function signature takes only a question id and a boolean -- no numeric parameter can ever reach usage_count/avg_success_rate directly", () => {
  assert.match(EXECUTABLE, /create or replace function public\.record_question_bank_telemetry\(p_question_id text, p_is_correct boolean\)/);
  assert.match(EXECUTABLE, /grant execute on function public\.record_question_bank_telemetry\(text, boolean\) to authenticated;/);
});

test("resolves the caller's own profile from auth.uid() -- never trusts a caller-supplied profile/user id", () => {
  const fn = extractFunctionBody(EXECUTABLE, "record_question_bank_telemetry");
  assert.match(fn, /select id into v_profile_id from public\.profiles where auth_user_id = auth\.uid\(\);/);
  assert.match(fn, /if v_profile_id is null then\s*\n\s*raise exception/);
});

test("fails closed (RAISE EXCEPTION) when no matching profile is found, never silently proceeding", () => {
  const fn = extractFunctionBody(EXECUTABLE, "record_question_bank_telemetry");
  assert.match(fn, /raise exception 'No profile found for the calling user';/);
});

test("requires a genuine pre-existing history row for (caller, question) before touching ali_question_bank -- the legitimacy/anti-arbitrary-write check", () => {
  const fn = extractFunctionBody(EXECUTABLE, "record_question_bank_telemetry");
  assert.match(fn, /if not exists \(\s*\n\s*select 1 from public\.ali_student_question_history\s*\n\s*where profile_id = v_profile_id and question_id = p_question_id\s*\n\s*\) then/);
  assert.match(fn, /raise exception 'No history row exists for caller and question/);
});

test("the update is a single atomic statement -- usage_count and avg_success_rate are both computed from the SAME pre-update row snapshot in one SET clause, never two separate statements", () => {
  const fn = extractFunctionBody(EXECUTABLE, "record_question_bank_telemetry");
  const updateBlock = fn.match(/update public\.ali_question_bank[\s\S]*?;/)?.[0] ?? "";
  assert.ok(updateBlock.length > 0, "expected exactly one UPDATE statement");
  assert.equal((fn.match(/update public\.ali_question_bank/g) ?? []).length, 1, "must be exactly one UPDATE statement, not two round trips");
  assert.match(updateBlock, /usage_count = usage_count \+ 1/);
  assert.match(updateBlock, /avg_success_rate = round\(/);
});

test("fails closed (RAISE EXCEPTION) when the update matches zero rows -- a non-existent, inactive, or (for a non-admin caller) sealed question id is never a silent no-op", () => {
  const fn = extractFunctionBody(EXECUTABLE, "record_question_bank_telemetry");
  assert.match(fn, /if not found then\s*\n\s*raise exception 'No practice_eligible question % found/);
});

test("the increment is always exactly +1 -- no caller-suppliable count/delta parameter exists anywhere in the function", () => {
  const fn = extractFunctionBody(EXECUTABLE, "record_question_bank_telemetry");
  assert.doesNotMatch(fn, /p_usage_count|p_count|p_delta|p_avg/);
});

test("the eligibility_status predicate mirrors the table's own existing SELECT-policy gate -- telemetry can never be recorded against sealed/mock_eligible content", () => {
  const fn = extractFunctionBody(EXECUTABLE, "record_question_bank_telemetry");
  assert.match(fn, /eligibility_status is distinct from 'mock_eligible' or public\.is_current_user_admin\(\)/);
});

test("does not reference or touch any Mock scoring/release/manual-marking function or the family model migration", () => {
  assert.doesNotMatch(EXECUTABLE, /mock_release_report|mock_apply_manual_mark|mock_analyse_attempt|mock_score_attempt|mock_persist_reading_scoring|ali_question_family/);
});

test("no other table is touched by this migration besides ali_question_bank (read/write) and ali_student_question_history (read-only legitimacy check)", () => {
  const fn = extractFunctionBody(EXECUTABLE, "record_question_bank_telemetry");
  const fromReferences = [...fn.matchAll(/from public\.(\w+)/g)].map((m) => m[1]);
  const updateReferences = [...fn.matchAll(/update public\.(\w+)/g)].map((m) => m[1]);
  for (const t of fromReferences) assert.ok(["profiles", "ali_student_question_history"].includes(t), `unexpected table read: ${t}`);
  for (const t of updateReferences) assert.equal(t, "ali_question_bank");
});
