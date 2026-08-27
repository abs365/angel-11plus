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
  determineMockResumeAction,
  computeResumeStartIndex,
} from "@/lib/mockAttempt/workspace";
import type { MockManifestGroupingEntry, ResumableMockAttempt } from "@/lib/mockAttempt/types";

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

// === Decision 217 (Mathematics Mock 1 attempt-resume remediation) ===

function resumable(overrides: Partial<ResumableMockAttempt>): ResumableMockAttempt {
  return { attemptId: "attempt-1", status: "in_progress", startedAt: "2026-08-27T09:00:00.000Z", expiresAt: "2026-08-27T10:00:00.000Z", isExpired: false, ...overrides };
}

test("determineMockResumeAction: no resumable attempt -> create_new (byte-identical to pre-217 behaviour)", () => {
  assert.deepEqual(determineMockResumeAction(null), { kind: "create_new" });
});

test("determineMockResumeAction: an expired attempt is ALWAYS finalize_expired, regardless of its own status -- never resumed as though time remains", () => {
  assert.deepEqual(determineMockResumeAction(resumable({ status: "in_progress", isExpired: true })), { kind: "finalize_expired", attemptId: "attempt-1" });
  assert.deepEqual(determineMockResumeAction(resumable({ status: "assigned", isExpired: true })), { kind: "finalize_expired", attemptId: "attempt-1" });
});

test("determineMockResumeAction: a never-started ('assigned'), non-expired attempt -> start_fresh", () => {
  assert.deepEqual(determineMockResumeAction(resumable({ status: "assigned", isExpired: false })), { kind: "start_fresh", attemptId: "attempt-1" });
});

test("determineMockResumeAction: an already-running ('in_progress'), non-expired attempt -> resume_in_progress, carrying the real expiresAt through unchanged", () => {
  assert.deepEqual(
    determineMockResumeAction(resumable({ status: "in_progress", isExpired: false, expiresAt: "2026-08-27T11:30:00.000Z" })),
    { kind: "resume_in_progress", attemptId: "attempt-1", expiresAt: "2026-08-27T11:30:00.000Z" }
  );
});

test("determineMockResumeAction: resume_in_progress falls back to an empty string expiresAt only if the lookup itself somehow returned null -- never invents a fabricated deadline", () => {
  assert.deepEqual(
    determineMockResumeAction(resumable({ status: "in_progress", isExpired: false, expiresAt: null })),
    { kind: "resume_in_progress", attemptId: "attempt-1", expiresAt: "" }
  );
});

test("determineMockResumeAction: the returned action never carries any identity/security field beyond the attempt id -- ResumableMockAttempt itself has no learner-identity field to leak", () => {
  const action = determineMockResumeAction(resumable({}));
  assert.deepEqual(Object.keys(action).sort(), ["attemptId", "expiresAt", "kind"]);
});

test("computeResumeStartIndex: an attempt with no answers yet lands on unit 0 -- identical to a fresh start", () => {
  const units = [{ questionIds: ["q1"], questionGroupId: null }, { questionIds: ["q2"], questionGroupId: null }];
  assert.equal(computeResumeStartIndex(units, new Set()), 0);
});

test("computeResumeStartIndex: lands on the first genuinely unanswered unit, not the last-visited one (no such state exists to restore)", () => {
  const units = [
    { questionIds: ["q1"], questionGroupId: null },
    { questionIds: ["g-01a", "g-01b"], questionGroupId: "g" },
    { questionIds: ["q3"], questionGroupId: null },
  ];
  assert.equal(computeResumeStartIndex(units, new Set(["q1"])), 1);
  // A grouped unit only counts as answered once EVERY subpart is answered.
  assert.equal(computeResumeStartIndex(units, new Set(["q1", "g-01a"])), 1);
  assert.equal(computeResumeStartIndex(units, new Set(["q1", "g-01a", "g-01b"])), 2);
});

test("computeResumeStartIndex: every unit already answered falls back to 0, never undefined/out-of-range", () => {
  const units = [{ questionIds: ["q1"], questionGroupId: null }, { questionIds: ["q2"], questionGroupId: null }];
  assert.equal(computeResumeStartIndex(units, new Set(["q1", "q2"])), 0);
});

