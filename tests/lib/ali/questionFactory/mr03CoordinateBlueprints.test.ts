import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MR03_COORDINATE_FAMILY, BP_REFLECT_X_AXIS, BP_REFLECT_Y_AXIS, BP_REFLECT_LINE_Y_EQUALS_X,
  BP_TRANSLATE, BP_REVERSE_TRANSLATION, BP_FIND_MIDPOINT, BP_COORD_ERROR_IDENTIFICATION,
} from "@/lib/ali/questionFactory/mr03CoordinateBlueprints";
import { runFamilyBatch, generateBlueprintCandidate, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk } from "@/lib/ali/questionFactory/diversityGates";

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

test("every blueprint stays aligned to MR-03/QT-MR-08", () => {
  for (const bp of MR03_COORDINATE_FAMILY.blueprints) {
    assert.equal(bp.competencyId, "MR-03");
    assert.equal(bp.questionTypeId, "QT-MR-08");
  }
});

test("blueprint IDs are unique and stable", () => {
  const ids = MR03_COORDINATE_FAMILY.blueprints.map((bp) => bp.blueprintId);
  assert.equal(new Set(ids).size, ids.length);
});

test("hand-verified correctness spot checks matching real production content exactly", () => {
  assert.equal(BP_REFLECT_X_AXIS.deriveCorrectAnswer({ x: 3, y: 5 }), "(3, -5)");
  assert.equal(BP_REFLECT_Y_AXIS.deriveCorrectAnswer({ x: 4, y: -2 }), "(-4, -2)");
  assert.equal(BP_TRANSLATE.deriveCorrectAnswer({ x: -3, y: 6, dx: 5, dy: -2 }), "(2, 4)");
});

test("BP_FIND_MIDPOINT is a genuinely different operation (averaging two points) from any single-point transform", () => {
  assert.equal(BP_FIND_MIDPOINT.deriveCorrectAnswer({ x1: 2, y1: 4, x2: 8, y2: 10 }), "(5, 7)");
});

test("a real 210-candidate batch produces zero answer_mismatch across all 7 blueprints", () => {
  const { results } = runFamilyBatch(MR03_COORDINATE_FAMILY, [], 210, seededRandom(151));
  for (const r of results) assert.ok(!r.reasons.includes("answer_mismatch"), `${r.candidate.blueprintId}: ${r.candidate.question} => ${r.candidate.claimedAnswer}`);
});

test("every candidate is independently verified via generic transform-agnostic functions, never merely the same-function check", () => {
  const { results } = runFamilyBatch(MR03_COORDINATE_FAMILY, [], 140, seededRandom(262));
  for (const r of results) assert.equal(r.independentlyVerified, true, r.candidate.blueprintId);
});

test("blueprint depth is genuinely 7 and classifies LOW risk", () => {
  const { results } = runFamilyBatch(MR03_COORDINATE_FAMILY, [], 140, seededRandom(373));
  const approved = results.filter((r) => r.approved).map((r) => r.candidate);
  const depth = classifyBlueprintDepth(approved);
  assert.equal(depth.blueprintDepth, 7);
  assert.equal(classifyScaledMemorisationRisk(depth), "LOW");
});

test("reasoning routes span direct_computation, reverse_reasoning, multi_step_application, and error_identification", () => {
  const { results } = runFamilyBatch(MR03_COORDINATE_FAMILY, [], 210, seededRandom(484));
  const routes = new Set(results.map((r) => r.candidate.reasoningRoute));
  assert.ok(routes.has("direct_computation"));
  assert.ok(routes.has("reverse_reasoning"));
  assert.ok(routes.has("multi_step_application"));
  assert.ok(routes.has("error_identification"));
});

test("fault injection: reflect-x-axis's generic transform check rejects a deliberately wrong claimed reflection", () => {
  const result = BP_REFLECT_X_AXIS.independentAnswerCheck!({ x: 3, y: 5 }, "(3, 5)"); // unreflected -- wrong
  assert.equal(result.matches, false);
});

test("fault injection: a hand-built BUGGY reflect implementation (negates x instead of y) is caught by the independent generic-function check, never compared against itself", () => {
  function buggyReflectXAxis(x: number, y: number): string { return `(${-x}, ${y})`; } // deliberately wrong axis
  const buggyClaim = buggyReflectXAxis(3, 5);
  const result = BP_REFLECT_X_AXIS.independentAnswerCheck!({ x: 3, y: 5 }, buggyClaim);
  assert.equal(result.matches, false);
});

