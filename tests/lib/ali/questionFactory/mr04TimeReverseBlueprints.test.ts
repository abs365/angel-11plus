import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MR04_TIME_REVERSE_FAMILY,
  BP_TIME_REVERSE_MULTISTAGE_DIRECT,
  BP_TIME_REVERSE_ERROR_IDENTIFICATION,
  BP_TIME_REVERSE_FIND_MISSING_STAGE,
  BP_TIME_REVERSE_CROSS_MIDNIGHT,
} from "@/lib/ali/questionFactory/mr04TimeReverseBlueprints";
import { runFamilyBatch, generateBlueprintCandidate, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk } from "@/lib/ali/questionFactory/diversityGates";

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

test("every blueprint stays aligned to MR-04/QT-MR-10, the real production identity for mr04-time-reverse", () => {
  for (const bp of MR04_TIME_REVERSE_FAMILY.blueprints) {
    assert.equal(bp.competencyId, "MR-04");
    assert.equal(bp.questionTypeId, "QT-MR-10");
    assert.equal(bp.familyId, "mr04-time-reverse");
  }
});

test("blueprint IDs are unique", () => {
  const ids = MR04_TIME_REVERSE_FAMILY.blueprints.map((bp) => bp.blueprintId);
  assert.equal(new Set(ids).size, ids.length);
});

test("a real 120-candidate batch produces zero answer_mismatch across all 6 blueprints", () => {
  const { results } = runFamilyBatch(MR04_TIME_REVERSE_FAMILY, [], 120, seededRandom(141));
  for (const r of results) {
    assert.ok(!r.reasons.includes("answer_mismatch"), `${r.candidate.blueprintId}: ${r.candidate.question} => claimed ${r.candidate.claimedAnswer}`);
  }
});

test("hand-verified correctness spot check matching the real production content exactly (finishes 13:15, 40+15+35=90min => starts 11:45)", () => {
  assert.equal(BP_TIME_REVERSE_MULTISTAGE_DIRECT.deriveCorrectAnswer({ finishMin: 13 * 60 + 15, stage1: 40, stage2: 15, stage3: 35 }), "11:45");
});

test("BP_TIME_REVERSE_FIND_MISSING_STAGE recovers the exact missing duration, independently verified", () => {
  // 09:00 start, 09:00-11:00 finish = 120 min total, stage1=30, stage2=20 known -> missing=70
  const answer = BP_TIME_REVERSE_FIND_MISSING_STAGE.deriveCorrectAnswer({ startMin: 9 * 60, finishMin: 11 * 60, stage1: 30, stage2: 20 });
  assert.equal(answer, "70");
});

test("BP_TIME_REVERSE_ERROR_IDENTIFICATION's wrong-working text is derived from the exact real, already-tagged production misconception (adding instead of subtracting)", () => {
  const text = BP_TIME_REVERSE_ERROR_IDENTIFICATION.renderQuestionText({ finishMin: 13 * 60 + 15, stage1: 40, stage2: 15 });
  assert.match(text, /ADDING the total duration/);
  assert.equal(BP_TIME_REVERSE_ERROR_IDENTIFICATION.deriveCorrectAnswer({ finishMin: 13 * 60 + 15, stage1: 40, stage2: 15 }), "12:20");
  assert.equal(BP_TIME_REVERSE_ERROR_IDENTIFICATION.misconceptionTargeted, "subtracting-the-total-elapsed-time-incorrectly-or-adding-instead-of-subtracting");
});

test("BP_TIME_REVERSE_CROSS_MIDNIGHT genuinely wraps across midnight into the previous day, independently verified", () => {
  // finish 01:20 (80 min), duration 200 min -> start = (80-200+1440)%1440 = 1320 = 22:00
  const answer = BP_TIME_REVERSE_CROSS_MIDNIGHT.deriveCorrectAnswer({ finishMin: 80, durationMin: 200 });
  assert.equal(answer, "22:00");
});

