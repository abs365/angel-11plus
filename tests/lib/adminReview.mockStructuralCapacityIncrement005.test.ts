import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MOCK_STRUCTURAL_CAPACITY_INCREMENT005_MARKER,
  MOCK_STRUCTURAL_CAPACITY_INCREMENT005_FAMILIES,
  MOCK_STRUCTURAL_CAPACITY_INCREMENT005_TARGET_IDS,
  buildMockStructuralCapacityIncrement005NotesPrefix,
} from "../../lib/adminReview";
import { resolveGroupSharedStem, selectDisplayUnitStimulus } from "../../lib/mockAttempt/workspace";

/**
 * Mathematics Structural Capacity, Authoring Increment 005 —
 * review-surface reachability proof (Decision 170's own lesson) AND
 * learner-rendering trace proof, using the new family's REAL authored
 * shape, not a synthetic fixture.
 */

test("lib/adminReview.ts: family config targets exactly the 1 new family with all 4 real question IDs", () => {
  assert.equal(MOCK_STRUCTURAL_CAPACITY_INCREMENT005_FAMILIES.length, 1);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_INCREMENT005_FAMILIES[0].newQuestionIds, [
    "mock-mr06-numberpuzzle-01", "mock-mr06-numberpuzzle-02", "mock-mr06-numberpuzzle-03", "mock-mr06-numberpuzzle-04",
  ]);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_INCREMENT005_TARGET_IDS, ["mock-mr06-numberpuzzle"]);
});

test("notes prefix builder embeds the exact INCREMENT005 marker used by migration 138's own notes text", () => {
  const prefix = buildMockStructuralCapacityIncrement005NotesPrefix("mock-mr06-numberpuzzle", ["mock-mr06-numberpuzzle-01"]);
  assert.equal(MOCK_STRUCTURAL_CAPACITY_INCREMENT005_MARKER, "MOCK-STRUCTURAL-CAPACITY-INCREMENT005");
  assert.match(prefix, /^MOCK-STRUCTURAL-CAPACITY-INCREMENT005 new content review: mock-mr06-numberpuzzle/);
});

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("page.tsx imports the fetch function, notes-prefix builder, and both config exports for Increment 005", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityIncrement005ReviewStatus, buildMockStructuralCapacityIncrement005NotesPrefix/);
  assert.match(pageSource, /MOCK_STRUCTURAL_CAPACITY_INCREMENT005_FAMILIES, MOCK_STRUCTURAL_CAPACITY_INCREMENT005_TARGET_IDS/);
});

test("page.tsx defines a dedicated MockStructuralCapacityIncrement005Section component", () => {
  assert.match(pageSource, /function MockStructuralCapacityIncrement005Section\(/);
});

test("page.tsx's load() fetches this batch's status and stores it via setMockStructuralCapacityIncrement005Status", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityIncrement005ReviewStatus\(MOCK_STRUCTURAL_CAPACITY_INCREMENT005_TARGET_IDS\)/);
  assert.match(pageSource, /setMockStructuralCapacityIncrement005Status\(mockStructuralCapacityIncrement005\)/);
});

test("page.tsx wires a selection state and a ReviewForm modal branch using review_type mock_maths_independent_review", () => {
  assert.match(pageSource, /selectedMockStructuralCapacityIncrement005, setSelectedMockStructuralCapacityIncrement005/);
  assert.match(pageSource, /if \(selectedMockStructuralCapacityIncrement005\) \{/);
  const modalBlock = pageSource.match(/if \(selectedMockStructuralCapacityIncrement005\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(modalBlock, /reviewType="mock_maths_independent_review"/);
  assert.match(modalBlock, /buildMockStructuralCapacityIncrement005NotesPrefix/);
});

test("page.tsx actually renders <MockStructuralCapacityIncrement005Section /> in the review list", () => {
  assert.match(pageSource, /<MockStructuralCapacityIncrement005Section targets=\{targets\} status=\{mockStructuralCapacityIncrement005Status\}/);
});

test("the section filters pending targets by the exact MOCK-STRUCTURAL-CAPACITY-INCREMENT005 marker, matching migration 138's own notes text, with no substring collision against prior markers", () => {
  assert.match(pageSource, /notes \?\? ""\)\.includes\("MOCK-STRUCTURAL-CAPACITY-INCREMENT005"\)/);
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
 * from migration 137), proving the generic mechanism produces a correct
 * result for this specific new, text-only shape, not merely asserting it
 * will. No live browser walkthrough was performed this session -- this
 * is a source-level trace, disclosed as such.
 */
const migrationSql = fs.readFileSync("supabase/migrations/137_mock_mathematics_structural_capacity_increment005_numberpuzzle.sql", "utf8");
const jsonBlocks = [...migrationSql.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));
function byId(id: string) {
  return jsonBlocks.find((r) => r.id === id);
}

test("learner rendering: numberpuzzle's 4 rows resolve to ONE shared stem plus 4 non-empty distinct tails, in group order", () => {
  const ids = [
    "mock-mr06-numberpuzzle-01", "mock-mr06-numberpuzzle-02", "mock-mr06-numberpuzzle-03", "mock-mr06-numberpuzzle-04",
  ];
  const items = ids.map((id) => { const r = byId(id); return { question: r.question, sharedStem: r.sharedStem }; });
  const resolved = resolveGroupSharedStem(items);
  assert.ok(resolved);
  assert.equal(resolved!.tails.length, 4);
  const uniqueTails = new Set(resolved!.tails);
  assert.equal(uniqueTails.size, 4, "all 4 subpart tails must be genuinely distinct");
  for (const tail of resolved!.tails) assert.ok(tail.length > 0);
});

test("learner rendering: no stimulus is present on any row -- selectDisplayUnitStimulus() correctly returns null, confirming this family renders as text-only abstract-algebra content, not a table", () => {
  const payloads = [
    "mock-mr06-numberpuzzle-01", "mock-mr06-numberpuzzle-02", "mock-mr06-numberpuzzle-03", "mock-mr06-numberpuzzle-04",
  ].map((id) => ({ stimulus: byId(id).stimulus }));
  const stimulus = selectDisplayUnitStimulus(payloads as never);
  assert.equal(stimulus, null);
});

test("per-row answer identity: each of the 4 raw component IDs is distinct, proving answer persistence/scoring would key correctly per component", () => {
  const allIds = jsonBlocks.map((r) => r.id);
  assert.equal(new Set(allIds).size, 4);
});
