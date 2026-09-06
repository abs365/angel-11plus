import { test } from "node:test";
import assert from "node:assert/strict";
import { TRIANGLE_ANGLE_SUM_SPEC } from "@/lib/ali/questionFactory/familySpecs";

/**
 * Question Factory Wave 2, Human Educational Calibration Gate -- the
 * original mr03-angle-sum difficultyControls() tied difficulty to
 * `(180 - angleA - angleB) % 5 === 0` -- an arithmetic coincidence of the
 * ANSWER, invisible to a learner before solving and unrelated to how
 * hard the calculation is. Confirmed directly against the 10 real
 * production candidates: 29°/106° -> 45° was labelled "easy" and
 * 43°/53° -> 84° was labelled "medium", despite both being an identical
 * single-step sum-then-subtract. Corrected to depend on the size of the
 * addition (angleA + angleB), a genuine property of the computation
 * itself.
 */

test("the old defect does not reappear: difficulty is never derived from whether the ANSWER is a multiple of 5", () => {
  // Two pairs whose ANSWERS are both multiples of 5, but whose angle sums
  // differ enough that the corrected rule should NOT necessarily agree
  // with the old rule's (180-a-b)%5===0 classification.
  const smallSumMultipleOf5Answer = { angleA: 10, angleB: 20 }; // sum=30 (easy), unknown=150 (multiple of 5)
  const largeSumMultipleOf5Answer = { angleA: 80, angleB: 65 }; // sum=145 (hard), unknown=35 (multiple of 5)
  const d1 = TRIANGLE_ANGLE_SUM_SPEC.difficultyControls(smallSumMultipleOf5Answer);
  const d2 = TRIANGLE_ANGLE_SUM_SPEC.difficultyControls(largeSumMultipleOf5Answer);
  assert.notEqual(d1, d2, "two pairs whose only shared property is a multiple-of-5 answer must not be forced to the same difficulty by that coincidence");
});

test("difficulty now depends on the size of the addition (angleA + angleB), a genuine property of the required computation", () => {
  assert.equal(TRIANGLE_ANGLE_SUM_SPEC.difficultyControls({ angleA: 30, angleB: 40 }), "easy"); // sum=70
  assert.equal(TRIANGLE_ANGLE_SUM_SPEC.difficultyControls({ angleA: 50, angleB: 60 }), "medium"); // sum=110
  assert.equal(TRIANGLE_ANGLE_SUM_SPEC.difficultyControls({ angleA: 80, angleB: 70 }), "hard"); // sum=150
});

test("the corrected rule reaches 'hard' for at least some inputs -- the old rule could NEVER produce 'hard' for this family at all, regardless of input, a second distinct defect beyond the answer-coincidence issue", () => {
  const reachesHard = [
    { angleA: 80, angleB: 70 },
    { angleA: 90, angleB: 80 },
    { angleA: 100, angleB: 60 },
  ].some((p) => TRIANGLE_ANGLE_SUM_SPEC.difficultyControls(p) === "hard");
  assert.ok(reachesHard, "the corrected rule must genuinely be able to reach 'hard', unlike the old rule");
});

test("re-classifying the 10 real production angle pairs with the corrected rule produces a materially different, more genuinely-spread distribution than the original defective labels", () => {
  const realProductionPairs = [
    { angleA: 43, angleB: 53 }, { angleA: 54, angleB: 42 }, { angleA: 114, angleB: 60 }, { angleA: 13, angleB: 105 }, { angleA: 20, angleB: 47 },
    { angleA: 31, angleB: 21 }, { angleA: 52, angleB: 85 }, { angleA: 29, angleB: 106 }, { angleA: 19, angleB: 11 }, { angleA: 42, angleB: 127 },
  ];
  const distribution: Record<string, number> = {};
  for (const p of realProductionPairs) {
    const d = TRIANGLE_ANGLE_SUM_SPEC.difficultyControls(p);
    distribution[d] = (distribution[d] ?? 0) + 1;
  }
  // The original (defective) labelling for these exact 10 pairs was
  // {easy: 2, medium: 8, hard: 0} -- confirmed against real production
  // data. The corrected rule must produce a genuinely different split.
  assert.notDeepEqual(distribution, { easy: 2, medium: 8 });
  assert.ok((distribution.hard ?? 0) > 0, "the corrected rule reaches 'hard' for this real dataset, unlike the original");
});
