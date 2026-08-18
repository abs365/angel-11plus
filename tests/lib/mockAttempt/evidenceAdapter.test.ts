import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyMockEvidence, summariseStrengthsAndPriorities } from "@/lib/mockAttempt/evidenceAdapter";
import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";
import type { MockQuestionOutcome } from "@/lib/mockAttempt/types";

/**
 * Programme Increment 008F — the Mock evidence boundary/adapter, tested
 * as pure logic (no database, no real Mock content needed). Proves the
 * classification is correct and safely bounded before any real content
 * exists — this is exactly "establish the architecture before content."
 */

// A real, currently-mapped question type, taken directly from the real
// mapping this file's own subject reuses — never invented.
const REAL_QT = Object.keys(QUESTION_TYPE_PRIMARY_COMPETENCY)[0];
const REAL_COMPETENCY = QUESTION_TYPE_PRIMARY_COMPETENCY[REAL_QT as keyof typeof QUESTION_TYPE_PRIMARY_COMPETENCY];

function outcome(overrides: Partial<MockQuestionOutcome>): MockQuestionOutcome {
  return {
    questionId: "q1",
    status: "correct",
    marksAwarded: 1,
    marksAvailable: 1,
    questionTypeId: REAL_QT,
    ...overrides,
  };
}

test("classifyMockEvidence produces one entry per correct/incorrect outcome, tagged source: 'mock'", () => {
  const outcomes = [outcome({ questionId: "q1", status: "correct" }), outcome({ questionId: "q2", status: "incorrect" })];
  const evidence = classifyMockEvidence(outcomes, "attempt-1", "form-1", "2026-08-18T00:00:00.000Z");
  assert.equal(evidence.length, 2);
  for (const e of evidence) {
    assert.equal(e.source, "mock");
    assert.equal(e.attemptId, "attempt-1");
    assert.equal(e.formId, "form-1");
    assert.equal(e.competencyId, REAL_COMPETENCY);
  }
  assert.equal(evidence[0].correct, true);
  assert.equal(evidence[1].correct, false);
});

test("classifyMockEvidence excludes unanswered and requires_manual_marking outcomes -- only a definitive result is evidence of anything", () => {
  const outcomes = [
    outcome({ questionId: "q1", status: "unanswered", marksAwarded: 0 }),
    outcome({ questionId: "q2", status: "requires_manual_marking", marksAwarded: null }),
    outcome({ questionId: "q3", status: "correct" }),
  ];
  const evidence = classifyMockEvidence(outcomes, "attempt-1", "form-1", "2026-08-18T00:00:00.000Z");
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].correct, true);
});

test("classifyMockEvidence skips an outcome with no questionTypeId (e.g. a manifest question that no longer resolves to a real bank row)", () => {
  const outcomes = [outcome({ questionId: "q1", status: "correct", questionTypeId: null })];
  const evidence = classifyMockEvidence(outcomes, "attempt-1", "form-1", "2026-08-18T00:00:00.000Z");
  assert.equal(evidence.length, 0);
});

test("classifyMockEvidence skips a questionTypeId that isn't in the real QUESTION_TYPE_PRIMARY_COMPETENCY mapping -- never invents a competency", () => {
  const outcomes = [outcome({ questionId: "q1", status: "correct", questionTypeId: "QT-NOT-REAL-99" })];
  const evidence = classifyMockEvidence(outcomes, "attempt-1", "form-1", "2026-08-18T00:00:00.000Z");
  assert.equal(evidence.length, 0);
});

test("summariseStrengthsAndPriorities requires at least 2 questions about the same competency before calling it a strength or a priority", () => {
  const evidence = classifyMockEvidence(
    [outcome({ questionId: "q1", status: "correct" })],
    "attempt-1",
    "form-1",
    "2026-08-18T00:00:00.000Z"
  );
  const { strengths, weaknesses } = summariseStrengthsAndPriorities(evidence);
  assert.deepEqual(strengths, []);
  assert.deepEqual(weaknesses, []);
});

test("summariseStrengthsAndPriorities: all-correct with >=2 questions about a competency is a strength", () => {
  const evidence = classifyMockEvidence(
    [outcome({ questionId: "q1", status: "correct" }), outcome({ questionId: "q2", status: "correct" })],
    "attempt-1",
    "form-1",
    "2026-08-18T00:00:00.000Z"
  );
  const { strengths, weaknesses } = summariseStrengthsAndPriorities(evidence);
  assert.equal(strengths.length, 1);
  assert.equal(strengths[0].competencyId, REAL_COMPETENCY);
  assert.equal(strengths[0].questionCount, 2);
  assert.equal(strengths[0].correctCount, 2);
  assert.deepEqual(weaknesses, []);
});

test("summariseStrengthsAndPriorities: all-incorrect with >=2 questions about a competency is a priority (weakness)", () => {
  const evidence = classifyMockEvidence(
    [outcome({ questionId: "q1", status: "incorrect" }), outcome({ questionId: "q2", status: "incorrect" })],
    "attempt-1",
    "form-1",
    "2026-08-18T00:00:00.000Z"
  );
  const { strengths, weaknesses } = summariseStrengthsAndPriorities(evidence);
  assert.deepEqual(strengths, []);
  assert.equal(weaknesses.length, 1);
  assert.equal(weaknesses[0].correctCount, 0);
});

test("summariseStrengthsAndPriorities: a mixed result (some correct, some incorrect) for the same competency is neither a strength nor a priority -- no false certainty", () => {
  const evidence = classifyMockEvidence(
    [outcome({ questionId: "q1", status: "correct" }), outcome({ questionId: "q2", status: "incorrect" })],
    "attempt-1",
    "form-1",
    "2026-08-18T00:00:00.000Z"
  );
  const { strengths, weaknesses } = summariseStrengthsAndPriorities(evidence);
  assert.deepEqual(strengths, []);
  assert.deepEqual(weaknesses, []);
});

test("no evidence entry ever carries a raw answer, response text, or marks value -- only competencyId/questionTypeId/source/correct/provenance", () => {
  const evidence = classifyMockEvidence(
    [outcome({ questionId: "q1", status: "correct" })],
    "attempt-1",
    "form-1",
    "2026-08-18T00:00:00.000Z"
  );
  const keys = Object.keys(evidence[0]).sort();
  assert.deepEqual(keys, ["attemptId", "competencyId", "correct", "formId", "questionTypeId", "scoredAt", "source"].sort());
});
