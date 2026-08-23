import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isGroupedItem,
  marksOf,
  groupQuestionsByGroupId,
  sortGroupMembers,
  computeGroupMarks,
} from "../../../lib/ali/assessmentHierarchy";
import type { BankQuestion } from "../../../types/ali/questionBank";

/**
 * Mock Programme Increment 005 (Decision 148). Pure-function tests for
 * the grouped-question representation, with no live database -- mirrors
 * this project's own established convention (tests/lib/ali/mockEligibility.test.ts).
 */

function makeQuestion(overrides: Partial<BankQuestion> & { id: string }): BankQuestion {
  return {
    subject: "maths",
    skill: "mr.arithmetic",
    pathway: ["csse"],
    contentDifficulty: "medium",
    questionType: "short-answer",
    estimatedTimeSeconds: 60,
    prompt: {
      id: overrides.id,
      question: "2 + 2?",
      answer: 4,
      skill: "mr.arithmetic",
      difficulty: "medium",
      marks: 1,
    } as unknown as BankQuestion["prompt"],
    explanation: "Because 2 + 2 = 4.",
    confidenceWeight: 1,
    revisionPriority: 3,
    masteryThreshold: 2,
    usageCount: 0,
    avgSuccessRate: null,
    learningUnitId: overrides.id,
    ...overrides,
  };
}

// --- isGroupedItem / marksOf ------------------------------------------------

test("a standalone item (no questionGroupId) is not a grouped item -- current, unchanged meaning of every existing row", () => {
  assert.equal(isGroupedItem(makeQuestion({ id: "mth-001" })), false);
});

test("a row with a questionGroupId is a grouped item", () => {
  assert.equal(isGroupedItem(makeQuestion({ id: "mth-q7a", questionGroupId: "mth-q7" })), true);
});

test("an empty-string questionGroupId is not treated as grouped", () => {
  assert.equal(isGroupedItem(makeQuestion({ id: "mth-001", questionGroupId: "" })), false);
});

test("marksOf reads the existing prompt.marks field, no second representation invented", () => {
  const q = makeQuestion({
    id: "mth-001",
    prompt: { id: "mth-001", question: "x", answer: 1, skill: "s", difficulty: "medium", marks: 3 } as unknown as BankQuestion["prompt"],
  });
  assert.equal(marksOf(q), 3);
});

test("marksOf returns undefined, never a guessed default, when prompt carries no marks field", () => {
  const q = makeQuestion({ id: "mth-001", prompt: { id: "mth-001", word: "x", question: "y", options: [], correctAnswer: "y", skill: "s" } as unknown as BankQuestion["prompt"] });
  assert.equal(marksOf(q), undefined);
});

// --- groupQuestionsByGroupId / sortGroupMembers -----------------------------

test("a Mathematics numbered question with (a)/(b)/(c) subparts groups correctly, in declared order", () => {
  const pool: BankQuestion[] = [
    makeQuestion({ id: "mth-q7-a", questionGroupId: "mth-q7", groupOrder: 1, subpartLabel: "(a)" }),
    makeQuestion({ id: "mth-q7-b", questionGroupId: "mth-q7", groupOrder: 2, subpartLabel: "(b)" }),
    makeQuestion({ id: "mth-q7-c", questionGroupId: "mth-q7", groupOrder: 3, subpartLabel: "(c)" }),
  ];
  const grouped = groupQuestionsByGroupId(pool);
  assert.equal(grouped.size, 1);
  const members = grouped.get("mth-q7")!;
  assert.deepEqual(members.map((m) => m.id), ["mth-q7-a", "mth-q7-b", "mth-q7-c"]);
});

test("a standalone Mathematics numbered question (no questionGroupId) is excluded from grouping entirely", () => {
  const pool: BankQuestion[] = [makeQuestion({ id: "mth-q4" })];
  assert.equal(groupQuestionsByGroupId(pool).size, 0);
});

test("ordering is deterministic even when input array order is scrambled", () => {
  const pool: BankQuestion[] = [
    makeQuestion({ id: "eng-q6-c", questionGroupId: "eng-q6", groupOrder: 3 }),
    makeQuestion({ id: "eng-q6-a", questionGroupId: "eng-q6", groupOrder: 1 }),
    makeQuestion({ id: "eng-q6-b", questionGroupId: "eng-q6", groupOrder: 2 }),
  ];
  const members = groupQuestionsByGroupId(pool).get("eng-q6")!;
  assert.deepEqual(members.map((m) => m.id), ["eng-q6-a", "eng-q6-b", "eng-q6-c"]);
});

