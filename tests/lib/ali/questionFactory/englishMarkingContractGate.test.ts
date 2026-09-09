import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateEnglishMarkingContract,
  validateEnglishMarkingContractBatch,
  buildDisjointWrongAnswer,
} from "../../../../lib/ali/questionFactory/englishMarkingContractGate";

/**
 * Educational Increment 003, Wave 3 -- regression coverage for the two
 * real Wave 2 marking incidents, using safe fixtures (not the literal
 * production questions) for cleaner isolation, per instruction.
 */

test("CASE 1: a normal longer English answer with a complete LEGACY_HEURISTIC contract passes, and a wrong answer fails", () => {
  const modelAnswer = "at the start she is anxious and rushed, panicking about missing the bus, but by the end she feels relief and genuine amusement";
  const result = validateEnglishMarkingContract({
    candidateId: "fixture-normal-answer",
    marks: 2,
    modelAnswer,
    canonicalAnswer: modelAnswer,
    disjointWrongAnswer: buildDisjointWrongAnswer([modelAnswer]),
  });
  assert.equal(result.valid, true, JSON.stringify(result.failures));
  assert.equal(result.canonicalEarnedMarks, 2);
});

test("CASE 1b: the same contract correctly fails a genuinely wrong answer", () => {
  const modelAnswer = "at the start she is anxious and rushed, panicking about missing the bus, but by the end she feels relief and genuine amusement";
  const wrong = buildDisjointWrongAnswer([modelAnswer]);
  // Directly confirm the wrong answer alone (not routed through the
  // gate, which would already fail loudly) earns zero via the contract.
  const result = validateEnglishMarkingContract({
    candidateId: "fixture-normal-answer-wrong-check",
    marks: 2,
    modelAnswer,
    canonicalAnswer: modelAnswer,
    disjointWrongAnswer: wrong,
    plausibleWrongAnswers: ["this passage describes something else entirely and does not answer the question"],
  });
  assert.equal(result.valid, true, JSON.stringify(result.failures));
});

test("CASE 2: a short emotion answer (\"nervous\") passes only under an accepted-set contract, correctly rejecting an unrelated emotion", () => {
  const acceptedAnswers = ["nervous", "anxious", "tense", "on edge", "uneasy"];
  const result = validateEnglishMarkingContract({
    candidateId: "fixture-short-emotion",
    marks: 1,
    acceptedAnswers,
    validationTier: "TIER2_ACCEPTED_SET",
    canonicalAnswer: "nervous",
    approvedVariants: ["anxious", "tense", "on edge", "uneasy"],
    disjointWrongAnswer: buildDisjointWrongAnswer(acceptedAnswers),
    plausibleWrongAnswers: ["happy"], // a real, short, plausible emotion word -- not accepted
  });
  assert.equal(result.valid, true, JSON.stringify(result.failures));
  assert.equal(result.canonicalEarnedMarks, 1);
});

test("CASE 2b: the same short emotion answer FAILS the gate if routed through LEGACY_HEURISTIC instead (reproducing Wave 2 Incident B exactly)", () => {
  const acceptedAnswers = ["nervous", "anxious", "tense", "on edge", "uneasy"];
  const result = validateEnglishMarkingContract({
    candidateId: "fixture-short-emotion-wrong-tier",
    marks: 1,
    acceptedAnswers,
    modelAnswer: "nervous",
    // No validationTier -- falls through to LEGACY_HEURISTIC, exactly
    // the pre-Migration-243 shape.
    canonicalAnswer: "nervous",
    disjointWrongAnswer: buildDisjointWrongAnswer(acceptedAnswers),
  });
  assert.equal(result.valid, false);
  assert.ok(result.failures.some((f) => f.reason.includes("Incident B")), "must name the Incident B failure mode");
});

test("CASE 3: a short sequencing answer (\"b, a, c\") passes under an order-sensitive accepted-set contract, correctly rejecting a different order", () => {
  const acceptedAnswers = ["b, a, c", "b then a then c"];
  const result = validateEnglishMarkingContract({
    candidateId: "fixture-short-sequencing",
    marks: 1,
    acceptedAnswers,
    validationTier: "TIER2_ACCEPTED_SET",
    canonicalAnswer: "b, a, c",
    approvedVariants: ["b then a then c"],
    disjointWrongAnswer: buildDisjointWrongAnswer(acceptedAnswers),
    plausibleWrongAnswers: ["a, b, c"], // same letters, wrong order
  });
  assert.equal(result.valid, true, JSON.stringify(result.failures));
});

