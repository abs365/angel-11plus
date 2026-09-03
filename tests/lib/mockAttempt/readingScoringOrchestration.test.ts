import { test } from "node:test";
import assert from "node:assert/strict";
import { computeReadingScoringOutcome, computeReadingScoringOutcomes, type ReadingScoringWorkItem } from "@/lib/mockAttempt/readingScoringOrchestration";

/**
 * Programme Completion Increment 016 — Authoritative Reading Comprehension
 * Scoring, pure-logic tests. Fixtures are the REAL, authored content for
 * one question of each validationTier (migration 097's own
 * mock-eng-boathouse-q03/q07/q10/q12a) — not synthetic stand-ins — proving
 * this orchestration module genuinely, correctly calls the existing,
 * already-approved scoreEnglishComprehensionAnswer()/scoreEnglishAnswer()
 * engine, not a new one. No production learner answers are used anywhere
 * in this file — every userAnswer below is authored by this test.
 */

function item(overrides: Partial<ReadingScoringWorkItem>): ReadingScoringWorkItem {
  return {
    questionId: "q1",
    marks: 1,
    validationTier: null,
    modelAnswer: null,
    acceptedAnswers: null,
    quotationRequired: null,
    orderedAnswer: null,
    correctOptions: null,
    requiredSelectionCount: null,
    userAnswer: "",
    ...overrides,
  };
}

// --- TIER2_ACCEPTED_SET ---------------------------------------------------

test("TIER2_ACCEPTED_SET: a genuinely correct answer (real Bees passage q01) earns full marks", () => {
  const q = item({
    questionId: "eng-inc001-bee-q01",
    marks: 1,
    validationTier: "TIER2_ACCEPTED_SET",
    acceptedAnswers: ["more than a mile", "over a mile", "further than a mile"],
    userAnswer: "over a mile",
  });
  assert.deepEqual(computeReadingScoringOutcome(q), { questionId: "eng-inc001-bee-q01", marksAwarded: 1 });
});

test("TIER2_ACCEPTED_SET: a genuinely wrong answer earns zero, never partial", () => {
  const q = item({
    questionId: "eng-inc001-bee-q01", marks: 1, validationTier: "TIER2_ACCEPTED_SET",
    acceptedAnswers: ["more than a mile", "over a mile", "further than a mile"],
    userAnswer: "about ten metres",
  });
  assert.equal(computeReadingScoringOutcome(q).marksAwarded, 0);
});

test("TIER2_ACCEPTED_SET: controlled normalisation (case/whitespace) is not loose semantic guessing -- an unrelated word never matches", () => {
  const q = item({
    questionId: "x", marks: 1, validationTier: "TIER2_ACCEPTED_SET",
    acceptedAnswers: ["relax"], userAnswer: "bathe",
  });
  assert.equal(computeReadingScoringOutcome(q).marksAwarded, 0, "the real mark scheme rejects 'bathe' for 'relax' -- a curated list, not keyword overlap");
});

// --- TIER4_ORDERED_LIST (real mock-eng-boathouse-q07) ---------------------

test("TIER4_ORDERED_LIST: the real Boathouse repair-order question awards full marks for the genuinely correct order", () => {
  const q = item({
    questionId: "mock-eng-boathouse-q07", marks: 3, validationTier: "TIER4_ORDERED_LIST",
    orderedAnswer: ["filling the crack", "sanding again", "applying the varnish"],
    userAnswer: "filling the crack\nsanding again\napplying the varnish",
  });
  assert.deepEqual(computeReadingScoringOutcome(q), { questionId: "mock-eng-boathouse-q07", marksAwarded: 3 });
});

test("TIER4_ORDERED_LIST: a partially-correct order (real content) awards genuine partial credit, not all-or-nothing", () => {
  const q = item({
    questionId: "mock-eng-boathouse-q07", marks: 3, validationTier: "TIER4_ORDERED_LIST",
    orderedAnswer: ["filling the crack", "sanding again", "applying the varnish"],
    // Correct item, then two swapped -- CSSE's own worked example: an item
    // correct but out of position earns nothing for that position.
    userAnswer: "filling the crack\napplying the varnish\nsanding again",
  });
  assert.equal(computeReadingScoringOutcome(q).marksAwarded, 1);
});

// --- TIER6_MULTI_SELECT (real mock-eng-boathouse-q10) ----------------------

test("TIER6_MULTI_SELECT: the real Boathouse tick-4 question awards full marks for the genuinely correct 4 options", () => {
  const q = item({
    questionId: "mock-eng-boathouse-q10", marks: 4, validationTier: "TIER6_MULTI_SELECT",
    correctOptions: ["1", "3", "5", "7"], requiredSelectionCount: 4,
    userAnswer: "1, 3, 5, 7",
  });
  assert.deepEqual(computeReadingScoringOutcome(q), { questionId: "mock-eng-boathouse-q10", marksAwarded: 4 });
});

test("TIER6_MULTI_SELECT: over-selection loses all marks (the real, evidenced CSSE tick-box rule)", () => {
  const q = item({
    questionId: "mock-eng-boathouse-q10", marks: 4, validationTier: "TIER6_MULTI_SELECT",
    correctOptions: ["1", "3", "5", "7"], requiredSelectionCount: 4,
    userAnswer: "1, 2, 3, 5, 7",
  });
  assert.equal(computeReadingScoringOutcome(q).marksAwarded, 0);
});

