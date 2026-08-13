import { test } from "node:test";
import assert from "node:assert/strict";
import { validateReviewSubmission, buildNotesWithQualification, sortByDifficulty, computeDifficultyRange, type ReviewSubmission } from "@/lib/adminReview";

/**
 * Educational Increment 007E, Part 9. Tests the pure validation guard
 * used before a review is ever written to ali_family_review — the last
 * line of defence against an anonymous or unexplained rejection being
 * recorded through the admin review interface.
 */

function baseSubmission(overrides: Partial<ReviewSubmission> = {}): ReviewSubmission {
  return {
    reviewTargetType: "question_family", targetId: "wave1-fam-two-character",
    reviewer: "Jane Smith", qualificationBasis: "Teaching experience, KS2 English", decision: "approved", notes: "", evidenceReference: "", provenanceReference: "",
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

test("an empty qualification basis is rejected — 007F, Part 2's recording requirement", () => {
  const err = validateReviewSubmission(baseSubmission({ qualificationBasis: "" }));
  assert.ok(err && err.toLowerCase().includes("qualification"));
});

test("a whitespace-only qualification basis is rejected", () => {
  const err = validateReviewSubmission(baseSubmission({ qualificationBasis: "   " }));
  assert.ok(err !== null);
});

test("buildNotesWithQualification always leads with the qualification line, never silently drops it", () => {
  const notes = buildNotesWithQualification(baseSubmission({ qualificationBasis: "Founder, 11+ preparation experience, programme owner", notes: "" }));
  assert.equal(notes, "Reviewer qualification: Founder, 11+ preparation experience, programme owner.");
});

test("buildNotesWithQualification appends the reviewer's own findings after the qualification line, not instead of it", () => {
  const notes = buildNotesWithQualification(baseSubmission({
    qualificationBasis: "Founder, 11+ preparation experience, programme owner",
    notes: "The distractors in item w1-fam-two-character-03 are too obviously wrong.",
  }));
  assert.ok(notes.startsWith("Reviewer qualification: Founder, 11+ preparation experience, programme owner."));
  assert.ok(notes.includes("The distractors in item w1-fam-two-character-03 are too obviously wrong."));
});

/**
 * Educational Increment 007F, Part 3/4. content_difficulty is stored as
 * "easy"/"medium"/"hard" — plain alphabetical sort would wrongly order
 * these as easy, hard, medium. These prove the real difficulty order is
 * used everywhere the reviewer sees a "easiest to hardest" sample or
 * range, matching the Founder's own observation that the interface must
 * present genuine educational structure, not an implementation artefact.
 */

test("sortByDifficulty orders easy before medium before hard, not alphabetically", () => {
  const items = [{ contentDifficulty: "hard" }, { contentDifficulty: "easy" }, { contentDifficulty: "medium" }];
  const sorted = sortByDifficulty(items);
  assert.deepEqual(sorted.map((i) => i.contentDifficulty), ["easy", "medium", "hard"]);
});

test("sortByDifficulty does not mutate the original array", () => {
  const items = [{ contentDifficulty: "hard" }, { contentDifficulty: "easy" }];
  const original = [...items];
  sortByDifficulty(items);
  assert.deepEqual(items, original);
});

test("computeDifficultyRange collapses a single difficulty to just that word", () => {
  assert.equal(computeDifficultyRange(["medium", "medium", "medium"]), "medium");
});

test("computeDifficultyRange shows a genuine easy-to-hard range in the correct order regardless of input order", () => {
  assert.equal(computeDifficultyRange(["hard", "easy", "medium"]), "easy to hard");
  assert.equal(computeDifficultyRange(["medium", "hard"]), "medium to hard");
});

test("computeDifficultyRange handles no data without throwing", () => {
  assert.equal(computeDifficultyRange([]), "unknown");
});

/**
 * Educational Increment 007F reviewer-experience correction: "Claude must
 * never preselect APPROVED." A null decision must be rejected by the same
 * guard as an empty reviewer name, never silently defaulted.
 */
test("a null decision is rejected, never silently treated as approved", () => {
  const err = validateReviewSubmission(baseSubmission({ decision: null }));
  assert.ok(err !== null);
});
