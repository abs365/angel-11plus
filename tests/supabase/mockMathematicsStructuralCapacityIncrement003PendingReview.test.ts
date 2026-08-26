import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Structural Capacity, Authoring Increment 003 — Pending
 * Review (Decision 191/192). Structural tests against migration 132's
 * own SQL text, mirroring migration 126's own established pending-review
 * placeholder pattern.
 */

const sql = fs.readFileSync("supabase/migrations/132_mock_mathematics_structural_capacity_increment003_pending_review.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("registers exactly one family, mock-mr09-funrun, as pending_independent_review", () => {
  const inserts = [...executable.matchAll(/insert into public\.ali_family_review/g)];
  assert.equal(inserts.length, 1);
  assert.match(executable, /'question_family', 'mock-mr09-funrun', 'UNASSIGNED'/);
  assert.equal((executable.match(/'pending_independent_review'::public\.family_review_decision/g) || []).length, 1);
});

test("review_type is mock_maths_independent_review, using the new INCREMENT003 marker (distinct from INC001/WAVE002/CORRECTION001)", () => {
  // Once in the INSERT's own select list, once in the idempotency
  // guard's WHERE clause.
  assert.equal((executable.match(/'mock_maths_independent_review'/g) || []).length, 2);
  assert.match(executable, /MOCK-STRUCTURAL-CAPACITY-INCREMENT003/);
  assert.ok(!executable.includes("MOCK-STRUCTURAL-CAPACITY-INC001"));
  assert.ok(!executable.includes("MOCK-STRUCTURAL-CAPACITY-WAVE002"));
  assert.ok(!executable.includes("MOCK-BUSTIMETABLE-CORRECTION001"));
});

test("marker does not collide as a substring with any prior marker, and no prior marker is a substring of it", () => {
  const marker = "MOCK-STRUCTURAL-CAPACITY-INCREMENT003";
  const priorMarkers = ["MOCK-STRUCTURAL-CAPACITY-INC001", "MOCK-STRUCTURAL-CAPACITY-WAVE002", "MOCK-BUSTIMETABLE-CORRECTION001"];
  for (const prior of priorMarkers) {
    assert.ok(!marker.includes(prior), `${marker} must not contain ${prior} as a substring`);
    assert.ok(!prior.includes(marker), `${prior} must not contain ${marker} as a substring`);
  }
});

test("reviewer is explicitly UNASSIGNED, never a fabricated identity", () => {
  const unassignedMatches = [...executable.matchAll(/'UNASSIGNED'/g)];
  assert.equal(unassignedMatches.length, 1);
  assert.ok(!/Ayobami|'Founder'/.test(executable));
});

test("notes carry the exact batch marker and all four question IDs", () => {
  assert.match(executable, /MOCK-STRUCTURAL-CAPACITY-INCREMENT003 new content review: mock-mr09-funrun/);
  assert.match(executable, /mock-mr09-funrun-01, mock-mr09-funrun-02, mock-mr09-funrun-03, mock-mr09-funrun-04/);
});

test("idempotency guard: where not exists checks family_id + decision + review_type + notes together", () => {
  const guards = [...executable.matchAll(/where not exists \(/g)];
  assert.equal(guards.length, 1);
  assert.match(executable, /where family_id = 'mock-mr09-funrun' and decision = 'pending_independent_review'/);
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

test("wrapped in a single begin/commit transaction, header discloses NOT APPLIED and dependency on migration 131", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
  assert.match(sql, /NOT APPLIED\. Founder must apply/);
  assert.match(sql, /migration 131/);
});
