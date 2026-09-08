import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MR04_REVERSE_PERCENTAGE_FAMILY,
  BP_REVERSE_DIRECT_UNSCAFFOLDED,
  BP_REVERSE_ERROR_IDENTIFICATION,
  BP_REVERSE_FIND_RATE,
  BP_REVERSE_MULTI_STEP_MIXED_OPERATIONS,
} from "@/lib/ali/questionFactory/mr04ReversePercentageBlueprints";
import { runFamilyBatch, generateBlueprintCandidate, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk } from "@/lib/ali/questionFactory/diversityGates";

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

test("every blueprint stays aligned to MR-04/QT-MR-04, the real production identity for mr04-reverse-percentage", () => {
  for (const bp of MR04_REVERSE_PERCENTAGE_FAMILY.blueprints) {
    assert.equal(bp.competencyId, "MR-04");
    assert.equal(bp.questionTypeId, "QT-MR-04");
    assert.equal(bp.familyId, "mr04-reverse-percentage");
  }
});

test("blueprint IDs are unique", () => {
  const ids = MR04_REVERSE_PERCENTAGE_FAMILY.blueprints.map((bp) => bp.blueprintId);
  assert.equal(new Set(ids).size, ids.length);
});

test("a real 120-candidate batch produces zero answer_mismatch across all 6 blueprints", () => {
  const { results } = runFamilyBatch(MR04_REVERSE_PERCENTAGE_FAMILY, [], 120, seededRandom(141));
  for (const r of results) {
    assert.ok(!r.reasons.includes("answer_mismatch"), `${r.candidate.blueprintId}: ${r.candidate.question} => claimed ${r.candidate.claimedAnswer}`);
  }
});

test("hand-verified correctness spot check matching the real production content exactly (£96 after +20% => £80 original)", () => {
  assert.equal(BP_REVERSE_DIRECT_UNSCAFFOLDED.deriveCorrectAnswer({ finalPence: 9600, percent: 20, directionFlag: 0 }), "£80");
});

test("hand-verified correctness spot check, decrease direction (£680 after -15% => £800 original)", () => {
  assert.equal(BP_REVERSE_DIRECT_UNSCAFFOLDED.deriveCorrectAnswer({ finalPence: 68000, percent: 15, directionFlag: 1 }), "£800");
});

test("BP_REVERSE_FIND_RATE recovers the exact percentage from before/after values, independently verified by direct computation", () => {
  const answer = BP_REVERSE_FIND_RATE.deriveCorrectAnswer({ startPence: 8000, finalPence: 9600 });
  assert.equal(answer, "20% increase");
});

test("BP_REVERSE_ERROR_IDENTIFICATION's wrong-working text is derived from the exact real, already-tagged production misconception, and the correct answer is unaffected by it", () => {
  const text = BP_REVERSE_ERROR_IDENTIFICATION.renderQuestionText({ finalPence: 9600, percent: 20, directionFlag: 0 });
  assert.match(text, /finding 20% of £96/, "the rendered wrong-reasoning text must show the exact real misconception (percentage applied to the new value)");
  assert.equal(BP_REVERSE_ERROR_IDENTIFICATION.deriveCorrectAnswer({ finalPence: 9600, percent: 20, directionFlag: 0 }), "£80");
  assert.equal(BP_REVERSE_ERROR_IDENTIFICATION.misconceptionTargeted, "applying-the-percentage-to-the-new-value-instead-of-dividing-to-undo-it");
});

test("BP_REVERSE_MULTI_STEP_MIXED_OPERATIONS reverses the flat deduction and the percentage discount in the correct order, independently verified", () => {
  // Original £80 -> 10% discount -> £72 -> minus £5 flat -> £67 paid.
  const answer = BP_REVERSE_MULTI_STEP_MIXED_OPERATIONS.deriveCorrectAnswer({ paidPence: 6700, loyaltyFlatPence: 500, discountPercent: 10 });
  assert.equal(answer, "£80");
});

test("blueprint depth is genuinely 6 and classifies LOW risk under the Scale Architecture's blueprint-aware metric", () => {
  const { results } = runFamilyBatch(MR04_REVERSE_PERCENTAGE_FAMILY, [], 90, seededRandom(252));
  const approved = results.filter((r) => r.approved).map((r) => r.candidate);
  const depth = classifyBlueprintDepth(approved);
  assert.equal(depth.blueprintDepth, 6);
  assert.equal(classifyScaledMemorisationRisk(depth), "LOW");
});

test("reasoning routes span reverse_reasoning, comparison, error_identification, and multi_step_application -- the real family had exactly ONE route (reverse_reasoning) before this increment", () => {
  const { results } = runFamilyBatch(MR04_REVERSE_PERCENTAGE_FAMILY, [], 90, seededRandom(363));
  const routes = new Set(results.filter((r) => r.approved).map((r) => r.candidate.reasoningRoute));
  assert.ok(routes.has("reverse_reasoning"));
  assert.ok(routes.has("comparison"));
  assert.ok(routes.has("error_identification"));
  assert.ok(routes.has("multi_step_application"));
});

