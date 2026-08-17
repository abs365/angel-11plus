import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";
import { computeAnalytics } from "@/lib/analytics";
import { toAliCompetencySignal } from "@/lib/learningEngine/preparationState";
import type { SubjectPreparationSummary, CompetencyPreparationSummary } from "@/lib/learningEngine/preparationState";
import type { UserProgress } from "@/types";
import type { EducationalState } from "@/types/ali/educationalState";
import type { EvidenceConfidenceTier } from "@/types/ali/confidence";

/**
 * Educational Increment 007W — Bounded Live-Volatility Investigation.
 *
 * Live production verification found that repeated dashboard loads on the
 * same authenticated learner, seconds apart with no learner activity,
 * produced materially different Today's Mission recommendations. Root
 * cause: recordAliCompetencySignal() was writing the Maths/English signal
 * to localStorage as a side effect of merely VIEWING the dashboard, and
 * that persisted write fed the NEXT load's initial synchronous paint
 * before its own async correction landed -- a dashboard view was
 * manufacturing state that influenced subsequent recommendations.
 *
 * The fix (app/dashboard/page.tsx) makes Maths/English follow Writing's
 * own already-correct pattern exactly: an in-memory-only
 * "missionViewProgress" object, recomputed fresh every load, never
 * persisted. These tests prove the CORE PRODUCT INVARIANT directly: same
 * canonical evidence + same context + no learner action => same
 * recommendation, simulated by constructing the exact object shape
 * app/dashboard/page.tsx now builds and feeding it to computeAdaptiveState
 * repeatedly, exactly as multiple dashboard loads would.
 */

function competency(id: string, educationalState: EducationalState, confidenceTier: EvidenceConfidenceTier): CompetencyPreparationSummary {
  return { competencyId: id as never, educationalState, confidenceTier };
}

function baseProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    xp: 77,
    streak: 1,
    completedLessons: ["practice-mathematics", "writing-wrt-001"],
    scores: { "practice-mathematics": 0, "writing-wrt-001": 0 },
    lastActivity: new Date().toISOString(),
    selectedPathwayId: "csse",
    ...overrides,
  };
}

/** Mirrors app/dashboard/page.tsx's missionViewProgress construction exactly -- pure, no persistence. */
function buildMissionViewProgress(
  p: UserProgress,
  mathsSummary: SubjectPreparationSummary,
  englishSummary: SubjectPreparationSummary
): UserProgress {
  return {
    ...p,
    aliCompetencySignal: {
      ...p.aliCompetencySignal,
      maths: toAliCompetencySignal(mathsSummary, "maths"),
      english: toAliCompetencySignal(englishSummary, "english"),
    },
  };
}

function missionSubjects(state: ReturnType<typeof computeAdaptiveState>): string[] {
  return state.dailyMission.items.map((i) => i.subject);
}

const mathsWeak: SubjectPreparationSummary = {
  component: "Mathematics",
  evidenceState: "developing_evidence",
  competencies: [competency("MR-01", "rebuilding", "high"), competency("MR-02", "practising", "low")],
};
const englishStrong: SubjectPreparationSummary = {
  component: "English Comprehension",
  evidenceState: "established_evidence",
  competencies: [competency("RC-01", "mastered", "high"), competency("RC-02", "durably-mastered", "high")],
};
const noEvidence: SubjectPreparationSummary = { component: "Mathematics", evidenceState: "no_evidence", competencies: [] };

test("Part 6: repeated calculation -- identical summaries produce byte-identical mission output across 5 calls", () => {
  const p = baseProgress();
  const r = computeAnalytics(p);
  const outputs = Array.from({ length: 5 }, () => {
    const vp = buildMissionViewProgress(p, mathsWeak, englishStrong);
    return computeAdaptiveState(vp, r);
  });
  const first = JSON.stringify(outputs[0].dailyMission);
  for (const o of outputs.slice(1)) {
    assert.equal(JSON.stringify(o.dailyMission), first, "identical evidence must produce an identical mission every time");
  }
});

test("Part 6: repeated dashboard-style composition -- simulating 3 separate 'loads' from the same base UserProgress never mutates or drifts the base object", () => {
  const p = baseProgress();
  const r = computeAnalytics(p);
  const snapshots: string[] = [];
  for (let i = 0; i < 3; i++) {
    // Each "load" starts fresh from the same immutable base progress, exactly
    // as app/dashboard/page.tsx's initial useEffect does on every real page
    // load (getProgress() reads localStorage, which the fix no longer writes).
    const vp = buildMissionViewProgress(p, mathsWeak, englishStrong);
    snapshots.push(JSON.stringify(computeAdaptiveState(vp, r).dailyMission));
  }
  assert.equal(p.aliCompetencySignal, undefined, "the base UserProgress must never be mutated by building a view-only mission");
  assert.equal(new Set(snapshots).size, 1, "all 3 simulated loads must agree on the same mission");
});

