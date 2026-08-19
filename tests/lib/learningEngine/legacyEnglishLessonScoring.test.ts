import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreAnswer } from "@/app/english/[id]/page";

/**
 * Stage 2 Educational Integrity Correction (Learn-path investigation) —
 * Founder real-production evidence showed nonsense answers ("Gree",
 * "Yuoye") submitted to the Learn-path lesson page
 * (app/english/[id]/page.tsx). Investigation found this page's own
 * locally-defined scoreAnswer() is a third, independently-diverged copy
 * of the exact defect fixed in lib/learningEngine/practiceContent.ts's
 * scoreEnglishAnswer() (Decision 106, Correction 3) — never previously
 * fixed here. Not currently exploitable against the 5 legacy English
 * rows presently tagged into ali_question_bank (none carries exactly 1
 * mark, the only value at which the old unconditional-half-marks
 * fallback coincided with full marks and could flip isCorrect to true),
 * but architecturally identical and latent. Fixed with the same minimal
 * change as Correction 3.
 */

const LIGHTHOUSE_MODEL_ANSWER =
  "'Frantic' suggests the keeper was increasingly panicked, desperate and out of control. The word implies that his fear was growing over time — moving beyond calm worry into something far more urgent and uncontrolled.";

test("REGRESSION: zero-keyword-overlap garbage no longer earns automatic half marks on the Learn-path scorer", () => {
  for (const garbage of ["asdfasdf", "the quick brown fox jumps", "I do not know the answer at all really"]) {
    assert.equal(
      scoreAnswer(garbage, LIGHTHOUSE_MODEL_ANSWER, 2),
      0,
      `"${garbage}" must score 0 -- no real content overlap with the model answer`
    );
  }
});

test("the exact Founder-reported inputs ('Gree', 'Yuoye') score 0 regardless of question marks value -- too short to reach the keyword-overlap branch at all", () => {
  for (const nonsense of ["Gree", "Yuoye"]) {
    for (const marks of [1, 2, 3, 4]) {
      assert.equal(scoreAnswer(nonsense, LIGHTHOUSE_MODEL_ANSWER, marks), 0);
    }
  }
});

test("THE LATENT DEFECT, closed: an 8+ character garbage answer against a 1-mark question can no longer coincide with full marks (Math.max(1, round(1/2)) === 1 was the exact exploit path)", () => {
  const marks = 1;
  const earned = scoreAnswer("this is not a real answer honestly", LIGHTHOUSE_MODEL_ANSWER, marks);
  assert.notEqual(earned, marks, "gibberish must never equal full marks, which is what isCorrect: earned === q.marks checks");
  assert.equal(earned, 0);
});

test("genuine partial keyword overlap still earns partial credit (positive-flexibility preserved)", () => {
  const marks = scoreAnswer(
    "Frantic suggests he was panicked and losing control as he wrote.",
    LIGHTHOUSE_MODEL_ANSWER,
    2
  );
  assert.ok(marks >= 1, "real overlap with the model answer's own content words must still earn credit");
});

test("a genuinely complete, differently-worded answer still earns full marks", () => {
  const marks = scoreAnswer(
    "The word frantic tells us the keeper was becoming more and more panicked, desperate and out of control, as though his fear kept building the longer he wrote, moving from ordinary worry into something urgent and uncontrolled.",
    LIGHTHOUSE_MODEL_ANSWER,
    2
  );
  assert.equal(marks, 2);
});

test("empty/whitespace-only/too-short input still scores 0 (pre-existing behaviour, unaffected)", () => {
  assert.equal(scoreAnswer("", LIGHTHOUSE_MODEL_ANSWER, 2), 0);
  assert.equal(scoreAnswer("   ", LIGHTHOUSE_MODEL_ANSWER, 2), 0);
  assert.equal(scoreAnswer("short", LIGHTHOUSE_MODEL_ANSWER, 2), 0);
});

test("no model answer, short input: pre-existing behaviour unaffected by this fix (only the keyword-overlap branch changed)", () => {
  assert.equal(scoreAnswer("this is my answer to the question", undefined, 2), 1);
});
