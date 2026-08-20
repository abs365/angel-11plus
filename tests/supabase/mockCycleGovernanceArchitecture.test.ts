import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mock Governance Architecture Increment 001 (Decision 135). Structural
 * tests against migration 085's own SQL text, matching this project's
 * established migration-testing convention (see
 * tests/supabase/mockAttemptEngine.test.ts, 008D's own precedent). Live,
 * end-to-end proof requires the Founder to apply this migration first.
 */

const sql = fs.readFileSync("supabase/migrations/085_mock_cycle_governance_architecture.sql", "utf8");
const executable = sql
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n");

test("does not touch mock_eligible, does not create or seed any ali_mock_form row, does not create ali_question_bank content", () => {
  assert.ok(!/eligibility_status/.test(executable));
  assert.ok(!/insert into public\.ali_mock_form/.test(executable));
  assert.ok(!/insert into public\.ali_question_bank/.test(executable));
});

test("A: ali_mock_cycle exists with RLS enabled, a select-own policy, and no insert/update/delete policy for anon/authenticated", () => {
  assert.match(executable, /create table if not exists public\.ali_mock_cycle/);
  assert.match(executable, /alter table public\.ali_mock_cycle enable row level security;/);
  assert.match(executable, /create policy ali_mock_cycle_select_own on public\.ali_mock_cycle for select to authenticated/);
  assert.ok(!/for (insert|update|delete)\s+to\s+(anon|authenticated)[\s\S]{0,200}ali_mock_cycle\b/i.test(executable));
});

test("A: ali_mock_cycle.initiated_by is constrained to exactly scheduled/parent_override, defaulting to scheduled", () => {
  assert.match(executable, /initiated_by text not null check \(initiated_by in \('scheduled', 'parent_override'\)\) default 'scheduled'/);
});

test("B: ali_mock_attempt gains nullable cycle_id (FK to ali_mock_cycle) and subject columns -- additive, no NOT NULL, no data touched", () => {
  assert.match(executable, /alter table public\.ali_mock_attempt\s*\n\s*add column if not exists cycle_id uuid references public\.ali_mock_cycle\(id\);/);
  assert.match(executable, /alter table public\.ali_mock_attempt\s*\n\s*add column if not exists subject text check \(subject in \('mathematics', 'english'\)\);/);
  assert.ok(!/alter table public\.ali_mock_attempt[\s\S]{0,300}not null/.test(executable), "new ali_mock_attempt columns must stay nullable");
});

test("B: at most one attempt per subject per cycle is database-enforced via a partial unique index, not app logic alone", () => {
  assert.match(
    executable,
    /create unique index if not exists ali_mock_attempt_cycle_subject_unique\s*\n\s*on public\.ali_mock_attempt \(cycle_id, subject\)\s*\n\s*where cycle_id is not null;/
  );
});

test("B: ali_mock_form gains a nullable subject column, not a NOT NULL one -- every existing/legacy form stays valid", () => {
  assert.match(executable, /alter table public\.ali_mock_form\s*\n\s*add column if not exists subject text check \(subject in \('mathematics', 'english'\)\);/);
});

test("C: two distinct creation functions carry the initiated_by source -- no shared function takes a caller-supplied source flag", () => {
  assert.match(executable, /create or replace function public\.mock_start_new_cycle\(\)/);
  assert.match(executable, /create or replace function public\.mock_authorise_extra_cycle\(\)/);
  const startBody = executable.match(/create or replace function public\.mock_start_new_cycle\(\)[\s\S]*?\$\$;/)![0];
  const overrideBody = executable.match(/create or replace function public\.mock_authorise_extra_cycle\(\)[\s\S]*?\$\$;/)![0];
  assert.match(startBody, /values \(v_profile_id, 'scheduled'\)/);
  assert.match(overrideBody, /values \(v_profile_id, 'parent_override'\)/);
  // Neither function accepts any argument that could let a caller choose the source.
  assert.match(startBody, /function public\.mock_start_new_cycle\(\)\s*\nreturns uuid/);
  assert.match(overrideBody, /function public\.mock_authorise_extra_cycle\(\)\s*\nreturns uuid/);
});

test("D: mock_start_new_cycle enforces the ~14-day interval anchored on the most recent SCHEDULED cycle only, never on parent_override cycles", () => {
  const body = executable.match(/create or replace function public\.mock_start_new_cycle\(\)[\s\S]*?\$\$;/)![0];
  assert.match(body, /interval constant interval := interval '14 days'/);
  assert.match(body, /where profile_id = v_profile_id and initiated_by = 'scheduled'/);
  assert.match(body, /now\(\) - v_last_scheduled_at < v_interval/);
});

test("D: mock_authorise_extra_cycle contains no interval/14-day check at all -- the bypass is real, not accidental", () => {
  const body = executable.match(/create or replace function public\.mock_authorise_extra_cycle\(\)[\s\S]*?\$\$;/)![0];
  assert.ok(!/interval/.test(body));
  assert.ok(!/14 days/.test(body));
});

test("both cycle-creation functions block on a currently open cycle before inserting -- prevents delaying one paper to game timing or stacking concurrent cycles", () => {
  for (const fn of ["mock_start_new_cycle", "mock_authorise_extra_cycle"]) {
    const body = executable.match(new RegExp(`create or replace function public\\.${fn}\\(\\)[\\s\\S]*?\\$\\$;`))![0];
    assert.match(body, /mock_cycle_is_open\(c\.id\)/);
    assert.match(body, /raise exception 'Mock cycle % is still open/);
  }
});

test("mock_cycle_is_open defines a cycle as open until BOTH a mathematics and an english attempt reach status = submitted", () => {
  const body = executable.match(/create or replace function public\.mock_cycle_is_open\(p_cycle_id uuid\)[\s\S]*?\$\$;/)![0];
  assert.match(body, /subject = 'mathematics' and status = 'submitted'/);
  assert.match(body, /subject = 'english' and status = 'submitted'/);
  assert.match(body, /return not \(v_maths_submitted and v_english_submitted\);/);
});

test("mock_cycle_is_open is never granted to anon or authenticated -- purely an internal helper", () => {
  assert.match(executable, /revoke all on function public\.mock_cycle_is_open\(uuid\) from public;/);
  assert.ok(!/grant execute on function public\.mock_cycle_is_open/.test(executable));
});

test("E/F: mock_create_cycle_attempt requires an owned, open cycle and a subject-pure active form, and copies subject from the form onto the attempt", () => {
  const body = executable.match(/create or replace function public\.mock_create_cycle_attempt\(p_form_id text, p_cycle_id uuid\)[\s\S]*?\$\$;/)![0];
  assert.match(body, /where id = p_cycle_id and profile_id = v_profile_id/);
  assert.match(body, /if not public\.mock_cycle_is_open\(p_cycle_id\) then/);
  assert.match(body, /if v_form\.subject is null then/);
  assert.match(body, /cycle_id, subject\)\s*\n\s*values \(v_profile_id, p_form_id, 'full_mock', 'assigned', v_question_ids, p_cycle_id, v_form\.subject\)/);
});

test("E/F: mock_create_cycle_attempt refuses a second attempt for the same subject within the same cycle", () => {
  const body = executable.match(/create or replace function public\.mock_create_cycle_attempt\(p_form_id text, p_cycle_id uuid\)[\s\S]*?\$\$;/)![0];
  assert.match(body, /where cycle_id = p_cycle_id and subject = v_form\.subject/);
  assert.match(body, /already has a % attempt -- one attempt per subject per cycle/);
});

test("G/H: the fabrication path is closed -- the original mock_create_attempt(text,text) now rejects full_mock, redirecting to the cycle-aware function", () => {
  const body = executable.match(/create or replace function public\.mock_create_attempt\(p_form_id text, p_attempt_type text\)[\s\S]*?\$\$;/)![0];
  assert.match(body, /if p_attempt_type = 'full_mock' then/);
  assert.match(body, /raise exception 'full_mock attempts must be created via mock_create_cycle_attempt/);
});

test("G/H: mock_create_attempt's guard is the FIRST check in the function body, before any profile/form lookup -- a full_mock call is rejected unconditionally, not only in some code paths", () => {
  const body = executable.match(/create or replace function public\.mock_create_attempt\(p_form_id text, p_attempt_type text\)[\s\S]*?\$\$;/)![0];
  const guardIndex = body.indexOf("if p_attempt_type = 'full_mock' then");
  const profileLookupIndex = body.indexOf("select id into v_profile_id");
  assert.ok(guardIndex > -1 && profileLookupIndex > -1 && guardIndex < profileLookupIndex);
});

test("G/H: mock_create_attempt's timed_section/diagnostic_mock behaviour is otherwise byte-identical to migration 070's own original body", () => {
  const original070 = fs
    .readFileSync("supabase/migrations/070_mock_attempt_engine.sql", "utf8")
    .split("\n")
    .filter((l) => !l.trimStart().startsWith("--"))
    .join("\n");
  const originalBody = original070.match(/create or replace function public\.mock_create_attempt\(p_form_id text, p_attempt_type text\)[\s\S]*?\$\$;/)![0];
  // Strip the new guard clause out of the 085 body and confirm what remains
  // matches the original 070 body exactly.
  const bodyWithoutGuard = executable
    .match(/create or replace function public\.mock_create_attempt\(p_form_id text, p_attempt_type text\)[\s\S]*?\$\$;/)![0]
    .replace(/if p_attempt_type = 'full_mock' then\s*\n\s*raise exception 'full_mock attempts must be created via mock_create_cycle_attempt\(form_id, cycle_id\) as part of a Mock cycle -- see migration 085';\s*\n\s*end if;\s*\n\s*\n/, "");
  assert.equal(bodyWithoutGuard.replace(/\s+/g, " ").trim(), originalBody.replace(/\s+/g, " ").trim());
});

test("mock_create_attempt(text,text) grants are unchanged: authenticated only, never anon", () => {
  assert.match(executable, /revoke all on function public\.mock_create_attempt\(text, text\) from public;/);
  assert.match(executable, /grant execute on function public\.mock_create_attempt\(text, text\) to authenticated;/);
  assert.ok(!/grant execute on function public\.mock_create_attempt\(text, text\) to anon/.test(executable));
});

test("does not touch any of the proven 072/074/075 lifecycle/scoring/report-release functions or their grants", () => {
  for (const fn of [
    "mock_get_active_form",
    "mock_get_attempt_manifest",
    "mock_set_flag",
    "mock_score_attempt",
    "mock_release_report",
    "mock_attempt_report_init",
  ]) {
    assert.ok(!executable.includes(fn), `migration 085 must not mention ${fn} at all`);
  }
});

test("does not touch mock_start_attempt, mock_get_question, or mock_submit_answer/mock_submit_attempt bodies -- per-paper timing/redaction/answer flow is untouched", () => {
  for (const fn of ["mock_start_attempt", "mock_get_question", "mock_submit_answer", "mock_submit_attempt"]) {
    assert.ok(!executable.includes(fn), `migration 085 must not mention ${fn} at all`);
  }
});

test("does not alter ali_mock_attempt_report or ali_mock_attempt_flag in any way", () => {
  assert.ok(!/ali_mock_attempt_report/.test(executable));
  assert.ok(!/ali_mock_attempt_flag/.test(executable));
});

test("all new functions granting authenticated execute correctly, never grant anon execute -- applied from the start, not a later correction", () => {
  const grantedFns = ["mock_start_new_cycle", "mock_authorise_extra_cycle", "mock_create_cycle_attempt"];
  for (const fn of grantedFns) {
    assert.match(executable, new RegExp(`grant execute on function public\\.${fn}\\([^)]*\\) to authenticated;`));
    assert.ok(!new RegExp(`grant execute on function public\\.${fn}\\([^)]*\\) to anon`).test(executable), `${fn} must never grant anon execute`);
  }
});

test("every new function is SECURITY DEFINER and re-derives caller identity from auth.uid() itself, never a passed-in profile/parent id", () => {
  const fns = ["mock_cycle_is_open", "mock_start_new_cycle", "mock_authorise_extra_cycle", "mock_create_cycle_attempt"];
  for (const fn of fns) {
    const fnMatch = executable.match(new RegExp(`create or replace function public\\.${fn}\\([\\s\\S]*?\\$\\$;`));
    assert.ok(fnMatch, `${fn} not found`);
    assert.match(fnMatch![0], /security definer/, `${fn} must be SECURITY DEFINER`);
  }
  // mock_cycle_is_open takes no identity argument by design (called only
  // internally, already scoped by its caller's own ownership check).
  for (const fn of ["mock_start_new_cycle", "mock_authorise_extra_cycle", "mock_create_cycle_attempt"]) {
    const fnMatch = executable.match(new RegExp(`create or replace function public\\.${fn}\\([\\s\\S]*?\\$\\$;`));
    assert.match(fnMatch![0], /auth\.uid\(\)/, `${fn} must derive identity from auth.uid()`);
  }
});

test("no payment, price, subscription, or entitlement table/column is created -- commercial principle recorded, not implemented", () => {
  assert.ok(!/\bprice\b/i.test(executable));
  assert.ok(!/\bpayment\b/i.test(executable));
  assert.ok(!/\bstripe\b/i.test(executable));
  assert.ok(!/\bsubscription\b/i.test(executable));
  assert.ok(!/\bentitlement\b/i.test(executable));
});

test("K: does not touch ali_question_bank, ali_student_question_history, ali_durable_mastery, or ali_educational_audit -- no Educational Intelligence change", () => {
  for (const table of ["ali_question_bank", "ali_student_question_history", "ali_durable_mastery", "ali_educational_audit"]) {
    assert.ok(!executable.includes(table), `migration 085 must not mention ${table}`);
  }
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
});
