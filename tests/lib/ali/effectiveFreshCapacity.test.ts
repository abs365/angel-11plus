import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyFamilyFreshness, summariseFreshCapacity, type FamilyExposureSignal } from "@/lib/ali/effectiveFreshCapacity";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Question Factory Wave 1, Phase 1 — `lib/ali/effectiveFreshCapacity.ts`
 * had zero test coverage before this file, despite being a real,
 * well-reasoned module (confirmed by the Wave 1 Gap Register). These are
 * real behavioural tests over the pure functions, proving the module's own
 * four classifications are each reachable and correctly distinguished --
 * the prerequisite for wiring it into a real per-learner runtime path in a
 * future increment (this module needs a specific learner's own history and
 * current sequence position, which no aggregate/cross-learner report has a
 * meaningful single value for -- see scripts/content-governance-report.mjs's
 * own disclosed scope note).
 */

function historyRow(overrides: Partial<StudentQuestionHistoryRow> = {}): StudentQuestionHistoryRow {
  return {
    questionId: "q1",
    timesSeen: 1,
    lastPresentedAtSequence: 0,
    lastPresentedAt: new Date().toISOString(),
    lastAttemptCorrect: true,
    masteryState: "learning",
    ...overrides,
  } as StudentQuestionHistoryRow;
}

test("classifyFamilyFreshness returns insufficient_metadata when no familyId or empty member list is supplied", () => {
  const signal: FamilyExposureSignal = { familyId: null, familyQuestionIds: [], history: new Map() };
  assert.equal(classifyFamilyFreshness(signal, 10, new Map()), "insufficient_metadata");

  const signalWithId: FamilyExposureSignal = { familyId: "fam-a", familyQuestionIds: [], history: new Map() };
  assert.equal(classifyFamilyFreshness(signalWithId, 10, new Map()), "insufficient_metadata");
});

test("classifyFamilyFreshness returns fresh when at least one sibling is genuinely unseen", () => {
  const signal: FamilyExposureSignal = {
    familyId: "fam-a",
    familyQuestionIds: ["q1", "q2"],
    history: new Map([["q1", historyRow({ questionId: "q1", timesSeen: 3, lastPresentedAtSequence: 5 })]]),
    // q2 has no history row at all -- genuinely unseen
  };
  assert.equal(classifyFamilyFreshness(signal, 10, new Map([["q1", 5]])), "fresh");
});

test("classifyFamilyFreshness returns recently_exhausted when every sibling is seen and still within its own cooldown window", () => {
  const signal: FamilyExposureSignal = {
    familyId: "fam-a",
    familyQuestionIds: ["q1"],
    history: new Map([["q1", historyRow({ questionId: "q1", timesSeen: 1, lastPresentedAtSequence: 8 })]]),
  };
  // currentSequence 10, lastPresentedAtSequence 8 -> distance 2, threshold 5 -> still cooling down
  assert.equal(classifyFamilyFreshness(signal, 10, new Map([["q1", 5]])), "recently_exhausted");
});

test("classifyFamilyFreshness returns renewable_due once every sibling has cleared its own real cooldown window", () => {
  const signal: FamilyExposureSignal = {
    familyId: "fam-a",
    familyQuestionIds: ["q1"],
    history: new Map([["q1", historyRow({ questionId: "q1", timesSeen: 1, lastPresentedAtSequence: 1 })]]),
  };
  // currentSequence 20, lastPresentedAtSequence 1 -> distance 19, threshold 5 -> cleared
  assert.equal(classifyFamilyFreshness(signal, 20, new Map([["q1", 5]])), "renewable_due");
});

test("classifyFamilyFreshness uses the LEAST recently seen sibling to decide, not the most recent", () => {
  const signal: FamilyExposureSignal = {
    familyId: "fam-a",
    familyQuestionIds: ["q1", "q2"],
    history: new Map([
      ["q1", historyRow({ questionId: "q1", timesSeen: 1, lastPresentedAtSequence: 18 })], // recent, distance 2 -- would say exhausted alone
      ["q2", historyRow({ questionId: "q2", timesSeen: 1, lastPresentedAtSequence: 1 })], // old, distance 19 -- would say renewable_due alone
    ]),
  };
  // The module's own documented rule uses the LEAST recently seen (largest distance) sibling's own threshold --
  // both are seen, so this is either recently_exhausted or renewable_due, never "fresh".
  const result = classifyFamilyFreshness(signal, 20, new Map([["q1", 5], ["q2", 5]]));
  assert.equal(result, "renewable_due", "the least-recently-seen sibling (q2, distance 19) has cleared its cooldown");
});

test("summariseFreshCapacity rolls up classifications into the correct bounded buckets, and never sums SEALED into fresh/renewable/exhausted", () => {
  const summary = summariseFreshCapacity([
    { classification: "fresh" },
    { classification: "fresh" },
    { classification: "renewable_due" },
    { classification: "recently_exhausted" },
    { classification: "insufficient_metadata" },
    { classification: "fresh", inventoryClass: "sealed" }, // SEALED must never count as fresh, regardless of its own classification
  ]);
  assert.deepEqual(summary, {
    freshFamilyCount: 2,
    renewableDueFamilyCount: 1,
    recentlyExhaustedFamilyCount: 1,
    insufficientMetadataFamilyCount: 1,
    sealedFamilyCount: 1,
  });
});
