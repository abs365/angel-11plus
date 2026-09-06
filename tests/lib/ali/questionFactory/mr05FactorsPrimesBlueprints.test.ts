import { test } from "node:test";
import assert from "node:assert/strict";
import { MR05_FACTORS_PRIMES_FAMILY, BP_HIGHEST_COMMON_FACTOR, BP_LOWEST_COMMON_MULTIPLE, BP_IS_PRIME, BP_COUNT_FACTORS } from "@/lib/ali/questionFactory/mr05FactorsPrimesBlueprints";
import { runFamilyBatch, generateBlueprintCandidate, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk } from "@/lib/ali/questionFactory/diversityGates";

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

test("every blueprint stays aligned to MR-05/QT-MR-11", () => {
  for (const bp of MR05_FACTORS_PRIMES_FAMILY.blueprints) {
    assert.equal(bp.competencyId, "MR-05");
    assert.equal(bp.questionTypeId, "QT-MR-11");
  }
});

test("blueprint IDs are unique and stable", () => {
  const ids = MR05_FACTORS_PRIMES_FAMILY.blueprints.map((bp) => bp.blueprintId);
  assert.equal(new Set(ids).size, ids.length);
});

test("a real 140-candidate batch produces zero answer_mismatch across all 7 blueprints", () => {
  const { results } = runFamilyBatch(MR05_FACTORS_PRIMES_FAMILY, [], 140, seededRandom(131));
  for (const r of results) {
    assert.ok(!r.reasons.includes("answer_mismatch"), `${r.candidate.blueprintId}: ${r.candidate.question} => claimed ${r.candidate.claimedAnswer}`);
  }
});

test("hand-verified correctness spot checks matching the real production content exactly (24 has 8 factors, 29 is prime, 51 is not prime)", () => {
  assert.equal(BP_COUNT_FACTORS.deriveCorrectAnswer({ n: 24 }), "8");
  assert.equal(BP_COUNT_FACTORS.deriveCorrectAnswer({ n: 36 }), "9");
  assert.equal(BP_IS_PRIME.deriveCorrectAnswer({ n: 29 }), "True");
  assert.equal(BP_IS_PRIME.deriveCorrectAnswer({ n: 51 }), "False");
});

test("HCF and LCM are genuinely distinct computations, independently verified", () => {
  assert.equal(BP_HIGHEST_COMMON_FACTOR.deriveCorrectAnswer({ a: 24, b: 36 }), "12");
  assert.equal(BP_LOWEST_COMMON_MULTIPLE.deriveCorrectAnswer({ a: 4, b: 6 }), "12");
  assert.notEqual(BP_HIGHEST_COMMON_FACTOR.blueprintId, BP_LOWEST_COMMON_MULTIPLE.blueprintId);
});

test("BP_HIGHEST_COMMON_FACTOR excludes coprime pairs (HCF=1) as trivial/uninformative", () => {
  assert.equal(BP_HIGHEST_COMMON_FACTOR.constraints({ a: 8, b: 9 }), false, "8 and 9 are coprime -- HCF=1 is trivial, excluded by design");
});

test("blueprint depth is genuinely 7 and classifies LOW risk", () => {
  const { results } = runFamilyBatch(MR05_FACTORS_PRIMES_FAMILY, [], 105, seededRandom(242));
  const approved = results.filter((r) => r.approved).map((r) => r.candidate);
  const depth = classifyBlueprintDepth(approved);
  assert.equal(depth.blueprintDepth, 7);
  assert.equal(classifyScaledMemorisationRisk(depth), "LOW");
});

test("reasoning routes span direct_computation, comparison, multi_step_application, and error_identification", () => {
  const { results } = runFamilyBatch(MR05_FACTORS_PRIMES_FAMILY, [], 105, seededRandom(353));
  const routes = new Set(results.map((r) => r.candidate.reasoningRoute));
  assert.ok(routes.has("direct_computation"));
  assert.ok(routes.has("comparison"));
  assert.ok(routes.has("multi_step_application"));
  assert.ok(routes.has("error_identification"));
});

test("BP_IS_PRIME and BP_IS_FACTOR both produce genuine 'yes' and 'no'-shaped answers over a real batch -- not always the same verdict", () => {
  const { results } = runFamilyBatch(MR05_FACTORS_PRIMES_FAMILY, [], 140, seededRandom(464));
  const primeAnswers = new Set(results.filter((r) => r.candidate.blueprintId === "mr05-bp-is-prime").map((r) => r.candidate.claimedAnswer));
  const factorAnswers = new Set(results.filter((r) => r.candidate.blueprintId === "mr05-bp-is-factor").map((r) => r.candidate.claimedAnswer));
  assert.ok(primeAnswers.has("True") && primeAnswers.has("False"), "both True and False must genuinely occur over a large enough sample");
  assert.ok(factorAnswers.has("Yes") && factorAnswers.has("No"), "both Yes and No must genuinely occur over a large enough sample");
});

test("every blueprint declares at least one TeachingUse", () => {
  for (const bp of MR05_FACTORS_PRIMES_FAMILY.blueprints) {
    assert.ok((bp.teachingUses?.length ?? 0) > 0, `${bp.blueprintId} must declare at least one TeachingUse`);
  }
});

test("exact-duplicate rejection against a real existing bank row", () => {
  const bp = MR05_FACTORS_PRIMES_FAMILY.blueprints.find((b) => b.blueprintId === "mr05-bp-count-factors")!;
  const candidate = generateBlueprintCandidate(bp, seededRandom(13));
  const existingBankRow = { id: "existing-1", familyId: "mr05-factors-primes", prompt: { question: candidate.question } };
  const result = validateBlueprintCandidate(candidate, bp, [existingBankRow]);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("exact_duplicate_of_existing_bank_row"));
});
