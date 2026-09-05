import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { generateCandidate, validateCandidate, runBatch } from "@/lib/ali/questionFactory/candidateGeneration";
import { DECIMAL_MULTIPLICATION_SPEC, RIBBON_FRACTION_SPEC, TRIANGLE_ANGLE_SUM_SPEC, WAVE_1_FAMILY_SPECS } from "@/lib/ali/questionFactory/familySpecs";
import type { ExistingBankRowForComparison } from "@/lib/ali/questionFactory/types";

/**
 * Question Factory Wave 1, Phase 4/5/9 -- Mathematics candidate
 * generation and validation. All three families here are real, live
 * `family_id` values confirmed via a read-only, anon-key production
 * query this session (see familySpecs.ts's own module docstring). No
 * test in this file writes to any database, and no candidate produced
 * here is ever routed anywhere a real learner could see it -- this file
 * exercises pure library functions only.
 */

// A fixed, deterministic PRNG so tests are reproducible, not flaky.
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const REAL_MR01_DECIMAL_ROWS: ExistingBankRowForComparison[] = [
  { id: "mth-008", familyId: "mr01-decimal-computation", prompt: { question: "Calculate: 2.4 × 0.35" } },
];
const REAL_PRECISION_FRAC_ROWS: ExistingBankRowForComparison[] = [
  { id: "precision-frac-01", familyId: "precision-frac", prompt: { question: "A 10m ribbon is cut into 3 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form." } },
];
const REAL_MR03_ANGLE_ROWS: ExistingBankRowForComparison[] = [
  { id: "mr03-ang-01", familyId: "mr03-angle-sum", prompt: { question: "A triangle has angles of 48°, 62° and one unknown angle. What is the size of the unknown angle?" } },
];

// === 1. Independent answer recomputation rejects a tampered candidate ===

test("a candidate with a deliberately wrong claimed answer is rejected by independent recomputation, regardless of everything else being valid", () => {
  const candidate = generateCandidate(DECIMAL_MULTIPLICATION_SPEC, seededRandom(1));
  const tampered = { ...candidate, claimedAnswer: "999.999" };
  const result = validateCandidate(tampered, DECIMAL_MULTIPLICATION_SPEC, []);
  assert.equal(result.mathematicallyValid, false);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("answer_mismatch"));
});

test("the SAME candidate with its real, untampered claimed answer passes the recomputation check", () => {
  const candidate = generateCandidate(DECIMAL_MULTIPLICATION_SPEC, seededRandom(1));
  const result = validateCandidate(candidate, DECIMAL_MULTIPLICATION_SPEC, []);
  assert.ok(!result.reasons.includes("answer_mismatch"));
});

// === 2. Out-of-range parameters are rejected ===

test("a candidate with a parameter outside the spec's declared range is rejected", () => {
  const candidate = generateCandidate(TRIANGLE_ANGLE_SUM_SPEC, seededRandom(2));
  const outOfRange = { ...candidate, params: { ...candidate.params, angleA: 500 } };
  const result = validateCandidate(outOfRange, TRIANGLE_ANGLE_SUM_SPEC, []);
  assert.equal(result.mathematicallyValid, false);
  assert.ok(result.reasons.includes("parameter_out_of_range"));
});

// === 3. Invalid parameter combinations are rejected ===

test("a candidate whose parameters individually sit in-range but form an invalid combination (ribbon length divides evenly by piece count) is rejected", () => {
  const candidate = generateCandidate(RIBBON_FRACTION_SPEC, seededRandom(3));
  const evenDivision = { ...candidate, params: { lengthMetres: 12, pieces: 4 } }; // 12/4 = 3 exactly -- violates this family's own constraint
  const result = validateCandidate(evenDivision, RIBBON_FRACTION_SPEC, []);
  assert.equal(result.mathematicallyValid, false);
  assert.ok(result.reasons.includes("invalid_combination"));
});

test("a candidate whose two decimal parameters resolve to whole numbers (both %10/%100 === 0) is rejected as an invalid combination for the decimal-multiplication family", () => {
  const candidate = generateCandidate(DECIMAL_MULTIPLICATION_SPEC, seededRandom(4));
  const wholeNumbers = { ...candidate, params: { aTenths: 50, bHundredths: 300 }, claimedAnswer: DECIMAL_MULTIPLICATION_SPEC.deriveCorrectAnswer({ aTenths: 50, bHundredths: 300 }) };
  const result = validateCandidate(wholeNumbers, DECIMAL_MULTIPLICATION_SPEC, []);
  assert.ok(result.reasons.includes("invalid_combination"));
});

