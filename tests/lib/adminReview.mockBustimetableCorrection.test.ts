import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MOCK_STRUCTURAL_CAPACITY_WAVE002_MARKER,
  MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_MARKER,
  MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_FAMILIES,
  MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_TARGET_IDS,
  buildMockStructuralCapacityWave002Correction001NotesPrefix,
} from "../../lib/adminReview";

/**
 * Mathematics Structural Capacity, Wave 002 — Bus Timetable Correction
 * Re-Review — review-surface reachability proof AND the critical
 * marker-non-collision regression proof, live against the actual
 * exported marker constants (not merely the migration's own SQL text).
 */

test("the correction marker is genuinely distinct from, and does not contain, the original WAVE002 marker as a substring", () => {
  assert.equal(MOCK_STRUCTURAL_CAPACITY_WAVE002_MARKER, "MOCK-STRUCTURAL-CAPACITY-WAVE002");
  assert.equal(MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_MARKER, "MOCK-BUSTIMETABLE-CORRECTION001");
  assert.ok(!MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_MARKER.includes(MOCK_STRUCTURAL_CAPACITY_WAVE002_MARKER));
});

test("REGRESSION: notes built under the correction marker would NOT be picked up by the original WAVE002 section's own .includes() filter", () => {
  const correctionNotes = buildMockStructuralCapacityWave002Correction001NotesPrefix("mock-mr10-bustimetable", ["mock-mr10-bustimetable-01"]);
  // This is the exact predicate app/admin-beta/review/page.tsx's own
  // MockStructuralCapacityWave002Section uses to find its pendingTarget.
  assert.equal(correctionNotes.includes("MOCK-STRUCTURAL-CAPACITY-WAVE002"), false, "the original section's own filter must never match the correction notes");
});

test("family config targets exactly mock-mr10-bustimetable with all 4 real question IDs", () => {
  assert.equal(MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_FAMILIES.length, 1);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_FAMILIES[0].newQuestionIds, [
    "mock-mr10-bustimetable-01", "mock-mr10-bustimetable-02", "mock-mr10-bustimetable-03", "mock-mr10-bustimetable-04",
  ]);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_TARGET_IDS, ["mock-mr10-bustimetable"]);
});

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("page.tsx imports the fetch function, notes-prefix builder, and both config exports for the correction batch", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityWave002Correction001ReviewStatus, buildMockStructuralCapacityWave002Correction001NotesPrefix/);
  assert.match(pageSource, /MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_FAMILIES, MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_TARGET_IDS/);
});

test("page.tsx defines a dedicated MockStructuralCapacityWave002Correction001Section, separate from MockStructuralCapacityWave002Section", () => {
  assert.match(pageSource, /function MockStructuralCapacityWave002Correction001Section\(/);
  assert.match(pageSource, /function MockStructuralCapacityWave002Section\(/);
});

test("the correction section's own pendingTarget filter uses the non-colliding MOCK-BUSTIMETABLE-CORRECTION001 marker; the old WAVE002 marker filter appears exactly once in the whole file (only in the original section)", () => {
  assert.match(pageSource, /notes \?\? ""\)\.includes\("MOCK-BUSTIMETABLE-CORRECTION001"\)/);
  const oldMarkerFilterCount = (pageSource.match(/\.includes\("MOCK-STRUCTURAL-CAPACITY-WAVE002"\)/g) || []).length;
  assert.equal(oldMarkerFilterCount, 1, "the old marker filter must appear exactly once, in the original section only -- never duplicated for the correction section");
});

test("the original WAVE002 section's own filter is unchanged, and (being a plain substring check) would NOT match the correction marker's own notes", () => {
  assert.match(pageSource, /notes \?\? ""\)\.includes\("MOCK-STRUCTURAL-CAPACITY-WAVE002"\)/);
  const correctionNotesSample = "MOCK-BUSTIMETABLE-CORRECTION001 re-review after content correction: mock-mr10-bustimetable";
  assert.equal(correctionNotesSample.includes("MOCK-STRUCTURAL-CAPACITY-WAVE002"), false);
});

test("page.tsx's load() fetches the correction batch's status and stores it separately from the original Wave 002 status", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityWave002Correction001ReviewStatus\(MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_TARGET_IDS\)/);
  assert.match(pageSource, /setMockStructuralCapacityWave002Correction001Status\(mockStructuralCapacityWave002Correction001\)/);
});

test("page.tsx wires a distinct selection state and ReviewForm modal branch for the correction batch", () => {
  assert.match(pageSource, /selectedMockStructuralCapacityWave002Correction001, setSelectedMockStructuralCapacityWave002Correction001/);
  assert.match(pageSource, /if \(selectedMockStructuralCapacityWave002Correction001\) \{/);
  const modalBlock = pageSource.match(/if \(selectedMockStructuralCapacityWave002Correction001\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(modalBlock, /reviewType="mock_maths_independent_review"/);
  assert.match(modalBlock, /buildMockStructuralCapacityWave002Correction001NotesPrefix/);
});

test("page.tsx renders BOTH <MockStructuralCapacityWave002Section /> (historical) and <MockStructuralCapacityWave002Correction001Section /> (re-review), neither replacing the other", () => {
  assert.match(pageSource, /<MockStructuralCapacityWave002Section targets=\{targets\} status=\{mockStructuralCapacityWave002Status\}/);
  assert.match(pageSource, /<MockStructuralCapacityWave002Correction001Section targets=\{targets\} status=\{mockStructuralCapacityWave002Correction001Status\}/);
});

test("Craft Stall is never referenced by the correction batch's own config (lib/adminReview.ts)", () => {
  const familyIds = MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_FAMILIES.map((f) => f.familyId);
  assert.ok(!familyIds.includes("mock-mr13-craftstall"));
  for (const f of MOCK_STRUCTURAL_CAPACITY_WAVE002_CORRECTION001_FAMILIES) {
    assert.ok(!f.disclosure.toLowerCase().includes("craftstall"));
    assert.ok(!f.newQuestionIds.some((id) => id.includes("craftstall")));
  }
});
