import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeRemainingSeconds,
  isAttemptExpired,
  formatRemainingTime,
  classifyTimerUrgency,
  buildPalette,
  unansweredQuestionIds,
  payloadMatchesQuestion,
} from "@/lib/mockAttempt/workspace";

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

test("buildPalette reflects answered/flagged/current as independent booleans, in manifest order", () => {
  const assigned = ["q1", "q2", "q3"];
  const answered = new Set(["q1", "q3"]);
  const flagged = new Set(["q2", "q3"]);
  const palette = buildPalette(assigned, answered, flagged, "q2");
  assert.deepEqual(palette, [
    { questionId: "q1", index: 0, answered: true, flagged: false, current: false },
    { questionId: "q2", index: 1, answered: false, flagged: true, current: true },
    { questionId: "q3", index: 2, answered: true, flagged: true, current: false },
  ]);
});

test("buildPalette with no current question marks every entry current: false", () => {
  const palette = buildPalette(["q1"], new Set(), new Set(), null);
  assert.equal(palette[0].current, false);
});

test("unansweredQuestionIds returns exactly the assigned ids not yet answered, preserving manifest order", () => {
  assert.deepEqual(unansweredQuestionIds(["q1", "q2", "q3"], new Set(["q2"])), ["q1", "q3"]);
  assert.deepEqual(unansweredQuestionIds(["q1", "q2"], new Set(["q1", "q2"])), []);
  assert.deepEqual(unansweredQuestionIds(["q1"], new Set()), ["q1"]);
});

test("payloadMatchesQuestion confirms a fetched payload genuinely belongs to the question that was asked for", () => {
  const payload = { questionId: "q1", subject: "maths", skill: "QT-MR-01", question: "?", marks: 1, contentDifficulty: "easy" };
  assert.equal(payloadMatchesQuestion(payload, "q1"), true);
  assert.equal(payloadMatchesQuestion(payload, "q2"), false);
});
