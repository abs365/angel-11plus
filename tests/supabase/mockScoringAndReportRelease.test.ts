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
    assert.ok(!executable.includes(fn), `must not mention ${fn} at all -- scoped exclusively to its own new functions`);
  }
});

test("redefines exactly one existing function -- migration 072's own report-init trigger function -- and no other pre-existing object", () => {
  assert.match(executable, /create or replace function public\.mock_attempt_report_init\(\)/);
  const redefinitions = [...executable.matchAll(/create or replace function public\.(\w+)\(/g)].map((m) => m[1]);
  assert.deepEqual(new Set(redefinitions), new Set(["mock_score_attempt", "mock_release_report", "mock_attempt_report_init"]), "only these 3 functions may be created/redefined by this migration");
});

test("does not touch ali_student_question_history, ali_durable_mastery, or ali_educational_audit -- the disclosed provenance-gap boundary", () => {
  for (const table of ["ali_student_question_history", "ali_durable_mastery", "ali_educational_audit"]) {
    assert.ok(!executable.includes(table), `must never touch ${table} -- Mock evidence stays inside ali_mock_attempt_report only, per this migration's own disclosed architecture decision`);
  }
});

test("does not create any table, policy, or trigger -- only ALTER TABLE ADD COLUMN and function definitions (mock_attempt_report_init is redefined via CREATE OR REPLACE, not a new CREATE TRIGGER)", () => {
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

test("Founder pre-application review, Issue 3: a response row with a null, missing, or whitespace-only value is treated as unanswered, never incorrect or manual", () => {
  const body = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  assert.match(body, /if v_response is null or v_response_value is null or trim\(v_response_value\) = '' then/);
  const branch = body.match(/if v_response is null or v_response_value is null or trim\(v_response_value\) = '' then[\s\S]*?end if;/)![0];
  assert.match(branch, /v_status := 'unanswered';/);
});

test("Founder pre-application review, Issue 2: scoring_state is 'scored' only when nothing requires manual marking, otherwise 'scoring' -- an existing, valid state, no new enum value invented", () => {
  const body = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  assert.match(body, /set scoring_state = case when v_manual_count > 0 then 'scoring' else 'scored' end,/);
  // Confirms this migration does not touch ali_mock_attempt_report's own scoring_state CHECK constraint at all.
  assert.ok(!/alter table public\.ali_mock_attempt_report\s+(drop|add) constraint/i.test(executable), "must not alter the existing scoring_state check constraint -- reuses an existing valid value instead");
});

test("a report can therefore never reach scoring_state = 'scored' -- and so can never be released -- while any question still requires manual marking, including future Continuous Writing", () => {
  const scoreBody = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  // Writing always sets v_manual_count > 0 (routes to requires_manual_marking), which the case expression above maps to 'scoring', never 'scored'.
  assert.match(scoreBody, /v_bank_row\.subject = 'writing'[\s\S]*?v_manual_count := v_manual_count \+ 1;/);
  const releaseBody = executable.match(/create or replace function public\.mock_release_report\([\s\S]*?\n\$\$;/)![0];
  assert.match(releaseBody, /and scoring_state = 'scored'/);
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

test("Founder pre-application review, Issue 1: mock_attempt_report_init (migration 072's own trigger function, redefined here) creates the report row and then automatically calls mock_score_attempt server-side -- no client/learner action required", () => {
  const body = executable.match(/create or replace function public\.mock_attempt_report_init\(\)[\s\S]*?\n\$\$;/)![0];
  assert.match(body, /security definer/);
  assert.match(body, /new\.status = 'submitted' and \(old\.status is distinct from 'submitted'\)/);
  assert.match(body, /insert into public\.ali_mock_attempt_report \(attempt_id\)/);
  assert.match(body, /perform public\.mock_score_attempt\(new\.id\);/);
});

test("the automatic scoring call is wrapped in its own exception block -- a scoring failure can never roll back the learner's own genuine submission", () => {
  const body = executable.match(/create or replace function public\.mock_attempt_report_init\(\)[\s\S]*?\n\$\$;/)![0];
  const nestedBlock = body.match(/begin\s*\n\s*perform public\.mock_score_attempt\(new\.id\);\s*\n\s*exception when others then[\s\S]*?end;/);
  assert.ok(nestedBlock, "expected a nested begin/exception/end block around the scoring call");
  assert.match(nestedBlock![0], /scoring_state = 'failed'/);
});

test("mock_score_attempt has NO execute grant to authenticated (or anon) -- only its own owning role can call it, invoked exclusively by the report-init trigger above", () => {
  assert.ok(!/grant execute on function public\.mock_score_attempt\(uuid\) to authenticated;/.test(executable), "must never grant mock_score_attempt to authenticated -- Issue 1's own fix");
  assert.match(executable, /revoke execute on function public\.mock_score_attempt\(uuid\) from authenticated;/);
  assert.match(executable, /revoke execute on function public\.mock_score_attempt\(uuid\) from anon;/);
  assert.match(executable, /revoke all on function public\.mock_score_attempt\(uuid\) from public;/);
});

test("mock_release_report retains its execute grant to authenticated, admin-gated internally -- unchanged by this review", () => {
  assert.match(executable, /grant execute on function public\.mock_release_report\(uuid\) to authenticated;/);
  assert.match(executable, /revoke execute on function public\.mock_release_report\(uuid\) from anon;/);
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
