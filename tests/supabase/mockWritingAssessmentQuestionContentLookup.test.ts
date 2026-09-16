import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair, recovery-path defect — migration 254:
 * the third and final defect in this repair arc. Production evidence
 * (new bounded logging from the previous commit) showed mock_get_pending_
 * writing_question_ids() correctly returning 2 pending ids, immediately
 * followed by assessed_count:0 with no "assess" stage log for either
 * question at all — proving the route's own content read returned zero
 * rows. Root cause: ali_question_bank's own SELECT RLS policy (migration
 * 100, ali_question_bank_select_all) only allows a non-admin caller to
 * see `eligibility_status = 'practice_eligible'` rows; both Writing
 * questions are `mock_eligible`. mock_get_writing_question_content()
 * bypasses that RLS the same way mock_get_question() (migration 070)
 * already does for question delivery, by internally reusing (never
 * reimplementing) mock_get_pending_writing_question_ids()'s own
 * ownership/pending derivation. Structural/logic assertions against
 * migration 254's real, live SQL source text, matching this repository's
 * own established convention for a NOT APPLIED migration.
 */

const MIGRATION = readFileSync("supabase/migrations/254_mock_writing_assessment_question_content_lookup.sql", "utf8");

function extractFunctionBody(source: string, name: string): string {
  const match = source.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`));
  if (!match) throw new Error(`function ${name} not found`);
  return match[0];
}

const body = extractFunctionBody(MIGRATION, "mock_get_writing_question_content");

test("migration 254 is wrapped in a single begin/commit transaction and discloses NOT APPLIED", () => {
  assert.match(MIGRATION, /^begin;/m);
  assert.match(MIGRATION, /^commit;/m);
  assert.match(MIGRATION, /NOT APPLIED/);
});

test("ownership/pending derivation is reused via mock_get_pending_writing_question_ids, never reimplemented", () => {
  assert.match(body, /v_pending_ids := public\.mock_get_pending_writing_question_ids\(p_attempt_id\);/);
  assert.doesNotMatch(body, /auth\.uid\(\)/, "this function must not re-derive ownership itself -- it delegates entirely to the existing function");
});

test("only writing-subject rows among the caller's own pending ids are ever returned", () => {
  assert.match(body, /where b\.id = any\(v_pending_ids\) and b\.subject = 'writing'/);
});

test("this function is internal-facing but callable by the owning learner directly -- granted to authenticated, revoked from anon and public", () => {
  assert.match(MIGRATION, /revoke all on function public\.mock_get_writing_question_content\(uuid\) from public;/);
  assert.match(MIGRATION, /grant execute on function public\.mock_get_writing_question_content\(uuid\) to authenticated;/);
  assert.match(MIGRATION, /revoke execute on function public\.mock_get_writing_question_content\(uuid\) from anon;/);
});

test("this migration never touches ali_question_bank's own RLS policy or any other existing function", () => {
  assert.doesNotMatch(MIGRATION, /create policy|drop policy|alter table .* enable row level security/i);
  assert.doesNotMatch(MIGRATION, /create or replace function public\.mock_get_pending_writing_question_ids/);
  assert.doesNotMatch(MIGRATION, /create or replace function public\.mock_persist_writing_assessment/);
});

test("this migration touches exactly one function", () => {
  const defs = MIGRATION.match(/create or replace function public\.\w+/g) ?? [];
  assert.deepEqual(defs, ["create or replace function public.mock_get_writing_question_content"]);
});
