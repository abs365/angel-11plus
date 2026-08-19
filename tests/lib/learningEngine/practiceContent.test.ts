import { test } from "node:test";
import assert from "node:assert/strict";
import { checkMathsAnswer, parseNumberWithUnit, scoreEnglishAnswer } from "../../../lib/learningEngine/practiceContent";

// --- Stage 2 Educational Integrity Correction: scoreEnglishAnswer (legacy
// English heuristic, reached with NO self-assessment step at all — its
// return value is written straight to evidence as automatically-verified
// marks) --------------------------------------------------------------

const RACEDAY_01_MODEL_ANSWER =
  "He jogged slow laps to loosen his muscles, checked his spikes four times, and practised the baton handover, referring to a laminated card of his split times.";

test("scoreEnglishAnswer REGRESSION: zero-keyword-overlap garbage no longer earns automatic half marks", () => {
  for (const garbage of ["aaaaaaaa", "xxxxxxxxxxx", "asdf asdf asdf", "the quick brown fox jumps", "I do not know the answer at all"]) {
    assert.equal(
      scoreEnglishAnswer(garbage, RACEDAY_01_MODEL_ANSWER, 4),
      0,
      `"${garbage}" must score 0 — no real content overlap with the model answer`
    );
  }
});

test("scoreEnglishAnswer: an answer just at the 8-character floor with zero real overlap still scores 0", () => {
  assert.equal(scoreEnglishAnswer("12345678", RACEDAY_01_MODEL_ANSWER, 4), 0);
});

test("scoreEnglishAnswer: genuine partial keyword overlap still earns partial credit (positive-flexibility preserved)", () => {
  const marks = scoreEnglishAnswer("he checked his spikes before the race", RACEDAY_01_MODEL_ANSWER, 4);
  assert.ok(marks >= 1, "real overlap with the model answer's own content words must still earn credit");
});

test("scoreEnglishAnswer: a genuinely complete, differently-worded answer still earns full marks (positive-flexibility preserved)", () => {
  const marks = scoreEnglishAnswer(
    "He jogged slow deliberate laps to loosen his muscles, checked his spikes for the fourth time, and practised the handover with an imaginary baton, referring to his laminated card of split times.",
    RACEDAY_01_MODEL_ANSWER,
    4
  );
  assert.equal(marks, 4);
});

test("scoreEnglishAnswer: empty/whitespace-only/too-short input still scores 0 (pre-existing behaviour, unaffected)", () => {
  assert.equal(scoreEnglishAnswer("", RACEDAY_01_MODEL_ANSWER, 4), 0);
  assert.equal(scoreEnglishAnswer("   ", RACEDAY_01_MODEL_ANSWER, 4), 0);
  assert.equal(scoreEnglishAnswer("short", RACEDAY_01_MODEL_ANSWER, 4), 0);
});

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

// ─── 007L post-closure fix: cubic/squared unit answers ─────────────────────
// Confirmed by direct production scan (264 rows, both subjects, every
// status): exactly one live row uses a power unit -- mth-009, "942 cm³".
// No cm², m², mm², m³, or mm³ answer exists anywhere in the bank today;
// these tests cover the full recognised-unit contract (mm/cm/km/m, squared
// and cubed) so the fix is exercised beyond just the one live instance.

test("mth-009 (LIVE, practice_eligible): 942 cm³ (Unicode superscript stored form)", () => {
  const correct = "942 cm³";
  assert.equal(checkMathsAnswer("942", correct), true, "bare number must be accepted");
  assert.equal(checkMathsAnswer("942cm³", correct), true, "number + Unicode cm³ must be accepted");
  assert.equal(checkMathsAnswer("942 cm³", correct), true, "number + space + Unicode cm³ must be accepted");
  assert.equal(checkMathsAnswer("942cm3", correct), true, "number + ASCII cm3 (no superscript key) must be accepted");
  assert.equal(checkMathsAnswer("942 CM3", correct), true, "case must not matter");
  assert.equal(checkMathsAnswer("941", correct), false, "wrong number must remain rejected");
  assert.equal(checkMathsAnswer("943", correct), false, "wrong number must remain rejected");
  assert.equal(checkMathsAnswer("942cm", correct), false, "linear cm is a different unit to cubic cm and must be rejected");
  assert.equal(checkMathsAnswer("942cm²", correct), false, "area is a different quantity to volume and must be rejected");
  assert.equal(checkMathsAnswer("942m³", correct), false, "correct number + wrong length unit must be rejected");
});

test("parseNumberWithUnit: squared/cubed length units, Unicode and ASCII forms normalise to the same canonical unit", () => {
  assert.deepEqual(parseNumberWithUnit("48m²"), { value: 48, unit: "m²" });
  assert.deepEqual(parseNumberWithUnit("48m2"), { value: 48, unit: "m²" });
  assert.deepEqual(parseNumberWithUnit("48 M2"), { value: 48, unit: "m²" });
  assert.deepEqual(parseNumberWithUnit("125cm³"), { value: 125, unit: "cm³" });
  assert.deepEqual(parseNumberWithUnit("125cm3"), { value: 125, unit: "cm³" });
  assert.deepEqual(parseNumberWithUnit("8mm³"), { value: 8, unit: "mm³" });
  assert.deepEqual(parseNumberWithUnit("8mm3"), { value: 8, unit: "mm³" });
  assert.deepEqual(parseNumberWithUnit("2km²"), { value: 2, unit: "km²" });
});

test("checkMathsAnswer: squared-area answers (no live row today, contract still verified directly)", () => {
  assert.equal(checkMathsAnswer("48", "48 m²"), true);
  assert.equal(checkMathsAnswer("48m²", "48 m²"), true);
  assert.equal(checkMathsAnswer("48m2", "48 m²"), true);
  assert.equal(checkMathsAnswer("49", "48 m²"), false);
  assert.equal(checkMathsAnswer("48cm²", "48 m²"), false, "correct number + wrong length unit must be rejected");
  assert.equal(checkMathsAnswer("48m", "48 m²"), false, "linear m is a different quantity to area and must be rejected");
});

test("regression: mass and liquid-volume units are never treated as power-unit-eligible", () => {
  // g/kg/ml/l squared or cubed have no meaning in this bank; confirm the
  // power-unit path does not accidentally fire for them.
  assert.equal(checkMathsAnswer("300g2", "300g"), false, "300g2 is not a valid form of 300g, must not be silently accepted");
  assert.equal(checkMathsAnswer("300g", "300g"), true, "the existing plain-unit path must still work unchanged");
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
