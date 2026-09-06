import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BP_THIRD_ANGLE_DIRECT,
  BP_RATIO_SPLIT,
  BP_VERIFY_TRIANGLE,
  BP_ERROR_CORRECTION,
  BP_MISCONCEPTION_360_CONFUSION,
  BP_COMPARE_TRIANGLES,
  BP_ISOSCELES_RELATIONSHIP,
  MR03_ANGLE_SUM_FAMILY,
} from "@/lib/ali/questionFactory/angleSumBlueprints";
import { RIBBON_FRACTION_SPEC } from "@/lib/ali/questionFactory/familySpecs";
import { generateBlueprintCandidate, validateBlueprintCandidate, runFamilyBatch, generateCandidate, validateCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk, detectRepeatedDimension } from "@/lib/ali/questionFactory/diversityGates";

/**
 * Question Factory Scale Architecture — Increment: Effective Educational
 * Depth + Bulk Generation. Proves the 7-blueprint mr03-angle-sum proof
 * family, the answer-equivalence capability, and the blueprint-vs-variant
 * depth model, using a seeded PRNG throughout for full determinism.
 */

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const ALL_BLUEPRINTS = [BP_THIRD_ANGLE_DIRECT, BP_RATIO_SPLIT, BP_VERIFY_TRIANGLE, BP_ERROR_CORRECTION, BP_MISCONCEPTION_360_CONFUSION, BP_COMPARE_TRIANGLES, BP_ISOSCELES_RELATIONSHIP];

test("every blueprint stays competency-aligned -- all 7 declare MR-03/QT-MR-07, never a different competency merely to increase diversity", () => {
  for (const bp of ALL_BLUEPRINTS) {
    assert.equal(bp.competencyId, "MR-03");
    assert.equal(bp.questionTypeId, "QT-MR-07");
  }
});

test("blueprint IDs are stable, unique, and non-empty across the whole family", () => {
  const ids = ALL_BLUEPRINTS.map((bp) => bp.blueprintId);
  assert.equal(new Set(ids).size, ids.length, "no two blueprints share an id");
  for (const id of ids) assert.ok(id.length > 0 && id.startsWith("mr03-bp-"));
});

test("MR03_ANGLE_SUM_FAMILY contains exactly the 7 declared blueprints, all under one familyId", () => {
  assert.equal(MR03_ANGLE_SUM_FAMILY.familyId, "mr03-angle-sum");
  assert.equal(MR03_ANGLE_SUM_FAMILY.blueprints.length, 7);
  for (const bp of MR03_ANGLE_SUM_FAMILY.blueprints) assert.equal(bp.familyId, "mr03-angle-sum");
});

test("generateBlueprintCandidate correctly stamps blueprintId, representationType, and no acceptedAnswerForms when the blueprint declares none", () => {
  const candidate = generateBlueprintCandidate(BP_THIRD_ANGLE_DIRECT, seededRandom(1));
  assert.equal(candidate.blueprintId, "mr03-bp-third-angle-direct");
  assert.ok(candidate.representationType === "prose" || candidate.representationType === "table");
  assert.equal(candidate.acceptedAnswerForms, undefined);
});

test("reasoning routes and unknown positions are tracked per-candidate and match their own blueprint's declaration", () => {
  const directCandidate = generateBlueprintCandidate(BP_THIRD_ANGLE_DIRECT, seededRandom(2));
  assert.equal(directCandidate.reasoningRoute, "direct_computation");
  assert.equal(directCandidate.unknownPosition, "third_angle");

  const ratioCandidate = generateBlueprintCandidate(BP_RATIO_SPLIT, seededRandom(3));
  assert.equal(ratioCandidate.reasoningRoute, "multi_step_application");
  assert.equal(ratioCandidate.unknownPosition, "two_unknown_angles_via_ratio");

  const compareCandidate = generateBlueprintCandidate(BP_COMPARE_TRIANGLES, seededRandom(4));
  assert.equal(compareCandidate.reasoningRoute, "comparison");
});

