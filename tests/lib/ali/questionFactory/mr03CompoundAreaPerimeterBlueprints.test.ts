import { test } from "node:test";
import assert from "node:assert/strict";
import { MR03_COMPOUND_AREA_PERIMETER_FAMILY, BP_COMPOUND_PERIMETER_DIRECT, BP_COMPOUND_AREA_DIRECT } from "@/lib/ali/questionFactory/mr03CompoundAreaPerimeterBlueprints";
import { runFamilyBatch, generateBlueprintCandidate, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk } from "@/lib/ali/questionFactory/diversityGates";

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

test("every blueprint stays aligned to MR-03/QT-MR-07", () => {
  for (const bp of MR03_COMPOUND_AREA_PERIMETER_FAMILY.blueprints) {
    assert.equal(bp.competencyId, "MR-03");
    assert.equal(bp.questionTypeId, "QT-MR-07");
  }
});

test("blueprint IDs are unique and stable", () => {
  const ids = MR03_COMPOUND_AREA_PERIMETER_FAMILY.blueprints.map((bp) => bp.blueprintId);
  assert.equal(new Set(ids).size, ids.length);
});

test("a real 120-candidate batch produces zero answer_mismatch across all 6 blueprints", () => {
  const { results } = runFamilyBatch(MR03_COMPOUND_AREA_PERIMETER_FAMILY, [], 120, seededRandom(121));
  for (const r of results) {
    assert.ok(!r.reasons.includes("answer_mismatch"), `${r.candidate.blueprintId}: ${r.candidate.question} => claimed ${r.candidate.claimedAnswer}`);
  }
});

test("the perimeter-independent-of-notch geometric fact is independently verified against a hand-computed example, not merely asserted by the blueprint's own code", () => {
  // Outer 9x7, notch 5x3 -- six-vertex rectilinear L-shape, perimeter independently traced:
  // (0,0)-(9,0)=9, (9,0)-(9,4)=4, (9,4)-(4,4)=5, (4,4)-(4,7)=3, (4,7)-(0,7)=4, (0,7)-(0,0)=7 => 9+4+5+3+4+7=32
  assert.equal(BP_COMPOUND_PERIMETER_DIRECT.deriveCorrectAnswer({ w: 9, h: 7, nw: 5, nh: 3 }), "32m");
  assert.equal(2 * (9 + 7), 32, "sanity: the formula itself matches the hand-traced boundary");
});

test("area formula is independently verified against the same hand-computed example", () => {
  assert.equal(BP_COMPOUND_AREA_DIRECT.deriveCorrectAnswer({ w: 9, h: 7, nw: 5, nh: 3 }), `${9 * 7 - 5 * 3}m2`);
});

test("shape-validity constraint rejects a notch that is not strictly smaller than the outer rectangle", () => {
  for (const bp of [BP_COMPOUND_AREA_DIRECT, BP_COMPOUND_PERIMETER_DIRECT]) {
    assert.equal(bp.constraints({ w: 10, h: 10, nw: 10, nh: 5 }), false, "nw === w must be rejected -- the notch cannot equal or exceed the outer width");
    assert.equal(bp.constraints({ w: 10, h: 10, nw: 5, nh: 10 }), false, "nh === h must be rejected");
  }
});

test("blueprint depth is genuinely 6 and classifies LOW risk", () => {
  const { results } = runFamilyBatch(MR03_COMPOUND_AREA_PERIMETER_FAMILY, [], 90, seededRandom(232));
  const approved = results.filter((r) => r.approved).map((r) => r.candidate);
  const depth = classifyBlueprintDepth(approved);
  assert.equal(depth.blueprintDepth, 6);
  assert.equal(classifyScaledMemorisationRisk(depth), "LOW");
});

test("reasoning routes span direct_computation, reverse_reasoning, multi_step_application, and comparison", () => {
  const { results } = runFamilyBatch(MR03_COMPOUND_AREA_PERIMETER_FAMILY, [], 90, seededRandom(343));
  const routes = new Set(results.map((r) => r.candidate.reasoningRoute));
  assert.ok(routes.has("direct_computation"));
  assert.ok(routes.has("reverse_reasoning"));
  assert.ok(routes.has("multi_step_application"));
  assert.ok(routes.has("comparison"));
});

test("all generated candidates use the diagram representation type, honestly (no false prose claim for a geometric figure)", () => {
  const { results } = runFamilyBatch(MR03_COMPOUND_AREA_PERIMETER_FAMILY, [], 60, seededRandom(454));
  for (const r of results) assert.equal(r.candidate.representationType, "diagram");
});

test("every sampled nw/nh stays within its own blueprint's declared parameterRanges -- the exact class of bug this test suite exists to catch", () => {
  for (const bp of MR03_COMPOUND_AREA_PERIMETER_FAMILY.blueprints) {
    const random = seededRandom(bp.blueprintId.length * 31);
    for (let i = 0; i < 100; i++) {
      const params = bp.sampleParams(random) as { nw?: number; nh?: number; nw1?: number; nh1?: number; nw2?: number; nh2?: number };
      const ranges = bp.parameterRanges as Record<string, { min: number; max: number }>;
      for (const key of Object.keys(params)) {
        const value = (params as Record<string, number>)[key];
        if (ranges[key]) {
          assert.ok(value >= ranges[key].min && value <= ranges[key].max, `${bp.blueprintId}.${key}=${value} outside declared range [${ranges[key].min}, ${ranges[key].max}]`);
        }
      }
    }
  }
});

test("exact-duplicate rejection against a real existing bank row", () => {
  const bp = MR03_COMPOUND_AREA_PERIMETER_FAMILY.blueprints.find((b) => b.blueprintId === "mr03-bp-compound-area-direct")!;
  const candidate = generateBlueprintCandidate(bp, seededRandom(11));
  const existingBankRow = { id: "existing-1", familyId: "mr03-compound-area-perimeter", prompt: { question: candidate.question } };
  const result = validateBlueprintCandidate(candidate, bp, [existingBankRow]);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("exact_duplicate_of_existing_bank_row"));
});
