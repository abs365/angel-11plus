import { test } from "node:test";
import assert from "node:assert/strict";
import { applyCanonicalWritingEvidence } from "@/lib/learningEngine/preparationState";
import type { AnalyticsReport } from "@/types/analytics";

/**
 * Educational Increment 007V, Part 8/9/10 — the one bounded, real
 * integration this increment ships: correcting the legacy report's
 * Writing entry with real ALI evidence, closing the exact live gap
 * Decision 74 disclosed (a real production observation: "Writing needs
 * attention" rendered from an unrelated legacy pathway's own score while
 * real CSSE Writing evidence was `no_evidence`).
 */

function baseReport(overrides: Partial<AnalyticsReport> = {}): AnalyticsReport {
  return {
    subjects: [
      { subject: "english", label: "English", color: "purple", attempts: 3, avgScore: 90, bestScore: 95, status: "strong" },
      { subject: "writing", label: "Writing", color: "orange", attempts: 1, avgScore: 20, bestScore: 20, status: "weak" },
    ],
    skills: [],
    insights: [
      { id: "1", type: "weakness", title: "Writing needs attention", body: "Use the checklist actively...", color: "red", priority: 18 },
      { id: "2", type: "strength", title: "English is a strength", body: "Keep it up.", color: "green", priority: 8 },
    ],
    overallScore: 55,
    totalSessions: 4,
    weakSubjects: ["Writing"],
    strongSubjects: ["English"],
    notStartedSubjects: [],
    nextRecommendation: null,
    hasEnoughData: true,
    ...overrides,
  };
}

test("real no_evidence overrides a legacy 'weak' Writing signal: status, insight, and weak/not-started lists all corrected", () => {
  const report = baseReport();
  const corrected = applyCanonicalWritingEvidence(report, "no_evidence");

  const writing = corrected.subjects.find((s) => s.subject === "writing")!;
  assert.equal(writing.status, "not-started");
  assert.equal(writing.attempts, 0);
  assert.equal(writing.avgScore, 0);

  assert.ok(!corrected.insights.some((i) => i.title === "Writing needs attention"), "the false weak-Writing insight must be removed");
  assert.ok(corrected.insights.some((i) => i.title === "English is a strength"), "unrelated insights must survive untouched");

  assert.ok(!corrected.weakSubjects.includes("Writing"));
  assert.ok(corrected.notStartedSubjects.includes("Writing"));
});

test("when real evidence already agrees with the legacy signal (Writing genuinely not-started), this is a pure no-op", () => {
  const report = baseReport({
    subjects: [
      { subject: "english", label: "English", color: "purple", attempts: 3, avgScore: 90, bestScore: 95, status: "strong" },
      { subject: "writing", label: "Writing", color: "orange", attempts: 0, avgScore: 0, bestScore: 0, status: "not-started" },
    ],
    insights: [{ id: "2", type: "strength", title: "English is a strength", body: "Keep it up.", color: "green", priority: 8 }],
    weakSubjects: [],
  });
  const corrected = applyCanonicalWritingEvidence(report, "no_evidence");
  assert.deepEqual(corrected, report, "must be byte-identical when there is nothing to correct");
});

test("real developing/established Writing evidence never triggers the override, even if the legacy signal looks weak", () => {
  const report = baseReport();
  const correctedDeveloping = applyCanonicalWritingEvidence(report, "developing_evidence");
  assert.deepEqual(correctedDeveloping, report, "genuine developing evidence must not be silently erased");

  const correctedEstablished = applyCanonicalWritingEvidence(report, "established_evidence");
  assert.deepEqual(correctedEstablished, report, "genuine established evidence must not be silently erased");
});

test("a report with no writing subject entry at all is left untouched", () => {
  const report = baseReport({ subjects: [{ subject: "english", label: "English", color: "purple", attempts: 3, avgScore: 90, bestScore: 95, status: "strong" }] });
  const corrected = applyCanonicalWritingEvidence(report, "no_evidence");
  assert.deepEqual(corrected, report);
});