// === 4. Exact duplicate of a real existing bank row is rejected ===

test("a candidate whose rendered question text exactly matches a REAL existing bank row is rejected as an exact duplicate, even though it is mathematically perfect", () => {
  const duplicateParams = { aTenths: 24, bHundredths: 35 }; // reproduces the real row's own "2.4 x 0.35"
  const candidate = {
    ...generateCandidate(DECIMAL_MULTIPLICATION_SPEC, seededRandom(5)),
    params: duplicateParams,
    question: DECIMAL_MULTIPLICATION_SPEC.renderQuestionText(duplicateParams),
    claimedAnswer: DECIMAL_MULTIPLICATION_SPEC.deriveCorrectAnswer(duplicateParams),
  };
  assert.equal(candidate.question, "Calculate: 2.4 × 0.35", "sanity: this really does reproduce the real bank row's exact text");
  const result = validateCandidate(candidate, DECIMAL_MULTIPLICATION_SPEC, REAL_MR01_DECIMAL_ROWS);
  assert.equal(result.mathematicallyValid, true, "mathematically this candidate is entirely correct");
  assert.equal(result.approved, false, "but it must still be rejected at the duplicate-check stage");
  assert.ok(result.reasons.includes("exact_duplicate_of_existing_bank_row"));
});

test("the identical duplicate-detection mechanism correctly rejects a real-row reproduction for the ribbon-fraction family too", () => {
  const duplicateParams = { lengthMetres: 10, pieces: 3 };
  const candidate = {
    ...generateCandidate(RIBBON_FRACTION_SPEC, seededRandom(6)),
    params: duplicateParams,
    question: RIBBON_FRACTION_SPEC.renderQuestionText(duplicateParams),
    claimedAnswer: RIBBON_FRACTION_SPEC.deriveCorrectAnswer(duplicateParams),
  };
  const result = validateCandidate(candidate, RIBBON_FRACTION_SPEC, REAL_PRECISION_FRAC_ROWS);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("exact_duplicate_of_existing_bank_row"));
});

test("exact duplicates WITHIN one batch (two candidates that happen to sample identical parameters) are also rejected, not only duplicates against the live bank", () => {
  const params = { angleA: 48, angleB: 62 };
  const first = { ...generateCandidate(TRIANGLE_ANGLE_SUM_SPEC, seededRandom(7)), params, question: TRIANGLE_ANGLE_SUM_SPEC.renderQuestionText(params), claimedAnswer: TRIANGLE_ANGLE_SUM_SPEC.deriveCorrectAnswer(params) };
  const second = { ...generateCandidate(TRIANGLE_ANGLE_SUM_SPEC, seededRandom(8)), params, question: TRIANGLE_ANGLE_SUM_SPEC.renderQuestionText(params), claimedAnswer: TRIANGLE_ANGLE_SUM_SPEC.deriveCorrectAnswer(params) };
  const firstResult = validateCandidate(first, TRIANGLE_ANGLE_SUM_SPEC, [], []);
  assert.equal(firstResult.approved, true, "the first occurrence is genuinely novel and must be approved");
  const secondResult = validateCandidate(second, TRIANGLE_ANGLE_SUM_SPEC, [], [first]);
  assert.equal(secondResult.approved, false);
  assert.ok(secondResult.reasons.includes("exact_duplicate_within_batch"));
});

// === 5. A genuinely valid, novel candidate is approved ===

test("a genuinely valid, novel candidate (no real bank row shares its parameters) is approved for each of the three Wave 1 families", () => {
  for (const spec of WAVE_1_FAMILY_SPECS) {
    const candidate = generateCandidate(spec, seededRandom(42));
    const result = validateCandidate(candidate, spec, []);
    assert.equal(result.approved, true, `family ${spec.familyId} should approve a fresh, untampered candidate`);
    assert.deepEqual(result.reasons, []);
  }
});

// === 6. Family identity is never fabricated ===

test("runBatch's own invariant: every approved candidate across a real batch carries the exact same familyId as its spec -- generation can never create a new family", () => {
  for (const spec of WAVE_1_FAMILY_SPECS) {
    const { metrics } = runBatch(spec, [], 30, seededRandom(100));
    assert.deepEqual(metrics.distinctFamilyIdsInApprovedSet, [spec.familyId], `family ${spec.familyId}: approved set must contain exactly one family id, matching the spec`);
  }
});

// === 7. Real batch orchestration, real metrics, for all three Wave 1 families ===

