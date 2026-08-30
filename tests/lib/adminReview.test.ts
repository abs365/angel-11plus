import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  validateReviewSubmission, buildNotesWithQualification, sortByDifficulty, computeDifficultyRange,
  REVIEW_CRITERIA, hasNegativeFraming, FAMILY_EDUCATIONAL_CONTEXT, FAMILY_MARKING_BASIS,
  groupQuestionsForReview,
  deriveBatchReviewStatus, deriveMockEnglishPassageBatch001ReviewStatus, deriveMockWritingBatch001ReviewStatus,
  deriveMockMrBatch003ReviewStatus,
  deriveMockEnglishInc001PassageReviewStatus, deriveMockEnglishInc001WritingReviewStatus,
  MOCK_ENGLISH_INC001_MARKER, MOCK_ENGLISH_INC001_PASSAGE_TARGET_IDS, MOCK_ENGLISH_INC001_WRITING_FAMILIES,
  deriveAmendmentVerificationStatus, buildAmendmentVerificationNotesPrefix,
  deriveLatestOriginalReviewDecision, deriveAmendmentVerificationEligibleTargets, ORIGINAL_CONTENT_REVIEW_TYPES,
  ENGLISH_INC001_AMENDMENT_REGISTER,
  MOCK_ENGLISH_PASSAGE_BATCH001_MARKER, MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID,
  MOCK_WRITING_BATCH001_FAMILIES, MOCK_WRITING_BATCH001_MARKER,
  MOCK_MR_BATCH003_FAMILIES, MOCK_MR_BATCH003_BATCH_MARKER,
  MOCK_SHARED_SCENARIO_COMPLETION_BATCH_FAMILIES, MOCK_SHARED_SCENARIO_COMPLETION_BATCH_MARKER,
  MOCK_SHARED_SCENARIO_COMPLETION_BATCH_TARGET_IDS, buildMockSharedScenarioCompletionBatchNotesPrefix,
  type ReviewSubmission, type RepresentativeQuestion, type SevenXReviewRow, type FamilyReviewHistoryRow,
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

test("Decision 235 -- an approved_with_amendment decision without notes is blocked, matching the database's own extended check constraint (migration 157)", () => {
  const err = validateReviewSubmission(baseSubmission({ decision: "approved_with_amendment", notes: "" }));
  assert.ok(err && err.toLowerCase().includes("approved_with_amendment decision requires notes"));
});

test("Decision 235 -- an approved_with_amendment decision WITH notes passes validation", () => {
  const err = validateReviewSubmission(baseSubmission({ decision: "approved_with_amendment", notes: "Q1 needs an explicit accepted-answer marking policy." }));
  assert.equal(err, null);
});

test("Decision 235 -- requires_revalidation still does not require notes to pass this guard (only rejected and approved_with_amendment do)", () => {
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

// --- groupQuestionsForReview (Decision 152, Review-Surface Grouping ------
// Correction) — proves a grouped numbered question is presented as ONE
// coherent unit, never as unrelated flat rows, the exact defect this
// session found: the review surface previously fetched and rendered
// questions with no awareness of migration 093's grouping columns at all.

function q(overrides: Partial<RepresentativeQuestion>): RepresentativeQuestion {
  return {
    id: "q1", subject: "maths", skill: "QT-MR-01", question: "?", modelAnswer: "1",
    familyId: null, learningUnitId: null, contentDifficulty: "medium", transferClass: null,
    addressesMisconception: null, contentVersion: 1, active: true, provenance: "angel_original",
    eligibilityStatus: "authentic_assessment_candidate", workingSteps: null,
    questionGroupId: null, groupOrder: null, subpartLabel: null, markingMode: null,
    stimulus: null, sharedStem: null, writingTask: null, authorNote: null,
    ...overrides,
  };
}

test("groupQuestionsForReview: an ungrouped row forms its own singleton group", () => {
  const groups = groupQuestionsForReview([q({ id: "a" }), q({ id: "b" })]);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.map((g) => g.items.length), [1, 1]);
});

test("groupQuestionsForReview: mock-mr01mr10-costumeschedule's real 4 rows collapse into exactly 2 groups of 2, matching Decision 151's own content", () => {
  const rows = [
    q({ id: "mock-mr01mr10-costumeschedule-01a", questionGroupId: "mock-mr01mr10-costumeschedule-01", groupOrder: 1, subpartLabel: "(a)" }),
    q({ id: "mock-mr01mr10-costumeschedule-01b", questionGroupId: "mock-mr01mr10-costumeschedule-01", groupOrder: 2, subpartLabel: "(b)" }),
    q({ id: "mock-mr01mr10-costumeschedule-02a", questionGroupId: "mock-mr01mr10-costumeschedule-02", groupOrder: 1, subpartLabel: "(a)" }),
    q({ id: "mock-mr01mr10-costumeschedule-02b", questionGroupId: "mock-mr01mr10-costumeschedule-02", groupOrder: 2, subpartLabel: "(b)" }),
  ];
  const groups = groupQuestionsForReview(rows);
  assert.equal(groups.length, 2, "the 4 rows must NEVER be rendered as 4 unrelated flat questions");
  assert.deepEqual(groups.map((g) => g.items.length), [2, 2]);
  assert.deepEqual(groups[0].items.map((i) => i.id), ["mock-mr01mr10-costumeschedule-01a", "mock-mr01mr10-costumeschedule-01b"]);
  assert.deepEqual(groups[1].items.map((i) => i.id), ["mock-mr01mr10-costumeschedule-02a", "mock-mr01mr10-costumeschedule-02b"]);
});

test("groupQuestionsForReview: within a group, items are ordered by groupOrder even if the input array is reversed", () => {
  const rows = [
    q({ id: "mock-eng-boathouse-q12b", questionGroupId: "mock-eng-boathouse-q12", groupOrder: 2, subpartLabel: "(b)" }),
    q({ id: "mock-eng-boathouse-q12a", questionGroupId: "mock-eng-boathouse-q12", groupOrder: 1, subpartLabel: "(a)" }),
  ];
  const groups = groupQuestionsForReview(rows);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].items.map((i) => i.id), ["mock-eng-boathouse-q12a", "mock-eng-boathouse-q12b"]);
});

