import { test } from "node:test";
import assert from "node:assert/strict";
import { checkMathsAnswer, parseNumberWithUnit } from "../../../lib/learningEngine/practiceContent";

/**
 * Educational Increment 007K — regression coverage for the unit-answer
 * validation defect: checkMathsAnswer() stripped £/$/,/° from a stored
 * answer before comparing numerically, but not letter-based measurement
 * units (m, kg, l, g...), so a mathematically correct bare-number answer
 * to a question whose canonical answer carries a unit suffix (e.g.
 * "4.25m") was marked wrong. Confirmed live-affected before this fix:
 * mr01-measurement-conversion (4 questions, was already practice_eligible
 * in production) plus mr03-mixed-perimeter and mr04-far-recipe (6
 * questions, provisional). All 10 are tested individually below.
 *
 * Educational rule implemented: the target unit is always already stated
 * in the question for every family currently authored this way ("what is
 * the total length in m?"), so unit choice is not itself the assessed
 * skill. A bare number is therefore accepted as fully correct, matching
 * a number with the correct unit attached -- but a number with the WRONG
 * unit attached (right value, mismatched unit) is deliberately rejected:
 * that is a genuine comprehension error (not reading which unit was
 * asked for), not incidental formatting.
 */

// ─── The 10 confirmed-affected questions, one block each ──────────────────

test("mr01-conv-01 (LIVE, practice_eligible): 4.25m", () => {
  const correct = "4.25m";
  assert.equal(checkMathsAnswer("4.25", correct), true, "bare number must now be accepted");
  assert.equal(checkMathsAnswer("4.25m", correct), true, "number + unit must be accepted");
  assert.equal(checkMathsAnswer("4.25 m", correct), true, "number + space + unit must be accepted");
  assert.equal(checkMathsAnswer("4.30", correct), false, "wrong number must remain rejected");
  assert.equal(checkMathsAnswer("4.25kg", correct), false, "correct number + wrong unit must be rejected");
  assert.equal(checkMathsAnswer("abc", correct), false, "malformed value must be rejected");
});

test("mr01-conv-02 (LIVE, practice_eligible): 2.55m", () => {
  const correct = "2.55m";
  assert.equal(checkMathsAnswer("2.55", correct), true);
  assert.equal(checkMathsAnswer("2.55m", correct), true);
  assert.equal(checkMathsAnswer("2.55 m", correct), true);
  assert.equal(checkMathsAnswer("2.5", correct), false);
  assert.equal(checkMathsAnswer("2.55cm", correct), false);
});

test("mr01-conv-03 (LIVE, practice_eligible): 1.55kg", () => {
  const correct = "1.55kg";
  assert.equal(checkMathsAnswer("1.55", correct), true);
  assert.equal(checkMathsAnswer("1.55kg", correct), true);
  assert.equal(checkMathsAnswer("1.55 kg", correct), true);
  assert.equal(checkMathsAnswer("1.5", correct), false);
  assert.equal(checkMathsAnswer("1.55g", correct), false, "1.55g is a materially different mass, not just a wrong unit label");
});

test("mr01-conv-04 (LIVE, practice_eligible): 2.15l", () => {
  const correct = "2.15l";
  assert.equal(checkMathsAnswer("2.15", correct), true);
  assert.equal(checkMathsAnswer("2.15l", correct), true);
  assert.equal(checkMathsAnswer("2.15 l", correct), true);
  assert.equal(checkMathsAnswer("2.1", correct), false);
  assert.equal(checkMathsAnswer("2.15ml", correct), false);
});

test("mr03-mix-01 (provisional): 28m", () => {
  const correct = "28m";
  assert.equal(checkMathsAnswer("28", correct), true);
  assert.equal(checkMathsAnswer("28m", correct), true);
  assert.equal(checkMathsAnswer("28 m", correct), true);
  assert.equal(checkMathsAnswer("48", correct), false, "the area value itself must not be accepted as the perimeter");
  assert.equal(checkMathsAnswer("28cm", correct), false);
});

test("mr03-mix-02 (provisional): 34m", () => {
  const correct = "34m";
  assert.equal(checkMathsAnswer("34", correct), true);
  assert.equal(checkMathsAnswer("34m", correct), true);
  assert.equal(checkMathsAnswer("30", correct), false);
});

test("mr03-mix-03 (provisional): 36m", () => {
  const correct = "36m";
  assert.equal(checkMathsAnswer("36", correct), true);
  assert.equal(checkMathsAnswer("36m", correct), true);
  assert.equal(checkMathsAnswer("45", correct), false, "the side length given in the question must not be accepted as the perimeter");
});

