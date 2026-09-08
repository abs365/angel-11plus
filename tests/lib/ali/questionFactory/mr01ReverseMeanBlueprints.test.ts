import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MR01_REVERSE_MEAN_FAMILY,
  BP_REVERSE_MEAN_DIRECT,
  BP_REVERSE_MEAN_ERROR_IDENTIFICATION,
  BP_REVERSE_MEAN_NEW_VALUE_CHANGES_MEAN,
  BP_REVERSE_MEAN_COMBINED_GROUPS,
} from "@/lib/ali/questionFactory/mr01ReverseMeanBlueprints";
import { runFamilyBatch, generateBlueprintCandidate, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk } from "@/lib/ali/questionFactory/diversityGates";

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

test("every blueprint stays aligned to MR-01/QT-MR-12, the real production identity for mr01-reverse-mean", () => {
  for (const bp of MR01_REVERSE_MEAN_FAMILY.blueprints) {
    assert.equal(bp.competencyId, "MR-01");
    assert.equal(bp.questionTypeId, "QT-MR-12");
    assert.equal(bp.familyId, "mr01-reverse-mean");
  }
});

test("blueprint IDs are unique", () => {
  const ids = MR01_REVERSE_MEAN_FAMILY.blueprints.map((bp) => bp.blueprintId);
  assert.equal(new Set(ids).size, ids.length);
});

test("a real 120-candidate batch produces zero answer_mismatch across all 6 blueprints", () => {
  const { results } = runFamilyBatch(MR01_REVERSE_MEAN_FAMILY, [], 120, seededRandom(141));
  for (const r of results) {
    assert.ok(!r.reasons.includes("answer_mismatch"), `${r.candidate.blueprintId}: ${r.candidate.question} => claimed ${r.candidate.claimedAnswer}`);
  }
});

test("hand-verified correctness spot check matching the real production content exactly (mean 18 across 5, four known 15+20+12+22=69 => fifth=21)", () => {
  assert.equal(BP_REVERSE_MEAN_DIRECT.deriveCorrectAnswer({ mean: 18, known1: 15, known2: 20, known3: 12, known4: 22 }), "21");
});

test("BP_REVERSE_MEAN_NEW_VALUE_CHANGES_MEAN recovers the exact added value, independently verified (old mean 10 x4=40, new mean 14 x5=70, added=30)", () => {
  const answer = BP_REVERSE_MEAN_NEW_VALUE_CHANGES_MEAN.deriveCorrectAnswer({ oldMean: 10, oldCount: 4, newMean: 14 });
  assert.equal(answer, "30");
});

test("BP_REVERSE_MEAN_ERROR_IDENTIFICATION's wrong-working text is derived from the exact real, already-tagged production misconception (mean treated as total)", () => {
  const text = BP_REVERSE_MEAN_ERROR_IDENTIFICATION.renderQuestionText({ mean: 18, known1: 15, known2: 20, known3: 12, known4: 22 });
  assert.match(text, /treating the mean itself as the total/);
  assert.equal(BP_REVERSE_MEAN_ERROR_IDENTIFICATION.deriveCorrectAnswer({ mean: 18, known1: 15, known2: 20, known3: 12, known4: 22 }), "21");
  assert.equal(BP_REVERSE_MEAN_ERROR_IDENTIFICATION.misconceptionTargeted, "treating-the-mean-as-the-total-instead-of-multiplying-by-the-count-first");
});

test("BP_REVERSE_MEAN_COMBINED_GROUPS recovers Group B's mean from the combined mean, independently verified (A: 4x10=40, combined 9x20=180, B total=140, B mean=140/5=28)", () => {
  const answer = BP_REVERSE_MEAN_COMBINED_GROUPS.deriveCorrectAnswer({ countA: 4, meanA: 10, countB: 5, combinedMean: 20 });
  assert.equal(answer, "28");
});

test("blueprint depth is genuinely 6 and classifies LOW risk under the Scale Architecture's blueprint-aware metric", () => {
  const { results } = runFamilyBatch(MR01_REVERSE_MEAN_FAMILY, [], 90, seededRandom(252));
  const approved = results.filter((r) => r.approved).map((r) => r.candidate);
  const depth = classifyBlueprintDepth(approved);
  assert.equal(depth.blueprintDepth, 6);
  assert.equal(classifyScaledMemorisationRisk(depth), "LOW");
});

test("reasoning routes span reverse_reasoning, multi_step_application, comparison, and error_identification -- the real family had exactly ONE route before this increment", () => {
  const { results } = runFamilyBatch(MR01_REVERSE_MEAN_FAMILY, [], 90, seededRandom(363));
  const routes = new Set(results.filter((r) => r.approved).map((r) => r.candidate.reasoningRoute));
  assert.ok(routes.has("reverse_reasoning"));
  assert.ok(routes.has("multi_step_application"));
  assert.ok(routes.has("comparison"));
  assert.ok(routes.has("error_identification"));
});

test("difficulty spans medium as well as hard/challenge -- the real family was 100% hard before this increment", () => {
  const { results } = runFamilyBatch(MR01_REVERSE_MEAN_FAMILY, [], 90, seededRandom(475));
  const difficulties = new Set(results.filter((r) => r.approved).map((r) => r.candidate.difficulty));
  assert.ok(difficulties.has("medium"));
  assert.ok(difficulties.has("hard") || difficulties.has("challenge"));
});

test("every blueprint declares at least one TeachingUse, and the misconception-targeted blueprint declares explicit_teaching", () => {
  for (const bp of MR01_REVERSE_MEAN_FAMILY.blueprints) {
    assert.ok((bp.teachingUses?.length ?? 0) > 0, `${bp.blueprintId} must declare at least one TeachingUse`);
  }
  assert.ok(BP_REVERSE_MEAN_ERROR_IDENTIFICATION.teachingUses?.includes("explicit_teaching"));
});

test("exact-duplicate rejection against a real existing bank row", () => {
  const bp = MR01_REVERSE_MEAN_FAMILY.blueprints.find((b) => b.blueprintId === "mr01-bp-reverse-mean-direct")!;
  const candidate = generateBlueprintCandidate(bp, seededRandom(15));
  const existingBankRow = { id: "existing-1", familyId: "mr01-reverse-mean", prompt: { question: candidate.question } };
  const result = validateBlueprintCandidate(candidate, bp, [existingBankRow]);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("exact_duplicate_of_existing_bank_row"));
});
