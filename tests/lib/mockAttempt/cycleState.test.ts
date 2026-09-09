import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveMockCycleSittingState } from "@/lib/mockAttempt/cycleState";
import type { MockCycleAttemptRow } from "@/lib/mockAttempt/client";

function attempt(overrides: Partial<MockCycleAttemptRow>): MockCycleAttemptRow {
  return { attemptId: "a1", subject: "mathematics", status: "in_progress", submittedAt: null, ...overrides };
}

test("neither paper started -- both not_started, sitting not complete", () => {
  const state = deriveMockCycleSittingState("cycle-1", []);
  assert.equal(state.mathematics.paperState, "not_started");
  assert.equal(state.english.paperState, "not_started");
  assert.equal(state.sittingComplete, false);
});

test("English in progress, Mathematics not started -- sitting not complete (acceptance gate K)", () => {
  const state = deriveMockCycleSittingState("cycle-1", [attempt({ attemptId: "e1", subject: "english", status: "in_progress" })]);
  assert.equal(state.english.paperState, "in_progress");
  assert.equal(state.mathematics.paperState, "not_started");
  assert.equal(state.sittingComplete, false);
});

test("English submitted alone does NOT complete the sitting (acceptance gate K)", () => {
  const state = deriveMockCycleSittingState("cycle-1", [
    attempt({ attemptId: "e1", subject: "english", status: "submitted", submittedAt: "2026-09-09T10:00:00Z" }),
  ]);
  assert.equal(state.english.paperState, "submitted");
  assert.equal(state.mathematics.paperState, "not_started");
  assert.equal(state.sittingComplete, false);
});

test("Mathematics submitted alone does NOT represent a complete two-paper sitting (acceptance gate L)", () => {
  const state = deriveMockCycleSittingState("cycle-1", [
    attempt({ attemptId: "m1", subject: "mathematics", status: "submitted", submittedAt: "2026-09-09T10:00:00Z" }),
  ]);
  assert.equal(state.mathematics.paperState, "submitted");
  assert.equal(state.english.paperState, "not_started");
  assert.equal(state.sittingComplete, false);
});

test("both papers submitted -- sitting complete (acceptance gate O)", () => {
  const state = deriveMockCycleSittingState("cycle-1", [
    attempt({ attemptId: "m1", subject: "mathematics", status: "submitted", submittedAt: "2026-09-09T09:00:00Z" }),
    attempt({ attemptId: "e1", subject: "english", status: "submitted", submittedAt: "2026-09-09T10:00:00Z" }),
  ]);
  assert.equal(state.sittingComplete, true);
  assert.equal(state.mathematics.attemptId, "m1");
  assert.equal(state.english.attemptId, "e1");
});

test("an expired-but-not-yet-finalised attempt is never treated as submitted -- refresh/resume safety (acceptance gate M)", () => {
  const state = deriveMockCycleSittingState("cycle-1", [attempt({ attemptId: "e1", subject: "english", status: "expired" })]);
  assert.equal(state.english.paperState, "in_progress");
  assert.equal(state.sittingComplete, false);
});

test("an attempt with a null/unrecognised subject is ignored by both subject readers -- fails closed, never misattributed", () => {
  const state = deriveMockCycleSittingState("cycle-1", [attempt({ attemptId: "x1", subject: null, status: "submitted" })]);
  assert.equal(state.mathematics.paperState, "not_started");
  assert.equal(state.english.paperState, "not_started");
});
