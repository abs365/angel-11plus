import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateReviewSubmission, buildNotesWithQualification, sortByDifficulty, computeDifficultyRange,
  REVIEW_CRITERIA, hasNegativeFraming, FAMILY_EDUCATIONAL_CONTEXT, FAMILY_MARKING_BASIS,
  type ReviewSubmission,
} from "@/lib/adminReview";

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

/**
 * Educational Increment 007F, "Review Evidence Clarification", Part 2.
 * The Founder's own quality rule: for every criterion, Yes = satisfied,
 * No = a problem was found, N/A = not applicable. The previously
 * negatively-framed ambiguityFree criterion ("Could a reasonable child
 * give a different answer the key does not accept?", where No was the
 * desirable answer) is the exact regression this guards against.
 */

test("every review criterion declares the yes-is-good polarity, no exceptions", () => {
  for (const c of REVIEW_CRITERIA) {
    assert.equal(c.polarity, "yes-is-good", `${c.key} does not declare the yes-is-good convention`);
  }
});

test("every review criterion covers all 18 real ali_family_review boolean columns, none dropped or duplicated", () => {
  const keys = REVIEW_CRITERIA.map((c) => c.key);
  assert.equal(new Set(keys).size, keys.length, "duplicate criterion key found");
  const expected = [
    "educationalValidity", "competencyValidity", "wordingQuality", "ageAppropriate", "ambiguityFree",
    "difficultyAppropriate", "misconceptionQuality", "explanationQuality", "variationBoundariesSound",
    "authenticityConfirmed", "questionTypeAlignment", "answerCorrectnessVerified", "transferValidity",
    "teachingQuality", "examStrategyQuality", "validationBehaviourSound", "originalityConfirmed", "copyrightRiskClear",
  ];
  assert.deepEqual([...keys].sort(), [...expected].sort());
});

test("no review criterion question is phrased with negative framing (Yes would mean a problem)", () => {
  for (const c of REVIEW_CRITERIA) {
    assert.equal(hasNegativeFraming(c.question), false, `${c.key}: "${c.question}" reads as negatively framed`);
  }
});

test("the ambiguity criterion specifically was reframed positively and no longer asks about a failure state", () => {
  const ambiguity = REVIEW_CRITERIA.find((c) => c.key === "ambiguityFree")!;
  assert.equal(ambiguity.question, "Does the answer key accept every reasonable answer supported by the passage?");
  assert.equal(hasNegativeFraming(ambiguity.question), false);
});

test("hasNegativeFraming catches the original ambiguity wording as an example of the pattern being guarded against", () => {
  assert.equal(hasNegativeFraming("Could a reasonable child give a different, equally defensible answer the key does not accept?"), true);
});

test("hasNegativeFraming does not flag ordinary positively-framed questions", () => {
  assert.equal(hasNegativeFraming("Is the wording clear for an 11+ learner?"), false);
  assert.equal(hasNegativeFraming("Does the answer key accept every reasonable answer supported by the passage?"), false);
});

/**
 * Educational Increment 007F, "Review Evidence Clarification", Part 1.
 * The multi-select family's evidence must distinguish confirmed CSSE
 * evidence, Angel's own original extension, and the real single-year
 * limitation, plus the directly-evidenced-vs-inferred marking split.
 */

test("wave2-fam-multiselect exposes the full confirmed/extension/limitation evidence breakdown", () => {
  const ctx = FAMILY_EDUCATIONAL_CONTEXT["wave2-fam-multiselect"];
  assert.ok(ctx.confirmedFromEvidence && ctx.confirmedFromEvidence.length > 0);
  assert.ok(ctx.angelExtension && ctx.angelExtension.length > 0);
  assert.ok(ctx.evidenceLimitation && ctx.evidenceLimitation.length > 0);
});

test("the multi-select evidence limitation honestly states single-year observation, and explicitly denies rather than claims an annual pattern", () => {
  const ctx = FAMILY_EDUCATIONAL_CONTEXT["wave2-fam-multiselect"];
  const limitation = ctx.evidenceLimitation!.toLowerCase();
  assert.ok(limitation.includes("1 of the 3") || limitation.includes("one of the 3") || limitation.includes("1 of 3"));
  // "annually recurring" is allowed to appear only inside an explicit
  // denial ("not... annually recurring") — never as a bare claim.
  assert.ok(!limitation.includes("every year"));
  if (limitation.includes("annually recurring")) {
    assert.ok(/\bnot\b[^.]*annually recurring/.test(limitation), "must explicitly deny an annual pattern, not assert one");
  }
});