test("END-TO-END RESUME SIMULATION: start, answer several, simulate a full refresh (fresh reconstruction from persisted state only), locate the existing attempt, restore, verify remaining time, continue, change an answer, then finalise", () => {
  const units = [
    { questionIds: ["q1"], questionGroupId: null },
    { questionIds: ["q2"], questionGroupId: null },
    { questionIds: ["g-01a", "g-01b"], questionGroupId: "g" },
    { questionIds: ["q4"], questionGroupId: null },
  ];
  const startedAt = "2026-08-27T09:00:00.000Z";
  const expiresAt = "2026-08-27T10:00:00.000Z"; // 60 minutes

  // --- Session 1: start, answer q1 and q2, then "lose" the tab (no submit, no refresh handling) ---
  const persistedAnswers = new Map<string, string>([["q1", "44.8"], ["q2", "87"]]);
  const answeredIds1 = new Set(persistedAnswers.keys());
  assert.equal(computeResumeStartIndex(units, answeredIds1), 2, "after answering q1/q2, the next unanswered unit is the grouped one");

  // --- Simulated full refresh: React state is gone; only the server's own
  // resumable-attempt lookup and persisted answers survive. ---
  const lookupResult = resumable({ status: "in_progress", isExpired: false, startedAt, expiresAt });
  const action = determineMockResumeAction(lookupResult);
  assert.deepEqual(action, { kind: "resume_in_progress", attemptId: "attempt-1", expiresAt });
  assert.notEqual(action.kind, "create_new", "a genuine in-progress attempt must never be silently re-created after refresh");

  // Remaining time is derived purely from the server's own real expiresAt
  // -- not reset by the refresh, not recomputed from a fresh 60-minute
  // budget. 20 minutes have elapsed since startedAt.
  const simulatedNow = Date.parse("2026-08-27T09:20:00.000Z");
  const remaining = computeRemainingSeconds(action.kind === "resume_in_progress" ? action.expiresAt : "", simulatedNow);
  assert.equal(remaining, 40 * 60, "40 minutes of the original 60 must remain, not a fresh 60");
  assert.equal(isAttemptExpired(expiresAt, simulatedNow), false);

  // Restore: reconstruct answered ids from the reloaded persisted map (the
  // exact mechanism getMockAttemptAnswers()/answeredValuesRef provide) and
  // land on the same deterministic position as before the refresh.
  const restoredAnsweredIds = new Set(persistedAnswers.keys());
  assert.deepEqual(restoredAnsweredIds, answeredIds1);
  assert.equal(computeResumeStartIndex(units, restoredAnsweredIds), 2);

  // --- Continue: answer the grouped unit, then change q1's own answer ---
  persistedAnswers.set("g-01a", "16:35");
  persistedAnswers.set("g-01b", "12.00");
  persistedAnswers.set("q1", "44.80"); // edited -- overwrites, not duplicates
  assert.equal(persistedAnswers.size, 4, "editing an existing answer must never create a second entry for the same question");
  const answeredIds2 = new Set(persistedAnswers.keys());
  assert.equal(computeResumeStartIndex(units, answeredIds2), 3, "next unanswered is now the final unit");

  // --- Finalise: answer q4, everything answered ---
  persistedAnswers.set("q4", "170");
  const answeredIds3 = new Set(persistedAnswers.keys());
  assert.deepEqual(unansweredUnitIndices(units, answeredIds3), [], "every unit answered -- ready to submit");
});

test("END-TO-END: repeated refresh (start, refresh, refresh again) always resolves to the SAME single attempt, never a duplicate", () => {
  const lookupResult = resumable({ status: "in_progress", isExpired: false });
  const firstRefresh = determineMockResumeAction(lookupResult);
  const secondRefresh = determineMockResumeAction(lookupResult);
  assert.deepEqual(firstRefresh, secondRefresh);
  assert.equal(firstRefresh.kind, "resume_in_progress");
  if (firstRefresh.kind === "resume_in_progress" && secondRefresh.kind === "resume_in_progress") {
    assert.equal(firstRefresh.attemptId, secondRefresh.attemptId, "one attempt only, however many times the lookup is repeated");
  }
});

test("END-TO-END: an already-submitted attempt is never surfaced as resumable -- mock_get_resumable_attempt()'s own query never returns 'submitted' status, so determineMockResumeAction is never even called with one; a caller reaching this point with none found correctly falls through to create_new", () => {
  // No 'submitted' ResumableMockAttempt fixture exists to pass here by
  // construction -- the type itself only permits 'assigned'/'in_progress'
  // (see ResumableMockAttempt's own docstring) -- so the only reachable
  // "nothing resumable" state is null, proven above to route to create_new.
  assert.deepEqual(determineMockResumeAction(null), { kind: "create_new" });
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
