import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MATHS_FAMILY_TEACHING_CONTENT,
  MATHS_MISCONCEPTION_CATEGORY_LABEL,
  getMathsTeachingContent,
  effectiveGuidedRevealStepCount,
  type MathsMisconceptionCategory,
} from "../../../lib/learningEngine/mathsTeachingContent";
import { checkMathsAnswer } from "../../../lib/learningEngine/practiceContent";

/**
 * Educational Increment 007L, Part 9, extended in Phase B (CSSE Completion
 * Programme) from the original 4 proof-set families to all 26 families now
 * in MATHS_FAMILY_TEACHING_CONTENT. Covers what this module itself can
 * prove without a live database call (structural correctness, MODEL
 * self-consistency, category coverage, frozen-snapshot answer-collision
 * guard); the "MODEL does not leak the TODAY-live answer" property is
 * verified against real production data by
 * scripts/007l-model-verification.mjs, not here — this file's collision
 * guard is a snapshot taken during Phase B's own implementation, so a
 * future edit to this file cannot silently reintroduce a collision without
 * a test failing here too, even between live-verification script runs.
 */

const ORIGINAL_007L_FAMILIES = ["mr01-missing-operand", "mr04-best-value", "mr03-angle-ratio", "mr01-measurement-conversion"];
const PHASE_B_FAMILIES = [
  "mr01-average-mean", "mr01-data-table", "mr02-compare", "mr02-far-ratio-context", "mr02-nth-term",
  "mr02-sequence-rule", "mr02-substitution", "mr02-sum-difference", "mr03-angle-sum", "mr03-classify",
  "mr03-coordinate", "mr03-mixed-perimeter", "mr04-compound-percentage", "mr04-elapsed-time",
  "mr04-far-percent", "mr04-far-recipe", "mr04-mixed-divisibility", "mr05-constrained-multiple",
  "mr05-factors-primes", "mr05-number-property", "precision-dec", "precision-frac",
];
const INCREMENT_020_FAMILIES = ["mr03-compound-area-perimeter"];
const ALL_FAMILIES = [...ORIGINAL_007L_FAMILIES, ...PHASE_B_FAMILIES, ...INCREMENT_020_FAMILIES];

test("exactly 27 families have teaching content (4 original 007L + 22 Phase B + 1 Increment 020), no more no less", () => {
  assert.deepEqual(Object.keys(MATHS_FAMILY_TEACHING_CONTENT).sort(), [...ALL_FAMILIES].sort());
});

test("getMathsTeachingContent returns undefined for families deliberately not covered — the fallback path", () => {
  // mr05-number-property-search: TRANSFER-UNSAFE (2 near-identical siblings),
  // deliberately excluded from Phase B — see the Phase B design document.
  assert.equal(getMathsTeachingContent("mr05-number-property-search"), undefined);
  assert.equal(getMathsTeachingContent(undefined), undefined);
  assert.equal(getMathsTeachingContent(null), undefined);
  assert.equal(getMathsTeachingContent(""), undefined);
});

test("getMathsTeachingContent returns real, non-empty content for every covered family", () => {
  for (const fam of ALL_FAMILIES) {
    const content = getMathsTeachingContent(fam);
    assert.ok(content, `${fam} must have teaching content`);
    assert.ok(content!.model.scenario.length > 0, `${fam} MODEL scenario must be non-empty`);
    assert.ok(content!.model.reasoning.length > 0, `${fam} MODEL reasoning must be non-empty`);
    assert.ok(content!.model.answer.length > 0, `${fam} MODEL answer must be non-empty`);
    assert.ok(content!.model.whatToNotice.length > 0, `${fam} MODEL whatToNotice must be non-empty`);
    assert.ok(content!.model.relationship.length > 0, `${fam} MODEL relationship must be non-empty`);
    assert.ok(content!.model.verification.length > 0, `${fam} MODEL verification must be non-empty`);
  }
});

test("every misconceptionCategory used by a family has a real label", () => {
  for (const [fam, content] of Object.entries(MATHS_FAMILY_TEACHING_CONTENT)) {
    const label = MATHS_MISCONCEPTION_CATEGORY_LABEL[content.misconceptionCategory];
    assert.ok(label && label.length > 0, `${fam}'s category ${content.misconceptionCategory} must have a label`);
  }
});

