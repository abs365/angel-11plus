import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidTableStimulus, selectDisplayUnitStimulus, isValidImageStimulus, selectDisplayUnitImageStimulus } from "@/lib/mockAttempt/workspace";
import type { MockQuestionPayload } from "@/lib/mockAttempt/types";

/**
 * Structured Assessment Stimulus (Decision 170) — pure-function tests
 * for isValidTableStimulus()/selectDisplayUnitStimulus(), the client-
 * side validation and display-unit-level de-duplication the Founder's
 * own directive required. Fixtures mirror the real, authored
 * mock-mr09-runningclub stimulus (migration 113, amended) and
 * mock-mr10-fairprep's own real absence of one.
 */

const VALID_TABLE = {
  type: "table" as const,
  caption: "Weekly running club attendance",
  headers: ["Week", "Attendance"],
  rows: [
    ["Week 1", "14"],
    ["Week 2", "19"],
    ["Week 3", "16"],
    ["Week 4", "23"],
    ["Week 5", "21"],
  ],
};

function payload(overrides: Partial<MockQuestionPayload>): MockQuestionPayload {
  return {
    questionId: "q1",
    subject: "maths",
    skill: "data-handling",
    question: "?",
    marks: 1,
    contentDifficulty: "medium",
    questionGroupId: "g1",
    groupOrder: 1,
    subpartLabel: "(a)",
    stimulus: null,
    sharedStem: null,
    passageTitle: null,
    passageText: null,
    ...overrides,
  };
}

test("isValidTableStimulus accepts the real runningclub-shaped table", () => {
  assert.equal(isValidTableStimulus(VALID_TABLE), true);
});

test("isValidTableStimulus accepts a table with no caption (caption is optional)", () => {
  const withoutCaption = { type: VALID_TABLE.type, headers: VALID_TABLE.headers, rows: VALID_TABLE.rows };
  assert.equal(isValidTableStimulus(withoutCaption), true);
});

test("isValidTableStimulus fails safely on null and undefined -- the real value of every existing row (including mock-mr10-fairprep)", () => {
  assert.equal(isValidTableStimulus(null), false);
  assert.equal(isValidTableStimulus(undefined), false);
});

test("isValidTableStimulus fails safely on malformed shapes", () => {
  assert.equal(isValidTableStimulus("just a string"), false, "not an object");
  assert.equal(isValidTableStimulus({}), false, "no type field");
  assert.equal(isValidTableStimulus({ type: "chart", headers: ["a"], rows: [["1"]] }), false, "unsupported future type");
  assert.equal(isValidTableStimulus({ type: "table", headers: [], rows: [["1"]] }), false, "empty headers");
  assert.equal(isValidTableStimulus({ type: "table", headers: ["a"], rows: [] }), false, "empty rows");
  assert.equal(isValidTableStimulus({ type: "table", headers: ["a", "b"], rows: [["1"]] }), false, "row width mismatch");
  assert.equal(isValidTableStimulus({ type: "table", headers: ["a"], rows: [[1]] }), false, "non-string cell");
  assert.equal(isValidTableStimulus({ type: "table", headers: [1], rows: [["1"]] }), false, "non-string header");
  assert.equal(isValidTableStimulus({ type: "table", caption: 5, headers: ["a"], rows: [["1"]] }), false, "non-string caption");
});

test("selectDisplayUnitStimulus returns null when no payload in the unit carries a stimulus -- mock-mr10-fairprep's own real case, grouped questions render unchanged", () => {
  const fairprepUnit = [
    payload({ questionId: "mock-mr10-fairprep-01", subpartLabel: "(a)", stimulus: null }),
    payload({ questionId: "mock-mr10-fairprep-02", subpartLabel: "(b)", stimulus: null }),
  ];
  assert.equal(selectDisplayUnitStimulus(fairprepUnit), null);
});

test("selectDisplayUnitStimulus returns the shared table exactly once for the real mock-mr09-runningclub shape (both subparts carry the identical stimulus)", () => {
  const runningclubUnit = [
    payload({ questionId: "mock-mr09-runningclub-01", subpartLabel: "(a)", stimulus: VALID_TABLE }),
    payload({ questionId: "mock-mr09-runningclub-02", subpartLabel: "(b)", stimulus: VALID_TABLE }),
  ];
  assert.deepEqual(selectDisplayUnitStimulus(runningclubUnit), VALID_TABLE);
});

