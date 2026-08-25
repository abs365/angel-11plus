import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock Structural Capacity, Authoring Wave 002 —
 * Pending Review (Decision 184/185). Structural tests against migration
 * 126's own SQL text, mirroring migration 120's own established
 * pending-review placeholder pattern.
 */

const sql = fs.readFileSync("supabase/migrations/126_mock_mathematics_structural_capacity_wave002_pending_review.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("registers exactly two families, mock-mr10-bustimetable and mock-mr13-craftstall, as pending_independent_review", () => {
  const inserts = [...executable.matchAll(/insert into public\.ali_family_review/g)];
  assert.equal(inserts.length, 2);
  assert.match(executable, /'question_family', 'mock-mr10-bustimetable', 'UNASSIGNED'/);
  assert.match(executable, /'question_family', 'mock-mr13-craftstall', 'UNASSIGNED'/);
  assert.equal((executable.match(/'pending_independent_review'::public\.family_review_decision/g) || []).length, 2);
});

test("review_type is mock_maths_independent_review for both, using the new WAVE002 marker (distinct from INC001)", () => {
  // Once in the INSERT's own select list, once in the idempotency
  // guard's WHERE clause, per family (2 families x 2 = 4).
  assert.equal((executable.match(/'mock_maths_independent_review'/g) || []).length, 4);
  assert.match(executable, /MOCK-STRUCTURAL-CAPACITY-WAVE002/);
  assert.ok(!executable.includes("MOCK-STRUCTURAL-CAPACITY-INC001"));
});

test("reviewer is explicitly UNASSIGNED for both, never a fabricated identity", () => {
  const unassignedMatches = [...executable.matchAll(/'UNASSIGNED'/g)];
  assert.equal(unassignedMatches.length, 2);
  assert.ok(!/Ayobami|'Founder'/.test(executable));
});

test("notes carry the exact batch marker and all question IDs for each family", () => {
  assert.match(executable, /MOCK-STRUCTURAL-CAPACITY-WAVE002 new content review: mock-mr10-bustimetable/);
  assert.match(executable, /mock-mr10-bustimetable-01, mock-mr10-bustimetable-02, mock-mr10-bustimetable-03, mock-mr10-bustimetable-04/);
  assert.match(executable, /MOCK-STRUCTURAL-CAPACITY-WAVE002 new content review: mock-mr13-craftstall/);
  assert.match(executable, /mock-mr13-craftstall-01, mock-mr13-craftstall-02, mock-mr13-craftstall-03/);
});

test("idempotency guards: where not exists checks family_id + decision + review_type + notes together, once per family", () => {
  const guards = [...executable.matchAll(/where not exists \(/g)];
  assert.equal(guards.length, 2);
  assert.match(executable, /where family_id = 'mock-mr10-bustimetable' and decision = 'pending_independent_review'/);
  assert.match(executable, /where family_id = 'mock-mr13-craftstall' and decision = 'pending_independent_review'/);
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

test("wrapped in a single begin/commit transaction, header discloses NOT APPLIED and dependency on migration 125", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
  assert.match(sql, /NOT APPLIED\. Founder must apply/);
  assert.match(sql, /migration 125/);
});