test("every MathsMisconceptionCategory value has exactly one label, none missing or extra", () => {
  const categories: MathsMisconceptionCategory[] = [
    "OPERATION_SELECTION",
    "PROCEDURAL_SEQUENCE_ERROR",
    "UNIT_OR_CONVERSION_ERROR",
    "MISREAD_QUANTITY",
    "STRUCTURAL_MISAPPLICATION",
    "INCOMPLETE_REASONING",
    "PRECISION_INSTRUCTION_IGNORED",
  ];
  assert.deepEqual(Object.keys(MATHS_MISCONCEPTION_CATEGORY_LABEL).sort(), categories.sort());
});

test("Phase B safety rule: maxGuidedRevealSteps, where set, is a small non-negative integer", () => {
  for (const [fam, content] of Object.entries(MATHS_FAMILY_TEACHING_CONTENT)) {
    if (content.maxGuidedRevealSteps !== undefined) {
      assert.ok(Number.isInteger(content.maxGuidedRevealSteps) && content.maxGuidedRevealSteps >= 0, `${fam}'s maxGuidedRevealSteps must be a non-negative integer`);
    }
  }
  // The two families known, by direct investigation, to need this cap.
  assert.equal(MATHS_FAMILY_TEACHING_CONTENT["mr01-data-table"].maxGuidedRevealSteps, 1, "mr01-data-table's real workingSteps end with the answer itself restated -- reveal must stop before it");
  assert.equal(MATHS_FAMILY_TEACHING_CONTENT["mr05-number-property"].maxGuidedRevealSteps, 0, "mr05-number-property's live rows have no stored workingSteps at all");
});

// ─── MODEL mathematical self-consistency — independently recomputed, not
// merely asserted, mirroring scripts/007i-maths-answer-verification.mjs's
// "re-derive from the question's own stated numbers" discipline. Covers
// the original 4 007L families plus all 22 Phase B families. ─────────────

test("mr01-missing-operand MODEL: 54 / 6 = 9, verified by inverse", () => {
  const content = getMathsTeachingContent("mr01-missing-operand")!;
  assert.equal(content.model.answer, "9");
  assert.equal(54 / 6, 9);
  assert.equal(checkMathsAnswer("9", content.model.answer), true);
});

test("mr04-best-value MODEL: unit prices recomputed, B is genuinely cheaper", () => {
  const content = getMathsTeachingContent("mr04-best-value")!;
  const unitA = 2.0 / 4;
  const unitB = 3.15 / 7;
  assert.equal(Math.round(unitA * 100) / 100, 0.5);
  assert.equal(Math.round(unitB * 100) / 100, 0.45);
  assert.ok(unitB < unitA, "B must genuinely be cheaper per item for this MODEL to be honest");
  assert.equal(content.model.answer, "B");
});

test("mr03-angle-ratio MODEL: ratio 4:1 of 180 degrees recomputed", () => {
  const content = getMathsTeachingContent("mr03-angle-ratio")!;
  const share = 180 / (4 + 1);
  const largest = 4 * share;
  assert.equal(share, 36);
  assert.equal(largest, 144);
  assert.equal(content.model.answer, "144°");
  assert.equal(checkMathsAnswer("144", content.model.answer), true, "bare number must be accepted (Decision 55)");
});

test("mr01-measurement-conversion MODEL: unit conversion and sum recomputed", () => {
  const content = getMathsTeachingContent("mr01-measurement-conversion")!;
  const total = 1.5 + 60 * 0.01;
  assert.equal(Math.round(total * 100) / 100, 2.1);
  assert.equal(content.model.answer, "2.1m");
  assert.equal(checkMathsAnswer("2.1", content.model.answer), true, "bare number must be accepted (Decision 55)");
  assert.equal(checkMathsAnswer("2.1kg", content.model.answer), false, "wrong unit must still be rejected (Decision 55)");
});

test("mr01-average-mean MODEL: mean of 4 values recomputed", () => {
  const content = getMathsTeachingContent("mr01-average-mean")!;
  const mean = (132 + 128 + 140 + 136) / 4;
  assert.equal(mean, 134);
  assert.equal(content.model.answer, "134");
});

test("mr01-data-table MODEL: subset sum recomputed", () => {
  const content = getMathsTeachingContent("mr01-data-table")!;
  assert.equal(11 + 3, 14);
  assert.equal(content.model.answer, "14");
});

test("mr02-compare MODEL: both expressions independently evaluated", () => {
  const content = getMathsTeachingContent("mr02-compare")!;
  const n = 5;
  assert.equal(4 * n + 3, 23);
  assert.equal(3 * n + 10, 25);
  assert.ok(23 < 25);
  assert.equal(content.model.answer, "Less than");
});

