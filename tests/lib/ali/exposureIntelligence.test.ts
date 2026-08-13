import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeFamilyExposure,
  classifyRetrievalStage,
  RETRIEVAL_INTERVAL_DAYS,
} from "@/lib/ali/exposureIntelligence";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

function q(id: string, familyId?: string): BankQuestion {
  return { id, skill: "QT-MR-01", familyId, prompt: {} } as unknown as BankQuestion;
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

function historyRow(opts: Partial<StudentQuestionHistoryRow>): StudentQuestionHistoryRow {
  return {
    profileId: "test-profile",
    questionId: "test-question",
    source: "practice",
    timesSeen: 1,
    timesCorrect: 1,
    distinctCorrectSessions: 1,
    lastCorrectSessionId: null,
    lastPresentedAt: new Date().toISOString(),
    lastPresentedAtSequence: 1,
    lastAttemptCorrect: true,
    secondLastAttemptCorrect: null,
    masteryState: "learning",
    lastAttemptTimeSeconds: null,
    lastAttemptSkipped: null,
    lastAttemptAnswerChanged: null,
    lastAttemptFirstAnswer: null,
    lastAttemptFinalAnswer: null,
    lastAttemptConfidenceRating: null,
    lastAttemptWorkingShown: null,
    firstSource: null,
    lastAttemptSupportTier: null,
    ...opts,
  };
}

// --- Category B: EXPOSURE INTELLIGENCE ----------------------------------

test("B: unseen family classifies as NEW", () => {
  const item = q("a1", "famA");
  const history = new Map<string, StudentQuestionHistoryRow>(); // no entry at all
  const exposure = computeFamilyExposure([item], history);
  assert.equal(classifyRetrievalStage(exposure.get("famA")), "NEW");
});

test("B: recently correct, not yet secure -> SHORT_TERM_RETRIEVAL", () => {
  const item = q("b1", "famB");
  const history = new Map([[item.id, historyRow({ lastAttemptCorrect: true, masteryState: "learning", lastPresentedAt: daysAgo(1) })]]);
  const exposure = computeFamilyExposure([item], history);
  assert.equal(classifyRetrievalStage(exposure.get("famB")), "SHORT_TERM_RETRIEVAL");
});

test("B: recently incorrect -> IMMEDIATE_REMEDIATION regardless of elapsed time", () => {
  const item = q("c1", "famC");
  const history = new Map([[item.id, historyRow({ lastAttemptCorrect: false, lastPresentedAt: daysAgo(30) })]]);
  const exposure = computeFamilyExposure([item], history);
  assert.equal(classifyRetrievalStage(exposure.get("famC")), "IMMEDIATE_REMEDIATION");
});

test("B: correct but supported (scaffolded), not mastered -> SHORT_TERM_RETRIEVAL", () => {
  const item = q("d1", "famD");
  const history = new Map([
    [item.id, historyRow({ lastAttemptCorrect: true, masteryState: "weak", lastAttemptSupportTier: "supported", lastPresentedAt: daysAgo(1) })],
  ]);
  const exposure = computeFamilyExposure([item], history);
  assert.equal(classifyRetrievalStage(exposure.get("famD")), "SHORT_TERM_RETRIEVAL");
});

test("B: mastered, maintenance window elapsed -> SPACED_RETRIEVAL", () => {
  const item = q("e1", "famE");
  const history = new Map([
    [item.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(RETRIEVAL_INTERVAL_DAYS.maintenanceWindow + 3) })],
  ]);
  const exposure = computeFamilyExposure([item], history);
  assert.equal(classifyRetrievalStage(exposure.get("famE")), "SPACED_RETRIEVAL");
});

test("B: mastered, recently confirmed -> MASTERY_MAINTENANCE", () => {
  const item = q("f1", "famF");
  const history = new Map([[item.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(2) })]]);
  const exposure = computeFamilyExposure([item], history);
  assert.equal(classifyRetrievalStage(exposure.get("famF")), "MASTERY_MAINTENANCE");
});

test("D: configurable interval boundary — exactly at the window is due, just under is not", () => {
  const dueItem = q("g1", "famG");
  const notDueItem = q("h1", "famH");
  const history = new Map([
    [dueItem.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(RETRIEVAL_INTERVAL_DAYS.maintenanceWindow) })],
    [notDueItem.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(RETRIEVAL_INTERVAL_DAYS.maintenanceWindow - 0.5) })],
  ]);
  const exposure = computeFamilyExposure([dueItem, notDueItem], history);
  assert.equal(classifyRetrievalStage(exposure.get("famG")), "SPACED_RETRIEVAL");
  assert.equal(classifyRetrievalStage(exposure.get("famH")), "MASTERY_MAINTENANCE");
});

test("B: no exposure at all (undefined) classifies as NEW, never throws", () => {
  assert.equal(classifyRetrievalStage(undefined), "NEW");
});

test("B: exposure keyed by the family's most recently seen item, not an arbitrary one", () => {
  const older = q("i1", "famI");
  const newer = q("i2", "famI");
  const history = new Map([
    [older.id, historyRow({ lastAttemptCorrect: false, lastPresentedAt: daysAgo(10) })],
    [newer.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(1) })],
  ]);
  const exposure = computeFamilyExposure([older, newer], history);
  // The older row was incorrect; the newer (most recent) row is mastered and recent.
  // Family-level classification must follow the most recent contact, not the oldest.
  assert.equal(classifyRetrievalStage(exposure.get("famI")), "MASTERY_MAINTENANCE");
});
