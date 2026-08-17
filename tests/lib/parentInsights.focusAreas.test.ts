import { test } from "node:test";
import assert from "node:assert/strict";
import { computeParentReport } from "@/lib/parentInsights";
import { computeAnalytics } from "@/lib/analytics";
import { computeGamification } from "@/lib/gamification";
import type { UserProgress } from "@/types";

/**
 * Educational Increment 007W — Bounded Live-Volatility Investigation,
 * Part 5. Live verification found "Worth focusing on next: WRITING —
 * Writing needs attention" (an actionable card: real href, "Daily"
 * frequency) rendered while Writing has zero Practice Eligible content.
 * The same actionable-card architecture could equally recommend Mock,
 * which was not previously guarded at all. Both are structurally excluded
 * now in lib/parentInsights.ts's buildFocusAreas().
 */

function baseProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    xp: 77,
    streak: 1,
    completedLessons: [],
    scores: {},
    lastActivity: new Date().toISOString(),
    selectedPathwayId: "csse",
    ...overrides,
  };
}

test("Writing is never an actionable focus area for CSSE, even when legacy evidence marks it weak", () => {
  const p = baseProgress({
    completedLessons: ["writing-wrt-001", "eng-001", "eng-002", "maths-reasoning"],
    scores: { "writing-wrt-001": 0, "eng-001": 90, "eng-002": 92, "maths-reasoning": 88 },
  });
  const report = computeAnalytics(p);
  const gamification = computeGamification(p);
  const parentReport = computeParentReport(p, report, gamification);

  for (const area of parentReport.focusAreas) {
    assert.notEqual(area.label, "Writing", "Writing must never be recommended as an actionable focus area while Practice Eligible = 0");
  }
});

test("Mock is never an actionable focus area for CSSE, even with 4+ sessions and no mock attempted", () => {
  const p = baseProgress({
    completedLessons: ["eng-001", "eng-002", "maths-1", "maths-2"],
    scores: { "eng-001": 80, "eng-002": 82, "maths-1": 75, "maths-2": 78 },
  });
  const report = computeAnalytics(p);
  const gamification = computeGamification(p);
  const parentReport = computeParentReport(p, report, gamification);

  for (const area of parentReport.focusAreas) {
    assert.notEqual(area.label, "Mock Test", "Mock must never be recommended as an actionable focus area while Mock Eligible = 0");
  }
});

test("a non-CSSE pathway is unaffected by the CSSE-specific Writing/Mock exclusion", () => {
  const p = baseProgress({
    selectedPathwayId: "independent",
    completedLessons: ["writing-wrt-001"],
    scores: { "writing-wrt-001": 0 },
  });
  const report = computeAnalytics(p);
  const gamification = computeGamification(p);
  // Only asserting this does not throw and produces a report -- the
  // independent pathway's own Writing content availability is out of this
  // increment's scope.
  const parentReport = computeParentReport(p, report, gamification);
  assert.ok(Array.isArray(parentReport.focusAreas));
});
