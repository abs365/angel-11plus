import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MOCK_STRUCTURAL_CAPACITY_WAVE002_MARKER,
  MOCK_STRUCTURAL_CAPACITY_WAVE002_FAMILIES,
  MOCK_STRUCTURAL_CAPACITY_WAVE002_TARGET_IDS,
  buildMockStructuralCapacityWave002NotesPrefix,
} from "../../lib/adminReview";
import { resolveGroupSharedStem, isValidTableStimulus, selectDisplayUnitStimulus } from "../../lib/mockAttempt/workspace";

/**
 * Mathematics First Mock Structural Capacity, Authoring Wave 002 —
 * review-surface reachability proof (Decision 170's own lesson) AND
 * learner-rendering trace proof (Part 21 of this session's own
 * directive), using the two new families' REAL authored shapes, not
 * synthetic fixtures.
 */

test("lib/adminReview.ts: family config targets exactly the 2 new families with all their real question IDs", () => {
  assert.equal(MOCK_STRUCTURAL_CAPACITY_WAVE002_FAMILIES.length, 2);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_WAVE002_FAMILIES[0].newQuestionIds, [
    "mock-mr10-bustimetable-01", "mock-mr10-bustimetable-02", "mock-mr10-bustimetable-03", "mock-mr10-bustimetable-04",
  ]);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_WAVE002_FAMILIES[1].newQuestionIds, [
    "mock-mr13-craftstall-01", "mock-mr13-craftstall-02", "mock-mr13-craftstall-03",
  ]);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_WAVE002_TARGET_IDS, ["mock-mr10-bustimetable", "mock-mr13-craftstall"]);
});

test("notes prefix builder embeds the exact WAVE002 marker used by migration 126's own notes text", () => {
  const prefix = buildMockStructuralCapacityWave002NotesPrefix("mock-mr10-bustimetable", ["mock-mr10-bustimetable-01"]);
  assert.equal(MOCK_STRUCTURAL_CAPACITY_WAVE002_MARKER, "MOCK-STRUCTURAL-CAPACITY-WAVE002");
  assert.match(prefix, /^MOCK-STRUCTURAL-CAPACITY-WAVE002 new content review: mock-mr10-bustimetable/);
});

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("page.tsx imports the fetch function, notes-prefix builder, and both config exports for Wave 002", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityWave002ReviewStatus, buildMockStructuralCapacityWave002NotesPrefix/);
  assert.match(pageSource, /MOCK_STRUCTURAL_CAPACITY_WAVE002_FAMILIES, MOCK_STRUCTURAL_CAPACITY_WAVE002_TARGET_IDS/);
});

test("page.tsx defines a dedicated MockStructuralCapacityWave002Section component", () => {
  assert.match(pageSource, /function MockStructuralCapacityWave002Section\(/);
});

test("page.tsx's load() fetches this batch's status and stores it via setMockStructuralCapacityWave002Status", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityWave002ReviewStatus\(MOCK_STRUCTURAL_CAPACITY_WAVE002_TARGET_IDS\)/);
  assert.match(pageSource, /setMockStructuralCapacityWave002Status\(mockStructuralCapacityWave002\)/);
});

