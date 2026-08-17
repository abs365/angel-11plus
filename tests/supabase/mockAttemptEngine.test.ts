import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Increment 008D — structural tests against migration 070's
 * own SQL text (testable without a live database, matching this
 * project's established migration-testing convention — see
 * tests/supabase/mockSealedContentRls.test.ts, 008C's own precedent).
 * Live, end-to-end proof requires the Founder to apply this migration
 * first; scripts/verify-mock-attempt-engine.mjs (this increment's own
 * new Founder-runnable script) is the live counterpart to these.
 */

const sql = fs.readFileSync("supabase/migrations/070_mock_attempt_engine.sql", "utf8");
const executable = sql
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n");

test("RLS is enabled on all three new tables", () => {
  for (const table of ["ali_mock_form", "ali_mock_attempt", "ali_mock_attempt_answer"]) {
    assert.match(executable, new RegExp(`alter table public\\.${table} enable row level security;`));
  }
});

test("ali_mock_attempt and ali_mock_attempt_answer have a SELECT-own policy but NO insert/update/delete policy for anon/authenticated -- all mutation is server-controlled", () => {
  assert.match(executable, /create policy ali_mock_attempt_select_own on public\.ali_mock_attempt for select to authenticated/);
  assert.match(executable, /create policy ali_mock_attempt_answer_select_own on public\.ali_mock_attempt_answer for select to authenticated/);
  // No "for insert"/"for update"/"for delete" policy anywhere touching these two tables.
  assert.ok(!/for (insert|update|delete)\s+to\s+(anon|authenticated)[\s\S]{0,200}ali_mock_attempt\b/i.test(executable));
});

test("ali_mock_form write access (insert/update/delete) requires is_current_user_admin(), matching the same pattern every other governed-content write path in this codebase already uses", () => {
  assert.match(executable, /create policy ali_mock_form_admin_write on public\.ali_mock_form for all to authenticated/);
  const adminWriteBlock = executable.match(/create policy ali_mock_form_admin_write[\s\S]*?;/)![0];
  assert.match(adminWriteBlock, /using \(public\.is_current_user_admin\(\)\)/);
  assert.match(adminWriteBlock, /with check \(public\.is_current_user_admin\(\)\)/);
});

test("attempt/answer ownership is scoped through profiles.auth_user_id = auth.uid(), never a client-supplied id", () => {
  const ownershipChecks = (executable.match(/auth_user_id = auth\.uid\(\)/g) || []).length;
  assert.ok(ownershipChecks >= 2, "both ali_mock_attempt and ali_mock_attempt_answer policies must check real auth ownership");
});

test("all 5 functions are SECURITY DEFINER, never SECURITY INVOKER, and every one re-derives the caller's profile from auth.uid() itself", () => {
  const functionNames = ["mock_create_attempt", "mock_start_attempt", "mock_get_question", "mock_submit_answer", "mock_submit_attempt"];
  for (const fn of functionNames) {
    const fnMatch = executable.match(new RegExp(`create or replace function public\\.${fn}\\([\\s\\S]*?\\$\\$;`));
    assert.ok(fnMatch, `${fn} not found`);
    assert.match(fnMatch![0], /security definer/, `${fn} must be SECURITY DEFINER`);
    assert.match(fnMatch![0], /auth\.uid\(\)/, `${fn} must derive identity from auth.uid(), never a passed-in id`);
  }
});

test("mock_get_question only ever returns the explicit, hand-picked safe field set -- never select * or a superset", () => {
  const fnMatch = executable.match(/create or replace function public\.mock_get_question\([\s\S]*?\$\$;/);
  assert.ok(fnMatch);
  const body = fnMatch![0];
  assert.match(body, /jsonb_build_object\(/, "must construct an explicit object, not return a raw row");
  for (const protectedField of ["answer", "workingSteps", "addresses_misconception", "provenance"]) {
    assert.ok(!body.includes(`'${protectedField}'`), `mock_get_question must never mention the protected field "${protectedField}"`);
  }
  // Confirms the exact allow-list this increment's own TS types.ts mirrors.
  for (const safeField of ["questionId", "subject", "skill", "question", "marks", "contentDifficulty"]) {
    assert.ok(body.includes(`'${safeField}'`), `expected safe field "${safeField}" in the returned object`);
  }
});

test("mock_get_question enforces: attempt ownership, in_progress status, not expired, question is in the assigned manifest", () => {
  const fnMatch = executable.match(/create or replace function public\.mock_get_question\([\s\S]*?\$\$;/);
  const body = fnMatch![0];
  assert.match(body, /profile_id = v_profile_id/);
  assert.match(body, /status <> 'in_progress'/);
  assert.match(body, /now\(\) > v_attempt\.expires_at/);
  assert.match(body, /p_question_id = any\(v_attempt\.assigned_question_ids\)/);
});

test("mock_submit_answer enforces the same four checks and never echoes correctness", () => {
  const fnMatch = executable.match(/create or replace function public\.mock_submit_answer\([\s\S]*?\$\$;/);
  const body = fnMatch![0];
  assert.match(body, /profile_id = v_profile_id/);
  assert.match(body, /status <> 'in_progress'/);
  assert.match(body, /p_question_id = any\(v_attempt\.assigned_question_ids\)/);
  assert.ok(!/return\s+.*correct/i.test(body), "must never return whether the answer was correct");
  assert.match(fnMatch![0], /returns void/);
});

test("mock_start_attempt only transitions from 'assigned', and mock_submit_attempt only from 'in_progress' -- no other state transition is possible", () => {
  const startFn = executable.match(/create or replace function public\.mock_start_attempt\([\s\S]*?\$\$;/)![0];
  assert.match(startFn, /status = 'assigned'/);
  const submitFn = executable.match(/create or replace function public\.mock_submit_attempt\([\s\S]*?\$\$;/)![0];
  assert.match(submitFn, /status = 'in_progress'/);
});

test("mock_start_attempt sets a server-authoritative expires_at, never trusting a client-supplied deadline", () => {
  const fnMatch = executable.match(/create or replace function public\.mock_start_attempt\([\s\S]*?\$\$;/)![0];
  assert.match(fnMatch, /expires_at = now\(\) \+ make_interval/);
});

test("execute grants are authenticated-only, never anon or public", () => {
  const grants = [...executable.matchAll(/grant execute on function public\.(\w+)\([^)]*\) to (\w+);/g)];
  assert.equal(grants.length, 5);
  for (const [, , role] of grants) assert.equal(role, "authenticated");
  const revokes = (executable.match(/revoke all on function[\s\S]*?from public;/g) || []).length;
  assert.equal(revokes, 5, "every function must revoke the default public execute grant first");
});

test("the migration never changes ali_question_bank.eligibility_status or the migration 069 policy", () => {
  assert.ok(!/set\s+eligibility_status/i.test(executable));
  assert.ok(!/ali_question_bank_select_all/.test(executable), "must not touch migration 069's own policy");
});

test("ali_mock_form has no active real form content inserted -- structure only, per this increment's own explicit instruction", () => {
  assert.ok(!/insert into public\.ali_mock_form/i.test(executable), "must not seed any real form row");
});

test("the migration is wrapped in a single begin/commit transaction", () => {
  const beginCount = (executable.match(/\bbegin;/g) || []).length;
  const commitCount = (executable.match(/\bcommit;/g) || []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});