test("the Angel-extension text does not claim CSSE wording or variants, only that Angel wrote original content on the same demand", () => {
  const ctx = FAMILY_EDUCATIONAL_CONTEXT["wave2-fam-multiselect"];
  const extension = ctx.angelExtension!.toLowerCase();
  assert.ok(extension.includes("original"));
  assert.ok(extension.includes("no angel wording") || extension.includes("not copied") || extension.includes("no ") );
});

test("other pilot families' simpler evidence entries are untouched (still no confirmed/extension/limitation breakdown)", () => {
  for (const id of ["wave1-fam-sequencing", "wave1-fam-quote-explain", "wave1-fam-two-character", "wave1-fam-vocab-explain", "mr02-compare"]) {
    const ctx = FAMILY_EDUCATIONAL_CONTEXT[id];
    assert.ok(ctx.evidenceBasis.length > 0, `${id} lost its evidenceBasis`);
    assert.equal(ctx.confirmedFromEvidence, undefined, `${id} unexpectedly gained a confirmed/extension breakdown`);
  }
});

test("multi-select marking basis distinguishes directly-evidenced over-selection from inferred under-selection credit", () => {
  const basis = FAMILY_MARKING_BASIS["wave2-fam-multiselect"];
  assert.equal(basis.length, 2);
  const overSelection = basis.find((b) => b.rule.toLowerCase().includes("more options"));
  const underSelection = basis.find((b) => b.rule.toLowerCase().includes("fewer than"));
  assert.equal(overSelection?.status, "directly-evidenced");
  assert.equal(underSelection?.status, "inferred");
  assert.ok(overSelection?.citation.includes("2023"), "the over-selection rule must cite the real 2023 cover-page instruction");
});

test("the inferred marking rule's citation honestly states no confirming CSSE artefact was found, does not silently upgrade to confirmed", () => {
  const basis = FAMILY_MARKING_BASIS["wave2-fam-multiselect"];
  const underSelection = basis.find((b) => b.status === "inferred")!;
  assert.ok(underSelection.citation.toLowerCase().includes("no accepted") || underSelection.citation.toLowerCase().includes("not") );
});

/**
 * CSSE Completion Programme, Phase B — Founder Educational Review
 * readiness. Mathematics Teaching Review is a distinct review type from
 * the content review covered above (see lib/adminReview.ts's own
 * review_type docstring) — these tests cover its own criteria, target
 * list, and validation, mirroring the discipline already established
 * above for REVIEW_CRITERIA/validateReviewSubmission.
 */

import {
  MATHS_TEACHING_REVIEW_CRITERIA, MATHS_TEACHING_REVIEW_TARGET_IDS, MATHS_TEACHING_REVIEW_METADATA,
  MATHS_TEACHING_CONTENT_VERSION, validateMathsTeachingReviewSubmission,
  type MathsTeachingReviewSubmission,
} from "@/lib/adminReview";

function baseTeachingSubmission(overrides: Partial<MathsTeachingReviewSubmission> = {}): MathsTeachingReviewSubmission {
  return {
    targetId: "mr01-average-mean", reviewer: "Jane Smith", qualificationBasis: "Founder, 11+ preparation experience",
    decision: "approved", notes: "",
    mathematicallyCorrect: true, modelUnderstandable: true, modelTeachesMethod: true,
    guidedPracticeBalanced: true, supportReducedAppropriately: true, remediationUseful: true,
    languageAgeAppropriate: true, teachingRelevantToSkill: true, exampleAvoidsAnswerLeakage: true,
    conceptualExplanationSufficient: true, independentExpectationAppropriate: true, clearAndUnambiguous: true,
    ...overrides,
  };
}

test("exactly 22 Mathematics Teaching Review targets, no duplicates", () => {
  assert.equal(MATHS_TEACHING_REVIEW_TARGET_IDS.length, 22);
  assert.equal(new Set(MATHS_TEACHING_REVIEW_TARGET_IDS).size, 22);
});

test("mr05-number-property-search is never a Mathematics Teaching Review target — it was deliberately excluded from Phase B as TRANSFER-UNSAFE", () => {
  assert.ok(!MATHS_TEACHING_REVIEW_TARGET_IDS.includes("mr05-number-property-search"));
});

test("none of the 4 original 007L proof families are Mathematics Teaching Review targets — they are not new in this phase", () => {
  for (const id of ["mr01-missing-operand", "mr04-best-value", "mr03-angle-ratio", "mr01-measurement-conversion"]) {
    assert.ok(!MATHS_TEACHING_REVIEW_TARGET_IDS.includes(id), `${id} must not appear — it predates Phase B`);
  }
});

