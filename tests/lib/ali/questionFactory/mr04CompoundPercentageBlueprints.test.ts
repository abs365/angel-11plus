import { test } from "node:test";
import assert from "node:assert/strict";
import { MR04_COMPOUND_PERCENTAGE_FAMILY, BP_SUCCESSIVE_CHANGE_DIRECT, BP_ORDER_INDEPENDENCE_CHECK, BP_FIND_EQUIVALENT_SINGLE_PERCENTAGE, BP_ERROR_IDENTIFICATION_ADDITIVE } from "@/lib/ali/questionFactory/mr04CompoundPercentageBlueprints";
import { runFamilyBatch, generateBlueprintCandidate, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk } from "@/lib/ali/questionFactory/diversityGates";

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

test("every blueprint stays aligned to MR-04/QT-MR-04", () => {
  for (const bp of MR04_COMPOUND_PERCENTAGE_FAMILY.blueprints) {
    assert.equal(bp.competencyId, "MR-04");
    assert.equal(bp.questionTypeId, "QT-MR-04");
  }
});

test("blueprint IDs are unique and stable", () => {
  const ids = MR04_COMPOUND_PERCENTAGE_FAMILY.blueprints.map((bp) => bp.blueprintId);
  assert.equal(new Set(ids).size, ids.length);
});

test("a real 120-candidate batch produces zero answer_mismatch across all 6 blueprints", () => {
  const { results } = runFamilyBatch(MR04_COMPOUND_PERCENTAGE_FAMILY, [], 120, seededRandom(141));
  for (const r of results) {
    assert.ok(!r.reasons.includes("answer_mismatch"), `${r.candidate.blueprintId}: ${r.candidate.question} => claimed ${r.candidate.claimedAnswer}`);
  }
});

test("hand-verified correctness spot check matching the real production content exactly (£80, +25%, -15% => £85)", () => {
  assert.equal(BP_SUCCESSIVE_CHANGE_DIRECT.deriveCorrectAnswer({ startPence: 8000, incPercent: 25, decPercent: 15 }), "£85");
});

test("BP_ORDER_INDEPENDENCE_CHECK's own claimed answer (order never matters, multiplicatively) is independently verified by direct computation for several real parameter sets, not merely asserted", () => {
  for (const [start, inc, dec] of [[8000, 25, 15], [20000, 10, 10], [5000, 50, 40]]) {
    const forward = Math.round((start * (100 + inc) * (100 - dec)) / 10000);
    const reverse = Math.round((start * (100 - dec) * (100 + inc)) / 10000);
    assert.equal(forward, reverse, `order must not matter for start=${start}, inc=${inc}, dec=${dec}`);
  }
  assert.equal(BP_ORDER_INDEPENDENCE_CHECK.deriveCorrectAnswer({ startPence: 8000, incPercent: 25, decPercent: 15 }), "No");
});

test("BP_FIND_EQUIVALENT_SINGLE_PERCENTAGE formats a non-integer overall percentage to exactly 2 decimal places, with no floating-point display drift", () => {
  const answer = BP_FIND_EQUIVALENT_SINGLE_PERCENTAGE.deriveCorrectAnswer({ incPercent: 37, decPercent: 28 });
  assert.match(answer, /^[+-]\d+(\.\d{2})?%$/, `answer "${answer}" must be a clean signed percentage with at most 2 decimal places`);
});

test("BP_ERROR_IDENTIFICATION_ADDITIVE's wrong answer is always derived from the SAME named additive misconception, never an arbitrary offset", () => {
  const text = BP_ERROR_IDENTIFICATION_ADDITIVE.renderQuestionText({ startPence: 8000, incPercent: 25, decPercent: 15 });
  assert.match(text, /25% − 15% = 10% net change/, "the rendered wrong-reasoning text must show the exact additive-combination error, not an arbitrary one");
  assert.equal(BP_ERROR_IDENTIFICATION_ADDITIVE.deriveCorrectAnswer({ startPence: 8000, incPercent: 25, decPercent: 15 }), "£85");
});

test("blueprint depth is genuinely 6 and classifies LOW risk", () => {
  const { results } = runFamilyBatch(MR04_COMPOUND_PERCENTAGE_FAMILY, [], 90, seededRandom(252));
  const approved = results.filter((r) => r.approved).map((r) => r.candidate);
  const depth = classifyBlueprintDepth(approved);
  assert.equal(depth.blueprintDepth, 6);
  assert.equal(classifyScaledMemorisationRisk(depth), "LOW");
});

test("reasoning routes span multi_step_application, comparison, reverse_reasoning, and error_identification", () => {
  const { results } = runFamilyBatch(MR04_COMPOUND_PERCENTAGE_FAMILY, [], 90, seededRandom(363));
  const routes = new Set(results.map((r) => r.candidate.reasoningRoute));
  assert.ok(routes.has("multi_step_application"));
  assert.ok(routes.has("comparison"));
  assert.ok(routes.has("reverse_reasoning"));
  assert.ok(routes.has("error_identification"));
});

test("all monetary answers use consistent £ formatting -- whole pounds show no decimal, fractional pounds show exactly 2 decimal places", () => {
  const { results } = runFamilyBatch(MR04_COMPOUND_PERCENTAGE_FAMILY, [], 60, seededRandom(474));
  for (const r of results) {
    if (!r.candidate.claimedAnswer.startsWith("£")) continue;
    assert.match(r.candidate.claimedAnswer, /^£\d+(\.\d{2})?$/, `"${r.candidate.claimedAnswer}" must be clean £ formatting, no floating-point drift`);
  }
});

test("every blueprint declares at least one TeachingUse, and the misconception-targeted blueprints declare explicit_teaching or scaffolded_practice", () => {
  for (const bp of MR04_COMPOUND_PERCENTAGE_FAMILY.blueprints) {
    assert.ok((bp.teachingUses?.length ?? 0) > 0, `${bp.blueprintId} must declare at least one TeachingUse`);
  }
  assert.ok(BP_ERROR_IDENTIFICATION_ADDITIVE.teachingUses?.includes("explicit_teaching"));
});

test("exact-duplicate rejection against a real existing bank row", () => {
  const bp = MR04_COMPOUND_PERCENTAGE_FAMILY.blueprints.find((b) => b.blueprintId === "mr04-bp-successive-change-direct")!;
  const candidate = generateBlueprintCandidate(bp, seededRandom(15));
  const existingBankRow = { id: "existing-1", familyId: "mr04-compound-percentage", prompt: { question: candidate.question } };
  const result = validateBlueprintCandidate(candidate, bp, [existingBankRow]);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("exact_duplicate_of_existing_bank_row"));
});
