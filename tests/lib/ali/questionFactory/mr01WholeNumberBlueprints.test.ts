import { test } from "node:test";
import assert from "node:assert/strict";
import { MR01_WHOLE_NUMBER_FAMILY, BP_MISSING_FACTOR, BP_DIVISION_WITH_REMAINDER } from "@/lib/ali/questionFactory/mr01WholeNumberBlueprints";
import { runFamilyBatch, generateBlueprintCandidate, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk } from "@/lib/ali/questionFactory/diversityGates";

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

test("every blueprint stays aligned to MR-01/QT-MR-01 -- none changes competency to inflate the count", () => {
  for (const bp of MR01_WHOLE_NUMBER_FAMILY.blueprints) {
    assert.equal(bp.competencyId, "MR-01");
    assert.equal(bp.questionTypeId, "QT-MR-01");
  }
});

test("blueprint IDs are unique and stable", () => {
  const ids = MR01_WHOLE_NUMBER_FAMILY.blueprints.map((bp) => bp.blueprintId);
  assert.equal(new Set(ids).size, ids.length);
});

test("a real 180-candidate batch produces zero answer_mismatch across all 9 blueprints", () => {
  const { results } = runFamilyBatch(MR01_WHOLE_NUMBER_FAMILY, [], 180, seededRandom(101));
  for (const r of results) {
    assert.ok(!r.reasons.includes("answer_mismatch"), `${r.candidate.blueprintId}: ${r.candidate.question} => claimed ${r.candidate.claimedAnswer}`);
  }
  assert.equal(results.length, 180);
});

test("BP_MISSING_FACTOR rejects a degenerate square case (known === product/known) via its own constraint", () => {
  assert.equal(BP_MISSING_FACTOR.constraints({ known: 5, product: 25 }), false, "known=5, product=25 -> missing factor would equal known itself, a degenerate case excluded by design");
});

test("BP_DIVISION_WITH_REMAINDER never generates an exact (remainder-0) division -- that is BP_DIVISION_EXACT's own territory", () => {
  const { results } = runFamilyBatch({ familyId: "mr01-whole-number-computation", subject: "maths", blueprints: [BP_DIVISION_WITH_REMAINDER] }, [], 60, seededRandom(202));
  for (const r of results) {
    assert.notEqual(r.candidate.claimedAnswer, "0", "a remainder of exactly 0 must never be produced by this blueprint");
  }
});

test("number-only substitution is not confused with genuine structural diversity -- blueprint depth reflects real reasoning routes, not raw variant count", () => {
  const { results } = runFamilyBatch(MR01_WHOLE_NUMBER_FAMILY, [], 90, seededRandom(303));
  const approved = results.filter((r) => r.approved).map((r) => r.candidate);
  const depth = classifyBlueprintDepth(approved);
  assert.equal(depth.blueprintDepth, 9);
  assert.equal(classifyScaledMemorisationRisk(depth), "LOW");
});

test("reasoning routes span direct_computation, reverse_reasoning, multi_step_application, and error_identification", () => {
  const { results } = runFamilyBatch(MR01_WHOLE_NUMBER_FAMILY, [], 90, seededRandom(404));
  const routes = new Set(results.map((r) => r.candidate.reasoningRoute));
  assert.ok(routes.has("direct_computation"));
  assert.ok(routes.has("reverse_reasoning"));
  assert.ok(routes.has("multi_step_application"));
  assert.ok(routes.has("error_identification"));
});

test("unknown position genuinely varies across blueprints (sum, difference, product, remainder, quotient, missing_addend, missing_factor, corrected_total, final_result)", () => {
  const { results } = runFamilyBatch(MR01_WHOLE_NUMBER_FAMILY, [], 90, seededRandom(505));
  const positions = new Set(results.map((r) => r.candidate.unknownPosition));
  assert.equal(positions.size, 9);
});

test("every blueprint declares at least one TeachingUse, and not every blueprint declares the same set", () => {
  const useSets = MR01_WHOLE_NUMBER_FAMILY.blueprints.map((bp) => (bp.teachingUses ?? []).join(","));
  for (const bp of MR01_WHOLE_NUMBER_FAMILY.blueprints) {
    assert.ok((bp.teachingUses?.length ?? 0) > 0, `${bp.blueprintId} must declare at least one TeachingUse`);
  }
  assert.ok(new Set(useSets).size > 1, "not every blueprint should declare an identical TeachingUse set");
});

test("hand-verified correctness spot checks (independent of the generator's own logic)", () => {
  assert.equal(MR01_WHOLE_NUMBER_FAMILY.blueprints.find((b) => b.blueprintId === "mr01-bp-addition-direct")!.deriveCorrectAnswer({ a: 847, b: 356 }), "1203");
  assert.equal(MR01_WHOLE_NUMBER_FAMILY.blueprints.find((b) => b.blueprintId === "mr01-bp-division-with-remainder")!.deriveCorrectAnswer({ dividend: 391, divisor: 7 }), "6");
  assert.equal(MR01_WHOLE_NUMBER_FAMILY.blueprints.find((b) => b.blueprintId === "mr01-bp-missing-factor")!.deriveCorrectAnswer({ known: 6, product: 282 }), "47");
});

test("generateBlueprintCandidate + validateBlueprintCandidate: a hand-crafted impossible parameter set is rejected regardless of a plausible-looking claimed answer", () => {
  const badCandidate = generateBlueprintCandidate(MR01_WHOLE_NUMBER_FAMILY.blueprints[5], seededRandom(1)); // BP_MISSING_ADDEND
  const tampered = { ...badCandidate, params: { known: 100, total: 50 }, claimedAnswer: "-50" }; // total < known, invalid
  const result = validateBlueprintCandidate(tampered, MR01_WHOLE_NUMBER_FAMILY.blueprints[5] as never, []);
  assert.equal(result.approved, false);
});

test("exact-duplicate rejection: a candidate identical to an existing real bank row is rejected", () => {
  const bp = MR01_WHOLE_NUMBER_FAMILY.blueprints.find((b) => b.blueprintId === "mr01-bp-addition-direct")!;
  const candidate = generateBlueprintCandidate(bp, seededRandom(7));
  const existingBankRow = { id: "existing-1", familyId: "mr01-whole-number-computation", prompt: { question: candidate.question } };
  const result = validateBlueprintCandidate(candidate, bp, [existingBankRow]);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("exact_duplicate_of_existing_bank_row"));
});
