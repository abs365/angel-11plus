import { test } from "node:test";
import assert from "node:assert/strict";
import { checkMathsAnswer } from "@/lib/learningEngine/practiceContent";
import { scoreEnglishComprehensionAnswer, type EnglishPromptValidationFields } from "@/lib/learningEngine/englishAnswerValidation";
import { mapEnglishCandidateToStoreRow } from "@/lib/ali/questionFactory/candidateStoreMapping";
import { ENGLISH_SYNONYM_CANDIDATES } from "@/lib/ali/questionFactory/englishSynonymFamily";
import { getPassageById } from "@/lib/ali/questionFactory/englishPassages";

/**
 * Published Answer Integrity Incident -- end-to-end regression, using the
 * REAL production marking functions (not a re-implementation), against
 * the exact incident data and representative diagram/coordinate/
 * multi-select content. Proves migration 237 + the englishSynonymFamily
 * fix, taken together, actually restore correct marking -- not just that
 * the SQL/data shape looks right in isolation. Mirrors migration 238's
 * own repair exactly: `{ ...question_content, answer: claimed_answer }`
 * for Maths, is what publish_question_candidate() (post-237) and the
 * data repair (238) both produce.
 */

/** The exact merge migration 237/238 perform for a Maths row, reproduced locally for a real MathsQuestion-shaped prompt. */
function repairedMathsPrompt(questionContent: Record<string, unknown>, claimedAnswer: string): Record<string, unknown> {
  return { ...questionContent, answer: claimedAnswer };
}

test("the exact incident, reproduced and proven fixed with the real marker: mr02-substitution, expected 40, learner enters 40, result correct", () => {
  // The exact published question_content for
  // factory-candidate-mr02-substitution-ea154c86af6a9f81, read directly
  // from production during the incident investigation.
  const questionContent = {
    params: { total: 52, ratioB: 4, ratioC: 5 },
    diagram: null,
    diagrams: null,
    question: "B = 4A and 5C = A. A student says A = 10 and, forgetting to apply the multiplier, says B = 10 too (instead of using B = 4A). This is incorrect. What is the correct value of B?",
    contextTag: "algebraic_substitution",
    workingSteps: ["B = 4A, not A itself", "A = 10", "B = 4 × 10 = 40"],
    reasoningRoute: "error_identification",
    unknownPosition: "corrected_b_value",
    representationType: "prose",
  };
  const repaired = repairedMathsPrompt(questionContent, "40");
  assert.equal(repaired.answer, "40");
  assert.notEqual(String(repaired.answer), "undefined", 'feedback must never say "Correct answer: undefined" again');
  assert.equal(checkMathsAnswer("40", String(repaired.answer)), true);
});

test("a wrong Maths answer on the same repaired question remains incorrect", () => {
  const repaired = repairedMathsPrompt({ question: "..." }, "40");
  assert.equal(checkMathsAnswer("41", String(repaired.answer)), false);
  assert.equal(checkMathsAnswer("10", String(repaired.answer)), false);
  assert.equal(checkMathsAnswer("", String(repaired.answer)), false);
});

test("diagram-bearing Maths marking remains valid after repair (mr03-compound-area-perimeter): diagram content is untouched by the merge, and marking works", () => {
  // Real published shape for a compound-area-perimeter candidate.
  const questionContent = {
    question: "An L-shaped field is formed from a 9m by 15m rectangle with a 2m by 8m rectangular corner removed. What is the total perimeter of the field, in metres?",
    workingSteps: ["An L-shape's perimeter equals the perimeter of its outer bounding rectangle -- every notch edge removed is replaced by an equal-length inward edge", "2 × (9 + 15) = 48m"],
    diagram: {
      type: "compound_rectilinear",
      vertices: [{ x: 0, y: 0 }, { x: 9, y: 0 }, { x: 9, y: 7 }, { x: 7, y: 7 }, { x: 7, y: 15 }, { x: 0, y: 15 }],
      edgeLabels: [{ edgeIndex: 0, label: "9 m" }, { edgeIndex: 2, label: "2 m" }, { edgeIndex: 3, label: "8 m" }, { edgeIndex: 5, label: "15 m" }],
    },
    representationType: "diagram",
  };
  const repaired = repairedMathsPrompt(questionContent, "48m");
  // The diagram survives the merge byte-for-byte.
  assert.deepEqual(repaired.diagram, questionContent.diagram);
  assert.equal(checkMathsAnswer("48m", String(repaired.answer)), true);
  assert.equal(checkMathsAnswer("48", String(repaired.answer)), true); // checkMathsAnswer already strips units -- unaffected by this fix
  assert.equal(checkMathsAnswer("50m", String(repaired.answer)), false);
});

test("coordinate Maths marking remains valid after repair (mr03-coordinate)", () => {
  const questionContent = {
    question: "Point B is at (8, -6). It is reflected in the y-axis. What are the new coordinates?",
    workingSteps: ["Reflecting in the y-axis keeps y the same and negates x", "(8, -6) → (-8, -6)"],
    params: { x: 8, y: -6 },
    representationType: "prose",
  };
  const repaired = repairedMathsPrompt(questionContent, "(-8, -6)");
  assert.equal(checkMathsAnswer("(-8, -6)", String(repaired.answer)), true);
  assert.equal(checkMathsAnswer("(8, -6)", String(repaired.answer)), false);
});

