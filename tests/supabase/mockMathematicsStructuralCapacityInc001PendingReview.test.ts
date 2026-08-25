import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock Structural Capacity, Authoring Increment 001 —
 * Pending Review (Decision 177/178). Structural tests against migration
 * 120's own SQL text, mirroring migrations 089/092/096/110/114's own
 * established pending-review placeholder pattern exactly.
 */

const sql = fs.readFileSync("supabase/migrations/120_mock_mathematics_structural_capacity_increment001_pending_review.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("registers exactly one family, mock-mr06-linkedvalues, as pending_independent_review", () => {
  const inserts = [...executable.matchAll(/insert into public\.ali_family_review/g)];
  assert.equal(inserts.length, 1);
  assert.match(executable, /'question_family', 'mock-mr06-linkedvalues', 'UNASSIGNED'/);
  assert.match(executable, /'pending_independent_review'::public\.family_review_decision/);
});

test("review_type is mock_maths_independent_review -- no new review_target_type or review_type value introduced", () => {
  assert.match(executable, /'mock_maths_independent_review'/);
});

test("reviewer is explicitly UNASSIGNED, never a fabricated identity", () => {
  assert.match(executable, /'UNASSIGNED'/);
  assert.ok(!/Ayobami|'Founder'/.test(executable));
});

test("notes carry the exact batch marker and all 3 question IDs", () => {
  assert.match(executable, /MOCK-STRUCTURAL-CAPACITY-INC001 new content review: mock-mr06-linkedvalues/);
  assert.match(executable, /mock-mr06-linkedvalues-01, mock-mr06-linkedvalues-02, mock-mr06-linkedvalues-03/);
});

test("idempotency guard: where not exists checks family_id + decision + review_type + notes together", () => {
  assert.match(executable, /where not exists \(/);
  assert.match(executable, /where family_id = 'mock-mr06-linkedvalues' and decision = 'pending_independent_review'/);
  assert.match(executable, /and review_type = 'mock_maths_independent_review'/);
  assert.match(executable, /and notes = 'MOCK-STRUCTURAL-CAPACITY-INC001/);
});

test("no eligibility_status is ever touched -- this migration only inserts into ali_family_review", () => {
  const insertTargets = [...executable.matchAll(/insert into\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["ali_family_review"]));
  assert.ok(!/\bupdate\s+public\./i.test(executable));
  assert.ok(!executable.includes("ali_question_bank"));
});

test("no ali_mock_form or ali_mock_attempt mutation anywhere", () => {
  for (const table of ["ali_mock_form", "ali_mock_attempt"]) {
    assert.ok(!executable.includes(table));
  }
});

test("wrapped in a single begin/commit transaction, header discloses NOT APPLIED and dependency on migration 119", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
  assert.match(sql, /NOT APPLIED\. Founder must apply/);
  assert.match(sql, /migration 119/);
});
