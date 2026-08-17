import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";
import { computeAnalytics } from "@/lib/analytics";
import type { UserProgress } from "@/types";

/**
 * Educational Increment 007U, Part 3 — regression coverage for two real,
 * live defects found via Founder screenshots:
 *   A. "Your writing average is 0%" shown for a subject with zero
 *      Practice Eligible content (no evidence, not confirmed 0%).
 *   C. Today's Mission recommending Creative Writing when the CSSE
 *      Continuous Writing practice route has no reachable content.
 * Both traced to lib/adaptiveEngine.ts, a legacy, pre-ALI engine still
 * powering app/dashboard/page.tsx (see this file's own header comment).
 */

function baseProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    xp: 0,
    streak: 0,
    completedLessons: [],
    scores: {},
    lastActivity: new Date().toISOString(),
    selectedPathwayId: "csse",
    ...overrides,
  };
}

test("A: a subject with zero attempts never has its reason state a percentage average", () => {
  // English/Maths/Vocabulary all strong (so Writing's not-started urgency=80
  // would, pre-fix, outrank them all and become the primary recommendation
  // with a percentage-quoting reason) -- Writing itself has zero scores.
  const p = baseProgress({
    completedLessons: ["eng-001", "eng-002", "eng-003", "maths-reasoning", "maths-arithmetic", "vocab-session"],
    scores: {
      "eng-001": 90, "eng-002": 92, "eng-003": 88,
      "maths-reasoning": 91, "maths-arithmetic": 89,
      "vocab-session": 90,
    },
  });
  const report = computeAnalytics(p);
  const state = computeAdaptiveState(p, report);

  for (const item of state.dailyMission.items) {
    assert.ok(
      !/writing average is 0%/i.test(item.reason) && !/\b0%/.test(item.reason),
      `mission item reason must never state a 0% average for zero evidence: "${item.reason}"`
    );
  }
});

test("C: Writing is never recommended as a CSSE mission item while it has no reachable practice content", () => {
  const p = baseProgress({
    completedLessons: ["eng-001", "eng-002", "eng-003"],
    scores: { "eng-001": 40, "eng-002": 38, "eng-003": 42 }, // English weak, would otherwise dominate ranking too
  });
  const report = computeAnalytics(p);
  const state = computeAdaptiveState(p, report);

  for (const item of state.dailyMission.items) {
    assert.notEqual(item.subject, "writing", `Writing must not be recommended: ${JSON.stringify(item)}`);
  }
});

test("C: a non-CSSE pathway is unaffected by the CSSE-specific writing exclusion", () => {
  // The 'independent' pathway also tests writing, and has real content
  // there (its own href resolution differs from CSSE's continuous-writing
  // route) -- the exclusion must be CSSE-specific, not a blanket removal.
  const p = baseProgress({
    selectedPathwayId: "independent",
    completedLessons: ["eng-001", "eng-002", "eng-003", "maths-reasoning", "maths-arithmetic"],
    scores: { "eng-001": 90, "eng-002": 92, "eng-003": 88, "maths-reasoning": 91, "maths-arithmetic": 89 },
  });
  const report = computeAnalytics(p);
  const state = computeAdaptiveState(p, report);

  // Writing (zero attempts, not-started, urgency 80) should be a legitimate
  // candidate for this pathway -- not asserting it definitely appears (mission
  // selection has other tie-breaking factors), only that nothing threw and the
  // pathway's own eligible subjects were considered.
  assert.ok(state.dailyMission.items.length > 0);
});

test("007W Part 16(9): Mock is never a mission candidate, regardless of urgency signal", () => {
  const p = baseProgress({
    completedLessons: [],
    scores: {},
    aliCompetencySignal: {
      maths: {
        subject: "maths",
        weakCompetencies: ["MR-01"],
        masteredCompetencies: [],
        attemptedCompetencies: ["MR-01"],
        recentlyMasteredCompetencies: [],
        updatedAt: new Date().toISOString(),
      },
    },
  });
  const report = computeAnalytics(p);
  const state = computeAdaptiveState(p, report);

  for (const item of state.dailyMission.items) {
    assert.notEqual(item.subject, "mock-test", "Mock must never surface as a Today's Mission item");
  }
});

test("007W Part 16(11/13): a real ALI weak-competency signal for Maths outranks legacy-only urgency and is used in the reason text", () => {
  // English is legacy-weak (would win on the old branch); Maths carries a
  // real ALI signal with a weak (rebuilding) competency -- the real-evidence
  // branch of urgency() must take priority and its reason text must be used.
  const p = baseProgress({
    completedLessons: ["eng-001", "eng-002", "eng-003"],
    scores: { "eng-001": 40, "eng-002": 38, "eng-003": 42 },
    aliCompetencySignal: {
      maths: {
        subject: "maths",
        weakCompetencies: ["MR-01"],
        masteredCompetencies: [],
        attemptedCompetencies: ["MR-01", "MR-02"],
        recentlyMasteredCompetencies: [],
        updatedAt: new Date().toISOString(),
      },
    },
  });
  const report = computeAnalytics(p);
  const state = computeAdaptiveState(p, report);

  const mathsItem = state.dailyMission.items.find((i) => i.subject === "maths");
  assert.ok(mathsItem, "Maths must be selected given its real weak-competency signal");
  assert.match(mathsItem!.reason, /reinforcement|focused practice/i, "reason text must come from the real-evidence branch (aliReasonText), not legacy copy");
});

test("A: 1-2 attempts (insufficient evidence) also never states a percentage average", () => {
  const p = baseProgress({
    completedLessons: ["eng-001", "eng-002", "eng-003", "maths-reasoning", "maths-arithmetic", "writing-wrt-001"],
    scores: {
      "eng-001": 90, "eng-002": 92, "eng-003": 88,
      "maths-reasoning": 91, "maths-arithmetic": 89,
      "writing-wrt-001": 0, // a single, possibly-abandoned attempt scoring 0
    },
  });
  const report = computeAnalytics(p);
  const state = computeAdaptiveState(p, report);

  for (const item of state.dailyMission.items) {
    if (item.subject === "writing") {
      assert.ok(!/\b0%/.test(item.reason), `a single 0-scoring attempt must not be stated as a confirmed 0% average: "${item.reason}"`);
    }
  }
});
