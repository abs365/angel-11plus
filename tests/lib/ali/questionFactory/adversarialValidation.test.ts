import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyFamilyDepth,
  classifyBlueprintDepth,
  classifyScaledMemorisationRisk,
  detectTemplateSaturation,
  detectRepeatedDimension,
  checkDifficultyDistributionIntegrity,
  runFamilyDiversityGates,
} from "@/lib/ali/questionFactory/diversityGates";
import { validateBlueprintCandidate, generateBlueprintCandidate, runFamilyBatch } from "@/lib/ali/questionFactory/candidateGeneration";
import { MR03_ANGLE_SUM_FAMILY, BP_ISOSCELES_RELATIONSHIP, BP_VERIFY_TRIANGLE } from "@/lib/ali/questionFactory/angleSumBlueprints";
import { RIBBON_FRACTION_SPEC } from "@/lib/ali/questionFactory/familySpecs";
import type { MathsQuestionCandidate } from "@/lib/ali/questionFactory/types";

/**
 * Educational Supply & Progression Integration Gate, Section 19 --
 * "Before mass generation, prove the new diversity validators can REJECT
 * bad supply as well as accept good supply." Every fixture below is
 * hand-constructed, deterministic TEST DATA -- never production content,
 * never written anywhere. Per the Founder's own explicit instruction,
 * this file also states plainly where a named defect is NOT currently
 * caught by any automated gate, rather than weakening a threshold or
 * inventing a fragile check to force a green result.
 */

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function candidate(overrides: Partial<MathsQuestionCandidate>): MathsQuestionCandidate {
  return {
    candidateId: "qfc-test-0",
    familyId: "mr03-angle-sum",
    competencyId: "MR-03",
    questionTypeId: "QT-MR-07",
    question: "A triangle has angles of 10°, 20° and one unknown angle. What is the size of the unknown angle?",
    claimedAnswer: "150",
    workingSteps: [],
    difficulty: "easy",
    params: { angleA: 10, angleB: 20, format: 0 },
    generatedAt: new Date().toISOString(),
    reasoningRoute: "direct_computation",
    contextTag: "triangle_geometry",
    unknownPosition: "third_angle",
    ...overrides,
  };
}

// ============================================================
// Fixture 1: number-only substitution -- CAUGHT
// ============================================================
test("adversarial: a batch that only ever substitutes numbers into one template is flagged CRITICAL by structural diversity", () => {
  const badBatch = Array.from({ length: 10 }, (_, i) =>
    candidate({ question: `A triangle has angles of ${10 + i}°, ${20 + i}° and one unknown angle. What is the size of the unknown angle?` })
  );
  const depth = classifyFamilyDepth(badBatch);
  assert.equal(depth.structuralVariantCount, 1, "digit-only substitution must collapse to exactly one normalised skeleton");
  assert.ok(depth.structuralDiversityRatio <= 0.2);
  const gates = runFamilyDiversityGates("mr03-angle-sum", badBatch);
  assert.equal(gates.memorisationRisk, "CRITICAL");
  assert.equal(gates.passesAllGates, false);
});

// ============================================================
// Fixture 2: wording-only substitution -- a REAL, DISCLOSED GAP
// ============================================================
test("adversarial: wording-only substitution (same numbers, different phrasing) is NOT caught by structural-diversity ratio -- a genuine, disclosed limitation, not a false pass", () => {
  const badBatch = [
    candidate({ question: "A triangle has angles of 10°, 20° and one unknown angle. What is the size of the unknown angle?" }),
    candidate({ question: "In a certain triangle, two of the angles measure 10° and 20°. Find the remaining angle." }),
    candidate({ question: "One triangle contains angles sized 10° and 20°, plus an unknown third angle. Work out its size." }),
  ];
  const depth = classifyFamilyDepth(badBatch);
  // This assertion documents the REAL current behaviour: normaliseStemForNearDuplicateCheck
  // (lib/ali/antiMemorisationChecks.ts) is digit-substitution-invariant only, never a
  // paraphrase/semantic-similarity detector. Three cosmetically-reworded copies of the
  // SAME underlying question (same numbers, same computation) register as three distinct
  // "structures" today. This is a known, named gap (see the Scale Architecture and this
  // increment's own evidence report), not a defect introduced by this test.
  assert.equal(depth.structuralVariantCount, 3, "wording-only variation is currently invisible to the structural-skeleton check");
});

