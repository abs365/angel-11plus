import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Increment 008F — structural tests against migration 074's own
 * SQL text (testable without a live database, matching this project's
 * established migration-testing convention). Live, end-to-end proof
 * requires the Founder to apply this migration first.
 */

const sql = fs.readFileSync("supabase/migrations/074_mock_scoring_and_report_release.sql", "utf8");
const executable = sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");

const EXISTING_RPCS = [
  "mock_create_attempt",
  "mock_start_attempt",
  "mock_get_question",
  "mock_submit_answer",
  "mock_submit_attempt",
  "mock_get_active_form",
  "mock_get_attempt_manifest",
  "mock_set_flag",
];

test("does not redefine any of the 8 proven Mock RPCs -- purely additive", () => {
  for (const fn of EXISTING_RPCS) {
    assert.ok(!new RegExp(`create or replace function public\\.${fn}\\(`).test(executable), `must never redefine ${fn}`);
    assert.ok(!executable.includes(fn), `must not mention ${fn} at all -- scoped exclusively to its own 2 new functions`);
  }
});

test("does not touch ali_student_question_history, ali_durable_mastery, or ali_educational_audit -- the disclosed provenance-gap boundary", () => {
  for (const table of ["ali_student_question_history", "ali_durable_mastery", "ali_educational_audit"]) {
    assert.ok(!executable.includes(table), `must never touch ${table} -- Mock evidence stays inside ali_mock_attempt_report only, per this migration's own disclosed architecture decision`);
  }
});

test("does not create any table, policy, or trigger -- only ALTER TABLE ADD COLUMN and two new functions", () => {
  assert.ok(!/create table|drop table|create policy|drop policy|create trigger|drop trigger/i.test(executable));
});

test("extends ali_mock_attempt_report with exactly two new, nullable columns", () => {
  assert.match(executable, /alter table public\.ali_mock_attempt_report\s+add column if not exists marking_version integer;/);
  assert.match(executable, /alter table public\.ali_mock_attempt_report\s+add column if not exists released_at timestamptz;/);
  assert.ok(!/not null|default/i.test(executable.match(/add column if not exists marking_version[^;]*;/)![0]));
  assert.ok(!/not null|default/i.test(executable.match(/add column if not exists released_at[^;]*;/)![0]));
});

test("mock_score_attempt is SECURITY DEFINER, derives identity from auth.uid(), and only scores a submitted (locked) attempt -- never in_progress", () => {
  const fnMatch = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/);
  assert.ok(fnMatch);
  const body = fnMatch![0];
  assert.match(body, /security definer/);
  assert.match(body, /auth\.uid\(\)/);
  assert.match(body, /profile_id = v_profile_id/);
  assert.match(body, /status <> 'submitted'/);
});

test("mock_score_attempt is idempotent per marking_version -- a second call at the same version is a no-op", () => {
  const fnMatch = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  assert.match(fnMatch, /scoring_state = 'scored'\s*\n\s*and marking_version = v_current_marking_version/);
  assert.match(fnMatch, /return;/);
});

test("mock_score_attempt never trusts a client-supplied correctness value -- its only argument is the attempt id", () => {
  const signature = executable.match(/create or replace function public\.mock_score_attempt\(([^)]*)\)/)![1];
  assert.equal(signature.trim(), "p_attempt_id uuid");
});

test("mock_score_attempt reads the real stored answer and marks, never the learner's own submitted response as authoritative for correctness", () => {
  const body = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  assert.match(body, /v_stored_answer := v_bank_row\.prompt->>'answer'/);
  assert.match(body, /v_marks := coalesce\(\(v_bank_row\.prompt->>'marks'\)::numeric, 1\)/);
});

test("mock_score_attempt uses the same 0.0001 numeric tolerance as checkMathsAnswer (lib/learningEngine/practiceContent.ts), kept in sync by disclosed convention", () => {
  const body = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  assert.match(body, /abs\(v_numeric_response - v_numeric_answer\) < 0\.0001/);
});

test("mock_score_attempt never auto-marks Writing, multi-form (semicolon) answers, or a missing answer -- all route to requires_manual_marking", () => {
  const body = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  assert.match(body, /v_bank_row\.subject = 'writing' or v_stored_answer is null or v_stored_answer like '%;%'/);
});

test("mock_score_attempt never computes a percentage while any question still requires manual marking", () => {
  const body = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  assert.match(body, /if v_manual_count > 0 or v_raw_available = 0 then\s*\n\s*v_percentage := null;/);
});

test("mock_score_attempt writes only to ali_mock_attempt_report -- no other table is mutated", () => {
  const body = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  assert.ok(!/insert into|update public\.(?!ali_mock_attempt_report)/i.test(body.replace(/update public\.ali_mock_attempt_report/g, "")), "must not write to any table other than ali_mock_attempt_report");
});

test("mock_score_attempt includes questionTypeId (already client-visible via mock_get_question, not a protected field) in each outcome, so competency classification reuses the real assessmentBrainMap.ts mapping instead of duplicating it into SQL", () => {
  const body = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  const outcomeBuilds = body.match(/jsonb_build_object\(\s*'questionId'[\s\S]*?\)/g) || [];
  assert.ok(outcomeBuilds.length >= 2, "expected at least the not-found branch and the main-loop branch");
  for (const build of outcomeBuilds) {
    assert.match(build, /'questionTypeId'/);
  }
});

test("mock_release_report requires is_current_user_admin() -- report release cannot be self-authorised by the learner", () => {
  const fnMatch = executable.match(/create or replace function public\.mock_release_report\([\s\S]*?\n\$\$;/);
  assert.ok(fnMatch);
  const body = fnMatch![0];
  assert.match(body, /security definer/);
  assert.match(body, /if not public\.is_current_user_admin\(\) then/);
  assert.match(body, /raise exception 'Only an admin may release a Mock report'/);
});

test("mock_release_report only releases an already-scored report -- scoring_state = 'scored' is required", () => {
  const body = executable.match(/create or replace function public\.mock_release_report\([\s\S]*?\n\$\$;/)![0];
  assert.match(body, /and scoring_state = 'scored'/);
});

test("execute grants for both new functions: authenticated granted, anon explicitly revoked, applied correctly from the start (unlike migration 072's own original omission)", () => {
  for (const fn of ["mock_score_attempt(uuid)", "mock_release_report(uuid)"]) {
    assert.match(executable, new RegExp(`grant execute on function public\\.${fn.replace(/[()]/g, "\\$&")} to authenticated;`));
    assert.match(executable, new RegExp(`revoke execute on function public\\.${fn.replace(/[()]/g, "\\$&")} from anon;`));
    assert.match(executable, new RegExp(`revoke all on function public\\.${fn.replace(/[()]/g, "\\$&")} from public;`));
  }
});

test("no execute grant to anon anywhere in this migration", () => {
  assert.ok(!/to anon;/.test(executable));
});

test("does not create real Mock content, does not touch eligibility_status", () => {
  assert.ok(!/insert into public\.ali_mock_form|insert into public\.ali_question_bank/i.test(executable));
  assert.ok(!/set\s+eligibility_status/i.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});
