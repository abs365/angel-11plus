import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Completion Increment 009 — migration 202's additive amendment
 * verification for eng-pc005-writing-somethingnew.
 */

const sql = fs.readFileSync("supabase/migrations/202_programme_completion_inc009_somethingnew_amendment_verification.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("exactly 1 insert against ali_family_review, review_type = 'amendment_verification'", () => {
  const inserts = [...executable.matchAll(/insert into public\.ali_family_review/g)];
  assert.equal(inserts.length, 1);
  assert.match(executable, /'amendment_verification'/);
});

test("targets mock-writing-wc01a-somethingnew, reviewer FOUNDER, decision approved (the verification record itself, not the amendment decision)", () => {
  assert.match(executable, /'writing_prompt', 'mock-writing-wc01a-somethingnew', 'FOUNDER'/);
  const decisionMatch = executable.match(/select 'writing_prompt', 'mock-writing-wc01a-somethingnew', 'FOUNDER',\s*\n\s*'(\w+)'::public\.family_review_decision/);
  assert.ok(decisionMatch);
  assert.equal(decisionMatch![1], "approved");
});

test("fails closed unless the exact disclosure sentence is already present in a prior approved_with_amendment row -- verified before the insert, not assumed", () => {
  const guard = executable.match(/do \$\$[\s\S]*?end \$\$;/)![0];
  assert.match(guard, /decision = 'approved_with_amendment'/);
  assert.match(guard, /Prospective self-projection is an Angel-original extrapolation/);
  assert.match(guard, /raise exception/);
});

test("does not alter or duplicate migration 201's own approved_with_amendment row: no UPDATE anywhere, and this insert's own decision is 'approved' (the verification), not 'approved_with_amendment' again", () => {
  assert.ok(!/update\s+public\./i.test(executable));
});

test("idempotent via a 'where not exists' guard", () => {
  assert.match(executable, /where not exists \(/);
});

test("wrapped in a single begin/commit transaction, not-applied disclosure present", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
  assert.match(sql, /NOT APPLIED\. Founder must apply/);
});