test("all generated angle answers are correct across every blueprint -- a real 140-candidate run (20 per blueprint) with zero answer_mismatch rejections", () => {
  const { results } = runFamilyBatch(MR03_ANGLE_SUM_FAMILY, [], 140, seededRandom(555));
  const answerMismatches = results.filter((r) => r.reasons.includes("answer_mismatch"));
  assert.deepEqual(answerMismatches, [], "every blueprint's independent answer recomputation must agree with its own claimed answer");
});

test("generation constraints prevent impossible questions -- BP_RATIO_SPLIT never produces a non-integer split, BP_VERIFY_TRIANGLE never produces a wildly-off (>40°) discrepancy, BP_ISOSCELES_RELATIONSHIP never produces a non-positive third angle", () => {
  const { results } = runFamilyBatch(MR03_ANGLE_SUM_FAMILY, [], 140, seededRandom(777));
  for (const r of results.filter((res) => res.approved)) {
    if (r.candidate.blueprintId === "mr03-bp-ratio-split") {
      assert.match(r.candidate.claimedAnswer, /^\d+° and \d+°$/);
    }
    if (r.candidate.blueprintId === "mr03-bp-verify-triangle") {
      assert.ok(Number(r.candidate.claimedAnswer) <= 40);
    }
    if (r.candidate.blueprintId === "mr03-bp-isosceles-relationship") {
      assert.ok(Number(r.candidate.claimedAnswer) >= 5);
    }
  }
});

test("BP_RATIO_SPLIT's constraints reject a 1:1 ratio -- that specific case belongs to the isosceles blueprint, never duplicated between the two", () => {
  assert.equal(BP_RATIO_SPLIT.constraints({ knownAngle: 60, ratioA: 2, ratioB: 2 }), false);
});

test("representation saturation is detected for a blueprint that never varies representation (6 of 7 blueprints), and NOT falsely flagged for the one that does", () => {
  const monoRepresentation = Array.from({ length: 10 }, () => "prose");
  const result = detectRepeatedDimension(monoRepresentation, "representation", 0.7);
  assert.equal(result.exceedsThreshold, true);

  const { results } = runFamilyBatch(MR03_ANGLE_SUM_FAMILY, [], 40, seededRandom(888));
  const directOnly = results.filter((r) => r.approved && r.candidate.blueprintId === "mr03-bp-third-angle-direct").map((r) => r.candidate.representationType!);
  if (directOnly.length >= 4) {
    const directResult = detectRepeatedDimension(directOnly, "representation", 0.9);
    assert.equal(directResult.distinctValueCount, 2, "the direct-third-angle blueprint alone genuinely produces both prose and table representations");
  }
});

test("blueprint depth correctly distinguishes the NEW 7-blueprint family (LOW risk) from the OLD single-blueprint calibration batch (still CRITICAL, unchanged)", () => {
  const { results } = runFamilyBatch(MR03_ANGLE_SUM_FAMILY, [], 80, seededRandom(999));
  const approved = results.filter((r) => r.approved).map((r) => r.candidate);
  const depth = classifyBlueprintDepth(approved);
  assert.equal(depth.blueprintDepth, 7);
  assert.ok(depth.dominantBlueprintShare <= 0.35, "no single blueprint should dominate a round-robin-generated batch");
  assert.equal(classifyScaledMemorisationRisk(depth), "LOW");

  // The legacy calibration batch (no blueprintId at all) must still classify CRITICAL -- this is not a silent behaviour change.
  const legacyBatch = Array.from({ length: 10 }, (_, i) => ({ question: `Calculate: ${i}.1 × ${i}.22` }));
  const legacyDepth = classifyBlueprintDepth(legacyBatch);
  assert.equal(legacyDepth.blueprintDepth, 1);
  assert.equal(classifyScaledMemorisationRisk(legacyDepth), "CRITICAL");
});

test("a family with many blueprints but one dominant 'filler' blueprint is NOT classified LOW -- balance matters, not merely blueprint count", () => {
  const skewed = [
    ...Array.from({ length: 90 }, (_, i) => ({ question: `Calculate: ${i}.1 × ${i}.22`, blueprintId: "bp-filler" })),
    { question: "A different structure A", blueprintId: "bp-2" },
    { question: "A different structure B", blueprintId: "bp-3" },
    { question: "A different structure C", blueprintId: "bp-4" },
    { question: "A different structure D", blueprintId: "bp-5" },
    { question: "A different structure E", blueprintId: "bp-6" },
    { question: "A different structure F", blueprintId: "bp-7" },
  ];
  const depth = classifyBlueprintDepth(skewed);
  assert.equal(depth.blueprintDepth, 7);
  assert.ok(depth.dominantBlueprintShare > 0.7);
  assert.equal(classifyScaledMemorisationRisk(depth), "CRITICAL", "7 blueprints existing on paper must not mask 90/96 candidates coming from one of them");
});