test("CASE 4: missing marks/modelAnswer/required contract fails validation before publication, with a precise reason", () => {
  const result = validateEnglishMarkingContract({
    candidateId: "fixture-missing-fields",
    marks: 1,
    // No acceptedAnswers, no modelAnswer, no validationTier at all.
    canonicalAnswer: "some answer",
    disjointWrongAnswer: "purple elephants bicycles trombone",
  });
  assert.equal(result.valid, false);
  assert.ok(result.failures.some((f) => f.reason.includes("modelAnswer")), "must name the missing modelAnswer");
  assert.equal(result.canonicalEarnedMarks, null, "must not attempt to score with a known-incomplete contract");
});

test("CASE 4b: an invalid marks value fails validation with a precise reason", () => {
  const result = validateEnglishMarkingContract({
    candidateId: "fixture-bad-marks",
    marks: 0,
    modelAnswer: "a valid model answer here",
    canonicalAnswer: "a valid model answer here",
    disjointWrongAnswer: "purple elephants bicycles trombone",
  });
  assert.equal(result.valid, false);
  assert.ok(result.failures.some((f) => f.reason.includes("positive integer")));
});

test("CASE 5: a scorer result that would be NaN/non-numeric fails closed with the precise Incident A reason", () => {
  // Reproduces Migration 242's own root cause exactly: acceptedAnswers
  // present, but no marks/modelAnswer/validationTier, so
  // LEGACY_HEURISTIC receives an undefined modelAnswer.
  const result = validateEnglishMarkingContract({
    candidateId: "fixture-nan-incident",
    marks: 1,
    acceptedAnswers: ["the correct answer"],
    // modelAnswer deliberately omitted, no validationTier.
    canonicalAnswer: "the correct answer",
    disjointWrongAnswer: "purple elephants bicycles trombone",
  });
  assert.equal(result.valid, false);
  assert.ok(result.failures.some((f) => f.reason.includes("modelAnswer")), "must fail closed on the missing modelAnswer before ever reaching the scorer");
});

test("a candidate that accepts a materially wrong answer fails closed, never silently passing", () => {
  // A deliberately broken contract: acceptedAnswers that would let a
  // near-empty or generic answer slip through TIER2's token-subsequence
  // matching -- proves the gate actually checks the wrong-answer arm,
  // not just the correct-answer arm.
  const acceptedAnswers = ["sad"];
  const result = validateEnglishMarkingContract({
    candidateId: "fixture-accepts-wrong",
    marks: 1,
    acceptedAnswers,
    validationTier: "TIER2_ACCEPTED_SET",
    canonicalAnswer: "sad",
    disjointWrongAnswer: "sad", // deliberately NOT disjoint -- proves the gate would catch a caller's own mistake
  });
  assert.equal(result.valid, false, "a caller-supplied 'disjoint' wrong answer that is not actually disjoint must still be caught, since it would score full marks");
});

test("buildDisjointWrongAnswer never accidentally reuses a real keyword or its substring (the 'nonsense' contains 'sense' class of mistake)", () => {
  const approved = ["a sense of long abandonment", "he feels the ending marks the loss of something that spanned generations, a sense of sentimental attachment"];
  const wrong = buildDisjointWrongAnswer(approved);
  assert.ok(!wrong.toLowerCase().includes("sense"), "must not contain the real keyword 'sense' as a substring anywhere");
  assert.ok(!wrong.toLowerCase().includes("nonsense"), "must not use a word that itself contains a real keyword as a substring");
});

test("validateEnglishMarkingContractBatch summarises a mixed batch correctly", () => {
  const good = {
    candidateId: "batch-good",
    marks: 1,
    acceptedAnswers: ["correct"],
    validationTier: "TIER2_ACCEPTED_SET" as const,
    canonicalAnswer: "correct",
    disjointWrongAnswer: buildDisjointWrongAnswer(["correct"]),
  };
  const bad = {
    candidateId: "batch-bad",
    marks: 1,
    canonicalAnswer: "correct",
    disjointWrongAnswer: "purple elephants bicycles trombone",
  };
  const summary = validateEnglishMarkingContractBatch([good, bad]);
  assert.equal(summary.total, 2);
  assert.equal(summary.passed, 1);
  assert.equal(summary.failed, 1);
  assert.ok(summary.failures.some((f) => f.candidateId === "batch-bad"));
});