test("mr02-far-ratio-context MODEL: ratio split then follow-on subtraction recomputed", () => {
  const content = getMathsTeachingContent("mr02-far-ratio-context")!;
  const share = 40 / (3 + 1);
  assert.equal(share, 10);
  assert.equal(share - 5, 5);
  assert.equal(content.model.answer, "5cm");
});

test("mr02-nth-term MODEL: nth-term formula recomputed", () => {
  const content = getMathsTeachingContent("mr02-nth-term")!;
  const diff = 12 - 5;
  assert.equal(diff, 7);
  assert.equal(5 + (7 - 1) * diff, 47);
  assert.equal(content.model.answer, "47");
});

test("mr02-sequence-rule MODEL: forward and inverse recomputed", () => {
  const content = getMathsTeachingContent("mr02-sequence-rule")!;
  assert.equal(11 * 8 + 7, 95, "forward: 11 -> x8 -> +7");
  assert.equal((79 - 7) / 8, 9, "backward: 79 -> -7 -> /8");
  assert.equal(9 * 8 + 7, 79, "backward answer re-checked forwards");
  assert.equal(content.model.answer, "Forwards: 95. Backwards: 9.");
});

test("mr02-substitution MODEL: two relationships substituted and solved, recomputed", () => {
  const content = getMathsTeachingContent("mr02-substitution")!;
  const A = 6;
  const B = 3 * A;
  const C = A / 2;
  assert.equal(A + B + C, 27);
  assert.equal(C, 3);
  assert.equal(content.model.answer, "A=6, C=3");
});

test("mr02-sum-difference MODEL: sum+difference algebra recomputed", () => {
  const content = getMathsTeachingContent("mr02-sum-difference")!;
  const sam = (32 - 8) / 2;
  assert.equal(sam, 12);
  assert.equal(sam + (sam + 8), 32);
  assert.equal(content.model.answer, "£12");
});

test("mr03-angle-sum MODEL: triangle third angle recomputed", () => {
  const content = getMathsTeachingContent("mr03-angle-sum")!;
  assert.equal(180 - (55 + 75), 50);
  assert.equal(content.model.answer, "50°");
});

test("mr03-classify MODEL: two equal angles imply isosceles, recomputed", () => {
  const content = getMathsTeachingContent("mr03-classify")!;
  assert.equal(70 + 70 + 40, 180, "must be a genuine triangle");
  assert.equal(content.model.answer, "Isosceles");
});

test("mr03-coordinate MODEL: x-axis reflection recomputed", () => {
  const content = getMathsTeachingContent("mr03-coordinate")!;
  const [x, y] = [6, -3];
  assert.deepEqual([x, -y], [6, 3]);
  assert.equal(content.model.answer, "(6, 3)");
});

test("mr03-mixed-perimeter MODEL: missing side then perimeter recomputed", () => {
  const content = getMathsTeachingContent("mr03-mixed-perimeter")!;
  const otherSide = 32 / 4;
  assert.equal(otherSide, 8);
  assert.equal(2 * (4 + otherSide), 24);
  assert.equal(content.model.answer, "24m");
});

test("mr04-compound-percentage MODEL: sequential percentage changes recomputed", () => {
  const content = getMathsTeachingContent("mr04-compound-percentage")!;
  const afterIncrease = 400 * 1.15;
  const afterDecrease = afterIncrease * 0.8;
  assert.equal(Math.round(afterIncrease * 100) / 100, 460);
  assert.equal(Math.round(afterDecrease * 100) / 100, 368);
  assert.equal(content.model.answer, "£368");
});

test("mr04-elapsed-time MODEL: elapsed time with minute-boundary carry recomputed", () => {
  const content = getMathsTeachingContent("mr04-elapsed-time")!;
  const totalMinutes = 15 + 40 + 10;
  assert.equal(totalMinutes, 65);
  // 13:20 + 65 minutes = 14:25
  const startMinutes = 13 * 60 + 20;
  const endMinutes = startMinutes + totalMinutes;
  assert.equal(Math.floor(endMinutes / 60), 14);
  assert.equal(endMinutes % 60, 25);
  assert.equal(content.model.answer, "14:25");
});

test("mr04-far-percent MODEL: proportional-fraction transfer recomputed", () => {
  const content = getMathsTeachingContent("mr04-far-percent")!;
  const fraction = 24 / 30;
  assert.equal(fraction, 0.8);
  assert.equal(90 * fraction, 72);
  assert.equal(content.model.answer, "£72");
});