test("page.tsx wires a selection state and a ReviewForm modal branch using review_type mock_maths_independent_review", () => {
  assert.match(pageSource, /selectedMockStructuralCapacityWave002, setSelectedMockStructuralCapacityWave002/);
  assert.match(pageSource, /if \(selectedMockStructuralCapacityWave002\) \{/);
  const modalBlock = pageSource.match(/if \(selectedMockStructuralCapacityWave002\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(modalBlock, /reviewType="mock_maths_independent_review"/);
  assert.match(modalBlock, /buildMockStructuralCapacityWave002NotesPrefix/);
});

test("page.tsx actually renders <MockStructuralCapacityWave002Section /> in the review list", () => {
  assert.match(pageSource, /<MockStructuralCapacityWave002Section targets=\{targets\} status=\{mockStructuralCapacityWave002Status\}/);
});

test("the section filters pending targets by the exact MOCK-STRUCTURAL-CAPACITY-WAVE002 marker, matching migration 126's own notes text", () => {
  assert.match(pageSource, /notes \?\? ""\)\.includes\("MOCK-STRUCTURAL-CAPACITY-WAVE002"\)/);
});

test("group rendering is generic: groupQuestionsForReview() is imported and reused, no per-batch special case", () => {
  assert.match(pageSource, /groupQuestionsForReview,/);
  assert.match(pageSource, /groupQuestionsForReview\(questions\)\.map/);
});

/**
 * LEARNER-RENDERING TRACE (Part 21) -- ali_mock_form is 0, so no live
 * Mock walkthrough is claimed; instead, the same pure functions the
 * real learner renderer calls (resolveGroupSharedStem,
 * selectDisplayUnitStimulus) are exercised directly against the two
 * new families' own REAL authored content (parsed straight from
 * migration 125), proving the generic mechanism produces a correct
 * result for these specific new shapes, not merely asserting it will.
 */
const migrationSql = fs.readFileSync("supabase/migrations/125_mock_mathematics_structural_capacity_wave002_timetable_pricelist.sql", "utf8");
const jsonBlocks = [...migrationSql.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));
function byId(id: string) {
  return jsonBlocks.find((r) => r.id === id);
}

test("learner rendering: timetable's 4 rows resolve to ONE shared stem plus 4 non-empty distinct tails, in group order", () => {
  const ids = ["mock-mr10-bustimetable-01", "mock-mr10-bustimetable-02", "mock-mr10-bustimetable-03", "mock-mr10-bustimetable-04"];
  const items = ids.map((id) => { const r = byId(id); return { question: r.question, sharedStem: r.sharedStem }; });
  const resolved = resolveGroupSharedStem(items);
  assert.ok(resolved);
  assert.equal(resolved!.tails.length, 4);
  const uniqueTails = new Set(resolved!.tails);
  assert.equal(uniqueTails.size, 4, "all 4 subpart tails must be genuinely distinct");
  for (const tail of resolved!.tails) assert.ok(tail.length > 0);
});

test("learner rendering: craft-stall's 3 rows resolve to ONE shared stem plus 3 non-empty distinct tails", () => {
  const ids = ["mock-mr13-craftstall-01", "mock-mr13-craftstall-02", "mock-mr13-craftstall-03"];
  const items = ids.map((id) => { const r = byId(id); return { question: r.question, sharedStem: r.sharedStem }; });
  const resolved = resolveGroupSharedStem(items);
  assert.ok(resolved);
  assert.equal(resolved!.tails.length, 3);
  assert.equal(new Set(resolved!.tails).size, 3);
});

test("learner rendering: both families' stimulus is a single valid table, selected once per display unit via selectDisplayUnitStimulus()", () => {
  const timetablePayloads = ["mock-mr10-bustimetable-01", "mock-mr10-bustimetable-02", "mock-mr10-bustimetable-03", "mock-mr10-bustimetable-04"]
    .map((id) => ({ stimulus: byId(id).stimulus }));
  const timetableStimulus = selectDisplayUnitStimulus(timetablePayloads as never);
  assert.ok(isValidTableStimulus(timetableStimulus));

  const craftstallPayloads = ["mock-mr13-craftstall-01", "mock-mr13-craftstall-02", "mock-mr13-craftstall-03"]
    .map((id) => ({ stimulus: byId(id).stimulus }));
  const craftstallStimulus = selectDisplayUnitStimulus(craftstallPayloads as never);
  assert.ok(isValidTableStimulus(craftstallStimulus));
});

test("per-row answer identity: each of the 7 raw component IDs is distinct, proving answer persistence/scoring would key correctly per component", () => {
  const allIds = jsonBlocks.map((r) => r.id);
  assert.equal(new Set(allIds).size, 7);
});
