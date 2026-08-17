import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveSevenXReviewStatus, buildSevenXNotesPrefix, SEVEN_X_BATCH_MARKER, SEVEN_X_FAMILIES, SEVEN_X_TARGET_IDS, type SevenXReviewRow } from "@/lib/adminReview";

/**
 * Educational Increment 007X, Founder Review-Surface Correction. Test
 * fixtures mirror the exact authenticated evidence the Founder retrieved
 * from ali_family_review for the 4 target families (Decision 79): a
 * family can carry a historical pending content review, a historical
 * APPROVED content review, an approved maths_teaching_review, and a new
 * 007X pending placeholder (sometimes duplicated) all at once.
 */

const FOUR_FAMILIES = ["mr05-number-property-search", "mr03-mixed-perimeter", "precision-frac", "precision-dec"];

function row(overrides: Partial<SevenXReviewRow>): SevenXReviewRow {
  return {
    family_id: "mr03-mixed-perimeter",
    review_type: "content_review",
    decision: "pending_independent_review",
    notes: null,
    reviewer: "UNASSIGNED",
    ...overrides,
  };
}

test("1. historical family content approval does NOT approve new 007X content", () => {
  const rows: SevenXReviewRow[] = [
    row({ family_id: "mr03-mixed-perimeter", decision: "pending_independent_review", notes: "Controlled Review Batch 4 pending placeholder" }),
    row({ family_id: "mr03-mixed-perimeter", decision: "approved", notes: "Reviewer qualification: 11+ tuition experience.\n\nApproved, Batch 4, original 3 siblings." }),
  ];
  const status = deriveSevenXReviewStatus(rows, FOUR_FAMILIES);
  assert.equal(status.get("mr03-mixed-perimeter")!.reviewed, false, "a historical approval with no 007X marker must never satisfy the new-content review");
});

test("2. approved maths_teaching_review does NOT approve 007X content", () => {
  const rows: SevenXReviewRow[] = [
    row({ family_id: "precision-frac", review_type: "maths_teaching_review", decision: "approved", notes: "Mathematics Teaching Review approved." }),
  ];
  const status = deriveSevenXReviewStatus(rows, FOUR_FAMILIES);
  assert.equal(status.get("precision-frac")!.reviewed, false, "a different review_type entirely must never satisfy content_review-scoped 007X status");
});

test("3. duplicate pending 007X placeholders collapse to one status per family, not duplicate cards", () => {
  const rows: SevenXReviewRow[] = [
    row({ family_id: "mr05-number-property-search", decision: "pending_independent_review", notes: `Educational Increment ${SEVEN_X_BATCH_MARKER}, Part 8. 5 new provisional questions...` }),
    row({ family_id: "mr05-number-property-search", decision: "pending_independent_review", notes: `${SEVEN_X_BATCH_MARKER} new content review: mr05-search-03..07` }),
  ];
  const status = deriveSevenXReviewStatus(rows, FOUR_FAMILIES);
  assert.equal(status.size, FOUR_FAMILIES.length, "exactly one status entry per family, regardless of how many underlying pending rows exist");
  assert.equal(status.get("mr05-number-property-search")!.reviewed, false, "two pending rows is still not reviewed");
});

test("4. buildSevenXNotesPrefix names exactly the given question IDs, nothing implied beyond them", () => {
  const ids = ["mr05-search-03", "mr05-search-04", "mr05-search-05", "mr05-search-06", "mr05-search-07"];
  const prefix = buildSevenXNotesPrefix("mr05-number-property-search", ids);
  for (const id of ids) assert.ok(prefix.includes(id));
  assert.ok(prefix.includes(SEVEN_X_BATCH_MARKER));
});

test("5. mr03-mixed-perimeter is reviewable despite historical content AND teaching approval", () => {
  const rows: SevenXReviewRow[] = [
    row({ family_id: "mr03-mixed-perimeter", decision: "pending_independent_review", notes: "historical Batch 4 placeholder" }),
    row({ family_id: "mr03-mixed-perimeter", decision: "approved", notes: "Batch 4 approval of the original 3 siblings, predating this later increment." }),
    row({ family_id: "mr03-mixed-perimeter", review_type: "maths_teaching_review", decision: "approved", notes: "Teaching review approved." }),
    row({ family_id: "mr03-mixed-perimeter", decision: "pending_independent_review", notes: `${SEVEN_X_BATCH_MARKER} new content review: mr03-mix-04..06` }),
  ];
  const status = deriveSevenXReviewStatus(rows, FOUR_FAMILIES);
  assert.equal(status.get("mr03-mixed-perimeter")!.reviewed, false, "not yet reviewed -- but critically, nothing here falsely marks it reviewed either");
});

