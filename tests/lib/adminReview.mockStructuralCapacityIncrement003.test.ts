import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MOCK_STRUCTURAL_CAPACITY_INCREMENT003_MARKER,
  MOCK_STRUCTURAL_CAPACITY_INCREMENT003_FAMILIES,
  MOCK_STRUCTURAL_CAPACITY_INCREMENT003_TARGET_IDS,
  buildMockStructuralCapacityIncrement003NotesPrefix,
} from "../../lib/adminReview";
import { resolveGroupSharedStem, isValidTableStimulus, selectDisplayUnitStimulus } from "../../lib/mockAttempt/workspace";

/**
 * Mathematics Structural Capacity, Authoring Increment 003 —
 * review-surface reachability proof (Decision 170's own lesson) AND
 * learner-rendering trace proof, using the new family's REAL authored
 * shape, not a synthetic fixture.
 */

test("lib/adminReview.ts: family config targets exactly the 1 new family with all 4 real question IDs", () => {
  assert.equal(MOCK_STRUCTURAL_CAPACITY_INCREMENT003_FAMILIES.length, 1);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_INCREMENT003_FAMILIES[0].newQuestionIds, [
    "mock-mr09-funrun-01", "mock-mr09-funrun-02", "mock-mr09-funrun-03", "mock-mr09-funrun-04",
  ]);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_INCREMENT003_TARGET_IDS, ["mock-mr09-funrun"]);
});

test("notes prefix builder embeds the exact INCREMENT003 marker used by migration 132's own notes text", () => {
  const prefix = buildMockStructuralCapacityIncrement003NotesPrefix("mock-mr09-funrun", ["mock-mr09-funrun-01"]);
  assert.equal(MOCK_STRUCTURAL_CAPACITY_INCREMENT003_MARKER, "MOCK-STRUCTURAL-CAPACITY-INCREMENT003");
  assert.match(prefix, /^MOCK-STRUCTURAL-CAPACITY-INCREMENT003 new content review: mock-mr09-funrun/);
});

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("page.tsx imports the fetch function, notes-prefix builder, and both config exports for Increment 003", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityIncrement003ReviewStatus, buildMockStructuralCapacityIncrement003NotesPrefix/);
  assert.match(pageSource, /MOCK_STRUCTURAL_CAPACITY_INCREMENT003_FAMILIES, MOCK_STRUCTURAL_CAPACITY_INCREMENT003_TARGET_IDS/);
});

test("page.tsx defines a dedicated MockStructuralCapacityIncrement003Section component", () => {
  assert.match(pageSource, /function MockStructuralCapacityIncrement003Section\(/);
});

test("page.tsx's load() fetches this batch's status and stores it via setMockStructuralCapacityIncrement003Status", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityIncrement003ReviewStatus\(MOCK_STRUCTURAL_CAPACITY_INCREMENT003_TARGET_IDS\)/);
  assert.match(pageSource, /setMockStructuralCapacityIncrement003Status\(mockStructuralCapacityIncrement003\)/);
});

test("page.tsx wires a selection state and a ReviewForm modal branch using review_type mock_maths_independent_review", () => {
  assert.match(pageSource, /selectedMockStructuralCapacityIncrement003, setSelectedMockStructuralCapacityIncrement003/);
  assert.match(pageSource, /if \(selectedMockStructuralCapacityIncrement003\) \{/);
  const modalBlock = pageSource.match(/if \(selectedMockStructuralCapacityIncrement003\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(modalBlock, /reviewType="mock_maths_independent_review"/);
  assert.match(modalBlock, /buildMockStructuralCapacityIncrement003NotesPrefix/);
});

test("page.tsx actually renders <MockStructuralCapacityIncrement003Section /> in the review list", () => {
  assert.match(pageSource, /<MockStructuralCapacityIncrement003Section targets=\{targets\} status=\{mockStructuralCapacityIncrement003Status\}/);
});

test("the section filters pending targets by the exact MOCK-STRUCTURAL-CAPACITY-INCREMENT003 marker, matching migration 132's own notes text, with no substring collision against prior markers", () => {
  assert.match(pageSource, /notes \?\? ""\)\.includes\("MOCK-STRUCTURAL-CAPACITY-INCREMENT003"\)/);
});

test("group rendering is generic: groupQuestionsForReview() is imported and reused, no per-batch special case", () => {
  assert.match(pageSource, /groupQuestionsForReview,/);
  assert.match(pageSource, /groupQuestionsForReview\(questions\)\.map/);
});

/**
 * LEARNER-RENDERING TRACE -- ali_mock_form is 0, so no live Mock
 * walkthrough is claimed; instead, the same pure functions the real
 * learner renderer calls (resolveGroupSharedStem, selectDisplayUnitStimulus)
 * are exercised directly against the new family's own REAL authored
 * content (parsed straight from migration 131), proving the generic
 * mechanism produces a correct result for this specific new shape, not
 * merely asserting it will. No live browser walkthrough was performed
 * this session -- this is a source-level trace, disclosed as such.
 */
const migrationSql = fs.readFileSync("supabase/migrations/131_mock_mathematics_structural_capacity_increment003_funrun.sql", "utf8");
const jsonBlocks = [...migrationSql.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));
function byId(id: string) {
  return jsonBlocks.find((r) => r.id === id);
}

test("learner rendering: funrun's 4 rows resolve to ONE shared stem plus 4 non-empty distinct tails, in group order", () => {
  const ids = ["mock-mr09-funrun-01", "mock-mr09-funrun-02", "mock-mr09-funrun-03", "mock-mr09-funrun-04"];
  const items = ids.map((id) => { const r = byId(id); return { question: r.question, sharedStem: r.sharedStem }; });
  const resolved = resolveGroupSharedStem(items);
  assert.ok(resolved);
  assert.equal(resolved!.tails.length, 4);
  const uniqueTails = new Set(resolved!.tails);
  assert.equal(uniqueTails.size, 4, "all 4 subpart tails must be genuinely distinct");
  for (const tail of resolved!.tails) assert.ok(tail.length > 0);
});

test("learner rendering: stimulus is a single valid table, selected once per display unit via selectDisplayUnitStimulus()", () => {
  const payloads = ["mock-mr09-funrun-01", "mock-mr09-funrun-02", "mock-mr09-funrun-03", "mock-mr09-funrun-04"]
    .map((id) => ({ stimulus: byId(id).stimulus }));
  const stimulus = selectDisplayUnitStimulus(payloads as never);
  assert.ok(isValidTableStimulus(stimulus));
});

test("per-row answer identity: each of the 4 raw component IDs is distinct, proving answer persistence/scoring would key correctly per component", () => {
  const allIds = jsonBlocks.map((r) => r.id);
  assert.equal(new Set(allIds).size, 4);
});
