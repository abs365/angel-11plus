import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MOCK_STRUCTURAL_CAPACITY_INC001_MARKER,
  MOCK_STRUCTURAL_CAPACITY_INC001_FAMILIES,
  MOCK_STRUCTURAL_CAPACITY_INC001_TARGET_IDS,
  buildMockStructuralCapacityInc001NotesPrefix,
} from "../../lib/adminReview";

/**
 * Mathematics First Mock Structural Capacity, Authoring Increment 001 —
 * review-surface reachability proof (Decision 170's own lesson: generic
 * grouping does NOT automatically make a new batch visible in the admin
 * review page; dedicated wiring must be traced, not assumed). Proves the
 * lib/adminReview.ts config is correct AND that app/admin-beta/review/
 * page.tsx actually imports, renders, and wires the new section through
 * the full load()/state/modal chain -- not merely that the config exists
 * in isolation.
 */

test("lib/adminReview.ts: family config targets exactly mock-mr06-linkedvalues with all 3 question IDs", () => {
  assert.equal(MOCK_STRUCTURAL_CAPACITY_INC001_FAMILIES.length, 1);
  assert.equal(MOCK_STRUCTURAL_CAPACITY_INC001_FAMILIES[0].familyId, "mock-mr06-linkedvalues");
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_INC001_FAMILIES[0].newQuestionIds, [
    "mock-mr06-linkedvalues-01", "mock-mr06-linkedvalues-02", "mock-mr06-linkedvalues-03",
  ]);
  assert.deepEqual(MOCK_STRUCTURAL_CAPACITY_INC001_TARGET_IDS, ["mock-mr06-linkedvalues"]);
});

test("notes prefix builder embeds the exact marker used by migration 120's own notes text", () => {
  const prefix = buildMockStructuralCapacityInc001NotesPrefix("mock-mr06-linkedvalues", ["mock-mr06-linkedvalues-01", "mock-mr06-linkedvalues-02", "mock-mr06-linkedvalues-03"]);
  assert.equal(MOCK_STRUCTURAL_CAPACITY_INC001_MARKER, "MOCK-STRUCTURAL-CAPACITY-INC001");
  assert.match(prefix, /^MOCK-STRUCTURAL-CAPACITY-INC001 new content review: mock-mr06-linkedvalues/);
  assert.match(prefix, /mock-mr06-linkedvalues-01, mock-mr06-linkedvalues-02, mock-mr06-linkedvalues-03/);
});

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("page.tsx imports the fetch function, notes-prefix builder, and both config exports from lib/adminReview", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityInc001ReviewStatus, buildMockStructuralCapacityInc001NotesPrefix/);
  assert.match(pageSource, /MOCK_STRUCTURAL_CAPACITY_INC001_FAMILIES, MOCK_STRUCTURAL_CAPACITY_INC001_TARGET_IDS/);
});

test("page.tsx defines a dedicated MockStructuralCapacityInc001Section component (not merely relying on generic grouping)", () => {
  assert.match(pageSource, /function MockStructuralCapacityInc001Section\(/);
});

test("page.tsx's load() fetches this batch's status and stores it via setMockStructuralCapacityInc001Status", () => {
  assert.match(pageSource, /fetchMockStructuralCapacityInc001ReviewStatus\(MOCK_STRUCTURAL_CAPACITY_INC001_TARGET_IDS\)/);
  assert.match(pageSource, /setMockStructuralCapacityInc001Status\(mockStructuralCapacityInc001\)/);
});

test("page.tsx wires a selection state and a ReviewForm modal branch using review_type mock_maths_independent_review", () => {
  assert.match(pageSource, /selectedMockStructuralCapacityInc001, setSelectedMockStructuralCapacityInc001/);
  assert.match(pageSource, /if \(selectedMockStructuralCapacityInc001\) \{/);
  const modalBlock = pageSource.match(/if \(selectedMockStructuralCapacityInc001\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(modalBlock, /reviewType="mock_maths_independent_review"/);
  assert.match(modalBlock, /buildMockStructuralCapacityInc001NotesPrefix/);
});

test("page.tsx actually renders <MockStructuralCapacityInc001Section /> in the review list, not merely defining it", () => {
  assert.match(pageSource, /<MockStructuralCapacityInc001Section targets=\{targets\} status=\{mockStructuralCapacityInc001Status\}/);
});

test("the section component filters pending targets by the exact MOCK-STRUCTURAL-CAPACITY-INC001 marker in notes, matching migration 120's own notes text", () => {
  assert.match(pageSource, /notes \?\? ""\)\.includes\("MOCK-STRUCTURAL-CAPACITY-INC001"\)/);
});

test("group rendering is generic: groupQuestionsForReview() is imported and used for the sevenX path, not a per-batch special case", () => {
  assert.match(pageSource, /groupQuestionsForReview,/);
  assert.match(pageSource, /groupQuestionsForReview\(questions\)\.map/);
});