test("two rows sharing a groupOrder tie-break deterministically by id, never by array/fetch order", () => {
  const pool: BankQuestion[] = [
    makeQuestion({ id: "eng-q6-z", questionGroupId: "eng-q6", groupOrder: 1 }),
    makeQuestion({ id: "eng-q6-a", questionGroupId: "eng-q6", groupOrder: 1 }),
  ];
  const membersFirstOrder = groupQuestionsByGroupId(pool).get("eng-q6")!;
  const membersReversed = groupQuestionsByGroupId([...pool].reverse()).get("eng-q6")!;
  assert.deepEqual(membersFirstOrder.map((m) => m.id), ["eng-q6-a", "eng-q6-z"]);
  assert.deepEqual(membersReversed.map((m) => m.id), ["eng-q6-a", "eng-q6-z"]);
});

test("multiple distinct groups in one pool are kept fully separate", () => {
  const pool: BankQuestion[] = [
    makeQuestion({ id: "mth-q7-a", questionGroupId: "mth-q7", groupOrder: 1 }),
    makeQuestion({ id: "mth-q9-a", questionGroupId: "mth-q9", groupOrder: 1 }),
    makeQuestion({ id: "mth-q7-b", questionGroupId: "mth-q7", groupOrder: 2 }),
  ];
  const grouped = groupQuestionsByGroupId(pool);
  assert.equal(grouped.size, 2);
  assert.deepEqual(grouped.get("mth-q7")!.map((m) => m.id), ["mth-q7-a", "mth-q7-b"]);
  assert.deepEqual(grouped.get("mth-q9")!.map((m) => m.id), ["mth-q9-a"]);
});

test("sortGroupMembers reproduces the same ordering standalone, without re-deriving grouping", () => {
  const members = [
    { id: "b", questionGroupId: "g", groupOrder: 2 },
    { id: "a", questionGroupId: "g", groupOrder: 1 },
  ];
  assert.deepEqual(sortGroupMembers(members).map((m) => m.id), ["a", "b"]);
});

// --- computeGroupMarks -------------------------------------------------------

test("an English comprehension question group (6(a) judgement 1 mark + 6(b) three quotation/explanation components at 2 marks each) aggregates to the correct total", () => {
  const pool: BankQuestion[] = [
    makeQuestion({
      id: "eng-q6-a",
      questionGroupId: "eng-q6",
      groupOrder: 1,
      subpartLabel: "(a)",
      prompt: { id: "eng-q6-a", question: "Judgement?", skill: "s", marks: 1 } as unknown as BankQuestion["prompt"],
    }),
    ...["i", "ii", "iii"].map((suffix, idx) =>
      makeQuestion({
        id: `eng-q6-b-${suffix}`,
        questionGroupId: "eng-q6",
        groupOrder: idx + 2,
        subpartLabel: `(b)-${suffix}`,
        prompt: { id: `eng-q6-b-${suffix}`, question: "Quotation + explanation?", skill: "s", marks: 2 } as unknown as BankQuestion["prompt"],
      })
    ),
  ];
  const members = groupQuestionsByGroupId(pool).get("eng-q6")!;
  const { totalMarks, unresolvedCount } = computeGroupMarks(members);
  assert.equal(totalMarks, 7);
  assert.equal(unresolvedCount, 0);
});

test("a member with no resolvable marks is reported as unresolved, never silently defaulted or dropped", () => {
  const members = [
    { id: "a", questionGroupId: "g", groupOrder: 1, marks: 2 },
    { id: "b", questionGroupId: "g", groupOrder: 2, marks: undefined },
  ];
  const { totalMarks, unresolvedCount } = computeGroupMarks(members);
  assert.equal(totalMarks, 2);
  assert.equal(unresolvedCount, 1);
});

test("grouped structure cannot corrupt paper scoring: a standalone item's own marks are unaffected by an unrelated group existing in the same pool", () => {
  const pool: BankQuestion[] = [
    makeQuestion({
      id: "mth-q4",
      prompt: { id: "mth-q4", question: "x", answer: 1, skill: "s", difficulty: "medium", marks: 5 } as unknown as BankQuestion["prompt"],
    }),
    makeQuestion({
      id: "mth-q7-a",
      questionGroupId: "mth-q7",
      groupOrder: 1,
      prompt: { id: "mth-q7-a", question: "y", answer: 1, skill: "s", difficulty: "medium", marks: 2 } as unknown as BankQuestion["prompt"],
    }),
  ];
  const standalone = pool.find((q) => q.id === "mth-q4")!;
  assert.equal(isGroupedItem(standalone), false);
  assert.equal(marksOf(standalone), 5);
});
