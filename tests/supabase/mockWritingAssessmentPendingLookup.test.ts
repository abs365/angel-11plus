import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair, recovery-path defect — migration 253:
 * adds mock_get_pending_writing_question_ids(), the smallest fix for a
 * production-confirmed defect (Vercel runtime logs: POST /api/mock-
 * writing-assessment returned 404 "report_not_available" for a
 * genuinely eligible, correctly-authenticated, correctly-owned request).
 * Root cause: the route read ali_mock_attempt_report directly through
 * the caller's own RLS-scoped session, but that table's SELECT policy
 * (ali_mock_attempt_report_select_released, migration 072) requires the
 * report to already be released — exactly the state this route exists to
 * help an attempt reach. Structural/logic assertions against migration
 * 253's real, live SQL source text, matching this repository's own
 * established convention for a NOT APPLIED migration.
 */

const MIGRATION = readFileSync("supabase/migrations/253_mock_writing_assessment_pending_lookup.sql", "utf8");

function extractFunctionBody(source: string, name: string): string {
  const match = source.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`));
  if (!match) throw new Error(`function ${name} not found`);
  return match[0];
}

const body = extractFunctionBody(MIGRATION, "mock_get_pending_writing_question_ids");

test("migration 253 is wrapped in a single begin/commit transaction and discloses NOT APPLIED", () => {
  assert.match(MIGRATION, /^begin;/m);
  assert.match(MIGRATION, /^commit;/m);
  assert.match(MIGRATION, /NOT APPLIED/);
});

test("ownership is resolved internally via profile_id = auth.uid(), never via RLS or a caller-supplied identity", () => {
  assert.match(body, /select id into v_profile_id from public\.profiles where auth_user_id = auth\.uid\(\);/);
  assert.match(body, /where id = p_attempt_id and profile_id = v_profile_id/);
});

test("a non-owned or non-existent attempt raises an exception rather than returning another caller's data", () => {
  assert.match(body, /if not found then\s*\n\s*raise exception 'Attempt % not found for caller', p_attempt_id;/);
});

test("only requires_manual_marking outcomes belonging to a Writing question are ever returned", () => {
  assert.match(body, /if \(v_outcome ->> 'status'\) = 'requires_manual_marking' then/);
  assert.match(body, /where b\.id = v_question_id and b\.subject = 'writing'/);
});

test("a missing report row returns an empty array, not an exception -- a safe, bounded default", () => {
  assert.match(body, /if not found then\s*\n\s*return v_ids;\s*\n\s*end if;/);
});

test("this function is internal-facing but callable by the owning learner directly -- granted to authenticated, revoked from anon and public", () => {
  assert.match(MIGRATION, /revoke all on function public\.mock_get_pending_writing_question_ids\(uuid\) from public;/);
  assert.match(MIGRATION, /grant execute on function public\.mock_get_pending_writing_question_ids\(uuid\) to authenticated;/);
  assert.match(MIGRATION, /revoke execute on function public\.mock_get_pending_writing_question_ids\(uuid\) from anon;/);
});

test("this migration never touches RLS policies, mock_persist_writing_assessment, mock_check_and_complete_scoring, or mock_release_report", () => {
  assert.doesNotMatch(MIGRATION, /create policy|drop policy|alter table .* enable row level security/i);
  assert.doesNotMatch(MIGRATION, /create or replace function public\.mock_persist_writing_assessment/);
  assert.doesNotMatch(MIGRATION, /create or replace function public\.mock_check_and_complete_scoring/);
  assert.doesNotMatch(MIGRATION, /create or replace function public\.mock_release_report/);
});

test("this migration touches exactly one function", () => {
  const defs = MIGRATION.match(/create or replace function public\.\w+/g) ?? [];
  assert.deepEqual(defs, ["create or replace function public.mock_get_pending_writing_question_ids"]);
});