test("6. precision-frac is reviewable despite teaching approval", () => {
  const rows: SevenXReviewRow[] = [
    row({ family_id: "precision-frac", review_type: "maths_teaching_review", decision: "approved", notes: "Teaching review approved." }),
    row({ family_id: "precision-frac", decision: "pending_independent_review", notes: `${SEVEN_X_BATCH_MARKER} new content review: precision-frac-04..06` }),
  ];
  const status = deriveSevenXReviewStatus(rows, FOUR_FAMILIES);
  assert.equal(status.get("precision-frac")!.reviewed, false);
});

test("7. precision-dec is reviewable despite teaching approval", () => {
  const rows: SevenXReviewRow[] = [
    row({ family_id: "precision-dec", review_type: "maths_teaching_review", decision: "approved", notes: "Teaching review approved." }),
    row({ family_id: "precision-dec", decision: "pending_independent_review", notes: `${SEVEN_X_BATCH_MARKER} new content review: precision-dec-04..06` }),
  ];
  const status = deriveSevenXReviewStatus(rows, FOUR_FAMILIES);
  assert.equal(status.get("precision-dec")!.reviewed, false);
});

test("8. mr05-number-property-search is reviewable (no prior review of any kind)", () => {
  const rows: SevenXReviewRow[] = [
    row({ family_id: "mr05-number-property-search", decision: "pending_independent_review", notes: `${SEVEN_X_BATCH_MARKER} new content review: mr05-search-03..07` }),
  ];
  const status = deriveSevenXReviewStatus(rows, FOUR_FAMILIES);
  assert.equal(status.get("mr05-number-property-search")!.reviewed, false);
});

test("a genuine 007X approval (post-submission, via buildSevenXNotesPrefix) IS correctly recognised as reviewed", () => {
  const notes = `${buildSevenXNotesPrefix("precision-dec", ["precision-dec-04", "precision-dec-05", "precision-dec-06"])}\n\nReviewer qualification: Essex CSSE 11+ parent.\n\nLooks correct.`;
  const rows: SevenXReviewRow[] = [row({ family_id: "precision-dec", decision: "approved", notes })];
  const status = deriveSevenXReviewStatus(rows, FOUR_FAMILIES);
  assert.equal(status.get("precision-dec")!.reviewed, true);
  assert.equal(status.get("precision-dec")!.decision, "approved");
});

test("4. exactly the 14 new question IDs (and only those) appear across the 007X review scope, matching migration 066 exactly", () => {
  const expected = [
    "mr05-search-03", "mr05-search-04", "mr05-search-05", "mr05-search-06", "mr05-search-07",
    "mr03-mix-04", "mr03-mix-05", "mr03-mix-06",
    "precision-frac-04", "precision-frac-05", "precision-frac-06",
    "precision-dec-04", "precision-dec-05", "precision-dec-06",
  ];
  const actual = SEVEN_X_FAMILIES.flatMap((f) => f.newQuestionIds);
  assert.equal(actual.length, 14);
  assert.deepEqual(new Set(actual), new Set(expected));
});

test("SEVEN_X_TARGET_IDS covers exactly the 4 target families, no more no less", () => {
  assert.deepEqual(new Set(SEVEN_X_TARGET_IDS), new Set(["mr05-number-property-search", "mr03-mixed-perimeter", "precision-frac", "precision-dec"]));
});

test("mth-003 is disclosed as reclassified-not-new, exclusively under mr03-mixed-perimeter, and never counted in any family's newQuestionIds", () => {
  const withMth003 = SEVEN_X_FAMILIES.filter((f) => f.reclassified?.some((r) => r.id === "mth-003"));
  assert.equal(withMth003.length, 1);
  assert.equal(withMth003[0].familyId, "mr03-mixed-perimeter");
  for (const f of SEVEN_X_FAMILIES) assert.ok(!f.newQuestionIds.includes("mth-003"));
});

test("9/10. this review scope config never mentions activating content to practice_eligible or mock_eligible -- it is read/decision-only", () => {
  // mth-003's own disclosure text legitimately mentions "eligibility_status
  // (provisional)" -- disclosing the CURRENT, unchanged state, not
  // proposing a change -- so this checks for the specific target values an
  // activation would set, not the column name itself.
  const configText = JSON.stringify(SEVEN_X_FAMILIES);
  assert.ok(!configText.includes("practice_eligible"));
  assert.ok(!configText.includes("mock_eligible"));
});
