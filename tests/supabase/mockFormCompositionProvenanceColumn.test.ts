import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock — ali_mock_form Composition Provenance Column
 * (Decision 210 Part 9, Decision 212). Structural tests against
 * migration 146's own SQL text.
 */

const sql = fs.readFileSync("supabase/migrations/146_mock_form_composition_provenance_column.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("adds exactly one new, nullable, additive jsonb column to ali_mock_form, idempotently", () => {
  assert.match(executable, /alter table public\.ali_mock_form\s*\n\s*add column if not exists composition_provenance jsonb;/);
});

test("no NOT NULL, no DEFAULT, no CHECK constraint on the new column -- purely additive, matching question_manifest's own unconstrained convention", () => {
  const alterBlock = executable.match(/alter table public\.ali_mock_form[\s\S]*?composition_provenance jsonb;/)![0];
  assert.ok(!/not null/i.test(alterBlock));
  assert.ok(!/default/i.test(alterBlock));
  assert.ok(!/check\s*\(/i.test(alterBlock));
});

test("a column comment documenting the field is present, referencing lib/ali/mockFreezeManifest.ts", () => {
  assert.match(executable, /comment on column public\.ali_mock_form\.composition_provenance is/);
  assert.match(sql, /lib\/ali\/mockFreezeManifest\.ts/);
});

test("no INSERT/UPDATE/DELETE against ali_mock_form anywhere in this migration -- schema change only, no data mutation", () => {
  assert.ok(!/insert into public\.ali_mock_form/i.test(executable));
  assert.ok(!/update public\.ali_mock_form/i.test(executable));
  assert.ok(!/delete from public\.ali_mock_form/i.test(executable));
});

test("no other table is touched by this migration", () => {
  const alterTargets = [...executable.matchAll(/alter table\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(alterTargets), new Set(["ali_mock_form"]));
});

test("no RPC/function created or altered, no RLS policy or grant", () => {
  assert.ok(!/create (or replace )?function/i.test(executable));
  assert.ok(!/create policy|alter policy/i.test(executable));
  assert.ok(!/\bgrant\b|\brevoke\b/i.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
});

test("header documents that active remains the sole freeze/activation gate -- no new approval-state column is added", () => {
  assert.match(sql, /`active`[\s\S]*?remains the sole freeze\/activation gate/);
});
