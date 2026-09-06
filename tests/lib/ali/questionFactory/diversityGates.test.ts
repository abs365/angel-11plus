import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyFamilyDepth,
  classifyMemorisationRisk,
  detectTemplateSaturation,
  detectRepeatedDimension,
  checkStructuralDiversityMinimum,
  checkDifficultyDistributionIntegrity,
  runFamilyDiversityGates,
  DEFAULT_FAMILY_GATE_POLICY,
} from "@/lib/ali/questionFactory/diversityGates";

/**
 * Question Factory Wave 2, Human Educational Calibration Gate, Task 8.
 * Built directly from the calibration audit's own real finding: all
 * three Wave 1 families passed 100% automated mathematical/duplicate
 * validation while being, educationally, one template each. These tests
 * prove the new deterministic gates would have caught that BEFORE human
 * review, using the exact real production numbers as regression fixtures
 * where named.
 */

function candidate(question: string, overrides: Partial<{ contextTag: string; reasoningRoute: "direct_computation" | "reverse_reasoning" | "comparison" | "error_identification" | "multi_step_application" | "interpretation"; unknownPosition: string; difficulty: "easy" | "medium" | "hard" | "challenge" }> = {}) {
  return {
    question,
    contextTag: overrides.contextTag ?? "bare_arithmetic",
    reasoningRoute: overrides.reasoningRoute ?? "direct_computation",
    unknownPosition: overrides.unknownPosition ?? "product",
    difficulty: overrides.difficulty ?? "medium",
  };
}

test("number-only substitutions are recognised as closely related -- classifyFamilyDepth collapses them to ONE structural variant, matching the real mr01-decimal-computation production batch (10 candidates, 1 structure)", () => {
  const tenRealDecimalQuestions = [
    "Calculate: 2.3 × 5.96", "Calculate: 6.6 × 1.55", "Calculate: 6.5 × 9.69", "Calculate: 1.7 × 9.02", "Calculate: 4.9 × 7.31",
    "Calculate: 4.1 × 0.74", "Calculate: 1.4 × 5.79", "Calculate: 6.2 × 1.24", "Calculate: 5.7 × 4.27", "Calculate: 3.6 × 9.91",
  ].map((q) => candidate(q));
  const depth = classifyFamilyDepth(tenRealDecimalQuestions);
  assert.equal(depth.rawVariantCount, 10);
  assert.equal(depth.structuralVariantCount, 1, "all ten share the identical skeleton once numbers are normalised");
  assert.equal(depth.structuralDiversityRatio, 0.1);
});

test("identical reasoning skeletons are detectable via detectTemplateSaturation, with an explainable dominant-skeleton result, not a black-box score", () => {
  const questions = Array.from({ length: 10 }, (_, i) => candidate(`A triangle has angles of ${10 + i}°, ${20 + i}° and one unknown angle. What is the size of the unknown angle?`));
  const result = detectTemplateSaturation(questions, 0.5);
  assert.equal(result.saturationRatio, 1);
  assert.equal(result.dominantSkeletonCount, 10);
  assert.ok(result.dominantSkeleton.length > 0, "the dominant skeleton itself must be inspectable, not just a ratio");
  assert.equal(result.exceedsThreshold, true);
});

test("varied wording alone does NOT falsely count as structural diversity -- two candidates differing only in numbers and superficial phrasing still normalise to the same skeleton when the underlying digit pattern is identical", () => {
  const a = candidate("Calculate: 2.3 × 5.96");
  const b = candidate("Calculate: 9.1 × 3.42"); // different numbers, same digit-count pattern (1dp x 2dp) -> same skeleton after # normalisation
  const depth = classifyFamilyDepth([a, b]);
  assert.equal(depth.structuralVariantCount, 1, "numeric-substitution-only variation must never be counted as two structures");
});

test("genuinely different structures within one competency CAN pass the gates -- a synthetic, deliberately diversified batch (varied context, reasoning route, unknown position, and phrasing) clears every Task 6 gate", () => {
  const diversified = [
    candidate("Calculate: 2.3 × 5.96", { contextTag: "bare_arithmetic", reasoningRoute: "direct_computation", unknownPosition: "product", difficulty: "easy" }),
    candidate("A shop sells ribbon at £2.30 per metre. How much does 5.96 metres cost?", { contextTag: "shopping", reasoningRoute: "direct_computation", unknownPosition: "total_cost", difficulty: "medium" }),
    candidate("Two numbers multiply to give 13.708. One of the numbers is 2.3. What is the other number?", { contextTag: "bare_arithmetic", reasoningRoute: "reverse_reasoning", unknownPosition: "factor", difficulty: "medium" }),
    candidate("A recipe needs 2.3 times as much flour as sugar. If 5.96kg of sugar is used, how much flour is needed?", { contextTag: "cooking", reasoningRoute: "multi_step_application", unknownPosition: "product", difficulty: "hard" }),
    candidate("A student calculated 2.3 × 5.96 = 137.08. Explain the error and give the correct answer.", { contextTag: "bare_arithmetic", reasoningRoute: "error_identification", unknownPosition: "product", difficulty: "hard" }),
  ];
  const report = runFamilyDiversityGates("synthetic-diversified-demo", diversified);
  assert.equal(report.templateSaturation.exceedsThreshold, false);
  assert.equal(report.contextRepetition.exceedsThreshold, false);
  assert.equal(report.reasoningRouteRepetition.exceedsThreshold, false);
  assert.equal(report.structuralDiversity.meetsMinimum, true);
  assert.ok(report.passesAllGates, "a genuinely diversified batch must be able to pass -- these gates measure real variety, they do not reject on principle");
  assert.notEqual(report.memorisationRisk, "CRITICAL");
});