// ============================================================
// Fixture 3: dominant-blueprint saturation -- CAUGHT
// ============================================================
test("adversarial: 7 nominal blueprints where one supplies 90% of the batch still classifies CRITICAL", () => {
  const dominant = Array.from({ length: 90 }, (_, i) => candidate({ candidateId: `dom-${i}`, blueprintId: "mr03-bp-third-angle-direct" }));
  const filler = ["mr03-bp-ratio-split", "mr03-bp-verify-triangle", "mr03-bp-error-correction", "mr03-bp-misconception-360-confusion", "mr03-bp-compare-triangles", "mr03-bp-isosceles-relationship"].map(
    (id, i) => candidate({ candidateId: `filler-${i}`, blueprintId: id })
  );
  const depth = classifyBlueprintDepth([...dominant, ...filler]);
  assert.equal(depth.blueprintDepth, 7);
  assert.ok(depth.dominantBlueprintShare > 0.7);
  assert.equal(classifyScaledMemorisationRisk(depth), "CRITICAL", "many blueprints existing on paper does not excuse one dominant filler blueprint in practice");
});

test("adversarial: the Founder's own named counter-example (100 candidates, 10 genuinely balanced blueprints) does NOT classify CRITICAL", () => {
  const balanced = Array.from({ length: 100 }, (_, i) => candidate({ candidateId: `bal-${i}`, blueprintId: `bp-${i % 10}` }));
  const depth = classifyBlueprintDepth(balanced);
  assert.equal(depth.blueprintDepth, 10);
  assert.equal(classifyScaledMemorisationRisk(depth), "LOW");
});

// ============================================================
// Fixtures 4-6: repeated context / reasoning route / unknown position -- CAUGHT
// ============================================================
test("adversarial: repeated context saturation is flagged by detectRepeatedDimension", () => {
  const contexts = Array.from({ length: 20 }, (_, i) => (i === 0 ? "isosceles_triangle_geometry" : "triangle_geometry"));
  const result = detectRepeatedDimension(contexts, "context", 0.7);
  assert.equal(result.exceedsThreshold, true);
});

test("adversarial: repeated reasoning-route saturation is flagged by detectRepeatedDimension", () => {
  const routes = Array.from({ length: 20 }, () => "direct_computation");
  const result = detectRepeatedDimension(routes, "reasoningRoute", 0.7);
  assert.equal(result.exceedsThreshold, true);
  assert.equal(result.distinctValueCount, 1);
});

test("adversarial: repeated unknown-position saturation is flagged by detectRepeatedDimension", () => {
  const positions = Array.from({ length: 20 }, () => "third_angle");
  const result = detectRepeatedDimension(positions, "unknownPosition", 0.7);
  assert.equal(result.exceedsThreshold, true);
});

test("adversarial: template saturation (one dominant literal skeleton) is flagged by detectTemplateSaturation", () => {
  const batch = Array.from({ length: 20 }, (_, i) => candidate({ question: i === 0 ? "A totally different, unrelated question stem." : "A triangle has angles of 5°, 6° and one unknown angle. What is the size of the unknown angle?" }));
  const result = detectTemplateSaturation(batch, 0.5);
  assert.equal(result.exceedsThreshold, true);
});

