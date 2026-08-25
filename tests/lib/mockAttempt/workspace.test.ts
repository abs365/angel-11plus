import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeRemainingSeconds,
  isAttemptExpired,
  formatRemainingTime,
  classifyTimerUrgency,
  buildDisplayUnits,
  buildPalette,
  unansweredUnitIndices,
  payloadMatchesQuestion,
} from "@/lib/mockAttempt/workspace";
import type { MockManifestGroupingEntry } from "@/lib/mockAttempt/types";

/**
 * Programme Increment 008E — pure-function tests for the canonical
 * secure Mock workspace's timer/palette/review logic, extracted from the
 * page component precisely so it gets real node:test coverage in a
 * codebase with no React-rendering test infrastructure.
 */

test("computeRemainingSeconds counts down correctly and never goes negative for a past expiresAt", () => {
  const now = Date.parse("2026-08-18T12:00:00.000Z");
  assert.equal(computeRemainingSeconds("2026-08-18T12:05:00.000Z", now), 300);
  assert.equal(computeRemainingSeconds("2026-08-18T11:55:00.000Z", now), 0);
  assert.equal(computeRemainingSeconds("2026-08-18T12:00:00.000Z", now), 0);
});

test("isAttemptExpired is true exactly when remaining seconds hits 0", () => {
  const now = Date.parse("2026-08-18T12:00:00.000Z");
  assert.equal(isAttemptExpired("2026-08-18T12:00:01.000Z", now), false);
  assert.equal(isAttemptExpired("2026-08-18T12:00:00.000Z", now), true);
  assert.equal(isAttemptExpired("2026-08-18T11:59:00.000Z", now), true);
});

test("formatRemainingTime pads minutes and seconds to two digits", () => {
  assert.equal(formatRemainingTime(0), "00:00");
  assert.equal(formatRemainingTime(5), "00:05");
  assert.equal(formatRemainingTime(65), "01:05");
  assert.equal(formatRemainingTime(3661), "61:01");
});

test("classifyTimerUrgency: calm above 10 minutes, approaching-end from 10 minutes, final-warning from 1 minute", () => {
  assert.equal(classifyTimerUrgency(3600), "normal");
  assert.equal(classifyTimerUrgency(601), "normal");
  assert.equal(classifyTimerUrgency(600), "approaching-end");
  assert.equal(classifyTimerUrgency(61), "approaching-end");
  assert.equal(classifyTimerUrgency(60), "final-warning");
  assert.equal(classifyTimerUrgency(0), "final-warning");
});

/**
 * Mathematics First Mock Form-Assembly Gate (Decision 161) —
 * buildDisplayUnits()/buildPalette()/unansweredUnitIndices() tests.
 * Fixtures mirror the real, already-certified grouped family
 * (mock-mr01mr10-costumeschedule) and real standalone ids, exactly
 * matching this codebase's own established fixture-fidelity discipline.
 */

const NO_GROUPING: MockManifestGroupingEntry[] = [];

function grouping(entries: Partial<MockManifestGroupingEntry>[]): MockManifestGroupingEntry[] {
  return entries.map((e) => ({
    questionId: e.questionId!,
    questionGroupId: e.questionGroupId ?? null,
    groupOrder: e.groupOrder ?? null,
    subpartLabel: e.subpartLabel ?? null,
  }));
}

test("buildDisplayUnits: with no grouping data at all, every id becomes its own standalone unit, unchanged from pre-Decision-161 behaviour", () => {
  const units = buildDisplayUnits(["q1", "q2", "q3"], NO_GROUPING);
  assert.deepEqual(units, [
    { questionIds: ["q1"], questionGroupId: null },
    { questionIds: ["q2"], questionGroupId: null },
    { questionIds: ["q3"], questionGroupId: null },
  ]);
});

test("buildDisplayUnits: the real mock-mr01mr10-costumeschedule family's 4 subparts collapse into exactly 2 display units, standalone ids either side are unaffected", () => {
  const rawIds = [
    "mock-mr02-invdiv-01",
    "mock-mr01mr10-costumeschedule-01a",
    "mock-mr01mr10-costumeschedule-01b",
    "mock-mr01mr10-costumeschedule-02a",
    "mock-mr01mr10-costumeschedule-02b",
    "mock-mr02-invdiv-02",
  ];
  const groupingData = grouping([
    { questionId: "mock-mr01mr10-costumeschedule-01a", questionGroupId: "mock-mr01mr10-costumeschedule-01", groupOrder: 1, subpartLabel: "(a)" },
    { questionId: "mock-mr01mr10-costumeschedule-01b", questionGroupId: "mock-mr01mr10-costumeschedule-01", groupOrder: 2, subpartLabel: "(b)" },
    { questionId: "mock-mr01mr10-costumeschedule-02a", questionGroupId: "mock-mr01mr10-costumeschedule-02", groupOrder: 1, subpartLabel: "(a)" },
    { questionId: "mock-mr01mr10-costumeschedule-02b", questionGroupId: "mock-mr01mr10-costumeschedule-02", groupOrder: 2, subpartLabel: "(b)" },
  ]);
  const units = buildDisplayUnits(rawIds, groupingData);
  assert.equal(units.length, 4);
  assert.deepEqual(units[0], { questionIds: ["mock-mr02-invdiv-01"], questionGroupId: null });
  assert.deepEqual(units[1], {
    questionIds: ["mock-mr01mr10-costumeschedule-01a", "mock-mr01mr10-costumeschedule-01b"],
    questionGroupId: "mock-mr01mr10-costumeschedule-01",
  });
  assert.deepEqual(units[2], {
    questionIds: ["mock-mr01mr10-costumeschedule-02a", "mock-mr01mr10-costumeschedule-02b"],
    questionGroupId: "mock-mr01mr10-costumeschedule-02",
  });
  assert.deepEqual(units[3], { questionIds: ["mock-mr02-invdiv-02"], questionGroupId: null });
});

