import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAnalytics } from "../../lib/analytics";
import type { UserProgress } from "../../types";

/**
 * Completion Assurance Programme, Completion C, Part 9 (D, E, F, G, H) —
 * regression tests for the two proven root causes: (1) Subject Breakdown
 * was blind to the canonical Practice engine's `practice-${areaId}` ids,
 * so it could show a subject as "not started" while Completed Sessions
 * already counted a real session for it; (2) Subject Breakdown always
 * showed all 9 hard-coded subjects, including reasoning subjects a
 * learner's selected pathway (e.g. CSSE) has already deliberately
 * excluded. Tests assert the learner/parent-facing contract (what
 * appears in report.subjects, not implementation internals).
 */

function baseProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    xp: 0,
    streak: 1,
    completedLessons: [],
    scores: {},
    lastActivity: new Date().toISOString(),
    ...overrides,
  };
}

test("D — a CSSE learner with zero reasoning activity does not receive excluded reasoning subjects as ordinary current subjects", () => {
  const p = baseProgress({
    selectedPathwayId: "csse",
    completedLessons: ["practice-mathematics"],
    scores: { "practice-mathematics": 80 },
  });
  const report = computeAnalytics(p);
  const reasoningSubjects = report.subjects.filter((s) =>
    ["verbal-reasoning", "non-verbal-reasoning", "spatial-reasoning", "numerical-reasoning"].includes(s.subject)
  );
  assert.equal(reasoningSubjects.length, 0, "CSSE excludes reasoning entirely; none should appear with zero attempts");
});

test("D (continued) — Mock Test is unaffected by the pathway-eligibility filter (it is deliberately not pathway-gated)", () => {
  const p = baseProgress({ selectedPathwayId: "csse" });
  const report = computeAnalytics(p);
  assert.ok(report.subjects.some((s) => s.subject === "mock-test"), "Mock Test must still appear even though it is absent from every pathway's eligible-subject list");
});

test("E — legitimate historical reasoning evidence is preserved, not destroyed, even under a pathway that now excludes it", () => {
  const p = baseProgress({
    selectedPathwayId: "csse",
    completedLessons: ["verbal-reasoning"],
    scores: { "verbal-reasoning": 72 },
  });
  const report = computeAnalytics(p);
  const vr = report.subjects.find((s) => s.subject === "verbal-reasoning");
  assert.ok(vr, "real historical evidence must not be silently deleted from the report");
  assert.equal(vr!.attempts, 1);
  assert.equal(vr!.avgScore, 72);
});

test("E (continued) — a GL pathway learner (reasoning is genuinely eligible) sees reasoning subjects normally, with or without attempts", () => {
  const p = baseProgress({ selectedPathwayId: "gl" });
  const report = computeAnalytics(p);
  assert.ok(report.subjects.some((s) => s.subject === "verbal-reasoning"), "GL eligibility must be unaffected by the CSSE-driven correction");
});

test("F — Subject Breakdown and Completed Sessions now reconcile for a canonical Practice session (the exact external-review contradiction)", () => {
  const p = baseProgress({
    completedLessons: ["practice-mathematics"],
    scores: { "practice-mathematics": 85 },
  });
  const report = computeAnalytics(p);
  const maths = report.subjects.find((s) => s.subject === "maths");
  assert.equal(p.completedLessons.length, 1, "Completed Sessions count");
  assert.equal(maths!.attempts, 1, "Subject Breakdown must count the same real session Completed Sessions already counts");
  assert.notEqual(maths!.status, "not-started", "must not contradict Completed Sessions by claiming Maths was never started");
});

test("F (continued) — the same reconciliation holds for English and Writing practice sessions", () => {
  const p = baseProgress({
    completedLessons: ["practice-reading-comprehension", "practice-continuous-writing"],
    scores: { "practice-reading-comprehension": 70, "practice-continuous-writing": 60 },
  });
  const report = computeAnalytics(p);
  assert.equal(report.subjects.find((s) => s.subject === "english")!.attempts, 1);
  assert.equal(report.subjects.find((s) => s.subject === "writing")!.attempts, 1);
});

test("G — a zero-data learner's report stays calm and truthful: no crash, no fabricated attempts, hasEnoughData is false", () => {
  const p = baseProgress();
  const report = computeAnalytics(p);
  assert.equal(report.hasEnoughData, false);
  assert.equal(report.totalSessions, 0);
  assert.ok(report.subjects.every((s) => s.attempts === 0));
});

test("H — existing legacy Mathematics and English activity remains visible and unaffected by this correction", () => {
  const p = baseProgress({
    completedLessons: ["eng-001", "maths-arithmetic"],
    scores: { "eng-001": 90, "maths-arithmetic": 88 },
  });
  const report = computeAnalytics(p);
  assert.equal(report.subjects.find((s) => s.subject === "english")!.attempts, 1);
  assert.equal(report.subjects.find((s) => s.subject === "maths")!.attempts, 1);
});
