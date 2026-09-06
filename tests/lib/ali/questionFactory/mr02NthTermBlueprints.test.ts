import { test } from "node:test";
import assert from "node:assert/strict";
import { MR02_NTH_TERM_FAMILY, BP_VERIFY_MEMBERSHIP, BP_ERROR_IDENTIFICATION_SEQUENCE } from "@/lib/ali/questionFactory/mr02NthTermBlueprints";
import { runFamilyBatch, generateBlueprintCandidate, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk } from "@/lib/ali/questionFactory/diversityGates";

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

test("every blueprint stays aligned to MR-02/QT-MR-05", () => {
  for (const bp of MR02_NTH_TERM_FAMILY.blueprints) {
    assert.equal(bp.competencyId, "MR-02");
    assert.equal(bp.questionTypeId, "QT-MR-05");
  }
});

test("blueprint IDs are unique and stable", () => {
  const ids = MR02_NTH_TERM_FAMILY.blueprints.map((bp) => bp.blueprintId);
  assert.equal(new Set(ids).size, ids.length);
});

test("a real 140-candidate batch produces zero answer_mismatch across all 7 blueprints", () => {
  const { results } = runFamilyBatch(MR02_NTH_TERM_FAMILY, [], 140, seededRandom(111));
  for (const r of results) {
    assert.ok(!r.reasons.includes("answer_mismatch"), `${r.candidate.blueprintId}: ${r.candidate.question} => claimed ${r.candidate.claimedAnswer}`);
  }
});

test("BP_VERIFY_MEMBERSHIP's own worked-answer function agrees with its declared correctness for both a genuine member and a genuine non-member", () => {
  assert.equal(BP_VERIFY_MEMBERSHIP.deriveCorrectAnswer({ a: 4, d: 5, candidateValue: 4 + 4 * 5, offset: 0 }), "Yes");
  assert.equal(BP_VERIFY_MEMBERSHIP.deriveCorrectAnswer({ a: 4, d: 5, candidateValue: 4 + 4 * 5 + 1, offset: 1 }), "No");
});

test("BP_ERROR_IDENTIFICATION_SEQUENCE's wrong answer is always derived from the SAME named off-by-one misconception, never an arbitrary offset", () => {
  const text = BP_ERROR_IDENTIFICATION_SEQUENCE.renderQuestionText({ a: 7, d: 3, n: 10 });
  const wrongClaimed = 7 + 10 * 3; // uses n instead of (n-1)
  assert.ok(text.includes(String(wrongClaimed)), "the rendered question must show the exact n*d-based wrong answer, not an arbitrary one");
  assert.equal(BP_ERROR_IDENTIFICATION_SEQUENCE.deriveCorrectAnswer({ a: 7, d: 3, n: 10 }), String(7 + 9 * 3));
});

test("blueprint depth is genuinely 7 and classifies LOW risk, not conflated with raw variant count", () => {
  const { results } = runFamilyBatch(MR02_NTH_TERM_FAMILY, [], 105, seededRandom(222));
  const approved = results.filter((r) => r.approved).map((r) => r.candidate);
  const depth = classifyBlueprintDepth(approved);
  assert.equal(depth.blueprintDepth, 7);
  assert.equal(classifyScaledMemorisationRisk(depth), "LOW");
});

test("reasoning routes span multi_step_application, reverse_reasoning, comparison, and error_identification", () => {
  const { results } = runFamilyBatch(MR02_NTH_TERM_FAMILY, [], 105, seededRandom(333));
  const routes = new Set(results.map((r) => r.candidate.reasoningRoute));
  assert.ok(routes.has("multi_step_application"));
  assert.ok(routes.has("reverse_reasoning"));
  assert.ok(routes.has("comparison"));
  assert.ok(routes.has("error_identification"));
});

test("unknown position genuinely varies across all 7 blueprints", () => {
  const { results } = runFamilyBatch(MR02_NTH_TERM_FAMILY, [], 105, seededRandom(444));
  const positions = new Set(results.map((r) => r.candidate.unknownPosition));
  assert.equal(positions.size, 7);
});

test("generation constraints prevent a degenerate zero-common-difference sequence anywhere in the family", () => {
  const { results } = runFamilyBatch(MR02_NTH_TERM_FAMILY, [], 105, seededRandom(555));
  for (const r of results) {
    if ("d" in r.candidate.params) assert.notEqual(r.candidate.params.d, 0);
  }
});

test("every blueprint declares at least one TeachingUse", () => {
  for (const bp of MR02_NTH_TERM_FAMILY.blueprints) {
    assert.ok((bp.teachingUses?.length ?? 0) > 0, `${bp.blueprintId} must declare at least one TeachingUse`);
  }
});

test("exact-duplicate rejection against a real existing bank row", () => {
  const bp = MR02_NTH_TERM_FAMILY.blueprints.find((b) => b.blueprintId === "mr02-bp-nth-term-direct")!;
  const candidate = generateBlueprintCandidate(bp, seededRandom(9));
  const existingBankRow = { id: "existing-1", familyId: "mr02-nth-term", prompt: { question: candidate.question } };
  const result = validateBlueprintCandidate(candidate, bp, [existingBankRow]);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("exact_duplicate_of_existing_bank_row"));
});
