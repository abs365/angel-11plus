import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mock Governance Architecture Increment 001, Security Correction
 * (Decision 136). Structural tests against migration 086's own SQL text,
 * mirroring tests/supabase/mockAttemptFunctionsRevokeAnon.test.ts and
 * tests/supabase/mockLifecycleFunctionsRevokeAnon.test.ts's own
 * established pattern exactly, since this is the identical fix applied
 * to the 4 migration-085 functions instead of the earlier 5/3 batches.
 */

const sql = fs.readFileSync("supabase/migrations/086_mock_cycle_functions_revoke_anon.sql", "utf8");
const executable = sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");

const PUBLIC_AUTHENTICATED_APIS = [
  "mock_start_new_cycle()",
  "mock_authorise_extra_cycle()",
  "mock_create_cycle_attempt(text, uuid)",
];

test("revokes execute from anon on exactly the 4 affected functions, exact signatures matching migration 085", () => {
  for (const fn of [...PUBLIC_AUTHENTICATED_APIS, "mock_cycle_is_open(uuid)"]) {
    assert.match(executable, new RegExp(`revoke execute on function public\\.${fn.replace(/[()]/g, "\\$&")} from anon;`));
  }
  const revokeFromAnon = [...executable.matchAll(/revoke execute on function public\.(\w+)\([^)]*\) from anon;/g)];
  assert.equal(revokeFromAnon.length, 4, "exactly 4 revoke-from-anon statements, no more, no fewer");
});

test("does NOT revoke execute from authenticated on the 3 public authenticated APIs -- they retain access", () => {
  for (const fn of PUBLIC_AUTHENTICATED_APIS) {
    assert.ok(
      !new RegExp(`revoke execute on function public\\.${fn.replace(/[()]/g, "\\$&")} from authenticated;`).test(executable),
      `${fn} must not have authenticated revoked`
    );
  }
});

test("mock_cycle_is_open is corrected on BOTH anon and authenticated -- restoring 'granted to no role at all' per Decision 135, not merely matching the other three functions", () => {
  assert.match(executable, /revoke execute on function public\.mock_cycle_is_open\(uuid\) from anon;/);
  assert.match(executable, /revoke execute on function public\.mock_cycle_is_open\(uuid\) from authenticated;/);
});

test("does not touch postgres or service_role privileges anywhere", () => {
  assert.ok(!/from\s+postgres/i.test(executable));
  assert.ok(!/from\s+service_role/i.test(executable));
});

test("does not touch any of the 8 proven 070/072/074/075 RPCs -- no grant/revoke statement mentions them, no function body redefined", () => {
  for (const fn of [
    "mock_create_attempt",
    "mock_start_attempt",
    "mock_get_question",
    "mock_submit_answer",
    "mock_submit_attempt",
    "mock_get_active_form",
    "mock_get_attempt_manifest",
    "mock_set_flag",
    "mock_score_attempt",
    "mock_release_report",
  ]) {
    assert.ok(!executable.includes(fn), `migration 086 must not mention ${fn} at all -- it is scoped exclusively to the 4 new 085 functions`);
  }
});

test("does not redefine any function body -- permission correction only", () => {
  assert.ok(!/create or replace function/i.test(executable));
});

test("touches no table, column, RLS policy, or eligibility_status", () => {
  assert.ok(!/create table|alter table|drop table|create policy|drop policy|alter policy|enable row level security/i.test(executable));
  assert.ok(!/eligibility_status/i.test(executable));
  assert.ok(!/insert into/i.test(executable));
});

test("does not touch ali_mock_cycle, ali_mock_attempt, or ali_mock_form schema -- privilege correction only, no structural change", () => {
  assert.ok(!/create table|alter table/i.test(executable));
});

test("does not mention Mock cadence/cycle semantics -- the 14-day interval, open-cycle, or subject logic is untouched (no CREATE OR REPLACE at all in this file)", () => {
  assert.ok(!/interval '14 days'/.test(executable));
  assert.ok(!/mock_cycle_is_open\(c\.id\)/.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
});

test("migration 085 itself is not modified by this correction (forward-only, honest migration history preserved)", () => {
  const migration085 = fs.readFileSync("supabase/migrations/085_mock_cycle_governance_architecture.sql", "utf8");
  assert.match(migration085, /NOT APPLIED\. Generated for Founder review/);
  // Migration 085's own revoke/grant statements for the 4 functions remain
  // exactly as originally authored -- this correction is additive, not a
  // rewrite of the prior file.
  assert.match(migration085, /revoke all on function public\.mock_cycle_is_open\(uuid\) from public;/);
  assert.match(migration085, /revoke all on function public\.mock_start_new_cycle\(\) from public;/);
  assert.match(migration085, /revoke all on function public\.mock_authorise_extra_cycle\(\) from public;/);
  assert.match(migration085, /revoke all on function public\.mock_create_cycle_attempt\(text, uuid\) from public;/);
});