test("mr04-far-04 (provisional): 300g", () => {
  const correct = "300g";
  assert.equal(checkMathsAnswer("300", correct), true);
  assert.equal(checkMathsAnswer("300g", correct), true);
  assert.equal(checkMathsAnswer("300 g", correct), true);
  assert.equal(checkMathsAnswer("250", correct), false, "genuinely wrong scaled amount");
  assert.equal(checkMathsAnswer("300kg", correct), false);
});

test("mr04-far-05 (provisional): 270g", () => {
  const correct = "270g";
  assert.equal(checkMathsAnswer("270", correct), true);
  assert.equal(checkMathsAnswer("270g", correct), true);
  assert.equal(checkMathsAnswer("180", correct), false, "the base recipe amount must not be accepted as the scaled answer");
});

test("mr04-far-06 (provisional): 160g", () => {
  const correct = "160g";
  assert.equal(checkMathsAnswer("160", correct), true);
  assert.equal(checkMathsAnswer("160g", correct), true);
  assert.equal(checkMathsAnswer("100", correct), false, "the base recipe amount must not be accepted as the scaled answer");
});

// ─── parseNumberWithUnit, directly ─────────────────────────────────────────

test("parseNumberWithUnit: bare number has unit=null", () => {
  assert.deepEqual(parseNumberWithUnit("4.25"), { value: 4.25, unit: null });
});

test("parseNumberWithUnit: longest matching unit wins (kg not g, mm not m)", () => {
  assert.deepEqual(parseNumberWithUnit("1.55kg"), { value: 1.55, unit: "kg" });
  assert.deepEqual(parseNumberWithUnit("12mm"), { value: 12, unit: "mm" });
  assert.deepEqual(parseNumberWithUnit("12cm"), { value: 12, unit: "cm" });
  assert.deepEqual(parseNumberWithUnit("12km"), { value: 12, unit: "km" });
});

test("parseNumberWithUnit: categorical text returns null, never misparsed as a unit", () => {
  assert.equal(parseNumberWithUnit("Equilateral"), null);
  assert.equal(parseNumberWithUnit("A"), null);
  assert.equal(parseNumberWithUnit("True"), null);
});

test("parseNumberWithUnit: malformed input returns null", () => {
  assert.equal(parseNumberWithUnit("abc"), null);
  assert.equal(parseNumberWithUnit(""), null);
  assert.equal(parseNumberWithUnit("m"), null, "a unit with no number attached is not a valid measurement");
});

// ─── Bank-wide regression: every other answer shape must be unaffected ────

test("regression: currency (£) unaffected", () => {
  assert.equal(checkMathsAnswer("14", "£14"), true);
  assert.equal(checkMathsAnswer("£14", "£14"), true);
  assert.equal(checkMathsAnswer("15", "£14"), false);
});

test("regression: degree (°) unaffected", () => {
  assert.equal(checkMathsAnswer("108", "108°"), true);
  assert.equal(checkMathsAnswer("108°", "108°"), true);
});

test("regression: compound percentage / decimal currency unaffected", () => {
  assert.equal(checkMathsAnswer("202.50", "£202.50"), true);
  assert.equal(checkMathsAnswer("202.5", "£202.50"), true);
});

test("regression: categorical / option-letter answers unaffected", () => {
  assert.equal(checkMathsAnswer("Equilateral", "Equilateral"), true);
  assert.equal(checkMathsAnswer("Scalene", "Equilateral"), false);
  assert.equal(checkMathsAnswer("A", "A"), true);
  assert.equal(checkMathsAnswer("B", "A"), false);
  assert.equal(checkMathsAnswer("True", "True"), true);
});

test("regression: MR-06 precision (fraction and 2-decimal-place) answers unaffected -- rounding remains strict", () => {
  assert.equal(checkMathsAnswer("3.17", "3.17"), true);
  assert.equal(checkMathsAnswer("3.2", "3.17"), false, "a wrongly rounded answer must not become accepted by this fix");
  assert.equal(checkMathsAnswer("3 1/3", "3 1/3"), true);
  assert.equal(checkMathsAnswer("3 1/2", "3 1/3"), false);
});

test("regression: existing semicolon-delimited accepted alternatives still take priority and are unaffected", () => {
  assert.equal(checkMathsAnswer("45", "45; 26th term (101)"), true);
  assert.equal(checkMathsAnswer("46", "45; 26th term (101)"), false);
});

test("regression: no unit-suffixed family has its wrong-answer rejection weakened by this fix", () => {
  // Every plausible-wrong case from the 10 confirmed questions above is
  // covered individually; this is a final sweep confirming a materially
  // different value is never accepted merely because it happens to
  // parse as a number.
  assert.equal(checkMathsAnswer("999", "4.25m"), false);
  assert.equal(checkMathsAnswer("999", "28m"), false);
  assert.equal(checkMathsAnswer("999", "300g"), false);
});