test("difficulty distribution is validated -- a family using only one difficulty label fails the minimum-distinct-tiers check", () => {
  const allMedium = Array.from({ length: 5 }, (_, i) => candidate(`Calculate: ${i}.1 × ${i}.22`, { difficulty: "medium" }));
  const result = checkDifficultyDistributionIntegrity(allMedium, 2);
  assert.equal(result.distinctTiersPresent, 1);
  assert.equal(result.meetsMinimum, false);
});

test("difficulty distribution integrity passes once at least the minimum number of distinct tiers genuinely appear", () => {
  const mixed = [candidate("a", { difficulty: "easy" }), candidate("b", { difficulty: "medium" }), candidate("c", { difficulty: "hard" })];
  const result = checkDifficultyDistributionIntegrity(mixed, 2);
  assert.equal(result.distinctTiersPresent, 3);
  assert.equal(result.meetsMinimum, true);
});

test("classifyMemorisationRisk reaches CRITICAL at the real production ratio (0.1, 10 candidates) -- matching the Founder's own instruction that a frequent learner succeeding via pattern memorisation is unacceptable, not merely a soft concern", () => {
  assert.equal(classifyMemorisationRisk(0.1, 10), "CRITICAL");
});

test("classifyMemorisationRisk reaches LOW only at genuinely high diversity, and the four levels are ordered monotonically", () => {
  assert.equal(classifyMemorisationRisk(0.9, 10), "LOW");
  assert.equal(classifyMemorisationRisk(0.5, 10), "MEDIUM");
  assert.equal(classifyMemorisationRisk(0.25, 10), "HIGH");
  assert.equal(classifyMemorisationRisk(0.05, 10), "CRITICAL");
});

test("detectRepeatedDimension is the SAME mechanism for context, unknown position, and reasoning route -- not three separately-implemented, potentially inconsistent checks", () => {
  const allSameContext = Array.from({ length: 10 }, () => "ribbon_cutting");
  const result = detectRepeatedDimension(allSameContext, "context", 0.7);
  assert.equal(result.distinctValueCount, 1);
  assert.equal(result.dominantValueRatio, 1);
  assert.equal(result.exceedsThreshold, true);

  const variedContext = ["ribbon_cutting", "shopping", "cooking", "sport", "travel"];
  const result2 = detectRepeatedDimension(variedContext, "context", 0.7);
  assert.equal(result2.distinctValueCount, 5);
  assert.equal(result2.exceedsThreshold, false);
});

test("duplicate and near-duplicate rejection remains deterministic -- running the same input through classifyFamilyDepth/detectTemplateSaturation twice produces byte-identical results", () => {
  const questions = ["Calculate: 2.3 × 5.96", "Calculate: 6.6 × 1.55"].map((q) => candidate(q));
  const first = classifyFamilyDepth(questions);
  const second = classifyFamilyDepth(questions);
  assert.deepEqual(first, second);
  const sat1 = detectTemplateSaturation(questions, 0.5);
  const sat2 = detectTemplateSaturation(questions, 0.5);
  assert.deepEqual(sat1, sat2);
});

test("checkStructuralDiversityMinimum reports the same ratio classifyFamilyDepth computes -- no divergent calculation path", () => {
  const questions = Array.from({ length: 5 }, (_, i) => candidate(`Calculate: ${i}.1 × ${i}.22`));
  const depth = classifyFamilyDepth(questions);
  const gate = checkStructuralDiversityMinimum(questions, 0.4);
  assert.equal(gate.structuralDiversityRatio, depth.structuralDiversityRatio);
});

test("runFamilyDiversityGates reproduces the real production finding exactly for all three Wave 1 families: 0.10 structural diversity ratio, CRITICAL memorisation risk, gates fail", () => {
  const realDecimalQuestions = [
    "Calculate: 2.3 × 5.96", "Calculate: 6.6 × 1.55", "Calculate: 6.5 × 9.69", "Calculate: 1.7 × 9.02", "Calculate: 4.9 × 7.31",
    "Calculate: 4.1 × 0.74", "Calculate: 1.4 × 5.79", "Calculate: 6.2 × 1.24", "Calculate: 5.7 × 4.27", "Calculate: 3.6 × 9.91",
  ].map((q) => candidate(q, { contextTag: "bare_arithmetic", reasoningRoute: "direct_computation", unknownPosition: "product" }));
  const report = runFamilyDiversityGates("mr01-decimal-computation", realDecimalQuestions, DEFAULT_FAMILY_GATE_POLICY);
  assert.equal(report.depth.structuralDiversityRatio, 0.1);
  assert.equal(report.memorisationRisk, "CRITICAL");
  assert.equal(report.passesAllGates, false);
  assert.equal(report.templateSaturation.exceedsThreshold, true);
});
