import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

/**
 * Structured Assessment Stimulus (Decision 170) — `stimulus` is the
 * material a question is ABOUT, shown to the learner before they
 * answer, exactly like `question` itself; it must never be treated as
 * answer-adjacent, and the real mock-mr09-runningclub payload shape
 * must validate correctly.
 */
const RUNNINGCLUB_STIMULUS = {
  type: "table",
  caption: "Weekly running club attendance",
  headers: ["Week", "Attendance"],
  rows: [["Week 1", "14"], ["Week 2", "19"], ["Week 3", "16"], ["Week 4", "23"], ["Week 5", "21"]],
};

test("stimulus is never a protected/leaked field -- the learner payload may contain it but never an answer", () => {
  const withStimulus = { ...SAFE_PAYLOAD, stimulus: RUNNINGCLUB_STIMULUS };
  assert.deepEqual(findLeakedProtectedFields(withStimulus), []);
  assert.equal(isPayloadRedactionSafe(withStimulus), true);
});

test("isValidMockQuestionPayload accepts a real runningclub-shaped payload with stimulus present", () => {
  assert.equal(isValidMockQuestionPayload({ ...SAFE_PAYLOAD, stimulus: RUNNINGCLUB_STIMULUS }), true);
});

test("isValidMockQuestionPayload accepts stimulus: null (the real mock-mr10-fairprep and every pre-Decision-170 row's own value)", () => {
  assert.equal(isValidMockQuestionPayload({ ...SAFE_PAYLOAD, stimulus: null }), true);
});

test("isValidMockQuestionPayload accepts a payload where stimulus is entirely absent -- a payload fetched before migration 115 existed must not be rejected outright", () => {
  assert.equal(isValidMockQuestionPayload(SAFE_PAYLOAD), true);
  assert.ok(!("stimulus" in SAFE_PAYLOAD));
});

test("isValidMockQuestionPayload rejects a non-object, non-null stimulus (a genuinely wrong top-level shape, not merely an unvalidated table)", () => {
  assert.equal(isValidMockQuestionPayload({ ...SAFE_PAYLOAD, stimulus: "not an object" }), false);
  assert.equal(isValidMockQuestionPayload({ ...SAFE_PAYLOAD, stimulus: 42 }), false);
});

/**
 * Shared-Scenario Presentation Correction (Decision 180) — `sharedStem`
 * is authored, non-secret scenario prose, exactly like `question`
 * itself; it must never be treated as answer-adjacent, and the real
 * mock-mr06-linkedvalues payload shape must validate correctly.
 */
const LINKEDVALUES_SHARED_STEM = "A collector has three bags of marbles: red, blue and green. The blue bag has 6 more marbles than the red bag. The green bag has 3 times as many marbles as the blue bag. Altogether, the three bags contain 64 marbles.";

test("sharedStem is never a protected/leaked field", () => {
  const withStem = { ...SAFE_PAYLOAD, sharedStem: LINKEDVALUES_SHARED_STEM };
  assert.deepEqual(findLeakedProtectedFields(withStem), []);
  assert.equal(isPayloadRedactionSafe(withStem), true);
});

test("isValidMockQuestionPayload accepts a real linkedvalues-shaped payload with sharedStem present", () => {
  assert.equal(isValidMockQuestionPayload({ ...SAFE_PAYLOAD, sharedStem: LINKEDVALUES_SHARED_STEM }), true);
});

test("isValidMockQuestionPayload accepts sharedStem: null (every family that has never authored this contract)", () => {
  assert.equal(isValidMockQuestionPayload({ ...SAFE_PAYLOAD, sharedStem: null }), true);
});

test("isValidMockQuestionPayload accepts a payload where sharedStem is entirely absent -- a payload fetched before migration 122 existed must not be rejected outright", () => {
  assert.equal(isValidMockQuestionPayload(SAFE_PAYLOAD), true);
  assert.ok(!("sharedStem" in SAFE_PAYLOAD));
});

test("isValidMockQuestionPayload rejects a non-string, non-null sharedStem", () => {
  assert.equal(isValidMockQuestionPayload({ ...SAFE_PAYLOAD, sharedStem: 42 }), false);
  assert.equal(isValidMockQuestionPayload({ ...SAFE_PAYLOAD, sharedStem: { not: "a string" } }), false);
});

/**
 * Programme Completion Increment 016 (Reading scoring investigation,
 * Section 6 defence-in-depth audit) — `lib/learningEngine/
 * englishAnswerValidation.ts`'s own EnglishPromptValidationFields
 * contract defines three more real answer-bearing keys
 * (quotationRequired/orderedAnswer/correctOptions) that the original
 * PROTECTED_MOCK_FIELDS list, written before Reading content existed,
 * never named. None of these three currently reach a learner --
 * mock_get_question()'s own explicit key allow-list (migration 218) is
 * the primary protection, unchanged by this addition -- this is
 * defence in depth only, so a future payload change can never
 * silently expose one.
 */
test("quotationRequired/orderedAnswer/correctOptions -- the three real answer-bearing fields the tiered English validation contract defines -- are protected, individually and together", () => {
  for (const field of ["quotationRequired", "orderedAnswer", "correctOptions"]) {
    const leaked = { ...SAFE_PAYLOAD, [field]: ["some secret value"] };
    assert.deepEqual(findLeakedProtectedFields(leaked), [field], `${field} should be detected as leaked`);
    assert.equal(isPayloadRedactionSafe(leaked), false);
  }
});

test("mock_get_question()'s own live SQL (migration 218) never returns any of the three new protected keys -- the primary protection, confirmed unchanged", () => {
  const migration218 = readFileSync("supabase/migrations/218_mock_get_question_passage_fields.sql", "utf8");
  for (const field of ["quotationRequired", "orderedAnswer", "correctOptions", "acceptedAnswers", "modelAnswer", "answer"]) {
    assert.doesNotMatch(migration218, new RegExp(`'${field}'`), `${field} must never appear in mock_get_question()'s own return object`);
  }
});
