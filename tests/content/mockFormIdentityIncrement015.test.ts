import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Completion Increment 015 — form-identity architecture
 * (migrations 213/214) and its interaction with the already-frozen
 * Reading Comprehension Mock 1 (migration 212) and Mathematics Mock 1.
 *
 * CODE/SQL VERIFIED, NOT PRODUCTION VERIFIED (same disclosed limitation
 * as every migration-content test in this repository — no live database
 * connection this session).
 */

const migration212 = fs.readFileSync("supabase/migrations/212_reading_comprehension_mock_1_freeze.sql", "utf8");
const migration213 = fs.readFileSync("supabase/migrations/213_mathematics_mock_1_display_name.sql", "utf8");
const migration214 = fs.readFileSync("supabase/migrations/214_mock_get_active_form_display_name.sql", "utf8");

function stripComments(sql: string): string {
  return sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");
}

test("migration 213 (Mathematics Mock 1 displayName) never touches question_manifest, active, subject, or attempt_type -- only composition_provenance", () => {
  const executable = stripComments(migration213);
  assert.doesNotMatch(executable, /set\s+question_manifest/i);
  assert.doesNotMatch(executable, /set\s+active\s*=/i);
  assert.doesNotMatch(executable, /set\s+subject\s*=/i);
  assert.doesNotMatch(executable, /set\s+attempt_type\s*=/i);
  assert.match(executable, /set\s+composition_provenance\s*=\s*jsonb_set/i);
});

test("migration 213 only sets displayName additively via jsonb_set (a merge, not a full column overwrite)", () => {
  assert.match(migration213, /jsonb_set\(composition_provenance, '\{displayName\}'/);
});

test("migration 213 targets exactly the Mathematics Mock 1 form id, no other form", () => {
  const executable = stripComments(migration213);
  const idMatches = executable.match(/'mathematics-mock-1'/g) ?? [];
  assert.ok(idMatches.length > 0, "must reference mathematics-mock-1");
  assert.doesNotMatch(executable, /'reading-comprehension-mock-1'/);
});

test("migration 213 is guarded: does not blindly assume the form exists (checks v_row_count before acting)", () => {
  assert.match(migration213, /v_row_count\s*=\s*0/);
  assert.match(migration213, /v_row_count\s*<>\s*1/);
});

test("migration 214 (mock_get_active_form extension) is read-only: no INSERT/UPDATE/DELETE against any table", () => {
  const executable = stripComments(migration214);
  assert.doesNotMatch(executable, /\binsert\s+into\b/i);
  assert.doesNotMatch(executable, /\bupdate\s+public\./i);
  assert.doesNotMatch(executable, /\bdelete\s+from\b/i);
  assert.match(executable, /select\s+f\.id,\s*f\.attempt_type,\s*f\.composition_provenance\s*->>\s*'displayName'/i);
});

test("migration 214 preserves the original access boundary: authenticated only, explicitly revoked from anon and public", () => {
  assert.match(migration214, /revoke all on function public\.mock_get_active_form\(text\) from public;/);
  assert.match(migration214, /grant execute on function public\.mock_get_active_form\(text\) to authenticated;/);
  assert.match(migration214, /revoke execute on function public\.mock_get_active_form\(text\) from anon;/);
});

test("migration 214 preserves the original filtering logic: active=true, matching attempt_type, most recent first", () => {
  assert.match(migration214, /where\s+f\.active = true\s+and\s+f\.attempt_type = p_attempt_type/i);
  assert.match(migration214, /order by f\.created_at desc\s+limit 1/i);
});

test("migration 212's composition_provenance already carries displayName='Reading Comprehension Mock 1' -- no change to 212 was required by the identity mechanism", () => {
  assert.match(migration212, /"displayName":"Reading Comprehension Mock 1"/);
});

test("212, 213, and 214 are all explicitly marked NOT APPLIED", () => {
  for (const [name, sql] of [["212", migration212], ["213", migration213], ["214", migration214]] as const) {
    assert.match(sql, /NOT APPLIED/, `migration ${name} must disclose it is not applied`);
  }
});

test("neither 213 nor 214 references any Reading/English content id or the Reading Comprehension Mock 1 form id -- the Mathematics identity fix and the RPC extension are content-neutral", () => {
  for (const [name, sql] of [["213", migration213], ["214", migration214]] as const) {
    const executable = stripComments(sql);
    assert.doesNotMatch(executable, /eng-inc00[12]-|mock-eng-boathouse|reading-comprehension-mock-1/, `migration ${name} must not reference Reading content`);
  }
});

test("213 and 214 never touch Mathematics Mock 1's educational content (question ids, marks, manifest) -- identity-only changes", () => {
  for (const [name, sql] of [["213", migration213], ["214", migration214]] as const) {
    const executable = stripComments(sql);
    assert.doesNotMatch(executable, /'mock-mr\d/, `migration ${name} must not reference any Mathematics question id`);
  }
});
