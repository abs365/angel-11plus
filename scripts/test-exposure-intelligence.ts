/**
 * Educational Increment 006 Parts 12-14/25 — tests
 * lib/ali/exposureIntelligence.ts (computeFamilyExposure,
 * classifyRetrievalStage) and
 * lib/learningEngine/sessionGenerator.ts's applyRetrievalPriority().
 */
import {
  computeFamilyExposure,
  classifyRetrievalStage,
  RETRIEVAL_INTERVAL_DAYS,
  type FamilyExposure,
} from "../lib/ali/exposureIntelligence";
import { applyRetrievalPriority } from "../lib/learningEngine/sessionGenerator";
import type { BankQuestion } from "../types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "../types/ali/history";

let passed = 0;
let failed = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`pass: ${message}`);
    passed++;
  } else {
    console.error(`FAIL: ${message}`);
    failed++;
  }
}

function q(id: string, familyId?: string): BankQuestion {
  return {
    id,
    subject: "maths",
    skill: "QT-MR-05",
    pathway: ["csse"],
    contentDifficulty: "medium",
    questionType: "short-answer",
    estimatedTimeSeconds: 60,
    prompt: { id, question: "?", answer: "1", skill: "arithmetic", marks: 1, difficulty: "year5-core" },
    explanation: "test",
    confidenceWeight: 1,
    revisionPriority: 3,
    masteryThreshold: 2,
    usageCount: 0,
    avgSuccessRate: null,
    learningUnitId: id,
    familyId,
  };
}

function historyRow(overrides: Partial<StudentQuestionHistoryRow>): StudentQuestionHistoryRow {
  return {
    profileId: "p1",
    questionId: "x",
    source: "test",
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
    ...overrides,
  };
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

// ---- classifyRetrievalStage ----

assert(classifyRetrievalStage(undefined) === "NEW", "no exposure at all -> NEW");
assert(classifyRetrievalStage({ familyId: "f", count: 0, lastExposureAt: null, lastOutcome: null, masteryState: null }) === "NEW", "zero count -> NEW");

assert(
  classifyRetrievalStage({ familyId: "f", count: 1, lastExposureAt: daysAgo(0), lastOutcome: false, masteryState: "weak" }) === "IMMEDIATE_REMEDIATION",
  "recent incorrect -> IMMEDIATE_REMEDIATION"
);
assert(
  classifyRetrievalStage({ familyId: "f", count: 3, lastExposureAt: daysAgo(30), lastOutcome: false, masteryState: "mastered" }) === "IMMEDIATE_REMEDIATION",
  "incorrect always prioritised for return regardless of elapsed time, even if mastered before"
);

assert(
  classifyRetrievalStage({ familyId: "f", count: 1, lastExposureAt: daysAgo(1), lastOutcome: true, masteryState: "learning" }) === "SHORT_TERM_RETRIEVAL",
  "correct but not yet secure -> SHORT_TERM_RETRIEVAL"
);

assert(
  classifyRetrievalStage({ familyId: "f", count: 5, lastExposureAt: daysAgo(1), lastOutcome: true, masteryState: "mastered" }) === "MASTERY_MAINTENANCE",
  "securely mastered, recently seen -> MASTERY_MAINTENANCE (deprioritised, not suppressed)"
);
assert(
  classifyRetrievalStage({ familyId: "f", count: 5, lastExposureAt: daysAgo(RETRIEVAL_INTERVAL_DAYS.maintenanceWindow + 1), lastOutcome: true, masteryState: "mastered" }) === "SPACED_RETRIEVAL",
  "securely mastered, maintenance window elapsed -> SPACED_RETRIEVAL (due again)"
);

// ---- computeFamilyExposure ----

{
  const pool = [q("a", "fam1"), q("b", "fam1"), q("c", "fam2")];
  const history = new Map<string, StudentQuestionHistoryRow>([
    ["a", historyRow({ questionId: "a", timesSeen: 2, lastPresentedAt: daysAgo(5) })],
    ["b", historyRow({ questionId: "b", timesSeen: 1, lastPresentedAt: daysAgo(1) })],
  ]);
  const exposure = computeFamilyExposure(pool, history);
  assert(exposure.get("fam1")?.count === 2, "family exposure count aggregates across sibling items");
  assert(exposure.get("fam1")?.lastExposureAt === daysAgo(1), "family exposure uses the MOST RECENT item's date, not the first");
  assert(!exposure.has("fam2"), "a family with zero real history is not in the exposure map (never seen, not fabricated)");
}

// ---- applyRetrievalPriority ----

{
  // A mastery-maintenance family sits in the selection; a NEW alternative exists in the pool -> swap.
  const maintained = q("m1", "fam-maintained");
  const fresh = q("n1", "fam-new");
  const selected = [maintained];
  const pool = [maintained, fresh];
  const exposureByFamily = new Map<string, FamilyExposure>([
    ["fam-maintained", { familyId: "fam-maintained", count: 5, lastExposureAt: daysAgo(1), lastOutcome: true, masteryState: "mastered" }],
  ]);
  const result = applyRetrievalPriority(selected, pool, exposureByFamily);
  assert(result[0].id === "n1", "a MASTERY_MAINTENANCE item is swapped for an available NEW alternative");
}

{
  // No alternative available -> the maintenance item is NOT dropped (never permanently suppressed).
  const maintained = q("m1", "fam-maintained");
  const selected = [maintained];
  const pool = [maintained];
  const exposureByFamily = new Map<string, FamilyExposure>([
    ["fam-maintained", { familyId: "fam-maintained", count: 5, lastExposureAt: daysAgo(1), lastOutcome: true, masteryState: "mastered" }],
  ]);
  const result = applyRetrievalPriority(selected, pool, exposureByFamily);
  assert(result[0].id === "m1", "with no alternative available, a MASTERY_MAINTENANCE item is left in place, never dropped");
}

{
  // A family due for SPACED_RETRIEVAL is a valid swap target, same as NEW.
  const maintained = q("m1", "fam-maintained");
  const due = q("d1", "fam-due");
  const selected = [maintained];
  const pool = [maintained, due];
  const exposureByFamily = new Map<string, FamilyExposure>([
    ["fam-maintained", { familyId: "fam-maintained", count: 5, lastExposureAt: daysAgo(1), lastOutcome: true, masteryState: "mastered" }],
    ["fam-due", { familyId: "fam-due", count: 5, lastExposureAt: daysAgo(RETRIEVAL_INTERVAL_DAYS.maintenanceWindow + 2), lastOutcome: true, masteryState: "mastered" }],
  ]);
  const result = applyRetrievalPriority(selected, pool, exposureByFamily);
  assert(result[0].id === "d1", "a SPACED_RETRIEVAL-due family is swapped in ahead of a MASTERY_MAINTENANCE one");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
console.log("All assertions passed.");
