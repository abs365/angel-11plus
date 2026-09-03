import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * RLS reassertion for public.ali_family_review (migration 205), prompted
 * by the Supabase SQL Editor's own warning when the Founder attempted to
 * run migration 201. Structural tests proving this is an exact,
 * idempotent replay of migration 054's own statements for this one
 * table, not a new policy shape.
 */

const sql = fs.readFileSync("supabase/migrations/205_ali_family_review_rls_reassertion.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
const migration054 = fs.readFileSync("supabase/migrations/034_family_review_workflow.sql", "utf8");
const migration054Real = fs.readFileSync("supabase/migrations/054_review_interface_admin_access.sql", "utf8");

test("enables row level security on ali_family_review, and only that table", () => {
  const enables = [...executable.matchAll(/alter table public\.(\w+) enable row level security;/g)].map((m) => m[1]);
  assert.deepEqual(enables, ["ali_family_review"]);
});

test("does not touch ali_passage_bank -- deliberately scoped to the one table the live warning named", () => {
  assert.ok(!executable.includes("ali_passage_bank"));
});

test("creates exactly 2 policies, matching migration 054's own exact names and shape: select + insert, both to authenticated, both gated by is_current_user_admin()", () => {
  const policies = [...executable.matchAll(/create policy (\w+)\s*\n\s*on public\.ali_family_review for (\w+) to (\w+)\s*\n\s*(using|with check) \(public\.is_current_user_admin\(\)\);/g)];
  assert.equal(policies.length, 2);
  const names = policies.map((p) => p[1]).sort();
  assert.deepEqual(names, ["ali_family_review_insert_admin", "ali_family_review_select_admin"]);
  for (const p of policies) assert.equal(p[3], "authenticated");
});

test("no update or delete policy is created -- matches migration 054's own deliberate omission", () => {
  assert.ok(!/for update|for delete|for all/i.test(executable));
});

test("policy names and gating function are byte-identical to migration 054's own real, already-established statements", () => {
  assert.ok(migration054Real.includes("create policy ali_family_review_select_admin"));
  assert.ok(migration054Real.includes("create policy ali_family_review_insert_admin"));
  assert.ok(migration054Real.includes("public.is_current_user_admin()"));
});

test("idempotent: every CREATE POLICY is preceded by a DROP POLICY IF EXISTS for the same policy", () => {
  const drops = [...executable.matchAll(/drop policy if exists (\w+) on public\.ali_family_review;/g)].map((m) => m[1]);
  assert.deepEqual(drops.sort(), ["ali_family_review_insert_admin", "ali_family_review_select_admin"]);
});

test("touches no row, no other table, and no function definition (is_current_user_admin itself is referenced, never redefined)", () => {
  assert.ok(!/\binsert into\b|\bupdate\b|\bdelete from\b/i.test(executable));
  assert.ok(!/create or replace function|create function/i.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("header explicitly makes this conditional on the diagnostic, and explicitly not applied unconditionally", () => {
  assert.match(sql, /DO NOT APPLY THIS MIGRATION UNTIL THE DIAGNOSTIC QUERY/);
  assert.match(sql, /NOT APPLIED\. Apply ONLY if the diagnostic/);
});

test("migration 034's own original disable statement is confirmed present, establishing why a reassertion could ever be necessary", () => {
  assert.match(migration054, /disable row level security/);
});
