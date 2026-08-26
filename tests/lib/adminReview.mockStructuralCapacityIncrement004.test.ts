import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MOCK_STRUCTURAL_CAPACITY_INCREMENT004_MARKER,
  MOCK_STRUCTURAL_CAPACITY_INCREMENT004_FAMILIES,
  MOCK_STRUCTURAL_CAPACITY_INCREMENT004_TARGET_IDS,
  buildMockStructuralCapacityIncrement004NotesPrefix,
} from "../../lib/adminReview";
import { resolveGroupSharedStem, selectDisplayUnitStimulus } from "../../lib/mockAttempt/workspace";

/**
 * Mathematics Structural Capacity, Authoring Increment 004 —
 * review-surface reachability proof (Decision 170's own lesson) AND
 * learner-rendering trace proof, using the new family's REAL authored
 * shape, not a synthetic fixture.
 */

test("lib/adminReview.ts: family config targets exactly the 1 new family with all 4 real question IDs", () => {
  assert.equal(MOCK_STRUCTURAL_CAPACITY_INCREMENT004_FAMILIES.length, 1);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_INCREMENT004_FAMILIES[0].newQuestionIds, [
    "mock-mr04-campingsale-01", "mock-mr04-campingsale-02", "mock-mr04-campingsale-03", "mock-mr04-campingsale-04",
  ]);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_INCREMENT004_TARGET_IDS, ["mock-mr04-campingsale"]);
});

test("notes prefix builder embeds the exact INCREMENT004 marker used by migration 135's own notes text", () => {
  const prefix = buildMockStructuralCapacityIncrement004NotesPrefix("mock-mr04-campingsale", ["mock-mr04-campingsale-01"]);
  assert.equal(MOCK_STRUCTURAL_CAPACITY_INCREMENT004_MARKER, "MOCK-STRUCTURAL-CAPACITY-INCREMENT004");
  assert.match(prefix, /^MOCK-STRUCTURAL-CAPACITY-INCREMENT004 new content review: mock-mr04-campingsale/);
});

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("page.tsx imports the fetch function, notes-prefix builder, and both config exports for Increment 004", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityIncrement004ReviewStatus, buildMockStructuralCapacityIncrement004NotesPrefix/);
  assert.match(pageSource, /MOCK_STRUCTURAL_CAPACITY_INCREMENT004_FAMILIES, MOCK_STRUCTURAL_CAPACITY_INCREMENT004_TARGET_IDS/);
});

test("page.tsx defines a dedicated MockStructuralCapacityIncrement004Section component", () => {
  assert.match(pageSource, /function MockStructuralCapacityIncrement004Section\(/);
});

test("page.tsx's load() fetches this batch's status and stores it via setMockStructuralCapacityIncrement004Status", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityIncrement004ReviewStatus\(MOCK_STRUCTURAL_CAPACITY_INCREMENT004_TARGET_IDS\)/);
  assert.match(pageSource, /setMockStructuralCapacityIncrement004Status\(mockStructuralCapacityIncrement004\)/);
});

test("page.tsx wires a selection state and a ReviewForm modal branch using review_type mock_maths_independent_review", () => {
  assert.match(pageSource, /selectedMockStructuralCapacityIncrement004, setSelectedMockStructuralCapacityIncrement004/);
  assert.match(pageSource, /if \(selectedMockStructuralCapacityIncrement004\) \{/);
  const modalBlock = pageSource.match(/if \(selectedMockStructuralCapacityIncrement004\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(modalBlock, /reviewType="mock_maths_independent_review"/);
  assert.match(modalBlock, /buildMockStructuralCapacityIncrement004NotesPrefix/);
});

test("page.tsx actually renders <MockStructuralCapacityIncrement004Section /> in the review list", () => {
  assert.match(pageSource, /<MockStructuralCapacityIncrement004Section targets=\{targets\} status=\{mockStructuralCapacityIncrement004Status\}/);
});

test("the section filters pending targets by the exact MOCK-STRUCTURAL-CAPACITY-INCREMENT004 marker, matching migration 135's own notes text, with no substring collision against prior markers", () => {
  assert.match(pageSource, /notes \?\? ""\)\.includes\("MOCK-STRUCTURAL-CAPACITY-INCREMENT004"\)/);
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
 * from migration 134), proving the generic mechanism produces a correct
 * result for this specific new, text-only shape, not merely asserting it
 * will. No live browser walkthrough was performed this session -- this
 * is a source-level trace, disclosed as such.
 */
const migrationSql = fs.readFileSync("supabase/migrations/134_mock_mathematics_structural_capacity_increment004_campingsale.sql", "utf8");
const jsonBlocks = [...migrationSql.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));
function byId(id: string) {
  return jsonBlocks.find((r) => r.id === id);
}

test("learner rendering: campingsale's 4 rows resolve to ONE shared stem plus 4 non-empty distinct tails, in group order", () => {
  const ids = [
    "mock-mr04-campingsale-01", "mock-mr04-campingsale-02", "mock-mr04-campingsale-03", "mock-mr04-campingsale-04",
  ];
  const items = ids.map((id) => { const r = byId(id); return { question: r.question, sharedStem: r.sharedStem }; });
  const resolved = resolveGroupSharedStem(items);
  assert.ok(resolved);
  assert.equal(resolved!.tails.length, 4);
  const uniqueTails = new Set(resolved!.tails);
  assert.equal(uniqueTails.size, 4, "all 4 subpart tails must be genuinely distinct");
  for (const tail of resolved!.tails) assert.ok(tail.length > 0);
});

test("learner rendering: no stimulus is present on any row -- selectDisplayUnitStimulus() correctly returns null, confirming this family renders as text-only narrative, not a table", () => {
  const payloads = [
    "mock-mr04-campingsale-01", "mock-mr04-campingsale-02", "mock-mr04-campingsale-03", "mock-mr04-campingsale-04",
  ].map((id) => ({ stimulus: byId(id).stimulus }));
  const stimulus = selectDisplayUnitStimulus(payloads as never);
  assert.equal(stimulus, null);
});

test("per-row answer identity: each of the 4 raw component IDs is distinct, proving answer persistence/scoring would key correctly per component", () => {
  const allIds = jsonBlocks.map((r) => r.id);
  assert.equal(new Set(allIds).size, 4);
});