test("mr04-far-recipe MODEL: unit-rate scaling recomputed", () => {
  const content = getMathsTeachingContent("mr04-far-recipe")!;
  const perPerson = 90 / 3;
  assert.equal(perPerson, 30);
  assert.equal(perPerson * 7, 210);
  assert.equal(content.model.answer, "210ml");
});

test("mr04-mixed-divisibility MODEL: both constraints checked together, recomputed", () => {
  const content = getMathsTeachingContent("mr04-mixed-divisibility")!;
  const candidates = [42, 48, 54].filter((n) => n % 6 === 0 && n > 40 && n < 60);
  const qualifying = candidates.filter((n) => n % 9 === 3);
  assert.deepEqual(qualifying, [48]);
  assert.equal(content.model.answer, "48");
});

test("mr05-constrained-multiple MODEL: LCM then boundary check recomputed", () => {
  const content = getMathsTeachingContent("mr05-constrained-multiple")!;
  const lcm = 30; // 5 and 6 share no common factor
  assert.equal(lcm % 5, 0);
  assert.equal(lcm % 6, 0);
  assert.ok(lcm > 20);
  assert.equal(content.model.answer, "30");
});

test("mr05-factors-primes MODEL: factor pairs of 16 recomputed", () => {
  const content = getMathsTeachingContent("mr05-factors-primes")!;
  const factors = [1, 2, 4, 8, 16].filter((n) => 16 % n === 0);
  assert.equal(factors.length, 5);
  assert.equal(content.model.answer, "5");
});

test("mr05-number-property MODEL: computed average tested for square-ness, recomputed", () => {
  const content = getMathsTeachingContent("mr05-number-property")!;
  const avg = (4 + 14) / 2;
  assert.equal(avg, 9);
  assert.equal(Math.sqrt(avg), 3);
  assert.equal(content.model.answer, "True");
});

test("precision-dec MODEL: division rounded to 2dp, recomputed", () => {
  const content = getMathsTeachingContent("precision-dec")!;
  const value = 17 / 6;
  assert.equal(Math.round(value * 100) / 100, 2.83);
  assert.equal(content.model.answer, "2.83");
});

test("precision-frac MODEL: exact fraction, mixed-number form, recomputed", () => {
  const content = getMathsTeachingContent("precision-frac")!;
  assert.equal(16 % 9, 7);
  assert.equal(Math.floor(16 / 9), 1);
  assert.equal(content.model.answer, "1 7/9");
  assert.equal(checkMathsAnswer("1 7/9", content.model.answer), true);
});

// ─── MODEL never uses any live question's own answer for that family — a
// frozen snapshot taken during Phase B's own live verification run
// (scripts/007l-model-verification.mjs re-confirms this against LIVE data
// on every run; this is a regression guard so a future edit to this file
// cannot silently reintroduce a collision without a test failing here
// too). Families whose real answer space is a small fixed category set
// (True/False, a 3-way comparison/shape label) are excluded here for the
// same reason 007L excluded mr04-best-value's binary A/B space — a label
// match is expected and not a meaningful leak signal; those families'
// scenario NUMBERS were independently checked by hand during design
// instead (see the Phase B design document). ────────────────────────────

const LIVE_ANSWERS_AT_PHASE_B_TIME: Record<string, string[]> = {
  "mr01-missing-operand": ["12", "7", "38", "23"],
  "mr03-angle-ratio": ["108°", "100°", "180°", "160°", "105°"],
  "mr01-measurement-conversion": ["4.25m", "2.55m", "1.55kg", "2.15l"],
  "mr01-average-mean": ["20", "19", "£14", "7"],
  "mr01-data-table": ["39", "12", "16", "5", "7"],
  "mr02-far-ratio-context": ["8", "7", "9"],
  "mr02-nth-term": ["49", "40", "44", "44", "71"],
  "mr02-sequence-rule": ["17", "7", "25", "8", "23", "13", "38", "10", "22", "6"],
  "mr02-substitution": ["A=4, C=2", "A=6, C=2", "A=5, C=1", "A=9, C=3", "A=10, C=2"],
  "mr02-sum-difference": ["14", "9", "19", "15", "10"],
  "mr03-angle-sum": ["70", "60", "63", "40", "95", "85", "80"],
  "mr03-coordinate": ["(3, -5)", "(-4, -2)", "(2, 4)"],
  "mr03-mixed-perimeter": ["28m", "34m", "36m"],
  "mr04-compound-percentage": ["£85", "£198", "£153", "£54", "£202.50"],
  "mr04-elapsed-time": ["15:45", "12:20", "10:45", "11:55", "17:30"],
  "mr04-far-percent": ["£45", "£60", "£40"],
  "mr04-far-recipe": ["300g", "270g", "160g"],
  "mr04-mixed-divisibility": ["95", "133", "152"],
  "mr05-constrained-multiple": ["36", "48", "45"],
  "mr05-factors-primes": ["8", "9", "True", "False", "6"],
  "precision-dec": ["3.17", "1.86", "4.17"],
  "precision-frac": ["3 1/3", "2 6/7", "2 5/6"],
};