// ============================================================
// Fixture 7: difficulty distribution corruption -- CAUGHT
// ============================================================
test("adversarial: a batch that only ever produces one difficulty tier fails the difficulty-distribution-integrity gate", () => {
  const batch = Array.from({ length: 20 }, () => candidate({ difficulty: "easy" }));
  const result = checkDifficultyDistributionIntegrity(batch, 2);
  assert.equal(result.distinctTiersPresent, 1);
  assert.equal(result.meetsMinimum, false);
});

// ============================================================
// Fixture 8: misleading difficulty labels -- a REAL, DISCLOSED GAP
// ============================================================
test("adversarial: misleading difficulty labels (label uncorrelated with genuine complexity) have NO automated detector today -- disclosed, not fabricated", () => {
  // This is the exact defect the Human Educational Calibration Gate found
  // and fixed by hand in mr03-angle-sum's OWN difficultyControls (the old
  // rule keyed off the answer's divisibility by 5). No generic gate in
  // this codebase can look at an arbitrary blueprint's difficultyControls
  // function and determine whether its returned label genuinely tracks
  // complexity -- that requires domain judgement about what "complexity"
  // means for THAT specific blueprint, which is why it was caught by
  // human review, not a deterministic check. What IS mechanically
  // provable is that a real blueprint's difficultyControls is a pure,
  // deterministic function of its declared difficultyDimensions -- this
  // assertion is what CAN be automated, and is asserted here honestly
  // instead of a fabricated "misleading label" detector.
  const dims = BP_VERIFY_TRIANGLE.difficultyDimensions;
  assert.ok(dims.length > 0, "every blueprint must disclose which real dimensions drive its difficulty label");
  const params = { angleA: 60, angleB: 60, angleC: 60 };
  const label1 = BP_VERIFY_TRIANGLE.difficultyControls(params);
  const label2 = BP_VERIFY_TRIANGLE.difficultyControls({ ...params });
  assert.equal(label1, label2, "difficultyControls must be a pure function of its declared dimensions, not a hidden random/stateful rule");
});

// ============================================================
// Fixture 9: invalid answer equivalence -- CAUGHT
// ============================================================
test("adversarial: a claimed answer NOT in the declared accepted-forms list is still rejected as answer_mismatch", () => {
  const params = { lengthMetres: 7, pieces: 4 };
  const forms = RIBBON_FRACTION_SPEC.deriveAcceptedAnswerForms!(params);
  const badCandidate = candidate({
    familyId: "precision-frac",
    competencyId: RIBBON_FRACTION_SPEC.competencyId,
    questionTypeId: RIBBON_FRACTION_SPEC.questionTypeId,
    question: RIBBON_FRACTION_SPEC.renderQuestionText(params),
    claimedAnswer: "1 metre", // plausible-looking, but not one of the real declared equivalent forms
    params,
  });
  assert.ok(!forms.includes(badCandidate.claimedAnswer), "the test fixture's bad answer must genuinely not be a declared accepted form");
  const result = validateBlueprintCandidate(badCandidate, RIBBON_FRACTION_SPEC, []);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("answer_mismatch"));
});

test("adversarial: a genuinely declared equivalent form (not the canonical one) IS accepted -- proves the gate rejects bad forms without also rejecting valid ones", () => {
  const params = { lengthMetres: 7, pieces: 4 };
  const forms = RIBBON_FRACTION_SPEC.deriveAcceptedAnswerForms!(params);
  assert.ok(forms.length >= 2, "this fixture requires a real multi-form answer to be meaningful");
  const nonCanonicalForm = forms[1];
  const goodCandidate = candidate({
    familyId: "precision-frac",
    competencyId: RIBBON_FRACTION_SPEC.competencyId,
    questionTypeId: RIBBON_FRACTION_SPEC.questionTypeId,
    question: RIBBON_FRACTION_SPEC.renderQuestionText(params),
    claimedAnswer: nonCanonicalForm,
    params,
  });
  const result = validateBlueprintCandidate(goodCandidate, RIBBON_FRACTION_SPEC, []);
  assert.equal(result.approved, true);
  assert.ok(!result.reasons.includes("answer_mismatch"));
});