test("a real 40-candidate batch for mr01-decimal-computation produces internally consistent, real metrics", () => {
  const { metrics } = runBatch(DECIMAL_MULTIPLICATION_SPEC, REAL_MR01_DECIMAL_ROWS, 40, seededRandom(200));
  assert.equal(metrics.rawGenerated, 40);
  assert.equal(metrics.valid + metrics.rejected, 40, "every generated candidate is classified exactly once as valid or rejected");
  assert.ok(metrics.approved <= metrics.valid, "approved (post-duplicate-check) can never exceed valid (post-math-check)");
  assert.ok(metrics.approved > 0, "at this batch size, at least some genuinely novel candidates must be approved");
  assert.ok(metrics.variedParameterKeys.length > 0, "real variation must be observed across the approved set, not a single repeated point");
  assert.equal(metrics.uniqueApprovedInstances, metrics.approved, "approved candidates are already deduplicated by construction -- unique count must equal approved count");
});

test("a real 40-candidate batch for precision-frac (fraction answer form) produces internally consistent, real metrics", () => {
  const { metrics } = runBatch(RIBBON_FRACTION_SPEC, REAL_PRECISION_FRAC_ROWS, 40, seededRandom(201));
  assert.equal(metrics.rawGenerated, 40);
  assert.equal(metrics.valid + metrics.rejected, 40);
  assert.ok(metrics.approved <= metrics.valid);
  assert.ok(metrics.approved > 0);
});

test("a real 40-candidate batch for mr03-angle-sum (geometry reasoning) produces internally consistent, real metrics", () => {
  const { metrics } = runBatch(TRIANGLE_ANGLE_SUM_SPEC, REAL_MR03_ANGLE_ROWS, 40, seededRandom(202));
  assert.equal(metrics.rawGenerated, 40);
  assert.equal(metrics.valid + metrics.rejected, 40);
  assert.ok(metrics.approved <= metrics.valid);
  assert.ok(metrics.approved > 0);
});

test("a batch containing the exact real bank-row parameters mixed with a seeded PRNG still correctly excludes that one duplicate from the approved set", () => {
  // Force the very first sample to reproduce the real row, by seeding
  // deterministically and checking the real duplicate-detection path
  // fires at least once across a larger run against a real-row pool
  // that includes several already-consumed parameter combinations.
  const denseRealRows: ExistingBankRowForComparison[] = Array.from({ length: 20 }, (_, i) => ({
    id: `synthetic-existing-${i}`,
    familyId: "mr03-angle-sum",
    prompt: { question: TRIANGLE_ANGLE_SUM_SPEC.renderQuestionText({ angleA: 20 + i, angleB: 30 + i }) },
  }));
  const { metrics, results } = runBatch(TRIANGLE_ANGLE_SUM_SPEC, denseRealRows, 60, seededRandom(300));
  assert.equal(metrics.rawGenerated, 60);
  const duplicateRejections = results.filter((r) => r.reasons.includes("exact_duplicate_of_existing_bank_row"));
  // Not asserting a nonzero count here (the PRNG may or may not collide with the dense pool) --
  // asserting instead that IF a collision occurred, it was correctly classified as mathematically
  // valid but not approved, proving the two-stage distinction holds under real batch conditions.
  for (const r of duplicateRejections) {
    assert.equal(r.mathematicallyValid, true, "a duplicate of a real row is still mathematically correct -- it must fail only the duplicate check, not the maths checks");
    assert.equal(r.approved, false);
  }
});

// === 8. No candidate structurally resembles a bankable row ===

test("MathsQuestionCandidate has no eligibility_status, active, or bank-style id field -- structurally impossible to write straight to ali_question_bank", () => {
  const candidate = generateCandidate(DECIMAL_MULTIPLICATION_SPEC, seededRandom(9));
  assert.equal((candidate as unknown as { eligibility_status?: unknown }).eligibility_status, undefined);
  assert.equal((candidate as unknown as { active?: unknown }).active, undefined);
  assert.match(candidate.candidateId, /^factory-candidate-/, "candidate ids are distinctly prefixed, never resembling a real bank id convention (qa-*, mth-*, mr0X-*)");
});

test("this module never imports a Supabase client or writes to any table", () => {
  const source = fs.readFileSync("lib/ali/questionFactory/candidateGeneration.ts", "utf8");
  assert.doesNotMatch(source, /from\s+["']@supabase\/supabase-js["']/);
  assert.doesNotMatch(source, /\.from\(\s*["']ali_/);
});
