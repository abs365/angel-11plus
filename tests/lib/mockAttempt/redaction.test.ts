import { test } from "node:test";
import assert from "node:assert/strict";
import { findLeakedProtectedFields, isPayloadRedactionSafe, isValidMockQuestionPayload } from "@/lib/mockAttempt/redaction";
import { PROTECTED_MOCK_FIELDS } from "@/lib/mockAttempt/types";

/**
 * Programme Increment 008D, Part 5/21 — the field-level secrecy boundary,
 * proven directly. This is the client/test-side mirror of
 * mock_get_question()'s own server-side redaction (migration 070); these
 * tests prove the CONTRACT, not the SQL implementation, which is tested
 * structurally in tests/supabase/mockAttemptEngine.test.ts.
 */

const SAFE_PAYLOAD = {
  questionId: "mr01-wholenum-01",
  subject: "maths",
  skill: "QT-MR-01",
  question: "6 × 47 = ?",
  marks: 1,
  contentDifficulty: "easy",
  // Migration 106 — always present, null for a standalone question.
  questionGroupId: null,
  groupOrder: null,
  subpartLabel: null,
};

test("a genuinely safe payload has zero leaked protected fields", () => {
  assert.deepEqual(findLeakedProtectedFields(SAFE_PAYLOAD), []);
  assert.equal(isPayloadRedactionSafe(SAFE_PAYLOAD), true);
});

test("every protected field, if present, is individually detected", () => {
  for (const field of PROTECTED_MOCK_FIELDS) {
    const leaked = { ...SAFE_PAYLOAD, [field]: "some secret value" };
    assert.deepEqual(findLeakedProtectedFields(leaked), [field], `${field} should be detected as leaked`);
    assert.equal(isPayloadRedactionSafe(leaked), false);
  }
});

test("a payload leaking multiple protected fields at once reports all of them", () => {
  const leaked = { ...SAFE_PAYLOAD, answer: "42", workingSteps: ["step 1"], modelAnswer: "42" };
  const found = findLeakedProtectedFields(leaked);
  assert.equal(found.length, 3);
  assert.ok(found.includes("answer"));
  assert.ok(found.includes("workingSteps"));
  assert.ok(found.includes("modelAnswer"));
});

test("non-object payloads (null, string, array) never throw and are treated as having no leaks to report", () => {
  assert.deepEqual(findLeakedProtectedFields(null), []);
  assert.deepEqual(findLeakedProtectedFields("a string"), []);
  assert.deepEqual(findLeakedProtectedFields(42), []);
});

test("isValidMockQuestionPayload accepts exactly the promised shape", () => {
  assert.equal(isValidMockQuestionPayload(SAFE_PAYLOAD), true);
});

test("isValidMockQuestionPayload rejects a payload missing a required field", () => {
  const { marks: _marks, ...missingMarks } = SAFE_PAYLOAD;
  assert.equal(isValidMockQuestionPayload(missingMarks), false);
});

test("isValidMockQuestionPayload rejects a payload with the wrong type for a required field", () => {
  assert.equal(isValidMockQuestionPayload({ ...SAFE_PAYLOAD, marks: "1" }), false);
});

test("Mathematics First Mock Form-Assembly Gate (Decision 161) — isValidMockQuestionPayload accepts a genuinely grouped subpart's real values", () => {
  const groupedSubpart = {
    ...SAFE_PAYLOAD,
    questionId: "mock-mr01mr10-costumeschedule-01a",
    questionGroupId: "mock-mr01mr10-costumeschedule-01",
    groupOrder: 1,
    subpartLabel: "(a)",
  };
  assert.equal(isValidMockQuestionPayload(groupedSubpart), true);
});

test("Decision 161 — isValidMockQuestionPayload rejects the wrong type for a grouping field even though it is nullable", () => {
  assert.equal(isValidMockQuestionPayload({ ...SAFE_PAYLOAD, questionGroupId: 42 }), false);
  assert.equal(isValidMockQuestionPayload({ ...SAFE_PAYLOAD, groupOrder: "1" }), false);
  assert.equal(isValidMockQuestionPayload({ ...SAFE_PAYLOAD, subpartLabel: 1 }), false);
});

test("Decision 161 — isValidMockQuestionPayload rejects a payload missing a grouping field entirely (the real RPC always includes it, null or not)", () => {
  const { questionGroupId: _questionGroupId, ...missingGroupId } = SAFE_PAYLOAD;
  assert.equal(isValidMockQuestionPayload(missingGroupId), false);
});

test("Decision 161 — none of the three grouping fields are ever treated as protected/leaked (they are structural paper metadata, not answer material)", () => {
  const groupedSubpart = {
    ...SAFE_PAYLOAD,
    questionGroupId: "mock-mr01mr10-costumeschedule-01",
    groupOrder: 1,
    subpartLabel: "(a)",
  };
  assert.deepEqual(findLeakedProtectedFields(groupedSubpart), []);
  assert.equal(isPayloadRedactionSafe(groupedSubpart), true);
});