test("exact-duplicate rejection against a real existing bank row", () => {
  const bp = MR03_COORDINATE_FAMILY.blueprints.find((b) => b.blueprintId === "mr03-bp-reflect-x-axis")!;
  const candidate = generateBlueprintCandidate(bp, seededRandom(21));
  const existingBankRow = { id: "existing-1", familyId: "mr03-coordinate", prompt: { question: candidate.question } };
  const result = validateBlueprintCandidate(candidate, bp, [existingBankRow]);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("exact_duplicate_of_existing_bank_row"));
});

test("every blueprint declares at least one TeachingUse", () => {
  for (const bp of MR03_COORDINATE_FAMILY.blueprints) assert.ok((bp.teachingUses?.length ?? 0) > 0, bp.blueprintId);
});

// ============================================================
// Increment 002 Revision, Section 5 -- zero-displacement wording fix.
// A translation with dx=0 or dy=0 must never render "0 units right"
// style phrasing; only the axis that actually moves is mentioned.
// ============================================================

test("BP_TRANSLATE never renders a zero-displacement clause on either axis", () => {
  const horizontalOnly = BP_TRANSLATE.renderQuestionText({ x: 1, y: 1, dx: 4, dy: 0 });
  assert.ok(!/\b0 units/.test(horizontalOnly), horizontalOnly);
  assert.match(horizontalOnly, /4 units right/);
  assert.ok(!/ and /.test(horizontalOnly), "a single-axis translation must not render a leftover ' and ' joiner");

  const verticalOnly = BP_TRANSLATE.renderQuestionText({ x: 1, y: 1, dx: 0, dy: -3 });
  assert.ok(!/\b0 units/.test(verticalOnly), verticalOnly);
  assert.match(verticalOnly, /3 units down/);

  const both = BP_TRANSLATE.renderQuestionText({ x: 1, y: 1, dx: 2, dy: 3 });
  assert.match(both, /2 units right and 3 units up/);
});

test("BP_REVERSE_TRANSLATION never renders a zero-displacement clause on either axis", () => {
  const horizontalOnly = BP_REVERSE_TRANSLATION.renderQuestionText({ resultX: 1, resultY: 1, dx: -5, dy: 0 });
  assert.ok(!/\b0 units/.test(horizontalOnly), horizontalOnly);
  assert.match(horizontalOnly, /5 units left/);

  const verticalOnly = BP_REVERSE_TRANSLATION.renderQuestionText({ resultX: 1, resultY: 1, dx: 0, dy: 6 });
  assert.ok(!/\b0 units/.test(verticalOnly), verticalOnly);
  assert.match(verticalOnly, /6 units up/);
});

test("no candidate produced by a real batch run ever contains '0 units' wording", () => {
  const { results } = runFamilyBatch(MR03_COORDINATE_FAMILY, [], 300, seededRandom(909));
  for (const r of results) {
    assert.ok(!/\b0 units/.test(r.candidate.question), `${r.candidate.candidateId ?? r.candidate.blueprintId}: "${r.candidate.question}"`);
  }
});

// ============================================================
// Increment 002 Revision, Section 6 -- reasoning-demand difficulty,
// not magnitude. Adversarial proof: a LARGE-magnitude point can be
// "easy" and a SMALL-magnitude point can be "hard", disproving any
// residual magnitude-based inversion.
// ============================================================

test("adversarial: BP_REFLECT_X_AXIS -- a large-magnitude point with positive y is EASY, a small-magnitude point with x=0 is HARD (magnitude does not determine difficulty)", () => {
  assert.equal(BP_REFLECT_X_AXIS.difficultyControls({ x: 9, y: 8 }), "easy");
  assert.equal(BP_REFLECT_X_AXIS.difficultyControls({ x: 0, y: 1 }), "hard");
  assert.equal(BP_REFLECT_X_AXIS.difficultyControls({ x: 5, y: -1 }), "medium");
});

test("adversarial: BP_REFLECT_Y_AXIS -- mirrors BP_REFLECT_X_AXIS on the other coordinate", () => {
  assert.equal(BP_REFLECT_Y_AXIS.difficultyControls({ x: 8, y: 9 }), "easy");
  assert.equal(BP_REFLECT_Y_AXIS.difficultyControls({ x: 1, y: 0 }), "hard");
  assert.equal(BP_REFLECT_Y_AXIS.difficultyControls({ x: -1, y: 5 }), "medium");
});

