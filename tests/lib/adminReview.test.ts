import { test } from "node:test";
import assert from "node:assert/strict";
import { validateReviewSubmission, type ReviewSubmission } from "@/lib/adminReview";

/**
 * Educational Increment 007E, Part 9. Tests the pure validation guard
 * used before a review is ever written to ali_family_review — the last
 * line of defence against an anonymous or unexplained rejection being
 * recorded through the admin review interface.
 */

function baseSubmission(overrides: Partial<ReviewSubmission> = {}): ReviewSubmission {
  return {
    reviewTargetType: "question_family", targetId: "wave1-fam-two-character",
    reviewer: "Jane Smith", decision: "approved", notes: "", evidenceReference: "", provenanceReference: "",
    educationalValidity: true, competencyValidity: true, wordingQuality: true, ageAppropriate: true,
    ambiguityFree: true, difficultyAppropriate: true, misconceptionQuality: true, explanationQuality: true,
    variationBoundariesSound: true, authenticityConfirmed: true, questionTypeAlignment: true,
    answerCorrectnessVerified: true, transferValidity: true, teachingQuality: true, examStrategyQuality: true,
    validationBehaviourSound: true, originalityConfirmed: true, copyrightRiskClear: true,
    ...overrides,
  };
}

test("a submission with a real reviewer name and a non-rejected decision passes validation", () => {
  assert.equal(validateReviewSubmission(baseSubmission()), null);
});

test("an empty reviewer name is rejected — a review cannot be recorded anonymously", () => {
  const err = validateReviewSubmission(baseSubmission({ reviewer: "" }));
  assert.ok(err && err.includes("anonymously"));
});

test("a whitespace-only reviewer name is rejected, not accepted as a real name", () => {
  const err = validateReviewSubmission(baseSubmission({ reviewer: "   " }));
  assert.ok(err !== null);
});

test("a rejected decision without notes is blocked, matching the database's own check constraint", () => {
  const err = validateReviewSubmission(baseSubmission({ decision: "rejected", notes: "" }));
  assert.ok(err && err.toLowerCase().includes("rejected decision requires notes"));
});

test("a rejected decision WITH notes passes validation", () => {
  const err = validateReviewSubmission(baseSubmission({ decision: "rejected", notes: "The passage reuses copyrighted dialogue." }));
  assert.equal(err, null);
});

test("approved_with_amendment and requires_revalidation do not require notes to pass this guard", () => {
  assert.equal(validateReviewSubmission(baseSubmission({ decision: "approved_with_amendment", notes: "" })), null);
  assert.equal(validateReviewSubmission(baseSubmission({ decision: "requires_revalidation", notes: "" })), null);
});