test("synonym-battery multi-select: correct selection passes with the real dispatcher, using the real fixed blueprint data end to end", () => {
  const candidate = ENGLISH_SYNONYM_CANDIDATES.find((c) => c.candidateId === "eng-syn-01")!; // "enormous" -> "huge"
  const args = mapEnglishCandidateToStoreRow(candidate, getPassageById(candidate.passageId));
  const prompt = args.p_question_content as unknown as EnglishPromptValidationFields;
  assert.equal(prompt.validationTier, "TIER6_MULTI_SELECT");

  const legacyHeuristic = () => 0;
  const correctResult = scoreEnglishComprehensionAnswer("huge", prompt, legacyHeuristic);
  assert.equal(correctResult.tier, "TIER6_MULTI_SELECT");
  assert.equal(correctResult.automaticallyVerified, true);
  assert.equal(correctResult.earnedMarks, 1, "the correct single option must earn the full 1 mark");
});

test("synonym-battery multi-select: wrong or incomplete selection fails appropriately with the real dispatcher", () => {
  const candidate = ENGLISH_SYNONYM_CANDIDATES.find((c) => c.candidateId === "eng-syn-01")!;
  const args = mapEnglishCandidateToStoreRow(candidate, getPassageById(candidate.passageId));
  const prompt = args.p_question_content as unknown as EnglishPromptValidationFields;
  const legacyHeuristic = () => 0;

  const wrongResult = scoreEnglishComprehensionAnswer("tiny", prompt, legacyHeuristic);
  assert.equal(wrongResult.earnedMarks, 0, "an incorrect option must earn 0");

  const emptyResult = scoreEnglishComprehensionAnswer("", prompt, legacyHeuristic);
  assert.equal(emptyResult.earnedMarks, 0, "no selection must earn 0, not silently pass");

  const overSelectedResult = scoreEnglishComprehensionAnswer("huge, tiny", prompt, legacyHeuristic);
  assert.equal(overSelectedResult.earnedMarks, 0, "over-selection beyond requiredSelectionCount must lose all marks (real CSSE tick-box rule), not partially pass");
});

test("every one of the 20 real synonym-battery candidates now marks correctly via the real dispatcher -- not just candidate eng-syn-01", () => {
  const legacyHeuristic = () => 0;
  for (const candidate of ENGLISH_SYNONYM_CANDIDATES) {
    const args = mapEnglishCandidateToStoreRow(candidate, getPassageById(candidate.passageId));
    const prompt = args.p_question_content as unknown as EnglishPromptValidationFields;
    const correctAnswer = args.p_claimed_answer;
    const result = scoreEnglishComprehensionAnswer(correctAnswer, prompt, legacyHeuristic);
    assert.equal(result.earnedMarks, 1, `${candidate.candidateId} must be markable correct via its own genuine claimed_answer`);
  }
});

test("every one of the 20 real synonym-battery candidates rejects EVERY one of its own wrong options -- guards against correctOptions ever again containing the full options list (the second, independently-discovered defect: that shape would mark every possible answer correct)", () => {
  const legacyHeuristic = () => 0;
  for (const candidate of ENGLISH_SYNONYM_CANDIDATES) {
    const args = mapEnglishCandidateToStoreRow(candidate, getPassageById(candidate.passageId));
    const prompt = args.p_question_content as unknown as EnglishPromptValidationFields;
    const correctAnswer = args.p_claimed_answer;
    for (const option of candidate.options ?? []) {
      if (option === correctAnswer) continue;
      const result = scoreEnglishComprehensionAnswer(option, prompt, legacyHeuristic);
      assert.equal(result.earnedMarks, 0, `${candidate.candidateId}: wrong option "${option}" must never earn marks`);
    }
  }
});

test("other English families' marking is unchanged by this fix (TIER1/TIER2/TIER4 dispatch still reads acceptedAnswers/orderedAnswer exactly as before)", () => {
  const legacyHeuristic = () => 0;
  const tier2Prompt: EnglishPromptValidationFields = { validationTier: "TIER2_ACCEPTED_SET", acceptedAnswers: ["pulp"], marks: 1 };
  assert.equal(scoreEnglishComprehensionAnswer("pulp", tier2Prompt, legacyHeuristic).earnedMarks, 1);
  assert.equal(scoreEnglishComprehensionAnswer("something else", tier2Prompt, legacyHeuristic).earnedMarks, 0);

  const tier4Prompt: EnglishPromptValidationFields = { validationTier: "TIER4_ORDERED_LIST", orderedAnswer: ["first", "second"], marks: 2 };
  const orderedResult = scoreEnglishComprehensionAnswer("first\nsecond", tier4Prompt, legacyHeuristic);
  assert.equal(orderedResult.earnedMarks, 2);
});
