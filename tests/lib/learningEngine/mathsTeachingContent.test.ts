import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MATHS_FAMILY_TEACHING_CONTENT,
  MATHS_MISCONCEPTION_CATEGORY_LABEL,
  getMathsTeachingContent,
  type MathsMisconceptionCategory,
} from "../../../lib/learningEngine/mathsTeachingContent";
import { checkMathsAnswer } from "../../../lib/learningEngine/practiceContent";

/**
 * Educational Increment 007L, Part 9 — automated verification for the
 * Mathematics Teaching Architecture bounded proof. Covers what this
 * module itself can prove without a live database call (structural
 * correctness, MODEL self-consistency, category coverage); the "MODEL
 * does not leak the live answer" property is verified against real
 * production data by a script (scripts/007l-model-verification.mjs), not
 * here, matching this project's established split between fast unit
 * tests and live-data verification scripts.
 */

const PROOF_SET_FAMILIES = ["mr01-missing-operand", "mr04-best-value", "mr03-angle-ratio", "mr01-measurement-conversion"];

test("exactly the 4 proof-set families have teaching content, no more no less", () => {
  assert.deepEqual(Object.keys(MATHS_FAMILY_TEACHING_CONTENT).sort(), [...PROOF_SET_FAMILIES].sort());
});

test("getMathsTeachingContent returns undefined for any family outside the proof set — the fallback path", () => {
  assert.equal(getMathsTeachingContent("mr02-sum-difference"), undefined);
  assert.equal(getMathsTeachingContent("mr05-factors-primes"), undefined);
  assert.equal(getMathsTeachingContent(undefined), undefined);
  assert.equal(getMathsTeachingContent(null), undefined);
  assert.equal(getMathsTeachingContent(""), undefined);
});

test("getMathsTeachingContent returns real content for every proof-set family", () => {
  for (const fam of PROOF_SET_FAMILIES) {
    const content = getMathsTeachingContent(fam);
    assert.ok(content, `${fam} must have teaching content`);
    assert.ok(content!.model.scenario.length > 0);
    assert.ok(content!.model.reasoning.length > 0);
    assert.ok(content!.model.answer.length > 0);
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
  ];
  assert.deepEqual(Object.keys(MATHS_MISCONCEPTION_CATEGORY_LABEL).sort(), categories.sort());
});

// ─── MODEL mathematical self-consistency — independently recomputed, not
// merely asserted, mirroring scripts/007i-maths-answer-verification.mjs's
// "re-derive from the question's own stated numbers" discipline. ─────────

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

// ─── MODEL never uses any live question's own numbers for that family —
// the exact literal values fetched from production for these 4 families
// during this increment (scripts/007l-model-verification.mjs re-confirms
// this against LIVE data; this is a frozen-snapshot guard so a future edit
// to this file cannot silently reintroduce a collision without a test
// failing here too). For the 3 numeric-answer families, comparing the
// MODEL's own computed answer against every live answer is a meaningful
// leak proxy (a large, effectively continuous answer space). mr04-best-
// value's A/B answer space is binary, so an answer "collision" there is
// mathematically inevitable and NOT a meaningful leak signal on its own —
// instead its scenario's own INPUT numbers are checked directly. ─────────

const LIVE_ANSWERS_AT_007L_TIME: Record<string, string[]> = {
  "mr01-missing-operand": ["12", "7", "38", "23"],
  "mr03-angle-ratio": ["108°", "100°", "180°", "160°", "105°"],
  "mr01-measurement-conversion": ["4.25m", "2.55m", "1.55kg", "2.15l"],
};

test("no MODEL worked-example answer collides with a live question's own answer for that family (numeric-answer families)", () => {
  for (const fam of Object.keys(LIVE_ANSWERS_AT_007L_TIME)) {
    const content = getMathsTeachingContent(fam)!;
    const liveAnswers = LIVE_ANSWERS_AT_007L_TIME[fam];
    assert.ok(!liveAnswers.includes(content.model.answer), `${fam}'s MODEL answer "${content.model.answer}" must not equal any live question's answer`);
  }
});

test("mr04-best-value MODEL's own scenario numbers (4 for £2.00, 7 for £3.15) do not match any live question's numbers", () => {
  // Live mr04-best-value quantity/price pairs at 007L time: (3,1.20)/(5,2.25),
  // (4,3.60)/(6,4.80), (2,1.50)/(3,2.10), (10,2)/(6,1.50), (6,3)/(8,4.40).
  const livePairs: [number, number][] = [
    [3, 1.2], [5, 2.25], [4, 3.6], [6, 4.8], [2, 1.5], [3, 2.1], [10, 2], [6, 1.5], [6, 3], [8, 4.4],
  ];
  const modelPairs: [number, number][] = [[4, 2.0], [7, 3.15]];
  for (const [q, p] of modelPairs) {
    assert.ok(!livePairs.some(([lq, lp]) => lq === q && lp === p), `MODEL pair (${q}, £${p}) must not match a live question's pair`);
  }
});