test("blueprint depth is genuinely 6 and classifies LOW risk under the Scale Architecture's blueprint-aware metric", () => {
  const { results } = runFamilyBatch(MR04_TIME_REVERSE_FAMILY, [], 90, seededRandom(252));
  const approved = results.filter((r) => r.approved).map((r) => r.candidate);
  const depth = classifyBlueprintDepth(approved);
  assert.equal(depth.blueprintDepth, 6);
  assert.equal(classifyScaledMemorisationRisk(depth), "LOW");
});

test("reasoning routes span reverse_reasoning, comparison, and error_identification -- the real family had exactly ONE route before this increment", () => {
  const { results } = runFamilyBatch(MR04_TIME_REVERSE_FAMILY, [], 90, seededRandom(363));
  const routes = new Set(results.filter((r) => r.approved).map((r) => r.candidate.reasoningRoute));
  assert.ok(routes.has("reverse_reasoning"));
  assert.ok(routes.has("comparison"));
  assert.ok(routes.has("error_identification"));
});

test("difficulty spans easy/medium as well as hard/challenge -- the real family was 100% hard before this increment", () => {
  const { results } = runFamilyBatch(MR04_TIME_REVERSE_FAMILY, [], 90, seededRandom(475));
  const difficulties = new Set(results.filter((r) => r.approved).map((r) => r.candidate.difficulty));
  assert.ok(difficulties.has("easy") || difficulties.has("medium"));
  assert.ok(difficulties.has("hard") || difficulties.has("challenge"));
});

test("Wave 1 manufacturing human-review finding, now locked in as a regression guard: BP_TIME_REVERSE_CROSS_MIDNIGHT never renders the grammatically wrong '1 minutes' (found in the real manufactured manifest, e.g. 'It lasted 4 hours 1 minutes') -- singular/plural must agree for both hours and minutes", () => {
  const { results } = runFamilyBatch(MR04_TIME_REVERSE_FAMILY, [], 90, seededRandom(363));
  const crossMidnight = results.filter((r) => r.approved && r.candidate.blueprintId === "mr04-bp-time-reverse-cross-midnight");
  assert.ok(crossMidnight.length > 0, "batch must include at least one approved cross-midnight candidate");
  for (const r of crossMidnight) {
    assert.doesNotMatch(r.candidate.question, /\b1 minutes\b/, `"${r.candidate.question}" contains the grammatically wrong "1 minutes"`);
    assert.doesNotMatch(r.candidate.question, /\b1 hours\b/, `"${r.candidate.question}" contains the grammatically wrong "1 hours"`);
  }
});

test("every rendered time is a valid zero-padded 24hr HH:MM string", () => {
  const { results } = runFamilyBatch(MR04_TIME_REVERSE_FAMILY, [], 60, seededRandom(586));
  for (const r of results) {
    if (!/^\d{2}:\d{2}$/.test(r.candidate.claimedAnswer)) continue; // skip non-time answers (missing-stage/comparison blueprints)
    assert.match(r.candidate.claimedAnswer, /^([01]\d|2[0-3]):[0-5]\d$/, `"${r.candidate.claimedAnswer}" must be a valid 24hr time`);
  }
});

test("every blueprint declares at least one TeachingUse, and the misconception-targeted blueprint declares explicit_teaching", () => {
  for (const bp of MR04_TIME_REVERSE_FAMILY.blueprints) {
    assert.ok((bp.teachingUses?.length ?? 0) > 0, `${bp.blueprintId} must declare at least one TeachingUse`);
  }
  assert.ok(BP_TIME_REVERSE_ERROR_IDENTIFICATION.teachingUses?.includes("explicit_teaching"));
});

test("exact-duplicate rejection against a real existing bank row", () => {
  const bp = MR04_TIME_REVERSE_FAMILY.blueprints.find((b) => b.blueprintId === "mr04-bp-time-reverse-multistage-direct")!;
  const candidate = generateBlueprintCandidate(bp, seededRandom(15));
  const existingBankRow = { id: "existing-1", familyId: "mr04-time-reverse", prompt: { question: candidate.question } };
  const result = validateBlueprintCandidate(candidate, bp, [existingBankRow]);
  assert.equal(result.approved, false);
  assert.ok(result.reasons.includes("exact_duplicate_of_existing_bank_row"));
});