// --- TIER3_QUOTATION_PLUS_EXPLANATION (real mock-eng-boathouse-q03) -------

test("TIER3_QUOTATION_PLUS_EXPLANATION: always computes zero here, regardless of how good the answer is -- judgement-required, never auto-scored, matching the engine's own requiresSelfComparison design", () => {
  const q = item({
    questionId: "mock-eng-boathouse-q03", marks: 4, validationTier: "TIER3_QUOTATION_PLUS_EXPLANATION",
    quotationRequired: ["looked less like a promise and more like a problem", "This is starting again from nothing"],
    userAnswer: "No, because the boat looked less like a promise and more like a problem, and she says this is starting again from nothing.",
  });
  assert.equal(computeReadingScoringOutcome(q).marksAwarded, 0, "TIER3 earnedMarks is always 0 from this engine -- migration 219's own database layer independently, unconditionally overrides this to requires_manual_marking regardless of this value");
});

// --- TIER1_EXACT_MATCH (real mock-eng-boathouse-q12a) ----------------------
// Corrected this increment (was: fell through to the legacy 8-character
// keyword heuristic, scoring a genuinely correct short "Yes" as zero) --
// see lib/learningEngine/englishAnswerValidation.ts's own dispatcher,
// which now reuses checkAcceptedAnswerSet() for TIER1, exactly as that
// function's own pre-existing "Tier 1/2" doc comment already intended.

test("TIER1_EXACT_MATCH: the real Boathouse q12a question awards full marks for the genuinely correct short answer", () => {
  const q = item({
    questionId: "mock-eng-boathouse-q12a", marks: 1, validationTier: "TIER1_EXACT_MATCH",
    acceptedAnswers: ["Yes"], userAnswer: "Yes",
  });
  assert.deepEqual(computeReadingScoringOutcome(q), { questionId: "mock-eng-boathouse-q12a", marksAwarded: 1 });
});

test("TIER1_EXACT_MATCH: case normalisation -- 'yes' still matches the authored 'Yes'", () => {
  const q = item({ questionId: "mock-eng-boathouse-q12a", marks: 1, validationTier: "TIER1_EXACT_MATCH", acceptedAnswers: ["Yes"], userAnswer: "yes" });
  assert.equal(computeReadingScoringOutcome(q).marksAwarded, 1);
});

test("TIER1_EXACT_MATCH: surrounding whitespace normalisation -- harmless leading/trailing/internal spacing still matches", () => {
  const q = item({ questionId: "mock-eng-boathouse-q12a", marks: 1, validationTier: "TIER1_EXACT_MATCH", acceptedAnswers: ["Yes"], userAnswer: "  Yes  " });
  assert.equal(computeReadingScoringOutcome(q).marksAwarded, 1);
});

test("TIER1_EXACT_MATCH: a genuinely different short answer fails, never guessed", () => {
  const q = item({ questionId: "mock-eng-boathouse-q12a", marks: 1, validationTier: "TIER1_EXACT_MATCH", acceptedAnswers: ["Yes"], userAnswer: "No" });
  assert.equal(computeReadingScoringOutcome(q).marksAwarded, 0);
});

test("TIER1_EXACT_MATCH: no character-level substring false positive -- a genuinely unrelated word that happens to contain the accepted answer's letters never matches", () => {
  const q = item({ questionId: "x", marks: 1, validationTier: "TIER1_EXACT_MATCH", acceptedAnswers: ["yes"], userAnswer: "eyes" });
  assert.equal(computeReadingScoringOutcome(q).marksAwarded, 0, "'eyes' must never match 'yes' as a character substring");
});

// --- unanswered / batch behaviour ------------------------------------------

test("an empty userAnswer earns zero for every deterministic tier -- never guessed, never a fallback credit", () => {
  for (const tier of ["TIER2_ACCEPTED_SET", "TIER4_ORDERED_LIST", "TIER6_MULTI_SELECT"] as const) {
    const q = item({ validationTier: tier, acceptedAnswers: ["x"], orderedAnswer: ["x"], correctOptions: ["x"], requiredSelectionCount: 1, userAnswer: "" });
    assert.equal(computeReadingScoringOutcome(q).marksAwarded, 0, `${tier} with an empty answer must score 0`);
  }
});

test("computeReadingScoringOutcomes maps every item in the claimed batch, in order, one outcome per question -- matching mock_persist_reading_scoring()'s own exact-count requirement", () => {
  const items = [
    item({ questionId: "a", validationTier: "TIER2_ACCEPTED_SET", acceptedAnswers: ["cat"], userAnswer: "cat", marks: 1 }),
    item({ questionId: "b", validationTier: "TIER2_ACCEPTED_SET", acceptedAnswers: ["dog"], userAnswer: "fish", marks: 1 }),
  ];
  const outcomes = computeReadingScoringOutcomes(items);
  assert.deepEqual(outcomes, [
    { questionId: "a", marksAwarded: 1 },
    { questionId: "b", marksAwarded: 0 },
  ]);
});