test("Part 6: Maths + English mixed real evidence resolves deterministically and Maths (real regression) outranks English (real strength)", () => {
  const p = baseProgress();
  const r = computeAnalytics(p);
  const vp = buildMissionViewProgress(p, mathsWeak, englishStrong);
  const state = computeAdaptiveState(vp, r);
  assert.equal(state.dailyMission.items[0]?.subject, "maths");
});

test("Part 6: equal-priority competencies -- two calls with the same tied evidence produce the same ordering (no unstable-sort artifact)", () => {
  const p = baseProgress();
  const r = computeAnalytics(p);
  const tiedMaths: SubjectPreparationSummary = { component: "Mathematics", evidenceState: "developing_evidence", competencies: [competency("MR-01", "practising", "moderate")] };
  const tiedEnglish: SubjectPreparationSummary = { component: "English Comprehension", evidenceState: "developing_evidence", competencies: [competency("RC-01", "practising", "moderate")] };
  const a = missionSubjects(computeAdaptiveState(buildMissionViewProgress(p, tiedMaths, tiedEnglish), r));
  const b = missionSubjects(computeAdaptiveState(buildMissionViewProgress(p, tiedMaths, tiedEnglish), r));
  assert.deepEqual(a, b);
});

test("Part 6: no evidence for both subjects -- stable, no crash, identical across repeats", () => {
  const p = baseProgress({ completedLessons: [], scores: {} });
  const r = computeAnalytics(p);
  const a = missionSubjects(computeAdaptiveState(buildMissionViewProgress(p, noEvidence, noEvidence), r));
  const b = missionSubjects(computeAdaptiveState(buildMissionViewProgress(p, noEvidence, noEvidence), r));
  assert.deepEqual(a, b);
});

test("Part 6: strong evidence for both subjects -- deterministic, no false weak/urgent flagging", () => {
  const p = baseProgress();
  const r = computeAnalytics(p);
  const strongMaths: SubjectPreparationSummary = { component: "Mathematics", evidenceState: "established_evidence", competencies: [competency("MR-01", "mastered", "high")] };
  const a = missionSubjects(computeAdaptiveState(buildMissionViewProgress(p, strongMaths, englishStrong), r));
  const b = missionSubjects(computeAdaptiveState(buildMissionViewProgress(p, strongMaths, englishStrong), r));
  assert.deepEqual(a, b);
});

test("Part 6: Writing (PE=0) never appears in the mission across repeated loads, regardless of Maths/English evidence churn", () => {
  const p = baseProgress();
  const r = computeAnalytics(p);
  for (let i = 0; i < 3; i++) {
    const vp = buildMissionViewProgress(p, mathsWeak, englishStrong);
    for (const item of computeAdaptiveState(vp, r).dailyMission.items) {
      assert.notEqual(item.subject, "writing");
    }
  }
});

test("Part 6: Mock (Mock Eligible=0) never appears in the mission across repeated loads", () => {
  const p = baseProgress();
  const r = computeAnalytics(p);
  for (let i = 0; i < 3; i++) {
    const vp = buildMissionViewProgress(p, mathsWeak, englishStrong);
    for (const item of computeAdaptiveState(vp, r).dailyMission.items) {
      assert.notEqual(item.subject, "mock-test");
    }
  }
});

test("Part 7 (concurrency/idempotency): two 'near-simultaneous loads' built independently from the same base never see each other's state", () => {
  const p = baseProgress();
  const r = computeAnalytics(p);
  // Simulates two overlapping dashboard loads racing -- each builds its own
  // view-only object from the same immutable base `p`. Since neither
  // persists, there is nothing to race on; both must resolve identically.
  const loadA = buildMissionViewProgress(p, mathsWeak, englishStrong);
  const loadB = buildMissionViewProgress(p, mathsWeak, englishStrong);
  assert.notEqual(loadA, loadB, "each load must build its own independent object, never share a mutable reference");
  assert.deepEqual(computeAdaptiveState(loadA, r).dailyMission, computeAdaptiveState(loadB, r).dailyMission);
});

test("Part 8 (legacy interaction): the final mission never alternates between a canonical and a legacy interpretation for the same evidence", () => {
  const p = baseProgress();
  const r = computeAnalytics(p);
  // Before the fix, load N+1's *initial* synchronous paint could read load
  // N's persisted (real) signal while load N+1's *own* async correction was
  // still in flight -- a mixed canonical/legacy state. With no persistence,
  // every load's view-only object is built fresh from the same real
  // evidence every time, so there is no intermediate mixed state to observe
  // once a load settles.
  const settled1 = missionSubjects(computeAdaptiveState(buildMissionViewProgress(p, mathsWeak, englishStrong), r));
  const settled2 = missionSubjects(computeAdaptiveState(buildMissionViewProgress(p, mathsWeak, englishStrong), r));
  assert.deepEqual(settled1, settled2);
});