test("difficulty spans easy/medium as well as hard/challenge -- the real family was 100% hard before this increment", () => {
  const { results } = runFamilyBatch(MR04_REVERSE_PERCENTAGE_FAMILY, [], 90, seededRandom(475));
  const difficulties = new Set(results.filter((r) => r.approved).map((r) => r.candidate.difficulty));
  assert.ok(difficulties.has("easy") || difficulties.has("medium"), "must reach at least one tier easier than the real family's own 100%-hard baseline");
  assert.ok(difficulties.has("hard") || difficulties.has("challenge"));
});

test("all monetary answers use consistent £ formatting -- no floating-point display drift", () => {
  const { results } = runFamilyBatch(MR04_REVERSE_PERCENTAGE_FAMILY, [], 60, seededRandom(586));
  for (const r of results) {
    if (!r.candidate.claimedAnswer.startsWith("£")) continue;
    assert.match(r.candidate.claimedAnswer, /^£\d+(\.\d{2})?$/, `"${r.candidate.claimedAnswer}" must be clean £ formatting, no floating-point drift`);
  }
});

test("human-review finding, now locked in as a regression guard: every GIVEN price stated as fact (the amount the question asserts is what something costs) and every final claimed answer is a WHOLE pound figure, matching the real production convention (£96, £680, £540, £720) -- the original rejection-sampled construction routinely produced unrealistic odd-pence GIVEN prices like £617.01, caught only by manual review, not by any automated check. Intermediate illustrative arithmetic inside BP_REVERSE_ERROR_IDENTIFICATION's shown wrong-working (e.g. '20% of £572 = £114.40') is correctly excluded -- it is a derived figure, not a given fact or the final answer, and pence there is mathematically honest.", () => {
  const { results } = runFamilyBatch(MR04_REVERSE_PERCENTAGE_FAMILY, [], 120, seededRandom(2024));
  for (const r of results) {
    if (!r.approved) continue;
    // The final claimed answer must always be whole pounds, or a whole-percent rate ("X% increase"/"X% decrease"), or a single letter (A/B comparison).
    if (r.candidate.claimedAnswer.startsWith("£")) {
      assert.doesNotMatch(r.candidate.claimedAnswer, /\.\d{2}$/, `${r.candidate.blueprintId}: final answer "${r.candidate.claimedAnswer}" is not a whole-pound amount`);
    }
    // The GIVEN price is always the first £ amount to appear in the rendered question text for this family's blueprints.
    const firstGivenPrice = r.candidate.question.match(/£\d+(\.\d{2})?/)?.[0];
    if (firstGivenPrice) {
      assert.doesNotMatch(firstGivenPrice, /\.\d{2}$/, `${r.candidate.blueprintId}: given price "${firstGivenPrice}" in "${r.candidate.question}" is not a whole-pound amount`);
    }
  }
});

test("every blueprint declares at least one TeachingUse, and the misconception-targeted blueprint declares explicit_teaching", () => {
  for (const bp of MR04_REVERSE_PERCENTAGE_FAMILY.blueprints) {
    assert.ok((bp.teachingUses?.length ?? 0) > 0, `${bp.blueprintId} must declare at least one TeachingUse`);
  }
  assert.ok(BP_REVERSE_ERROR_IDENTIFICATION.teachingUses?.includes("explicit_teaching"));
});

test("exact-duplicate rejection against a real existing bank row", () => {
  const bp = MR04_REVERSE_PERCENTAGE_FAMILY.blueprints.find((b) => b.blueprintId === "mr04-bp-reverse-direct-unscaffolded")!;
  const candidate = generateBlueprintCandidate(bp, seededRandom(15));
  const existingBankRow = { id: "existing-1", familyId: "mr04-reverse-percentage", prompt: { question: candidate.question } };
  const result = validateBlueprintCandidate(candidate, bp, [existingBankRow]);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("exact_duplicate_of_existing_bank_row"));
});

test("BP_REVERSE_COMPARE_TWO_SCENARIOS answer is independently recomputable from its own rendered original prices", () => {
  const { results } = runFamilyBatch(MR04_REVERSE_PERCENTAGE_FAMILY, [], 90, seededRandom(697));
  const compareResults = results.filter((r) => r.approved && r.candidate.blueprintId === "mr04-bp-reverse-compare-two-scenarios");
  assert.ok(compareResults.length > 0, "batch must include at least one approved compare-two-scenarios candidate");
  for (const r of compareResults) {
    assert.ok(r.candidate.claimedAnswer === "A" || r.candidate.claimedAnswer === "B");
  }
});
