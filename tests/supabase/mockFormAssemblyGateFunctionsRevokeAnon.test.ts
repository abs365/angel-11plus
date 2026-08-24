import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock Form-Assembly Gate, Security Correction
 * (Decision 162). Structural tests against migration 108's own SQL text,
 * mirroring tests/supabase/mockAttemptFunctionsRevokeAnon.test.ts,
 * mockLifecycleFunctionsRevokeAnon.test.ts, and
 * mockCycleFunctionsRevokeAnon.test.ts's own established pattern exactly
 * -- this is the identical defect class and the identical fix pattern, a
 * fourth time, applied to the two brand-new migration-106/107 functions.
 */

const sql = fs.readFileSync("supabase/migrations/108_mock_form_assembly_gate_functions_revoke_anon.sql", "utf8");
const executable = sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");

const AFFECTED_FUNCTIONS = ["mock_get_attempt_grouping(uuid)", "mock_get_open_cycle()"];

test("revokes execute from anon on exactly the 2 affected functions, exact signatures matching migrations 106/107", () => {
  for (const fn of AFFECTED_FUNCTIONS) {
    assert.match(executable, new RegExp(`revoke execute on function public\\.${fn.replace(/[()]/g, "\\$&")} from anon;`));
  }
  const revokeFromAnon = [...executable.matchAll(/revoke execute on function public\.(\w+)\([^)]*\) from anon;/g)];
  assert.equal(revokeFromAnon.length, 2, "exactly 2 revoke-from-anon statements, no more, no fewer");
});

test("does NOT revoke execute from authenticated on either affected function -- they retain access", () => {
  for (const fn of AFFECTED_FUNCTIONS) {
    assert.ok(
      !new RegExp(`revoke execute on function public\\.${fn.replace(/[()]/g, "\\$&")} from authenticated;`).test(executable),
      `${fn} must not have authenticated revoked`
    );
  }
  assert.ok(!/from authenticated/i.test(executable), "this migration must never touch authenticated at all");
});

test("mock_get_question is not touched -- production evidence confirms its anon-absent state is already correct, and no other function from migration 106/107 is mentioned unnecessarily", () => {
  assert.ok(!executable.includes("mock_get_question"), "migration 108 must not mention mock_get_question -- it is scoped exclusively to the 2 affected functions");
});

test("mock_cycle_is_open is not touched -- it was already corrected by migration 086 and confirmed still ungranted to anon/authenticated by the Founder's own targeted query", () => {
  assert.ok(!executable.includes("mock_cycle_is_open"));
});

test("does not touch postgres or service_role privileges anywhere", () => {
  assert.ok(!/from\s+postgres/i.test(executable));
  assert.ok(!/from\s+service_role/i.test(executable));
});

test("does not touch any of the 8 proven 070/072/074/075 RPCs, or any migration-085/086 cycle function -- no grant/revoke statement mentions them, no function body redefined", () => {
  for (const fn of [
    "mock_create_attempt",
    "mock_start_attempt",
    "mock_submit_answer",
    "mock_submit_attempt",
    "mock_get_active_form",
    "mock_get_attempt_manifest",
    "mock_set_flag",
    "mock_score_attempt",
    "mock_release_report",
    "mock_start_new_cycle",
    "mock_authorise_extra_cycle",
    "mock_create_cycle_attempt",
  ]) {
    assert.ok(!executable.includes(fn), `migration 108 must not mention ${fn} at all`);
  }
});

test("does not redefine any function body -- permission correction only", () => {
  assert.ok(!/create or replace function/i.test(executable));
});

test("touches no table, column, RLS policy, or eligibility_status", () => {
  assert.ok(!/create table|alter table|drop table|create policy|drop policy|alter policy|enable row level security/i.test(executable));
  assert.ok(!/eligibility_status/i.test(executable));
  assert.ok(!/insert into|update |delete from/i.test(executable));
});

test("does not mention ali_mock_form, ali_mock_attempt, ali_question_bank, Practice, English, or Writing -- privilege correction only, no content/structural change", () => {
  assert.ok(!/ali_mock_form|ali_mock_attempt|ali_question_bank|practice_eligible|mock_eligible/i.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header, and explicitly names its dependency on migrations 106/107", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migrations 106 and[\s\S]*?107 have already been applied/);
});

test("migrations 106 and 107 are not modified by this correction (forward-only, honest migration history preserved)", () => {
  const migration106 = fs.readFileSync("supabase/migrations/106_mock_mathematics_grouped_question_learner_rendering.sql", "utf8");
  const migration107 = fs.readFileSync("supabase/migrations/107_mock_full_mock_cycle_attempt_learner_compatibility.sql", "utf8");
  assert.match(migration106, /NOT APPLIED\. Generated for Founder review/);
  assert.match(migration107, /NOT APPLIED\. Generated for Founder review/);
  // Their own original revoke/grant statements remain exactly as authored --
  // this correction is additive, not a rewrite of either prior file.
  assert.match(migration106, /revoke all on function public\.mock_get_attempt_grouping\(uuid\) from public;/);
  assert.match(migration106, /grant execute on function public\.mock_get_attempt_grouping\(uuid\) to authenticated;/);
  assert.match(migration107, /revoke all on function public\.mock_get_open_cycle\(\) from public;/);
  assert.match(migration107, /grant execute on function public\.mock_get_open_cycle\(\) to authenticated;/);
});

test("root-cause reconciliation: the migration's own header explicitly names the recurring defect class (071/073/086) and explains why mock_get_question was unaffected (CREATE OR REPLACE preserves an existing ACL) while the two new functions were not", () => {
  assert.match(sql, /071/);
  assert.match(sql, /073/);
  assert.match(sql, /086/);
  assert.match(sql, /ALTER DEFAULT PRIVILEGES/);
  assert.ok(/preserves[\s\S]*ACL/i.test(sql) || /ACL[\s\S]*preserves/i.test(sql));
});
