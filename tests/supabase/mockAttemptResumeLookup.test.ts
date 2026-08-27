import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Mock 1 — Attempt Resume Lookup (Decision 217, Decision
 * 216's own P1 finding, Founder-directed bounded remediation).
 * Structural + security tests against migration 149's own SQL text.
 */

const sql = fs.readFileSync("supabase/migrations/149_mock_attempt_resume_lookup.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("mock_get_resumable_attempt is created with exactly one parameter, p_form_id text -- structurally no learner-identity parameter can ever be supplied", () => {
  assert.match(executable, /create or replace function public\.mock_get_resumable_attempt\(p_form_id text\)/);
  // No second parameter of any kind -- proves no p_profile_id/p_learner_id/p_user_id argument exists in the signature.
  const signature = executable.match(/create or replace function public\.mock_get_resumable_attempt\(([^)]*)\)/)![1];
  assert.equal(signature.trim(), "p_form_id text");
});

test("identity is derived exclusively from auth.uid() inside the function body, never from a parameter", () => {
  const body = executable.match(/create or replace function public\.mock_get_resumable_attempt[\s\S]*?^\$\$;/m)![0];
  assert.match(body, /select id into v_profile_id from public\.profiles where auth_user_id = auth\.uid\(\)/);
  assert.ok(!/p_profile_id|p_learner_id|p_user_id/i.test(body), "must never accept a caller-supplied identity parameter");
});

test("raises if no profile is found for the caller -- never silently proceeds with a null identity", () => {
  const body = executable.match(/create or replace function public\.mock_get_resumable_attempt[\s\S]*?^\$\$;/m)![0];
  assert.match(body, /if v_profile_id is null then\s*\n\s*raise exception/);
});

test("query is unconditionally scoped to the caller's own profile_id -- a caller can never see another learner's attempt", () => {
  assert.match(executable, /where a\.profile_id = v_profile_id/);
});

test("query is scoped to the requested form_id", () => {
  assert.match(executable, /and a\.form_id = p_form_id/);
});

test("only 'assigned' and 'in_progress' are ever treated as resumable -- 'submitted' is never returned, and neither is the schema-permitted-but-dead 'ready'/'expired'", () => {
  assert.match(executable, /and a\.status in \('assigned', 'in_progress'\)/);
  assert.ok(!/'submitted'/.test(executable.match(/where a\.profile_id[\s\S]*?limit 1;/)![0]));
});

test("deterministic single-row result: ordered by created_at desc, limited to 1 -- never ambiguous about which attempt is resumed", () => {
  assert.match(executable, /order by a\.created_at desc\s*\n\s*limit 1;/);
});

test("is_expired is computed live from now() and the attempt's own expires_at -- never trusts a client-supplied value", () => {
  assert.match(executable, /\(a\.expires_at is not null and now\(\) > a\.expires_at\) as is_expired/);
});

test("does not filter on ali_mock_form.active -- deliberately consistent with mock_get_question()/mock_submit_answer()'s own established precedent that an in-progress attempt is frozen independent of later form deactivation", () => {
  const body = executable.match(/create or replace function public\.mock_get_resumable_attempt[\s\S]*?^\$\$;/m)![0];
  assert.ok(!body.includes("ali_mock_form"), "the lookup function itself must never join or filter against ali_mock_form");
  assert.match(sql, /does NOT[\s\S]{0,20}filter on `ali_mock_form\.active`/);
});

test("pure read-only function: no INSERT, UPDATE, or DELETE anywhere in the function body -- a failed/empty lookup can never itself create an attempt", () => {
  const body = executable.match(/create or replace function public\.mock_get_resumable_attempt[\s\S]*?^\$\$;/m)![0];
  assert.ok(!/\binsert\s+into\b/i.test(body));
  assert.ok(!/\bupdate\s+public\./i.test(body));
  assert.ok(!/\bdelete\s+from\b/i.test(body));
});

test("grants: authenticated only, never anon", () => {
  assert.match(executable, /revoke all on function public\.mock_get_resumable_attempt\(text\) from public;/);
  assert.match(executable, /grant execute on function public\.mock_get_resumable_attempt\(text\) to authenticated;/);
  assert.ok(!/grant execute on function public\.mock_get_resumable_attempt\(text\) to anon/.test(executable));
});

test("does not modify any existing function -- no other CREATE OR REPLACE FUNCTION appears in this migration", () => {
  const matches = [...executable.matchAll(/create or replace function public\.(\w+)/g)].map((m) => m[1]);
  assert.deepEqual(matches, ["mock_get_resumable_attempt"]);
});

test("does not create, alter, or reference any RLS policy -- relies entirely on the existing migration 070 policies", () => {
  assert.ok(!/create policy|alter policy|drop policy/i.test(executable));
});

test("does not touch ali_question_bank, ali_mock_form, or migration 145's eligibility helper", () => {
  assert.ok(!executable.includes("ali_question_bank"));
  assert.ok(!executable.includes("mock_validate_manifest_eligibility"));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
});

test("header documents the resumable-attempt contract derived from the real schema (only 'assigned'/'in_progress' are live states), not invented terminology", () => {
  assert.match(sql, /'ready' and 'expired' are schema-permitted but structurally dead/);
});

test("header documents that mock_start_attempt() cannot be called twice on the same attempt -- timer reset is already structurally impossible", () => {
  assert.match(sql, /structurally[\s\S]{0,30}cannot be called a second time/);
});

test("header documents reliance on the existing ali_mock_attempt_cycle_subject_unique constraint for race safety, not new locking", () => {
  assert.match(sql, /ali_mock_attempt_cycle_subject_unique/);
  assert.match(sql, /adds no new locking of its own/);
});

test("every RAISE with a % placeholder supplies exactly one matching argument", () => {
  const raiseStatements = [...executable.matchAll(/raise (?:exception|notice)\s+'([^']*(?:''[^']*)*)'((?:\s*,\s*v_\w+)*)\s*;/g)];
  for (const [, message, args] of raiseStatements) {
    const placeholders = (message.match(/%/g) || []).length;
    const argCount = args ? (args.match(/v_\w+/g) || []).length : 0;
    assert.equal(placeholders, argCount, `RAISE message "${message}" has ${placeholders} placeholders but ${argCount} arguments`);
  }
});
