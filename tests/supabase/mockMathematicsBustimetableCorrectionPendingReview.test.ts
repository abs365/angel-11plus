import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Structural Capacity, Wave 002 — Bus Timetable Correction
 * Re-Review Registration (Decision 185/186). Structural tests against
 * migration 128's own SQL text, plus the critical marker-collision
 * regression this session's own drafting caught and avoided: a new
 * marker that merely appended a suffix to the old WAVE002 marker would
 * still satisfy the old section's own `.includes()` filter, risking the
 * original section's button picking up this new pending row and
 * mis-tagging a fresh decision under the wrong marker.
 */

const sql = fs.readFileSync("supabase/migrations/128_mock_mathematics_bustimetable_correction_pending_review.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const OLD_MARKER = "MOCK-STRUCTURAL-CAPACITY-WAVE002";
const NEW_MARKER = "MOCK-BUSTIMETABLE-CORRECTION001";

test("registers exactly mock-mr10-bustimetable (all 4 question IDs) as pending_independent_review", () => {
  const inserts = [...executable.matchAll(/insert into public\.ali_family_review/g)];
  assert.equal(inserts.length, 1);
  assert.match(executable, /'question_family', 'mock-mr10-bustimetable', 'UNASSIGNED'/);
  assert.match(executable, /'pending_independent_review'::public\.family_review_decision/);
  assert.match(executable, /mock-mr10-bustimetable-01, mock-mr10-bustimetable-02, mock-mr10-bustimetable-03, mock-mr10-bustimetable-04/);
});

test("mock-mr13-craftstall is never referenced anywhere in this migration's own executable SQL", () => {
  assert.ok(!executable.includes("mock-mr13-craftstall"));
});

test("REGRESSION: the new marker string does NOT contain the old WAVE002 marker as a substring -- the exact collision this session's drafting caught and fixed", () => {
  assert.ok(!NEW_MARKER.includes(OLD_MARKER), "the new marker must not contain the old marker as a substring, or the old section's .includes() filter would wrongly match this new pending row");
  assert.match(executable, new RegExp(NEW_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("review_type is mock_maths_independent_review, reviewer is explicitly UNASSIGNED", () => {
  assert.ok(executable.includes("'mock_maths_independent_review'"));
  assert.match(executable, /'UNASSIGNED'/);
  assert.ok(!/Ayobami|'Founder'/.test(executable));
});

test("notes explicitly disclose that the prior approval covered the uncorrected wording and is not carried forward as approval of the corrected content", () => {
  assert.match(sql, /prior approval[\s\S]*?covered the UNCORRECTED wording/);
  assert.match(sql, /not carried forward as approval of this corrected content/);
});

test("idempotency guard: where not exists checks family_id + decision + review_type + notes together", () => {
  assert.match(executable, /where not exists \(/);
  assert.match(executable, /where family_id = 'mock-mr10-bustimetable' and decision = 'pending_independent_review'/);
  assert.match(executable, /and review_type = 'mock_maths_independent_review'/);
});

test("no ali_question_bank mutation anywhere -- this migration only inserts into ali_family_review", () => {
  const insertTargets = [...executable.matchAll(/insert into\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["ali_family_review"]));
  assert.ok(!executable.includes("ali_question_bank"));
});

test("does not delete, update, or otherwise mutate any existing ali_family_review row -- INSERT only", () => {
  assert.ok(!/\bupdate\s+public\.ali_family_review\b/i.test(executable));
  assert.ok(!/\bdelete from\s+public\.ali_family_review\b/i.test(executable));
});

test("no ali_mock_form, RPC, RLS, or grant mutation anywhere", () => {
  assert.ok(!executable.includes("ali_mock_form"));
  assert.ok(!/create (or replace )?function|create policy|alter policy|\bgrant\b|\brevoke\b/i.test(executable));
});

test("wrapped in a single begin/commit transaction, header discloses NOT APPLIED and dependency on migration 127", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
  assert.match(sql, /NOT APPLIED\. Founder must apply/);
  assert.match(sql, /migration 127/);
});