test("groupQuestionsForReview: groups are ordered by each group's own first item id, producing the natural Q1..Q12 reading order for a real passage's 13 rows", () => {
  const standalone = (id: string) => q({ id, familyId: id });
  const rows = [
    standalone("mock-eng-boathouse-q02"), standalone("mock-eng-boathouse-q01"),
    q({ id: "mock-eng-boathouse-q12b", questionGroupId: "mock-eng-boathouse-q12", groupOrder: 2, subpartLabel: "(b)" }),
    standalone("mock-eng-boathouse-q11"),
    q({ id: "mock-eng-boathouse-q12a", questionGroupId: "mock-eng-boathouse-q12", groupOrder: 1, subpartLabel: "(a)" }),
    standalone("mock-eng-boathouse-q03"),
  ];
  const groups = groupQuestionsForReview(rows);
  assert.deepEqual(groups.map((g) => g.key), [
    "mock-eng-boathouse-q01", "mock-eng-boathouse-q02", "mock-eng-boathouse-q03",
    "mock-eng-boathouse-q11", "mock-eng-boathouse-q12",
  ]);
});

test("groupQuestionsForReview: never merges two different questionGroupId values together", () => {
  const rows = [
    q({ id: "x1a", questionGroupId: "x1", groupOrder: 1 }),
    q({ id: "x1b", questionGroupId: "x1", groupOrder: 2 }),
    q({ id: "x2a", questionGroupId: "x2", groupOrder: 1 }),
  ];
  const groups = groupQuestionsForReview(rows);
  assert.equal(groups.length, 2);
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

/**
 * CSSE Completion Programme, Phase C, Part 13 — English Teaching Review.
 * Reuses REVIEW_CRITERIA/ReviewSubmission/validateReviewSubmission
 * unchanged (migration 060's own design intent: English's 18 criteria
 * already cover this review's needs) — these tests cover only what is
 * genuinely new: the target list, the metadata, and the distinct
 * review_type submit path.
 */

import {
  ENGLISH_TEACHING_REVIEW_TARGET_IDS, ENGLISH_TEACHING_REVIEW_METADATA, ENGLISH_TEACHING_CONTENT_VERSION,
} from "@/lib/adminReview";

test("exactly 8 English Teaching Review targets, no duplicates", () => {
  assert.equal(ENGLISH_TEACHING_REVIEW_TARGET_IDS.length, 8);
  assert.equal(new Set(ENGLISH_TEACHING_REVIEW_TARGET_IDS).size, 8);
});

test("wave1-fam-tick-justify is never an English Teaching Review target — it has 0 Practice Eligible rows, not learner-reachable", () => {
  assert.ok(!ENGLISH_TEACHING_REVIEW_TARGET_IDS.includes("wave1-fam-tick-justify"));
});

test("every English Teaching Review target has real per-family metadata", () => {
  for (const id of ENGLISH_TEACHING_REVIEW_TARGET_IDS) {
    const meta = ENGLISH_TEACHING_REVIEW_METADATA[id];
    assert.ok(meta, `${id} is missing ENGLISH_TEACHING_REVIEW_METADATA`);
    assert.ok(meta.competency.length > 0);
    assert.ok(meta.questionType.length > 0);
    assert.ok(meta.remediationBeforePhaseC.length > 0);
    assert.ok(meta.transferNote.length > 0);
    assert.ok(meta.guidedClassification === "REAL" || meta.guidedClassification === "INSTRUCTIONAL ONLY");
  }
});

test("ENGLISH_TEACHING_REVIEW_METADATA has no stray entries beyond the 8 real targets", () => {
  assert.deepEqual(Object.keys(ENGLISH_TEACHING_REVIEW_METADATA).sort(), [...ENGLISH_TEACHING_REVIEW_TARGET_IDS].sort());
});

test("every English Teaching Review target also has a real FAMILY_EDUCATIONAL_CONTEXT entry", () => {
  for (const id of ENGLISH_TEACHING_REVIEW_TARGET_IDS) {
    const ctx = FAMILY_EDUCATIONAL_CONTEXT[id];
    assert.ok(ctx, `${id} is missing a FAMILY_EDUCATIONAL_CONTEXT entry`);
    assert.ok(ctx.objective.length > 0);
    assert.ok(ctx.evidenceBasis.length > 0);
  }
});

test("the 3 REAL Guided families (quote-explain, sequencing, multiselect) are classified REAL, not INSTRUCTIONAL ONLY", () => {
  for (const id of ["wave1-fam-quote-explain", "wave1-fam-sequencing", "wave2-fam-multiselect"]) {
    assert.equal(ENGLISH_TEACHING_REVIEW_METADATA[id].guidedClassification, "REAL");
  }
});

test("the 5 INSTRUCTIONAL-ONLY families are classified correctly, not overstated as REAL", () => {
  for (const id of ["wave1-fam-direct-retrieval", "wave1-fam-synonym-battery", "wave1-fam-vocab-explain", "wave1-fam-two-character", "wave1-fam-emotion-cause"]) {
    assert.equal(ENGLISH_TEACHING_REVIEW_METADATA[id].guidedClassification, "INSTRUCTIONAL ONLY");
  }
});

test("the 3 of these 8 families with no MODEL are disclosed honestly, not overstated as having one", () => {
  for (const id of ["wave1-fam-direct-retrieval", "wave1-fam-synonym-battery", "wave1-fam-emotion-cause"]) {
    assert.equal(ENGLISH_TEACHING_REVIEW_METADATA[id].modelStatus, "No MODEL authored yet");
  }
});

test("ENGLISH_TEACHING_CONTENT_VERSION is a real, non-empty identifier naming the real increment", () => {
  assert.ok(ENGLISH_TEACHING_CONTENT_VERSION.length > 0);
  assert.ok(ENGLISH_TEACHING_CONTENT_VERSION.includes("007O"));
});

// --- English Passage Review Status Defect Correction (Decision 157) ------
// Reproduces the exact production scenario: a genuine passage review is
// stored correctly but the pre-correction status reader required a
// free-text marker the passage's own submission path never wrote, so it
// could never be recognised. Fixtures below mirror the real production
// row shapes (family_id/reviewer/review_type/decision/notes) reported by
// the Founder's own read-only query, not synthetic placeholders.

function pendingPlaceholderRow(familyId: string, reviewType: string, marker: string): SevenXReviewRow {
  return {
    family_id: familyId, review_type: reviewType, decision: "pending_independent_review",
    notes: `${marker} new content review: placeholder`, reviewer: "UNASSIGNED",
  };
}

function genuineReviewRow(overrides: Partial<SevenXReviewRow> & { family_id: string; review_type: string }): SevenXReviewRow {
  return {
    decision: "approved", notes: "Reviewer qualification: KS2 English teaching experience.\n\nGenuine reviewer notes.",
    reviewer: "Ayobami Lawal",
    ...overrides,
  };
}

test("1. English passage: pending placeholder only -> not yet reviewed", () => {
  const rows = [pendingPlaceholderRow(MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID, "mock_english_passage_independent_review", MOCK_ENGLISH_PASSAGE_BATCH001_MARKER)];
  const status = deriveMockEnglishPassageBatch001ReviewStatus(rows);
  assert.equal(status.get(MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID)?.reviewed, false);
});

test("2. English passage: pending placeholder + one valid approved review WITHOUT the marker -> reviewed (approved) -- the exact production defect", () => {
  const rows = [
    pendingPlaceholderRow(MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID, "mock_english_passage_independent_review", MOCK_ENGLISH_PASSAGE_BATCH001_MARKER),
    genuineReviewRow({ family_id: MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID, review_type: "mock_english_passage_independent_review" }),
  ];
  const status = deriveMockEnglishPassageBatch001ReviewStatus(rows);
  const s = status.get(MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID);
  assert.equal(s?.reviewed, true, "a genuine review must be recognised even though its notes never contained the marker");
  assert.equal(s?.decision, "approved");
  assert.equal(s?.reviewer, "Ayobami Lawal");
});

test("3. English passage: pending placeholder + TWO valid approved reviews without the marker -> reviewed (approved), latest wins, does not regress to pending", () => {
  const rows = [
    pendingPlaceholderRow(MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID, "mock_english_passage_independent_review", MOCK_ENGLISH_PASSAGE_BATCH001_MARKER),
    genuineReviewRow({ family_id: MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID, review_type: "mock_english_passage_independent_review", notes: "Reviewer qualification: first submission." }),
    genuineReviewRow({ family_id: MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID, review_type: "mock_english_passage_independent_review", notes: "Reviewer qualification: second submission (latest)." }),
  ];
  const status = deriveMockEnglishPassageBatch001ReviewStatus(rows);
  const s = status.get(MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID);
  assert.equal(s?.reviewed, true);
  assert.equal(s?.decision, "approved");
  // rows are processed in the order given (matching fetchBatchReviewStatus's
  // own ascending created_at ordering) -- the LAST matching row wins.
});

test("4. English passage: a completed review with the WRONG review_type is not accepted for this batch", () => {
  const rows = [
    genuineReviewRow({ family_id: MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID, review_type: "content_review" }),
  ];
  const status = deriveMockEnglishPassageBatch001ReviewStatus(rows);
  assert.equal(status.get(MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID)?.reviewed, false);
});

test("5. English passage: a completed review for the WRONG family_id/target is not accepted", () => {
  const rows = [
    genuineReviewRow({ family_id: "some-other-passage", review_type: "mock_english_passage_independent_review" }),
  ];
  const status = deriveMockEnglishPassageBatch001ReviewStatus(rows);
  assert.equal(status.get(MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID)?.reviewed, false);
});

test("6. English passage: a row with reviewer UNASSIGNED is never treated as completed, even if it happens to contain the marker and a non-pending decision", () => {
  const rows: SevenXReviewRow[] = [
    { family_id: MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID, review_type: "mock_english_passage_independent_review", decision: "approved", notes: `${MOCK_ENGLISH_PASSAGE_BATCH001_MARKER} malformed row`, reviewer: "UNASSIGNED" },
  ];
  const status = deriveMockEnglishPassageBatch001ReviewStatus(rows);
  assert.equal(status.get(MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID)?.reviewed, false, "UNASSIGNED must never be read as a genuine reviewer regardless of decision or notes content");
});

test("7. Writing Batch 001 status behaviour is unchanged: still requires the marker, still correctly recognises a properly-tagged review", () => {
  const family = MOCK_WRITING_BATCH001_FAMILIES[0];
  const rows = [
    genuineReviewRow({ family_id: family.familyId, review_type: "mock_writing_prompt_independent_review", notes: `${MOCK_WRITING_BATCH001_MARKER} new content review: ${family.familyId}` }),
  ];
  const status = deriveMockWritingBatch001ReviewStatus(rows, [family.familyId]);
  assert.equal(status.get(family.familyId)?.reviewed, true);

  // and a review missing the marker is still correctly rejected for Writing -- Decision 157 did not weaken this batch's own isolation.
  const rowsWithoutMarker = [
    genuineReviewRow({ family_id: family.familyId, review_type: "mock_writing_prompt_independent_review", notes: "Reviewer qualification: no marker here." }),
  ];
  const statusWithoutMarker = deriveMockWritingBatch001ReviewStatus(rowsWithoutMarker, [family.familyId]);
  assert.equal(statusWithoutMarker.get(family.familyId)?.reviewed, false, "Writing must still require its own marker -- unaffected by the passage-specific correction");
});

test("9. English Content Foundation Increment 001 passage review: pending placeholder only -> not yet reviewed, for BOTH new passages independently", () => {
  for (const id of MOCK_ENGLISH_INC001_PASSAGE_TARGET_IDS) {
    const rows = [pendingPlaceholderRow(id, "mock_english_passage_independent_review", MOCK_ENGLISH_INC001_MARKER)];
    const status = deriveMockEnglishInc001PassageReviewStatus(rows);
    assert.equal(status.get(id)?.reviewed, false);
  }
});

test("10. English Content Foundation Increment 001 passage review: a genuine approved decision (no marker required, mirroring Decision 157's own correction for the existing certified passage) is correctly recognised for each passage independently", () => {
  for (const id of MOCK_ENGLISH_INC001_PASSAGE_TARGET_IDS) {
    const rows = [
      pendingPlaceholderRow(id, "mock_english_passage_independent_review", MOCK_ENGLISH_INC001_MARKER),
      genuineReviewRow({ family_id: id, review_type: "mock_english_passage_independent_review", notes: "Reviewer qualification: KS2 English teaching experience.\n\nNo batch marker in this submission's own notes." }),
    ];
    const status = deriveMockEnglishInc001PassageReviewStatus(rows);
    const s = status.get(id);
    assert.equal(s?.reviewed, true);
    assert.equal(s?.decision, "approved");
    assert.equal(s?.reviewer, "Ayobami Lawal");
  }
});

test("11. English Content Foundation Increment 001 passage review: a decision for ONE passage never marks the OTHER passage as reviewed -- no cross-target contamination", () => {
  const [understudyId, beeId] = MOCK_ENGLISH_INC001_PASSAGE_TARGET_IDS;
  const rows = [
    pendingPlaceholderRow(understudyId, "mock_english_passage_independent_review", MOCK_ENGLISH_INC001_MARKER),
    pendingPlaceholderRow(beeId, "mock_english_passage_independent_review", MOCK_ENGLISH_INC001_MARKER),
    genuineReviewRow({ family_id: understudyId, review_type: "mock_english_passage_independent_review" }),
  ];
  const status = deriveMockEnglishInc001PassageReviewStatus(rows);
  assert.equal(status.get(understudyId)?.reviewed, true);
  assert.equal(status.get(beeId)?.reviewed, false, "Bee Navigation must remain unreviewed -- only the Understudy row carried a genuine decision");
});

test("12. English Content Foundation Increment 001 passage review: a content_review decision for the same family_id (a different review_type) is never read as satisfying the Mock independent review", () => {
  const [understudyId] = MOCK_ENGLISH_INC001_PASSAGE_TARGET_IDS;
  const rows = [genuineReviewRow({ family_id: understudyId, review_type: "content_review" })];
  const status = deriveMockEnglishInc001PassageReviewStatus(rows);
  assert.equal(status.get(understudyId)?.reviewed, false);
});

test("13. English Content Foundation Increment 001 Writing review: still requires its own marker, still correctly recognises a properly-tagged review, for all 3 new prompts", () => {
  for (const family of MOCK_ENGLISH_INC001_WRITING_FAMILIES) {
    const rows = [
      genuineReviewRow({ family_id: family.familyId, review_type: "mock_writing_prompt_independent_review", notes: `${MOCK_ENGLISH_INC001_MARKER} new content review: Continuous Writing prompt (${family.familyId})` }),
    ];
    const status = deriveMockEnglishInc001WritingReviewStatus(rows, [family.familyId]);
    assert.equal(status.get(family.familyId)?.reviewed, true);

    const rowsWithoutMarker = [
      genuineReviewRow({ family_id: family.familyId, review_type: "mock_writing_prompt_independent_review", notes: "Reviewer qualification: no marker here." }),
    ];
    const statusWithoutMarker = deriveMockEnglishInc001WritingReviewStatus(rowsWithoutMarker, [family.familyId]);
    assert.equal(statusWithoutMarker.get(family.familyId)?.reviewed, false, "must still require its own marker");
  }
});

test("14. English Content Foundation Increment 001: the 3 target ids are exactly the 3 real writing-prompt family_id column values migration 154 registered, never the prompts' own row ids", () => {
  const ids = MOCK_ENGLISH_INC001_WRITING_FAMILIES.map((f) => f.familyId).sort();
  assert.deepEqual(ids, ["mock-writing-wc01a-mistakelearned", "mock-writing-wc01a-newplace", "mock-writing-wc01a-screentime"].sort());
});

// === Decision 235 -- Amendment Register + Amendment Verification ===========

test("Decision 235: the amendment register carries exactly the 4 approved_with_amendment targets, in the correct target/decision pairing -- Mistake Learned (approved, no amendment) is absent", () => {
  const ids = ENGLISH_INC001_AMENDMENT_REGISTER.map((e) => e.targetId).sort();
  assert.deepEqual(ids, ["eng-inc001-bee-navigation", "eng-inc001-understudy", "mock-writing-wc01a-newplace", "mock-writing-wc01a-screentime"].sort());
  assert.ok(!ids.includes("mock-writing-wc01a-mistakelearned"), "A Mistake You Learned From is the approved control case and must never appear in the amendment register");
  for (const entry of ENGLISH_INC001_AMENDMENT_REGISTER) {
    assert.equal(entry.originalDecision, "approved_with_amendment");
    assert.ok(entry.requiredCorrection.length > 0);
    assert.ok(entry.verificationCriterion.length > 0);
  }
});

test("Decision 235: the Bee register entry discloses AUDITED/NO CONTENT CHANGE, not a fabricated correction -- the amendment was already satisfied by Decision 229", () => {
  const bee = ENGLISH_INC001_AMENDMENT_REGISTER.find((e) => e.targetId === "eng-inc001-bee-navigation");
  assert.ok(bee?.requiredCorrection.includes("AUDITED, NO CONTENT CHANGE REQUIRED"));
  assert.equal(bee?.affectedContent, "none (verified unchanged: ali_passage_bank.eng-inc001-bee-navigation; ali_question_bank.eng-inc001-bee-q01 through q08)");
});

test("Decision 235: amendment verification status is a genuinely separate review_type from the original independent review -- a completed ORIGINAL review alone never counts as verified", () => {
  const id = "eng-inc001-understudy";
  const rows = [genuineReviewRow({ family_id: id, review_type: "mock_english_passage_independent_review", decision: "approved_with_amendment" })];
  const status = deriveAmendmentVerificationStatus(rows, [id]);
  assert.equal(status.get(id)?.reviewed, false, "the original independent-review row must never be misread as amendment-verification evidence");
});

test("Decision 235: amendment verification status correctly recognises a genuine amendment_verification decision, independently per target, with no cross-target contamination", () => {
  const [understudyId, beeId] = ["eng-inc001-understudy", "eng-inc001-bee-navigation"];
  const rows = [genuineReviewRow({ family_id: understudyId, review_type: "amendment_verification", decision: "approved" })];
  const status = deriveAmendmentVerificationStatus(rows, [understudyId, beeId]);
  assert.equal(status.get(understudyId)?.reviewed, true);
  assert.equal(status.get(understudyId)?.decision, "approved");
  assert.equal(status.get(beeId)?.reviewed, false, "Bee must remain unverified -- only the Understudy row carried a genuine amendment_verification decision");
});

test("Decision 235: the notes-prefix builder embeds the correct target title and the exact required correction is available from the shared register (no second, hand-typed copy)", () => {
  const prefix = buildAmendmentVerificationNotesPrefix("mock-writing-wc01a-newplace");
  assert.match(prefix, /^AMENDMENT-VERIFICATION \(Decision 235\): Somewhere New/);
  assert.match(prefix, /does not itself convert approved_with_amendment to approved/);
});

// === Decision 251, Part B -- generic, history-derived Amendment Verification eligibility ===

function historyRow(overrides: Partial<FamilyReviewHistoryRow> & { family_id: string; review_type: string; decision: string; created_at: string }): FamilyReviewHistoryRow {
  return { reviewer: "Ayobami Lawal", notes: "Genuine reviewer notes.", review_target_type: "passage", ...overrides };
}

test("Decision 251: ORIGINAL_CONTENT_REVIEW_TYPES excludes amendment_verification, founder_amendment_clarification, and every *_teaching_review type", () => {
  assert.ok(!ORIGINAL_CONTENT_REVIEW_TYPES.includes("amendment_verification"));
  assert.ok(!ORIGINAL_CONTENT_REVIEW_TYPES.includes("founder_amendment_clarification"));
  assert.ok(!ORIGINAL_CONTENT_REVIEW_TYPES.includes("maths_teaching_review"));
  assert.ok(!ORIGINAL_CONTENT_REVIEW_TYPES.includes("english_teaching_review"));
  assert.ok(!ORIGINAL_CONTENT_REVIEW_TYPES.includes("writing_teaching_review"));
});

test("Decision 251: deriveAmendmentVerificationEligibleTargets reproduces exactly the same 4 real Increment 001 targets the old hardcoded list named, from real-shaped review history alone -- Mistake Learned (approved, no amendment) correctly excluded, matching the register's own control case", () => {
  const rows: FamilyReviewHistoryRow[] = [
    historyRow({ family_id: "eng-inc001-understudy", review_type: "mock_english_passage_independent_review", decision: "approved_with_amendment", created_at: "2026-08-01T00:00:00Z", review_target_type: "passage" }),
    historyRow({ family_id: "eng-inc001-bee-navigation", review_type: "mock_english_passage_independent_review", decision: "approved_with_amendment", created_at: "2026-08-01T00:00:00Z", review_target_type: "passage" }),
    historyRow({ family_id: "mock-writing-wc01a-newplace", review_type: "mock_writing_prompt_independent_review", decision: "approved_with_amendment", created_at: "2026-08-01T00:00:00Z", review_target_type: "writing_prompt" }),
    historyRow({ family_id: "mock-writing-wc01a-screentime", review_type: "mock_writing_prompt_independent_review", decision: "approved_with_amendment", created_at: "2026-08-01T00:00:00Z", review_target_type: "writing_prompt" }),
    historyRow({ family_id: "mock-writing-wc01a-mistakelearned", review_type: "mock_writing_prompt_independent_review", decision: "approved", created_at: "2026-08-01T00:00:00Z", review_target_type: "writing_prompt" }),
  ];
  const eligible = deriveAmendmentVerificationEligibleTargets(rows);
  assert.deepEqual(eligible.map((t) => t.id).sort(), ["eng-inc001-bee-navigation", "eng-inc001-understudy", "mock-writing-wc01a-newplace", "mock-writing-wc01a-screentime"].sort());
  assert.ok(!eligible.some((t) => t.id === "mock-writing-wc01a-mistakelearned"), "plain approved with no amendment must never become eligible");
  const understudy = eligible.find((t) => t.id === "eng-inc001-understudy");
  assert.equal(understudy?.reviewTargetType, "passage");
  const newplace = eligible.find((t) => t.id === "mock-writing-wc01a-newplace");
  assert.equal(newplace?.reviewTargetType, "writing_prompt");
});

test("Decision 251: a brand-new increment's target becomes eligible automatically once its own formal review is recorded approved_with_amendment -- zero hardcoded-list membership required", () => {
  const rows: FamilyReviewHistoryRow[] = [
    historyRow({ family_id: "eng-inc003-peppersbreakfast", review_type: "content_review", decision: "approved_with_amendment", created_at: "2026-08-30T00:00:00Z", review_target_type: "passage" }),
  ];
  const eligible = deriveAmendmentVerificationEligibleTargets(rows);
  assert.deepEqual(eligible.map((t) => t.id), ["eng-inc003-peppersbreakfast"]);
});

test("Decision 251: Approved does not require amendment verification -- a plain approved decision never appears as eligible", () => {
  const rows: FamilyReviewHistoryRow[] = [
    historyRow({ family_id: "eng-inc003-writing-wc01a-imaginedplace", review_type: "content_review", decision: "approved", created_at: "2026-08-30T00:00:00Z", review_target_type: "writing_prompt" }),
  ];
  assert.deepEqual(deriveAmendmentVerificationEligibleTargets(rows), []);
});

test("Decision 251: Requires revalidation does not masquerade as amendment verification -- Salmon's own history shape (requires_revalidation, later Approved) is never eligible at either stage", () => {
  const stillRevalidating: FamilyReviewHistoryRow[] = [
    historyRow({ family_id: "eng-inc003-salmonnavigation", review_type: "content_review", decision: "requires_revalidation", created_at: "2026-08-30T00:00:00Z", review_target_type: "passage" }),
  ];
  assert.deepEqual(deriveAmendmentVerificationEligibleTargets(stillRevalidating), []);
  const laterApproved: FamilyReviewHistoryRow[] = [
    ...stillRevalidating,
    historyRow({ family_id: "eng-inc003-salmonnavigation", review_type: "content_review", decision: "approved", created_at: "2026-08-31T00:00:00Z", review_target_type: "passage" }),
  ];
  assert.deepEqual(deriveAmendmentVerificationEligibleTargets(laterApproved), []);
});

test("Decision 251: Rejected cannot progress into amendment verification eligibility", () => {
  const rows: FamilyReviewHistoryRow[] = [
    historyRow({ family_id: "some-family", review_type: "content_review", decision: "rejected", notes: "A rejection note.", created_at: "2026-08-30T00:00:00Z", review_target_type: "passage" }),
  ];
  assert.deepEqual(deriveAmendmentVerificationEligibleTargets(rows), []);
});

test("Decision 251: only the LATEST original-review decision governs eligibility -- an earlier approved_with_amendment superseded by a later formal Approved decision is correctly no longer eligible (the reviewer is allowed to decide the current live content is now satisfactory, per Decision 251 Part C)", () => {
  const rows: FamilyReviewHistoryRow[] = [
    historyRow({ family_id: "eng-inc003-peppersbreakfast", review_type: "content_review", decision: "approved_with_amendment", created_at: "2026-08-30T00:00:00Z", review_target_type: "passage" }),
    historyRow({ family_id: "eng-inc003-peppersbreakfast", review_type: "content_review", decision: "approved", created_at: "2026-08-30T01:00:00Z", review_target_type: "passage" }),
  ];
  assert.deepEqual(deriveAmendmentVerificationEligibleTargets(rows), []);
});

test("Decision 251: a pending placeholder row and an UNASSIGNED reviewer are both ignored when deriving the latest original-review decision, exactly as deriveBatchReviewStatus already established for every other batch", () => {
  const rows: FamilyReviewHistoryRow[] = [
    historyRow({ family_id: "eng-inc003-writing-wc01a-imaginedplace", review_type: "content_review", decision: "pending_independent_review", reviewer: "UNASSIGNED", created_at: "2026-08-29T00:00:00Z", review_target_type: "writing_prompt" }),
    historyRow({ family_id: "eng-inc003-writing-wc01a-imaginedplace", review_type: "content_review", decision: "approved_with_amendment", reviewer: "UNASSIGNED", created_at: "2026-08-30T00:00:00Z", review_target_type: "writing_prompt" }),
  ];
  assert.equal(deriveLatestOriginalReviewDecision(rows, "eng-inc003-writing-wc01a-imaginedplace"), null, "an UNASSIGNED reviewer must never count as a real formal decision");
});

test("Decision 251: amendment_verification and *_teaching_review rows are never treated as a fresh original decision, even when they are the most recent row for a family", () => {
  const rows: FamilyReviewHistoryRow[] = [
    historyRow({ family_id: "eng-inc001-understudy", review_type: "mock_english_passage_independent_review", decision: "approved_with_amendment", created_at: "2026-08-01T00:00:00Z", review_target_type: "passage" }),
    historyRow({ family_id: "eng-inc001-understudy", review_type: "amendment_verification", decision: "approved", created_at: "2026-08-02T00:00:00Z", review_target_type: "passage" }),
    historyRow({ family_id: "eng-inc001-understudy", review_type: "english_teaching_review", decision: "approved", created_at: "2026-08-03T00:00:00Z", review_target_type: "passage" }),
  ];
  const latest = deriveLatestOriginalReviewDecision(rows, "eng-inc001-understudy");
  assert.equal(latest?.review_type, "mock_english_passage_independent_review", "amendment_verification and teaching-review rows must not shadow the real original decision");
  assert.equal(latest?.decision, "approved_with_amendment");
  assert.deepEqual(deriveAmendmentVerificationEligibleTargets(rows).map((t) => t.id), ["eng-inc001-understudy"]);
});

test("8. Mathematics Batch 003 status behaviour is unchanged: still requires the marker, still correctly recognises a properly-tagged review", () => {
  const family = MOCK_MR_BATCH003_FAMILIES[0];
  const rows = [
    genuineReviewRow({ family_id: family.familyId, review_type: "mock_maths_independent_review", notes: `${MOCK_MR_BATCH003_BATCH_MARKER} new content review: ${family.familyId}` }),
  ];
  const status = deriveMockMrBatch003ReviewStatus(rows, [family.familyId]);
  assert.equal(status.get(family.familyId)?.reviewed, true);

  const rowsWithoutMarker = [
    genuineReviewRow({ family_id: family.familyId, review_type: "mock_maths_independent_review", notes: "Reviewer qualification: no marker here." }),
  ];
  const statusWithoutMarker = deriveMockMrBatch003ReviewStatus(rowsWithoutMarker, [family.familyId]);
  assert.equal(statusWithoutMarker.get(family.familyId)?.reviewed, false, "Mathematics Batch 003 must still require its own marker -- unaffected by the passage-specific correction");
});

test("deriveBatchReviewStatus default behaviour (requireMarker defaults to true) still rejects a genuine review with no marker, for any generic caller not opting out", () => {
  const rows = [genuineReviewRow({ family_id: "some-family", review_type: "content_review", notes: "no marker in this text" })];
  const status = deriveBatchReviewStatus(rows, ["some-family"], "SOME-BATCH-MARKER", "content_review");
  assert.equal(status.get("some-family")?.reviewed, false);
});

test("deriveBatchReviewStatus with requireMarker explicitly true behaves identically to the default (no silent behaviour change for existing callers)", () => {
  const rows = [genuineReviewRow({ family_id: "some-family", review_type: "content_review", notes: "no marker in this text" })];
  const withDefault = deriveBatchReviewStatus(rows, ["some-family"], "SOME-BATCH-MARKER", "content_review");
  const withExplicitTrue = deriveBatchReviewStatus(rows, ["some-family"], "SOME-BATCH-MARKER", "content_review", true);
  assert.deepEqual(withDefault, withExplicitTrue);
});

/**
 * Mathematics First Mock Minimum — Shared-Scenario Completion Batch
 * (Decision 168/169/170).
 */

test("MOCK_SHARED_SCENARIO_COMPLETION_BATCH_FAMILIES contains exactly the 2 approved families, each grouped (2 question IDs)", () => {
  assert.deepEqual(MOCK_SHARED_SCENARIO_COMPLETION_BATCH_TARGET_IDS, ["mock-mr10-fairprep", "mock-mr09-runningclub"]);
  for (const f of MOCK_SHARED_SCENARIO_COMPLETION_BATCH_FAMILIES) {
    assert.equal(f.newQuestionIds.length, 2, `${f.familyId} must have exactly 2 grouped question IDs`);
  }
});

test("buildMockSharedScenarioCompletionBatchNotesPrefix() output exactly matches the real notes string embedded in migration 114 -- a genuine cross-file consistency proof, not merely consistent hand-authoring", () => {
  const sql114 = fs.readFileSync("supabase/migrations/114_mock_mathematics_shared_scenario_completion_batch_pending_review.sql", "utf8");
  for (const f of MOCK_SHARED_SCENARIO_COMPLETION_BATCH_FAMILIES) {
    const built = buildMockSharedScenarioCompletionBatchNotesPrefix(f.familyId, f.newQuestionIds);
    assert.ok(sql114.includes(built), `migration 114 must contain the exact notes string this builder produces for ${f.familyId}: "${built}"`);
  }
});

test("deriveBatchReviewStatus correctly recognises a genuine shared-scenario-completion-batch review using the real marker", () => {
  const family = MOCK_SHARED_SCENARIO_COMPLETION_BATCH_FAMILIES[0];
  const notes = buildMockSharedScenarioCompletionBatchNotesPrefix(family.familyId, family.newQuestionIds);
  const rows = [genuineReviewRow({ family_id: family.familyId, review_type: "mock_maths_independent_review", notes })];
  const status = deriveBatchReviewStatus(rows, [family.familyId], MOCK_SHARED_SCENARIO_COMPLETION_BATCH_MARKER, "mock_maths_independent_review");
  assert.equal(status.get(family.familyId)?.reviewed, true);
});
