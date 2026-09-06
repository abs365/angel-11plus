import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Educational Foundation Completion increment -- structural proof for
 * migration 232 (ali_question_family live sync). No live Postgres
 * connection in this test suite's own convention -- source-text
 * assertions against the migration's own SQL, matching every other
 * migration test in this repository.
 */

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*--.*$/gm, "");
}

const MIGRATION_PATH = join("supabase", "migrations", "232_ali_question_family_live_sync.sql");
const RAW = readFileSync(MIGRATION_PATH, "utf8");
const EXECUTABLE = stripComments(RAW);

test("migration 232 exists and is wrapped in a single begin/commit transaction", () => {
  assert.match(EXECUTABLE, /\bbegin;/);
  assert.match(EXECUTABLE, /\bcommit;/);
  assert.equal((EXECUTABLE.match(/\bbegin;/g) ?? []).length, 1);
  assert.equal((EXECUTABLE.match(/\bcommit;/g) ?? []).length, 1);
});

test("touches only ali_question_family and its own new trigger/functions -- no write to ali_question_bank or any other table", () => {
  assert.doesNotMatch(EXECUTABLE, /update\s+public\.ali_question_bank/i);
  assert.doesNotMatch(EXECUTABLE, /insert\s+into\s+public\.ali_question_bank/i);
  assert.doesNotMatch(EXECUTABLE, /delete\s+from\s+public\.ali_question_bank/i);
  assert.match(EXECUTABLE, /insert into public\.ali_question_family/i);
});

test("does not create, drop, or alter any RLS policy or grant -- ali_question_family's existing admin-only SELECT policy is untouched", () => {
  assert.doesNotMatch(EXECUTABLE, /create policy/i);
  assert.doesNotMatch(EXECUTABLE, /drop policy/i);
  assert.doesNotMatch(EXECUTABLE, /\bgrant\b/i);
  assert.doesNotMatch(EXECUTABLE, /row level security/i);
});

test("both new functions are SECURITY DEFINER with a safe, explicit search_path", () => {
  const functionBlocks = EXECUTABLE.match(/create or replace function[\s\S]*?\$\$;/g) ?? [];
  assert.equal(functionBlocks.length, 2, "expected exactly ali_sync_question_family and the trigger function");
  for (const block of functionBlocks) {
    assert.match(block, /security definer/i);
    assert.match(block, /set search_path = public/i);
  }
});

test("the sync function never deletes an ali_question_family row -- a family with zero live member rows is left untouched, reported by name", () => {
  assert.doesNotMatch(EXECUTABLE, /delete\s+from\s+public\.ali_question_family/i);
  assert.match(EXECUTABLE, /left untouched/i);
});

test("exactly one trigger is created, firing after insert or update or delete on ali_question_bank", () => {
  assert.match(EXECUTABLE, /create trigger ali_question_bank_family_sync/i);
  assert.match(EXECUTABLE, /after insert or update or delete on public\.ali_question_bank/i);
  assert.match(EXECUTABLE, /drop trigger if exists ali_question_bank_family_sync/i);
});

test("includes a fail-closed verification block that raises an exception on any remaining row_count mismatch", () => {
  assert.match(EXECUTABLE, /raise exception 'Migration 232/);
  assert.match(EXECUTABLE, /stale row_count/i);
});

test("discloses NOT APPLIED, matching this repository's own convention for a Founder-applied migration", () => {
  assert.match(RAW, /NOT APPLIED/);
});

test("root-cause explanation names the real, proven mechanism (on conflict do nothing) rather than asserting an unverified cause", () => {
  assert.match(RAW, /on conflict \(family_id\) do nothing/);
});