test("100 valid questions genuinely generated from 10 balanced blueprints must NOT be automatically classified CRITICAL merely because 10/100 = 0.10 -- the Founder's own named scale-model requirement", () => {
  const balanced = Array.from({ length: 100 }, (_, i) => ({
    question: `Structure ${i % 10} instance ${i}`,
    blueprintId: `bp-${i % 10}`,
  }));
  const depth = classifyBlueprintDepth(balanced);
  assert.equal(depth.blueprintDepth, 10);
  assert.equal(depth.dominantBlueprintShare, 0.1);
  assert.notEqual(classifyScaledMemorisationRisk(depth), "CRITICAL");
});

test("answer equivalence: precision-frac now accepts BOTH the canonical mixed-number form and the mathematically-equivalent improper fraction", () => {
  const params = { lengthMetres: 9, pieces: 5 }; // 9/5 -> "1 4/5" canonical, "9/5" improper
  const forms = RIBBON_FRACTION_SPEC.deriveAcceptedAnswerForms!(params);
  assert.deepEqual(forms, ["1 4/5", "9/5"]);

  const candidateWithMixed = { ...generateCandidate(RIBBON_FRACTION_SPEC, seededRandom(10)), params, question: RIBBON_FRACTION_SPEC.renderQuestionText(params), claimedAnswer: "1 4/5" };
  const resultMixed = validateBlueprintCandidate(candidateWithMixed, RIBBON_FRACTION_SPEC, []);
  assert.equal(resultMixed.approved, true);

  const candidateWithImproper = { ...candidateWithMixed, claimedAnswer: "9/5" };
  const resultImproper = validateBlueprintCandidate(candidateWithImproper, RIBBON_FRACTION_SPEC, []);
  assert.equal(resultImproper.approved, true, "the improper-fraction form must now be accepted, not silently marked wrong");
});

test("invalid equivalent forms still fail -- a mathematically WRONG answer is rejected even though the blueprint declares accepted equivalence forms", () => {
  const params = { lengthMetres: 9, pieces: 5 };
  const candidate = { ...generateCandidate(RIBBON_FRACTION_SPEC, seededRandom(11)), params, question: RIBBON_FRACTION_SPEC.renderQuestionText(params), claimedAnswer: "2 1/5" };
  const result = validateBlueprintCandidate(candidate, RIBBON_FRACTION_SPEC, []);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("answer_mismatch"));
});

test("a blueprint with no declared accepted forms falls back to validateCandidate's own plain behaviour exactly -- answer equivalence is opt-in, never a global change to marking", () => {
  const candidate = generateCandidate(BP_THIRD_ANGLE_DIRECT, seededRandom(12));
  const viaBlueprint = validateBlueprintCandidate(candidate, BP_THIRD_ANGLE_DIRECT, []);
  const viaPlain = validateCandidate(candidate, BP_THIRD_ANGLE_DIRECT, []);
  assert.deepEqual(viaBlueprint, viaPlain);
});

test("runFamilyBatch never fabricates a new family -- every candidate across all 7 blueprints carries the exact family_id the family declares", () => {
  const { results } = runFamilyBatch(MR03_ANGLE_SUM_FAMILY, [], 70, seededRandom(2024));
  for (const r of results) {
    assert.equal(r.candidate.familyId, "mr03-angle-sum");
  }
});

test("misconception coverage is genuinely distinct across the blueprints that declare one -- no two blueprints silently share the identical misconception string", () => {
  const misconceptions = ALL_BLUEPRINTS.map((bp) => bp.misconceptionTargeted).filter((m): m is string => Boolean(m));
  assert.equal(new Set(misconceptions).size, misconceptions.length);
});