test("buildDisplayUnits: two DIFFERENT groups appearing consecutively never merge into one unit", () => {
  const groupingData = grouping([
    { questionId: "a1", questionGroupId: "group-a", groupOrder: 1 },
    { questionId: "b1", questionGroupId: "group-b", groupOrder: 1 },
  ]);
  const units = buildDisplayUnits(["a1", "b1"], groupingData);
  assert.deepEqual(units, [
    { questionIds: ["a1"], questionGroupId: "group-a" },
    { questionIds: ["b1"], questionGroupId: "group-b" },
  ]);
});

test("buildDisplayUnits fails closed to standalone: an id with no matching grouping entry is never guessed at, never merged into a neighbour", () => {
  const groupingData = grouping([{ questionId: "q1", questionGroupId: "some-group", groupOrder: 1 }]);
  const units = buildDisplayUnits(["q1", "unknown-id"], groupingData);
  assert.deepEqual(units, [
    { questionIds: ["q1"], questionGroupId: "some-group" },
    { questionIds: ["unknown-id"], questionGroupId: null },
  ]);
});

test("buildPalette reflects answered/flagged/current as independent booleans, in unit order — a grouped unit is answered only when EVERY subpart is answered, flagged when ANY subpart is flagged", () => {
  const units = buildDisplayUnits(
    ["q1", "g-01a", "g-01b", "q3"],
    grouping([
      { questionId: "g-01a", questionGroupId: "g-01", groupOrder: 1 },
      { questionId: "g-01b", questionGroupId: "g-01", groupOrder: 2 },
    ])
  );
  const answered = new Set(["q1", "g-01a"]); // only ONE of the group's two subparts answered
  const flagged = new Set(["g-01b", "q3"]);
  const palette = buildPalette(units, answered, flagged, 1);
  assert.deepEqual(palette, [
    { questionIds: ["q1"], index: 0, answered: true, flagged: false, current: false },
    { questionIds: ["g-01a", "g-01b"], index: 1, answered: false, flagged: true, current: true },
    { questionIds: ["q3"], index: 2, answered: false, flagged: true, current: false },
  ]);
});

test("buildPalette: a grouped unit becomes answered once BOTH subparts are answered", () => {
  const units = buildDisplayUnits(
    ["g-01a", "g-01b"],
    grouping([
      { questionId: "g-01a", questionGroupId: "g-01", groupOrder: 1 },
      { questionId: "g-01b", questionGroupId: "g-01", groupOrder: 2 },
    ])
  );
  const palette = buildPalette(units, new Set(["g-01a", "g-01b"]), new Set(), 0);
  assert.equal(palette[0].answered, true);
});

test("buildPalette with an out-of-range current index marks every entry current: false", () => {
  const units = buildDisplayUnits(["q1"], NO_GROUPING);
  const palette = buildPalette(units, new Set(), new Set(), -1);
  assert.equal(palette[0].current, false);
});

test("unansweredUnitIndices returns exactly the unit indices not yet fully answered, preserving unit order, and treats a partially-answered grouped unit as unanswered", () => {
  const units = buildDisplayUnits(
    ["q1", "g-01a", "g-01b", "q3"],
    grouping([
      { questionId: "g-01a", questionGroupId: "g-01", groupOrder: 1 },
      { questionId: "g-01b", questionGroupId: "g-01", groupOrder: 2 },
    ])
  );
  assert.deepEqual(unansweredUnitIndices(units, new Set(["q1", "g-01a"])), [1, 2]);
  assert.deepEqual(unansweredUnitIndices(units, new Set(["q1", "g-01a", "g-01b", "q3"])), []);
});

test("payloadMatchesQuestion confirms a fetched payload genuinely belongs to the question that was asked for", () => {
  const payload = {
    questionId: "q1",
    subject: "maths",
    skill: "QT-MR-01",
    question: "?",
    marks: 1,
    contentDifficulty: "easy",
    questionGroupId: null,
    groupOrder: null,
    subpartLabel: null,
    stimulus: null,
    sharedStem: null,
  };
  assert.equal(payloadMatchesQuestion(payload, "q1"), true);
  assert.equal(payloadMatchesQuestion(payload, "q2"), false);
});