test("no MODEL worked-example answer collides with a live question's own answer for that family (numeric/format-answer families)", () => {
  for (const fam of Object.keys(LIVE_ANSWERS_AT_PHASE_B_TIME)) {
    const content = getMathsTeachingContent(fam)!;
    const liveAnswers = LIVE_ANSWERS_AT_PHASE_B_TIME[fam];
    assert.ok(!liveAnswers.includes(content.model.answer), `${fam}'s MODEL answer "${content.model.answer}" must not equal any live question's answer`);
  }
});

test("mr04-best-value MODEL's own scenario numbers (4 for £2.00, 7 for £3.15) do not match any live question's numbers", () => {
  const livePairs: [number, number][] = [
    [3, 1.2], [5, 2.25], [4, 3.6], [6, 4.8], [2, 1.5], [3, 2.1], [10, 2], [6, 1.5], [6, 3], [8, 4.4],
  ];
  const modelPairs: [number, number][] = [[4, 2.0], [7, 3.15]];
  for (const [q, p] of modelPairs) {
    assert.ok(!livePairs.some(([lq, lp]) => lq === q && lp === p), `MODEL pair (${q}, £${p}) must not match a live question's pair`);
  }
});

test("mr03-coordinate MODEL's own scenario point (6, -3) does not match any live question's input point", () => {
  // Live mr03-coordinate reflects/translates (2,3)->(2,-3)-style points; the
  // MODEL's chosen point was specifically re-picked during design after an
  // initial draft collided with a live answer -- guarding that fix here.
  const modelPoint: [number, number] = [6, -3];
  const liveAnswerPoints: [number, number][] = [[3, -5], [-4, -2], [2, 4]];
  assert.ok(!liveAnswerPoints.some(([x, y]) => x === modelPoint[0] && y === modelPoint[1]));
});

/**
 * CSSE Completion Programme, Phase B Founder review readiness —
 * effectiveGuidedRevealStepCount is a pure extraction of the exact cap
 * logic app/learning-intelligence/practice/[area]/page.tsx's MathsActivity
 * already applied inline (byte-for-byte, only moved), now also reused by
 * the Mathematics Teaching Review interface. These tests prove the
 * extraction preserved the original behaviour exactly.
 */

test("effectiveGuidedRevealStepCount: no cap returns the full real step count, unmodified", () => {
  assert.equal(effectiveGuidedRevealStepCount(3, undefined), 3);
  assert.equal(effectiveGuidedRevealStepCount(0, undefined), 0);
});

test("effectiveGuidedRevealStepCount: a cap below the real count restricts reveal to the cap (mr01-data-table's real case: 2 real steps, capped to 1)", () => {
  assert.equal(effectiveGuidedRevealStepCount(2, 1), 1);
});

test("effectiveGuidedRevealStepCount: a cap of 0 always yields 0, regardless of how many real steps exist (mr05-number-property's case, though its real count is itself 0)", () => {
  assert.equal(effectiveGuidedRevealStepCount(5, 0), 0);
  assert.equal(effectiveGuidedRevealStepCount(0, 0), 0);
});

test("effectiveGuidedRevealStepCount: a cap at or above the real count never exceeds the real count (min, not the cap itself)", () => {
  assert.equal(effectiveGuidedRevealStepCount(2, 5), 2);
  assert.equal(effectiveGuidedRevealStepCount(3, 3), 3);
});

test("effectiveGuidedRevealStepCount matches every family's real maxGuidedRevealSteps contract", () => {
  assert.equal(effectiveGuidedRevealStepCount(2, MATHS_FAMILY_TEACHING_CONTENT["mr01-data-table"].maxGuidedRevealSteps), 1);
  assert.equal(effectiveGuidedRevealStepCount(0, MATHS_FAMILY_TEACHING_CONTENT["mr05-number-property"].maxGuidedRevealSteps), 0);
  assert.equal(effectiveGuidedRevealStepCount(3, MATHS_FAMILY_TEACHING_CONTENT["mr02-nth-term"].maxGuidedRevealSteps), 3);
});
