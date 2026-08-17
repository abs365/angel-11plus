import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Increment 008D, Post-Migration Production Verification —
 * hardening fix for a live-discovered finding: a bare anon-key call to
 * each of the 5 SECURITY DEFINER functions reached real application
 * logic rather than a Postgres permission error. This migration
 * explicitly revokes execute from anon on all 5.
 */

const sql = fs.readFileSync("supabase/migrations/071_mock_attempt_functions_revoke_anon.sql", "utf8");
const executable = sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");

test("revokes execute from anon on all 5 mock attempt functions, exact signatures matching migration 070", () => {
  const expected = [
    "mock_create_attempt(text, text)",
    "mock_start_attempt(uuid, integer)",
    "mock_get_question(uuid, text)",
    "mock_submit_answer(uuid, text, jsonb)",
    "mock_submit_attempt(uuid)",
  ];
  for (const fn of expected) {
    assert.match(executable, new RegExp(`revoke execute on function public\\.${fn.replace(/[()]/g, "\\$&")} from anon;`));
  }
});

test("touches no table, no RLS policy, no eligibility_status, no other schema object", () => {
  assert.ok(!/create table|alter table|drop table/i.test(executable));
  assert.ok(!/create policy|drop policy/i.test(executable));
  assert.ok(!/set\s+eligibility_status/i.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});
