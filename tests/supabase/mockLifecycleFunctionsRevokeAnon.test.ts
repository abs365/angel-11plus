import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Increment 008E — Security Correction (Decision 94/95).
 * Structural tests against migration 073's own SQL text, mirroring
 * tests/supabase/mockAttemptFunctionsRevokeAnon.test.ts's own established
 * pattern for migration 071 exactly, since this is the identical fix
 * applied to the 3 new migration-072 functions instead of the original 5.
 */

const sql = fs.readFileSync("supabase/migrations/073_mock_lifecycle_functions_revoke_anon.sql", "utf8");
const executable = sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");

const AFFECTED_FUNCTIONS = [
  "mock_get_active_form(text)",
  "mock_get_attempt_manifest(uuid)",
  "mock_set_flag(uuid, text, boolean)",
];

test("revokes execute from anon on exactly the 3 affected functions, exact signatures matching migration 072", () => {
  for (const fn of AFFECTED_FUNCTIONS) {
    assert.match(executable, new RegExp(`revoke execute on function public\\.${fn.replace(/[()]/g, "\\$&")} from anon;`));
  }
  const revokeFromAnon = [...executable.matchAll(/revoke execute on function public\.(\w+)\([^)]*\) from anon;/g)];
  assert.equal(revokeFromAnon.length, 3, "exactly 3 revoke-from-anon statements, no more, no fewer");
});

test("does NOT revoke execute from authenticated on any function -- authenticated retains access to all 3", () => {
  assert.ok(!/revoke execute on function[\s\S]*?from authenticated;/i.test(executable));
});

test("does not touch any of the 5 proven 008D RPCs -- no grant/revoke statement mentions them, no function body redefined", () => {
  for (const fn of ["mock_create_attempt", "mock_start_attempt", "mock_get_question", "mock_submit_answer", "mock_submit_attempt"]) {
    assert.ok(!executable.includes(fn), `migration 073 must not mention ${fn} at all -- it is scoped exclusively to the 3 new 072 functions`);
  }
});

test("does not redefine any function body -- permission correction only", () => {
  assert.ok(!/create or replace function/i.test(executable), "this migration must never redefine a function body, only its grants");
});

test("touches no RLS policy at all -- no create/drop/alter policy statement anywhere", () => {
  assert.ok(!/create policy|drop policy|alter policy/i.test(executable));
});

test("touches no table, no content, no eligibility_status", () => {
  assert.ok(!/create table|alter table|drop table|insert into/i.test(executable));
  assert.ok(!/set\s+eligibility_status/i.test(executable));
  assert.ok(!/ali_question_bank|ali_passage_bank/.test(executable));
});

test("does not touch the report-init trigger or any ali_mock_attempt_report/ali_mock_attempt_flag object", () => {
  assert.ok(!/mock_attempt_report_init|ali_mock_attempt_report|ali_mock_attempt_flag/.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("contains the Founder-supplied catalogue evidence verbatim, as the disclosed basis for this correction", () => {
  assert.match(sql, /mock_get_active_form\s*\|\s*anon\s*\|\s*EXECUTE/);
  assert.match(sql, /mock_get_attempt_manifest\s*\|\s*anon\s*\|\s*EXECUTE/);
  assert.match(sql, /mock_set_flag\s*\|\s*anon\s*\|\s*EXECUTE/);
});
