import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Stage 3, Increment 003 — structural tests against migration 078's own
 * SQL text, matching the established convention
 * (tests/supabase/mockScoringTrustBoundaryCorrection.test.ts and others):
 * string/regex assertions against the raw migration file, never a live
 * database. This migration is drafted for Founder/reviewer application
 * and has not been applied.
 */

const sql = fs.readFileSync("supabase/migrations/078_mr04_content_depth_foundation.sql", "utf8");
const executable = sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");

test("wrapped in a single begin/commit transaction", () => {
  assert.match(executable, /^\s*begin;/m);
  assert.match(executable, /^\s*commit;/m);
});

test("NEW CONTENT BECOMES ELIGIBLE ONLY THROUGH THE APPROVED STATE: every inserted row is 'provisional' -- never 'practice_eligible' or 'mock_eligible'", () => {
  const eligibilityValues = [...executable.matchAll(/'angel_original', '(\w+)'/g)].map((m) => m[1]);
  assert.equal(eligibilityValues.length, 11, "expected exactly 11 rows");
  for (const v of eligibilityValues) assert.equal(v, "provisional");
});

test("exactly 11 INSERT statements, one per new question, each idempotent via ON CONFLICT DO NOTHING", () => {
  const inserts = [...executable.matchAll(/insert into public\.ali_question_bank/gi)];
  assert.equal(inserts.length, 11);
  const conflicts = [...executable.matchAll(/on conflict \(id\) do nothing/gi)];
  assert.equal(conflicts.length, 11);
});

test("NO PRACTICE/MOCK BOUNDARY REGRESSION: no UPDATE, DELETE, or eligibility_status='mock_eligible' anywhere in this migration", () => {
  assert.ok(!/\bupdate\s+public\./i.test(executable), "this migration must only ever INSERT -- never touch existing rows");
  assert.ok(!/\bdelete\s+from/i.test(executable));
  assert.ok(!executable.includes("mock_eligible"));
});

test("creates no table, column, policy, or trigger -- content-only migration", () => {
  assert.ok(!/create\s+table/i.test(executable));
  assert.ok(!/alter\s+table/i.test(executable));
  assert.ok(!/create\s+policy|drop\s+policy/i.test(executable));
  assert.ok(!/create\s+trigger|drop\s+trigger/i.test(executable));
});

test("every row targets one of the three approved skills, and only those three", () => {
  const skills = [...executable.matchAll(/'maths', '(QT-MR-\d+)'/g)].map((m) => m[1]);
  assert.equal(skills.length, 11);
  for (const s of skills) assert.ok(["QT-MR-04", "QT-MR-10", "QT-MR-13"].includes(s));
});

test("every row is content_difficulty='hard' -- the confirmed-missing tier, never a different value", () => {
  const difficulties = [...executable.matchAll(/array\['csse'\], '(\w+)', 'short-answer'/g)].map((m) => m[1]);
  assert.equal(difficulties.length, 11);
  for (const d of difficulties) assert.equal(d, "hard");
});

test("family_id matches one of the three declared new families for every row, never null and never an existing family", () => {
  const familyIds = [...executable.matchAll(/\n\s*'(mr04-[a-z-]+)', 'angel_original'/g)].map((m) => m[1]);
  assert.equal(familyIds.length, 11);
  const allowed = new Set(["mr04-reverse-percentage", "mr04-time-reverse", "mr04-bv-convert"]);
  for (const f of familyIds) assert.ok(allowed.has(f), `unexpected family_id: ${f}`);
});

test("mentions the review-boundary discipline explicitly in its own header comment (raw file, not the comment-stripped executable)", () => {
  assert.ok(sql.toUpperCase().includes("NOT APPLIED"));
  assert.ok(sql.toLowerCase().includes("review"));
});