test("adversarial: BP_REFLECT_LINE_Y_EQUALS_X -- difficulty tracks the COUNT of negative coordinates, not magnitude", () => {
  assert.equal(BP_REFLECT_LINE_Y_EQUALS_X.difficultyControls({ x: 9, y: 8 }), "easy");
  assert.equal(BP_REFLECT_LINE_Y_EQUALS_X.difficultyControls({ x: -1, y: 1 }), "medium");
  assert.equal(BP_REFLECT_LINE_Y_EQUALS_X.difficultyControls({ x: -9, y: -8 }), "hard");
  // A large-magnitude, all-positive point stays easy; a small-magnitude, all-negative point is hard.
  assert.equal(BP_REFLECT_LINE_Y_EQUALS_X.difficultyControls({ x: -1, y: -1 }), "hard");
});

test("adversarial: BP_TRANSLATE -- difficulty tracks sign-crossing count, not the size of dx/dy", () => {
  // Large dx/dy but no sign crossing (large positive start, large positive shift): easy.
  assert.equal(BP_TRANSLATE.difficultyControls({ x: 9, y: 9, dx: 8, dy: 8 }), "easy");
  // Small numbers but one coordinate crosses zero: medium.
  assert.equal(BP_TRANSLATE.difficultyControls({ x: 1, y: 1, dx: -3, dy: 1 }), "medium");
  // Small numbers, both coordinates cross zero: hard.
  assert.equal(BP_TRANSLATE.difficultyControls({ x: 1, y: 1, dx: -3, dy: -3 }), "hard");
});

test("adversarial: BP_REVERSE_TRANSLATION -- difficulty tracks sign-crossing between the original and result, not magnitude", () => {
  assert.equal(BP_REVERSE_TRANSLATION.difficultyControls({ resultX: 9, resultY: 9, dx: 8, dy: 8 }), "easy");
  assert.equal(BP_REVERSE_TRANSLATION.difficultyControls({ resultX: -2, resultY: 1, dx: -3, dy: 1 }), "medium");
  assert.equal(BP_REVERSE_TRANSLATION.difficultyControls({ resultX: -2, resultY: -2, dx: -3, dy: -3 }), "hard");
});

test("adversarial: BP_COORD_ERROR_IDENTIFICATION -- difficulty tracks equal-coordinate-magnitude, not size; a large equal-magnitude pair is HARD, a small unequal pair is easy/medium", () => {
  assert.equal(BP_COORD_ERROR_IDENTIFICATION.difficultyControls({ x: 9, y: 9 }), "hard");
  assert.equal(BP_COORD_ERROR_IDENTIFICATION.difficultyControls({ x: -9, y: 9 }), "hard");
  assert.equal(BP_COORD_ERROR_IDENTIFICATION.difficultyControls({ x: 1, y: 2 }), "easy");
  assert.equal(BP_COORD_ERROR_IDENTIFICATION.difficultyControls({ x: 1, y: -2 }), "medium");
});

test("Product Completion & Educational Scale, Section 25 -- two DIFFERENT blueprints sharing the identical {x,y} params shape never collide on candidateId, even for the SAME (x,y) point", () => {
  // BP_REFLECT_X_AXIS and BP_REFLECT_Y_AXIS both take exactly {x, y} --
  // a stable id scheme keyed on params alone (without blueprintId) would
  // collide here despite these being genuinely different questions
  // (different transforms) for the same point. Both draw from an
  // identical fixed random sequence so they sample the identical point.
  const fixedSequence = () => { let n = 0; return () => { n += 1; return n === 1 ? 0.65 : 0.75; }; };
  const a = generateBlueprintCandidate(BP_REFLECT_X_AXIS, fixedSequence());
  const b = generateBlueprintCandidate(BP_REFLECT_Y_AXIS, fixedSequence());
  assert.deepEqual(a.params, b.params, "sanity check: both blueprints must have sampled the identical (x,y) point for this test to be meaningful");
  assert.notEqual(a.blueprintId, b.blueprintId);
  assert.notEqual(a.candidateId, b.candidateId, "same point, different blueprint -- must never share a candidateId");
});

test("no blueprint's difficultyDimensions still names raw coordinate/translation magnitude as the reasoning source", () => {
  for (const bp of MR03_COORDINATE_FAMILY.blueprints) {
    for (const dim of bp.difficultyDimensions) {
      assert.ok(!/^coordinate_magnitude$|^translation_magnitude$/.test(dim), `${bp.blueprintId} still declares a magnitude-based difficulty dimension: "${dim}"`);
    }
  }
});