test("selectDisplayUnitStimulus is generic: it selects the first VALID stimulus by position, not by any family name or convention", () => {
  const onlySecondCarriesIt = [
    payload({ questionId: "x-01", stimulus: null }),
    payload({ questionId: "x-02", stimulus: VALID_TABLE }),
  ];
  assert.deepEqual(selectDisplayUnitStimulus(onlySecondCarriesIt), VALID_TABLE);
});

test("selectDisplayUnitStimulus ignores a malformed stimulus and keeps looking, rather than rendering garbage -- fails safely", () => {
  const malformedThenValid = [
    payload({ questionId: "x-01", stimulus: { type: "table", headers: [], rows: [] } }),
    payload({ questionId: "x-02", stimulus: VALID_TABLE }),
  ];
  assert.deepEqual(selectDisplayUnitStimulus(malformedThenValid), VALID_TABLE);
});

test("selectDisplayUnitStimulus on a standalone (single-payload) unit behaves the same as any other unit", () => {
  assert.equal(selectDisplayUnitStimulus([payload({ stimulus: null })]), null);
  assert.deepEqual(selectDisplayUnitStimulus([payload({ stimulus: VALID_TABLE })]), VALID_TABLE);
});

/**
 * CSSE Two-Paper Mock, pre-activation completion pass (migration 246) —
 * isValidImageStimulus()/selectDisplayUnitImageStimulus() tests, mirroring
 * the table-stimulus tests above exactly. Fixture mirrors the real Q2
 * task (lib/ali/questionFactory/englishQ2PictureNarrativeFamily.ts).
 */

const VALID_IMAGE = {
  type: "image" as const,
  imageAssetUrl: "/mock-assets/q2-picture-narrative/old-shed-v1.svg",
  altText: "An old, weathered wooden shed at the edge of an overgrown garden.",
  caption: undefined,
};

test("isValidImageStimulus accepts the real old-shed-v1 shape", () => {
  assert.equal(isValidImageStimulus(VALID_IMAGE), true);
});

test("isValidImageStimulus accepts an image with a caption", () => {
  assert.equal(isValidImageStimulus({ ...VALID_IMAGE, caption: "The Old Shed" }), true);
});

test("isValidImageStimulus fails safely on null and undefined", () => {
  assert.equal(isValidImageStimulus(null), false);
  assert.equal(isValidImageStimulus(undefined), false);
});

test("isValidImageStimulus fails safely on an unauthored image (imageAssetUrl: null) -- the exact state every Q2 task was in before migration 246, and any future task not yet completed", () => {
  assert.equal(isValidImageStimulus({ type: "image", imageAssetUrl: null, altText: "pending" }), false);
});

test("isValidImageStimulus fails safely on malformed shapes", () => {
  assert.equal(isValidImageStimulus("just a string"), false, "not an object");
  assert.equal(isValidImageStimulus({}), false, "no type field");
  assert.equal(isValidImageStimulus({ type: "table", imageAssetUrl: "/x.svg", altText: "a" }), false, "wrong type discriminator");
  assert.equal(isValidImageStimulus({ type: "image", imageAssetUrl: "", altText: "a" }), false, "empty imageAssetUrl");
  assert.equal(isValidImageStimulus({ type: "image", imageAssetUrl: "/x.svg", altText: "" }), false, "empty altText");
  assert.equal(isValidImageStimulus({ type: "image", imageAssetUrl: "/x.svg", altText: "a", caption: 5 }), false, "non-string caption");
});

test("selectDisplayUnitImageStimulus returns null when no payload in the unit carries an image stimulus", () => {
  const unit = [payload({ questionId: "x-01", stimulus: null }), payload({ questionId: "x-02", stimulus: null })];
  assert.equal(selectDisplayUnitImageStimulus(unit), null);
});

test("selectDisplayUnitImageStimulus returns the first valid image stimulus, skipping an unauthored (imageAssetUrl: null) one", () => {
  const unit = [
    payload({ questionId: "x-01", stimulus: { type: "image", imageAssetUrl: null, altText: "pending" } }),
    payload({ questionId: "x-02", stimulus: VALID_IMAGE }),
  ];
  assert.deepEqual(selectDisplayUnitImageStimulus(unit), VALID_IMAGE);
});

test("selectDisplayUnitImageStimulus on a standalone (single-payload) unit -- the real Q2 shape", () => {
  assert.equal(selectDisplayUnitImageStimulus([payload({ stimulus: null })]), null);
  assert.deepEqual(selectDisplayUnitImageStimulus([payload({ stimulus: VALID_IMAGE })]), VALID_IMAGE);
});