test("every Mathematics Teaching Review target has real per-family metadata (competency, Question Type, transfer classification)", () => {
  for (const id of MATHS_TEACHING_REVIEW_TARGET_IDS) {
    const meta = MATHS_TEACHING_REVIEW_METADATA[id];
    assert.ok(meta, `${id} is missing MATHS_TEACHING_REVIEW_METADATA`);
    assert.ok(meta.competency.length > 0);
    assert.ok(meta.questionType.length > 0);
    assert.ok(meta.transferClassification === "TRANSFER-SUFFICIENT" || meta.transferClassification === "TRANSFER-LIMITED");
    assert.ok(meta.transferNote.length > 0);
  }
});

test("MATHS_TEACHING_REVIEW_METADATA has no stray entries beyond the 22 real targets", () => {
  assert.deepEqual(Object.keys(MATHS_TEACHING_REVIEW_METADATA).sort(), [...MATHS_TEACHING_REVIEW_TARGET_IDS].sort());
});

test("every Mathematics Teaching Review target also has a real FAMILY_EDUCATIONAL_CONTEXT entry (what the child is learning / why it matters for CSSE)", () => {
  for (const id of MATHS_TEACHING_REVIEW_TARGET_IDS) {
    const ctx = FAMILY_EDUCATIONAL_CONTEXT[id];
    assert.ok(ctx, `${id} is missing a FAMILY_EDUCATIONAL_CONTEXT entry`);
    assert.ok(ctx.objective.length > 0, `${id} objective must be non-empty`);
    assert.ok(ctx.evidenceBasis.length > 0, `${id} evidenceBasis must be non-empty`);
  }
});

test("every Mathematics Teaching Review criterion declares the yes-is-good polarity", () => {
  for (const c of MATHS_TEACHING_REVIEW_CRITERIA) {
    assert.equal(c.polarity, "yes-is-good", `${c.key} does not declare the yes-is-good convention`);
  }
});

test("no Mathematics Teaching Review criterion is phrased with negative framing", () => {
  for (const c of MATHS_TEACHING_REVIEW_CRITERIA) {
    assert.equal(hasNegativeFraming(c.question), false, `${c.key}: "${c.question}" reads as negatively framed`);
  }
});

test("Mathematics Teaching Review has exactly 12 criteria, matching the directive's own checklist, no duplicates", () => {
  const keys = MATHS_TEACHING_REVIEW_CRITERIA.map((c) => c.key);
  assert.equal(keys.length, 12);
  assert.equal(new Set(keys).size, keys.length, "duplicate criterion key found");
});

test("MATHS_TEACHING_CONTENT_VERSION is a real, non-empty identifier", () => {
  assert.ok(MATHS_TEACHING_CONTENT_VERSION.length > 0);
  assert.ok(MATHS_TEACHING_CONTENT_VERSION.includes("007M"));
});

test("validateMathsTeachingReviewSubmission: a complete submission passes", () => {
  assert.equal(validateMathsTeachingReviewSubmission(baseTeachingSubmission()), null);
});

test("validateMathsTeachingReviewSubmission: an empty reviewer name is rejected", () => {
  const err = validateMathsTeachingReviewSubmission(baseTeachingSubmission({ reviewer: "" }));
  assert.ok(err && err.includes("anonymously"));
});

test("validateMathsTeachingReviewSubmission: an empty qualification basis is rejected — never pre-filled, must be actively confirmed", () => {
  const err = validateMathsTeachingReviewSubmission(baseTeachingSubmission({ qualificationBasis: "" }));
  assert.ok(err && err.toLowerCase().includes("qualification"));
});

test("validateMathsTeachingReviewSubmission: a null decision is rejected, never silently treated as approved", () => {
  const err = validateMathsTeachingReviewSubmission(baseTeachingSubmission({ decision: null }));
  assert.ok(err !== null);
});

test("validateMathsTeachingReviewSubmission: a rejected decision without notes is blocked", () => {
  const err = validateMathsTeachingReviewSubmission(baseTeachingSubmission({ decision: "rejected", notes: "" }));
  assert.ok(err && err.toLowerCase().includes("rejected decision requires notes"));
});

test("validateMathsTeachingReviewSubmission: a rejected decision WITH notes passes", () => {
  assert.equal(validateMathsTeachingReviewSubmission(baseTeachingSubmission({ decision: "rejected", notes: "The MODEL's worked example is confusing." })), null);
});

test("buildNotesWithQualification also works for the Mathematics Teaching Review submission shape (structural type, not ReviewSubmission-specific)", () => {
  const notes = buildNotesWithQualification(baseTeachingSubmission({ qualificationBasis: "Founder, 11+ preparation experience", notes: "The MODEL for mr01-average-mean is clear." }));
  assert.ok(notes.startsWith("Reviewer qualification: Founder, 11+ preparation experience."));
  assert.ok(notes.includes("The MODEL for mr01-average-mean is clear."));
});