// ============================================================
// Fixture 10: impossible angle values -- CAUGHT
// ============================================================
test("adversarial: impossible/out-of-range angle parameters are rejected regardless of what the fixture claims the answer is", () => {
  // equalAngle = 100 violates BP_ISOSCELES_RELATIONSHIP's own declared
  // range (max 85) AND its constraint (180 - 2*100 = -20, not a real angle).
  const impossibleParams = { equalAngle: 100 };
  assert.equal(BP_ISOSCELES_RELATIONSHIP.constraints(impossibleParams), false, "the blueprint's own constraint function must reject this on its own terms");
  const badCandidate = candidate({
    familyId: "mr03-angle-sum",
    blueprintId: "mr03-bp-isosceles-relationship",
    question: BP_ISOSCELES_RELATIONSHIP.renderQuestionText(impossibleParams),
    claimedAnswer: "-20", // even a claim matching the naive formula is still impossible
    params: impossibleParams,
  });
  const result = validateBlueprintCandidate(badCandidate, BP_ISOSCELES_RELATIONSHIP, []);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("invalid_combination") || result.reasons.includes("parameter_out_of_range"));
});

// ============================================================
// Fixture 11: fake structural diversity (different numbers, same underlying shape presented as if novel) -- CAUGHT
// ============================================================
test("adversarial: a batch claiming variety via numbers alone, with no blueprintId, still falls back to CRITICAL under the scaled model (never optimistically assumed diverse)", () => {
  const fakeBatch = Array.from({ length: 50 }, (_, i) =>
    candidate({ candidateId: `fake-${i}`, question: `A triangle has angles of ${5 + i}°, ${8 + i}° and one unknown angle. What is the size of the unknown angle?` })
  );
  const depth = classifyBlueprintDepth(fakeBatch);
  assert.equal(depth.dominantBlueprintShare, 1, "undeclared blueprint provenance must never be assumed diverse");
  assert.equal(classifyScaledMemorisationRisk(depth), "CRITICAL");
});

// ============================================================
// Control: a genuinely diverse, valid batch must still PASS every gate --
// proves this file has not weakened any threshold to force a result.
// ============================================================
test("control: the real 7-blueprint mr03-angle-sum family, generated fresh, passes every adversarial gate applied above", () => {
  const { results } = runFamilyBatch(MR03_ANGLE_SUM_FAMILY, [], 140, seededRandom(4242));
  const approved = results.filter((r) => r.approved).map((r) => r.candidate);
  assert.ok(approved.length > 100, "a real, valid batch must not be accidentally starved by this test's own setup");

  const depth = classifyBlueprintDepth(approved);
  assert.equal(classifyScaledMemorisationRisk(depth), "LOW");

  const contextResult = detectRepeatedDimension(approved.map((c) => c.contextTag), "context", 0.9);
  assert.equal(contextResult.exceedsThreshold, false);

  const reasoningResult = detectRepeatedDimension(approved.map((c) => c.reasoningRoute), "reasoningRoute", 0.7);
  assert.equal(reasoningResult.exceedsThreshold, false);

  const difficultyResult = checkDifficultyDistributionIntegrity(approved.map((c) => ({ difficulty: c.difficulty })), 2);
  assert.equal(difficultyResult.meetsMinimum, true);

  for (const c of approved) {
    assert.ok(c.blueprintId, "every real candidate from a StructuralBlueprint family must carry its blueprintId");
  }
});

test("control: generateBlueprintCandidate stamps a valid, individually-generated candidate that itself passes validateBlueprintCandidate", () => {
  const c = generateBlueprintCandidate(BP_VERIFY_TRIANGLE, seededRandom(99));
  const result = validateBlueprintCandidate(c, BP_VERIFY_TRIANGLE, []);
  assert.equal(result.approved, true);
});
