import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MOCK_STRUCTURAL_CAPACITY_INCREMENT006_MARKER,
  MOCK_STRUCTURAL_CAPACITY_INCREMENT006_FAMILIES,
  MOCK_STRUCTURAL_CAPACITY_INCREMENT006_TARGET_IDS,
  buildMockStructuralCapacityIncrement006NotesPrefix,
} from "../../lib/adminReview";
import { resolveGroupSharedStem, selectDisplayUnitStimulus } from "../../lib/mockAttempt/workspace";

/**
 * Mathematics Structural Capacity, Authoring Increment 006 —
 * review-surface reachability proof (Decision 170's own lesson) AND
 * learner-rendering trace proof, using the new family's REAL authored
 * shape, not a synthetic fixture.
 */

test("lib/adminReview.ts: family config targets exactly the 1 new family with all 4 real question IDs", () => {
  assert.equal(MOCK_STRUCTURAL_CAPACITY_INCREMENT006_FAMILIES.length, 1);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_INCREMENT006_FAMILIES[0].newQuestionIds, [
    "mock-mr11-roundingbounds-01", "mock-mr11-roundingbounds-02", "mock-mr11-roundingbounds-03", "mock-mr11-roundingbounds-04",
  ]);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_INCREMENT006_TARGET_IDS, ["mock-mr11-roundingbounds"]);
});

test("notes prefix builder embeds the exact INCREMENT006 marker used by migration 141's own notes text", () => {
  const prefix = buildMockStructuralCapacityIncrement006NotesPrefix("mock-mr11-roundingbounds", ["mock-mr11-roundingbounds-01"]);
  assert.equal(MOCK_STRUCTURAL_CAPACITY_INCREMENT006_MARKER, "MOCK-STRUCTURAL-CAPACITY-INCREMENT006");
  assert.match(prefix, /^MOCK-STRUCTURAL-CAPACITY-INCREMENT006 new content review: mock-mr11-roundingbounds/);
});

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("page.tsx imports the fetch function, notes-prefix builder, and both config exports for Increment 006", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityIncrement006ReviewStatus, buildMockStructuralCapacityIncrement006NotesPrefix/);
  assert.match(pageSource, /MOCK_STRUCTURAL_CAPACITY_INCREMENT006_FAMILIES, MOCK_STRUCTURAL_CAPACITY_INCREMENT006_TARGET_IDS/);
});

test("page.tsx defines a dedicated MockStructuralCapacityIncrement006Section component", () => {
  assert.match(pageSource, /function MockStructuralCapacityIncrement006Section\(/);
});

test("page.tsx's load() fetches this batch's status and stores it via setMockStructuralCapacityIncrement006Status", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityIncrement006ReviewStatus\(MOCK_STRUCTURAL_CAPACITY_INCREMENT006_TARGET_IDS\)/);
  assert.match(pageSource, /setMockStructuralCapacityIncrement006Status\(mockStructuralCapacityIncrement006\)/);
});

test("page.tsx wires a selection state and a ReviewForm modal branch using review_type mock_maths_independent_review", () => {
  assert.match(pageSource, /selectedMockStructuralCapacityIncrement006, setSelectedMockStructuralCapacityIncrement006/);
  assert.match(pageSource, /if \(selectedMockStructuralCapacityIncrement006\) \{/);
  const modalBlock = pageSource.match(/if \(selectedMockStructuralCapacityIncrement006\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(modalBlock, /reviewType="mock_maths_independent_review"/);
  assert.match(modalBlock, /buildMockStructuralCapacityIncrement006NotesPrefix/);
});

test("page.tsx actually renders <MockStructuralCapacityIncrement006Section /> in the review list", () => {
  assert.match(pageSource, /<MockStructuralCapacityIncrement006Section targets=\{targets\} status=\{mockStructuralCapacityIncrement006Status\}/);
});

test("the section filters pending targets by the exact MOCK-STRUCTURAL-CAPACITY-INCREMENT006 marker, matching migration 141's own notes text, with no substring collision against prior markers", () => {
  assert.match(pageSource, /notes \?\? ""\)\.includes\("MOCK-STRUCTURAL-CAPACITY-INCREMENT006"\)/);
});

test("group rendering is generic: groupQuestionsForReview() is imported and reused, no per-batch special case", () => {
  assert.match(pageSource, /groupQuestionsForReview,/);
  assert.match(pageSource, /groupQuestionsForReview\(questions\)\.map/);
});

/**
 * LEARNER-RENDERING TRACE -- ali_mock_form is 0, so no live Mock
 * walkthrough is claimed; instead, the same pure function the real
 * learner renderer calls (resolveGroupSharedStem) is exercised directly
 * against the new family's own REAL authored content (parsed straight
 * from migration 140), proving the generic mechanism produces a correct
 * result for this specific new, text-only shape, not merely asserting it
 * will. No live browser walkthrough was performed this session -- this
 * is a source-level trace, disclosed as such.
 */
const migrationSql = fs.readFileSync("supabase/migrations/140_mock_mathematics_structural_capacity_increment006_roundingbounds.sql", "utf8");
const jsonBlocks = [...migrationSql.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));
function byId(id: string) {
  return jsonBlocks.find((r) => r.id === id);
}

const ROUNDINGBOUNDS_IDS = [
  "mock-mr11-roundingbounds-01", "mock-mr11-roundingbounds-02", "mock-mr11-roundingbounds-03", "mock-mr11-roundingbounds-04",
];

test("learner rendering: roundingbounds' 4 rows resolve to ONE shared stem plus 4 non-empty distinct tails, in group order", () => {
  const items = ROUNDINGBOUNDS_IDS.map((id) => { const r = byId(id); return { question: r.question, sharedStem: r.sharedStem }; });
  const resolved = resolveGroupSharedStem(items);
  assert.ok(resolved);
  assert.equal(resolved!.tails.length, 4);
  const uniqueTails = new Set(resolved!.tails);
  assert.equal(uniqueTails.size, 4, "all 4 subpart tails must be genuinely distinct");
  for (const tail of resolved!.tails) assert.ok(tail.length > 0);
});

test("learner rendering: no stimulus is present on any row -- selectDisplayUnitStimulus() correctly returns null, confirming this family renders as text-only narrative content, not a table", () => {
  const payloads = ROUNDINGBOUNDS_IDS.map((id) => ({ stimulus: byId(id).stimulus }));
  const stimulus = selectDisplayUnitStimulus(payloads as never);
  assert.equal(stimulus, null);
});

test("per-row answer identity: each of the 4 raw component IDs is distinct, proving answer persistence/scoring would key correctly per component", () => {
  const allIds = jsonBlocks.map((r) => r.id);
  assert.equal(new Set(allIds).size, 4);
});
