import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreEnglishComprehensionAnswer, type EnglishPromptValidationFields } from "@/lib/learningEngine/englishAnswerValidation";

/**
 * Synonym Multi-Select Marking Contract Incident -- end-to-end
 * regression using the REAL production scoring function
 * (`scoreEnglishComprehensionAnswer`, `checkMultiSelect`'s real
 * dispatcher), not a reimplementation. Reproduces the exact live
 * incident: qf-eng-syn-19, a genuine non-admin learner selecting the
 * exact correct answer ("unwind") was marked "Not quite" despite
 * Angel's own feedback confirming "You selected 1 of the 1 correct
 * boxes" -- see ANGEL_POST_REPAIR_LEARNER_SMOKE_TEST_ADDENDUM.md.
 *
 * The Practice page's own correctness check
 * (app/learning-intelligence/practice/[area]/page.tsx:561) is
 * `isCorrect = result.earnedMarks === q.marks` -- replicated exactly
 * here (not re-derived) so this test proves the same comparison the
 * real page performs, driven by the real scoring result.
 */

function isCorrect(earnedMarks: number, marks: number | undefined): boolean {
  return earnedMarks === marks;
}

const legacyHeuristic = () => 0; // never reached for TIER6_MULTI_SELECT

// The exact published shape of qf-eng-syn-19 BEFORE migrations 239/240 --
// read directly from production. No `marks` key.
const BROKEN_SYN19: EnglishPromptValidationFields = {
  marks: undefined as unknown as number,
  validationTier: "TIER6_MULTI_SELECT",
  correctOptions: ["unwind"],
  requiredSelectionCount: 1,
};

// The exact same row AFTER migration 240's repair -- marks merged in
// from the row's own already-correct requiredSelectionCount.
const REPAIRED_SYN19: EnglishPromptValidationFields = {
  ...BROKEN_SYN19,
  marks: 1,
};

test("reproduces the exact live incident: BEFORE the repair, the genuine correct answer is marked incorrect even though the selection itself is fully correct", () => {
  const result = scoreEnglishComprehensionAnswer("unwind", BROKEN_SYN19, legacyHeuristic);
  assert.equal(result.multiSelectDetail?.correctCount, 1);
  assert.equal(result.multiSelectDetail?.requiredCount, 1);
  assert.equal(result.multiSelectDetail?.exactMatch, true, "the selection itself is correctly recognised as an exact match");
  assert.equal(result.earnedMarks, 1);
  // The exact bug: earnedMarks (1) !== q.marks (undefined) -> marked wrong
  // despite a fully correct selection.
  assert.equal(isCorrect(result.earnedMarks, BROKEN_SYN19.marks), false, "reproduces the exact incident -- a genuinely correct answer is marked incorrect");
});

test("AFTER the repair: the exact genuine correct answer ('unwind') now marks correctly", () => {
  const result = scoreEnglishComprehensionAnswer("unwind", REPAIRED_SYN19, legacyHeuristic);
  assert.equal(result.multiSelectDetail?.correctCount, 1);
  assert.equal(result.earnedMarks, 1);
  assert.equal(isCorrect(result.earnedMarks, REPAIRED_SYN19.marks), true);
});

test("a wrong synonym is still marked incorrect after the repair", () => {
  const result = scoreEnglishComprehensionAnswer("tighten", REPAIRED_SYN19, legacyHeuristic);
  assert.equal(result.multiSelectDetail?.correctCount, 0);
  assert.equal(result.earnedMarks, 0);
  assert.equal(isCorrect(result.earnedMarks, REPAIRED_SYN19.marks), false);
});

test("an empty/blank answer is still marked incorrect after the repair", () => {
  const result = scoreEnglishComprehensionAnswer("", REPAIRED_SYN19, legacyHeuristic);
  assert.equal(result.multiSelectDetail?.correctCount, 0);
  assert.equal(isCorrect(result.earnedMarks, REPAIRED_SYN19.marks), false);
});

test("over-selection (typing more than one word) loses all marks, matching the established over-selection policy -- not weakened by this repair", () => {
  const result = scoreEnglishComprehensionAnswer("unwind, tighten", REPAIRED_SYN19, legacyHeuristic);
  assert.equal(result.multiSelectDetail?.overSelected, true);
  assert.equal(result.earnedMarks, 0);
  assert.equal(isCorrect(result.earnedMarks, REPAIRED_SYN19.marks), false);
});

test("the repair does not make every option accepted -- a distractor word from the same passage is still marked wrong", () => {
  // 'huge' is qf-eng-syn-01's correct answer, not qf-eng-syn-19's -- a
  // plausible wrong guess a learner might carry over between questions.
  const result = scoreEnglishComprehensionAnswer("huge", REPAIRED_SYN19, legacyHeuristic);
  assert.equal(result.multiSelectDetail?.correctCount, 0);
  assert.equal(isCorrect(result.earnedMarks, REPAIRED_SYN19.marks), false);
});

test("case and punctuation tolerance is unchanged by this repair (checkMultiSelect's own existing normalisation, not something this fix alters)", () => {
  const result = scoreEnglishComprehensionAnswer("Unwind.", REPAIRED_SYN19, legacyHeuristic);
  assert.equal(result.multiSelectDetail?.correctCount, 1);
  assert.equal(isCorrect(result.earnedMarks, REPAIRED_SYN19.marks), true);
});

test("a second affected candidate (qf-eng-syn-01, correctOptions: ['huge']) is fixed identically", () => {
  const broken: EnglishPromptValidationFields = { marks: undefined as unknown as number, validationTier: "TIER6_MULTI_SELECT", correctOptions: ["huge"], requiredSelectionCount: 1 };
  const repaired: EnglishPromptValidationFields = { ...broken, marks: 1 };
  const beforeResult = scoreEnglishComprehensionAnswer("huge", broken, legacyHeuristic);
  assert.equal(isCorrect(beforeResult.earnedMarks, broken.marks), false, "reproduces the same incident on a second row");
  const afterResult = scoreEnglishComprehensionAnswer("huge", repaired, legacyHeuristic);
  assert.equal(isCorrect(afterResult.earnedMarks, repaired.marks), true);
});

test("a multi-selection family (requiredSelectionCount=4, matching the 6 pre-existing working rows' own shape) is unaffected by this repair -- same contract, larger N", () => {
  const prompt: EnglishPromptValidationFields = { marks: 4, validationTier: "TIER6_MULTI_SELECT", correctOptions: ["A", "E", "F", "H"], requiredSelectionCount: 4 };
  const result = scoreEnglishComprehensionAnswer("A, E, F, H", prompt, legacyHeuristic);
  assert.equal(result.earnedMarks, 4);
  assert.equal(isCorrect(result.earnedMarks, prompt.marks), true);
});

test("non-TIER6 tiers are entirely unaffected by this repair -- earnedMarks already equals prompt.marks by construction for TIER2, regardless of whether marks is defined", () => {
  const acceptedSetPrompt: EnglishPromptValidationFields = { marks: undefined as unknown as number, validationTier: "TIER2_ACCEPTED_SET", acceptedAnswers: ["brood pouch"] };
  const result = scoreEnglishComprehensionAnswer("brood pouch", acceptedSetPrompt, legacyHeuristic);
  assert.equal(isCorrect(result.earnedMarks, acceptedSetPrompt.marks), true, "TIER2 was never broken by the missing-marks defect -- earnedMarks mirrors prompt.marks by construction");
});
