import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreMockAttempt, scoreMockResponse, type MockScoringRow } from "@/lib/ali/mockScoringSimulation";

/**
 * Mathematics Mock 1 — Release-QA Scoring Simulation tests (Decision 216).
 * `scoreMockResponse`/`scoreMockAttempt` are a byte-for-byte port of the
 * real, live `mock_score_attempt()` SQL (migration 104) -- these tests
 * prove the port matches the SQL's own documented behaviour, and are the
 * evidence base for the release-QA scoring findings.
 */

// === scoreMockResponse: per-question marking branch ===

test("unanswered: null, undefined, empty string, and whitespace-only response all score unanswered", () => {
  assert.equal(scoreMockResponse("42", null), "unanswered");
  assert.equal(scoreMockResponse("42", undefined), "unanswered");
  assert.equal(scoreMockResponse("42", ""), "unanswered");
  assert.equal(scoreMockResponse("42", "   "), "unanswered");
});

test("numeric path: exact match scores correct", () => {
  assert.equal(scoreMockResponse("28", "28"), "correct");
});

test("numeric path: tolerance accepts reasonable formatting variation (trailing zeros, whitespace)", () => {
  assert.equal(scoreMockResponse("2.5", "2.50"), "correct");
  assert.equal(scoreMockResponse("102", "102.00"), "correct");
  assert.equal(scoreMockResponse("102", " 102 "), "correct");
  assert.equal(scoreMockResponse("91.80", "91.8"), "correct");
});

test("numeric path: a genuinely different number scores incorrect", () => {
  assert.equal(scoreMockResponse("28", "29"), "incorrect");
  assert.equal(scoreMockResponse("2.5", "2.6"), "incorrect");
});

test("numeric path: tolerance boundary -- within 0.0001 is correct, at or beyond is not", () => {
  assert.equal(scoreMockResponse("28", "28.00005"), "correct");
  assert.equal(scoreMockResponse("28", "28.001"), "incorrect");
});

test("string fallback: a currency-symbol-prefixed stored answer requires an EXACT string match -- the real, confirmed defect", () => {
  assert.equal(scoreMockResponse("£102", "102"), "incorrect", "bare numeric fails against a £-prefixed stored answer");
  assert.equal(scoreMockResponse("£102", "£102"), "correct", "only the exact literal spelling scores correct");
  assert.equal(scoreMockResponse("£102", "£102.00"), "incorrect", "even a correctly-symbol-prefixed but differently-formatted response fails");
});

test("string fallback: case-insensitive, trimmed exact match for non-numeric answers", () => {
  assert.equal(scoreMockResponse("Stickers", "stickers"), "correct");
  assert.equal(scoreMockResponse("Stickers", " STICKERS "), "correct");
  assert.equal(scoreMockResponse("Week 3 to Week 4", "week 3 to week 4"), "correct");
  assert.equal(scoreMockResponse("Stickers", "Bracelets"), "incorrect");
});

test("string fallback: a bare-numeric stored answer with a currency-symbol-prefixed response also fails (the relationship is symmetric)", () => {
  assert.equal(scoreMockResponse("102", "£102"), "incorrect");
});

test("time-format answers (e.g. '16:35') use the string path, exact match required", () => {
  assert.equal(scoreMockResponse("16:35", "16:35"), "correct");
  assert.equal(scoreMockResponse("16:35", "16.35"), "incorrect");
});

// === scoreMockAttempt: full attempt aggregation, against the real 56-row shape ===

const SAMPLE_ROWS: MockScoringRow[] = [
  { id: "q1", answer: "44.8", marks: 1 },
  { id: "q2", answer: "87", marks: 1 },
  { id: "q3", answer: "£102", marks: 1 },
  { id: "q4", answer: "Stickers", marks: 1 },
];

test("scoreMockAttempt: all correct sums to full available marks, 100%", () => {
  const responses = new Map(SAMPLE_ROWS.map((r) => [r.id, r.answer]));
  const result = scoreMockAttempt(SAMPLE_ROWS, responses);
  assert.equal(result.rawAchieved, 4);
  assert.equal(result.rawAvailable, 4);
  assert.equal(result.percentage, 100);
  assert.equal(result.correctCount, 4);
  assert.equal(result.incorrectCount, 0);
  assert.equal(result.unansweredCount, 0);
});

test("scoreMockAttempt: all wrong sums to 0, 0%", () => {
  const responses = new Map(SAMPLE_ROWS.map((r) => [r.id, "nope"]));
  const result = scoreMockAttempt(SAMPLE_ROWS, responses);
  assert.equal(result.rawAchieved, 0);
  assert.equal(result.percentage, 0);
  assert.equal(result.incorrectCount, 4);
});

test("scoreMockAttempt: all unanswered sums to 0, unansweredCount = full row count, none marked incorrect", () => {
  const result = scoreMockAttempt(SAMPLE_ROWS, new Map());
  assert.equal(result.rawAchieved, 0);
  assert.equal(result.unansweredCount, 4);
  assert.equal(result.incorrectCount, 0);
  assert.equal(result.answeredCount, 0);
});

test("scoreMockAttempt: mixed case scores each row independently and sums correctly", () => {
  const responses = new Map([
    ["q1", "44.8"], // correct
    ["q2", "0"], // incorrect
    ["q3", "102"], // incorrect (the £-prefix defect)
    ["q4", "stickers"], // correct (case-insensitive)
  ]);
  const result = scoreMockAttempt(SAMPLE_ROWS, responses);
  assert.equal(result.rawAchieved, 2);
  assert.equal(result.correctCount, 2);
  assert.equal(result.incorrectCount, 2);
  assert.equal(result.percentage, 50);
});

test("scoreMockAttempt: percentage is rounded to exactly 1 decimal place, matching the real SQL's round(...,1)", () => {
  const rows: MockScoringRow[] = [
    { id: "a", answer: "1", marks: 1 },
    { id: "b", answer: "1", marks: 1 },
    { id: "c", answer: "1", marks: 1 },
  ];
  const responses = new Map([["a", "1"], ["b", "1"]]); // 2 of 3
  const result = scoreMockAttempt(rows, responses);
  assert.equal(result.rawAchieved, 2);
  assert.equal(result.rawAvailable, 3);
  assert.equal(result.percentage, 66.7);
});

test("scoreMockAttempt: marksAwarded per outcome equals the row's own marks value when correct, 0 otherwise -- never a fraction", () => {
  const responses = new Map([["q1", "44.8"], ["q3", "wrong"]]);
  const result = scoreMockAttempt(SAMPLE_ROWS, responses);
  const q1 = result.outcomes.find((o) => o.questionId === "q1")!;
  const q3 = result.outcomes.find((o) => o.questionId === "q3")!;
  assert.equal(q1.marksAwarded, 1);
  assert.equal(q3.marksAwarded, 0);
  assert.equal(q3.marksAvailable, 1);
});

test("scoreMockAttempt: response for a question NOT in the manifest is simply ignored -- no contamination between rows", () => {
  const responses = new Map([["q1", "44.8"], ["not-a-real-question", "anything"]]);
  const result = scoreMockAttempt(SAMPLE_ROWS, responses);
  assert.equal(result.correctCount, 1);
  assert.equal(result.outcomes.length, 4);
});
