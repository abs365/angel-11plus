import { test } from "node:test";
import assert from "node:assert/strict";
import { reduceFamilyClustering, applyRetrievalPriority } from "@/lib/learningEngine/sessionGenerator";
import { computeFamilyExposure } from "@/lib/ali/exposureIntelligence";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Regression coverage for Educational Increment 006B's Production
 * Integrity Closure. Written after two real defects were found by hand:
 *   1. A swap could pick an untagged (no familyId) candidate over a
 *      genuinely distinct-family one purely by candidatePool array order.
 *   2. A swap fixing one over-represented family could introduce a FRESH
 *      collision with a different family already present elsewhere in the
 *      session, which the outer loop never re-checked.
 * Both are asserted directly below (see "collision" and "prefers a real
 * family" tests) so a regression trips this suite, not just a live query.
 */

function q(id: string, familyId?: string): BankQuestion {
  return { id, skill: "QT-MR-01", familyId, prompt: {} } as unknown as BankQuestion;
}

// --- Category A: FAMILY DIVERSITY -------------------------------------

test("A: distinct alternatives available -> over-represented family reduced to 1", () => {
  const selected = [q("x1", "famX"), q("x2", "famX"), q("x3", "famX"), q("y1", "famY")];
  const pool = [...selected, q("z1", "famZ"), q("w1", "famW")];
  const out = reduceFamilyClustering(selected, pool);
  const counts = countByFamily(out);
  assert.equal(Math.max(...Object.values(counts)), 1);
  assert.equal(out.length, 4);
});

test("A: insufficient alternatives -> repeat is left in place, never dropped", () => {
  const selected = [q("x1", "famX"), q("x2", "famX"), q("x3", "famX")];
  const pool = [...selected]; // no alternative of any kind
  const out = reduceFamilyClustering(selected, pool);
  assert.equal(out.length, 3);
  assert.equal(countByFamily(out).famX, 3);
});

test("A: same-family siblings reduced to exactly one representative", () => {
  const selected = [q("x1", "famX"), q("x2", "famX")];
  const pool = [...selected, q("z1", "famZ")];
  const out = reduceFamilyClustering(selected, pool);
  assert.equal(countByFamily(out).famX, 1);
  assert.ok(out.some((r) => r.familyId === "famZ"));
});

test("A: null family_id items are never counted as over-represented", () => {
  const selected = [q("n1"), q("n2"), q("n3"), q("y1", "famY")];
  const pool = [...selected, q("z1", "famZ")];
  const out = reduceFamilyClustering(selected, pool);
  // Untagged items are independent legacy questions, not siblings of one
  // another, so this is intended behaviour, not a defect: they are outside
  // this mechanism's scope by design (see the function's own docstring).
  assert.equal(out.length, 4);
  assert.equal(countByFamily(out).NULL, 3);
});

test("A: multiple over-represented families are each reduced independently", () => {
  const selected = [q("x1", "famX"), q("x2", "famX"), q("y1", "famY"), q("y2", "famY")];
  const pool = [...selected, q("z1", "famZ"), q("w1", "famW")];
  const out = reduceFamilyClustering(selected, pool);
  const counts = countByFamily(out);
  assert.ok(Object.values(counts).every((c) => c <= 1));
});

test("A: deterministic result for identical inputs", () => {
  const selected = [q("x1", "famX"), q("x2", "famX"), q("y1", "famY")];
  const pool = [...selected, q("z1", "famZ")];
  const out1 = reduceFamilyClustering(selected, pool).map((r) => r.id);
  const out2 = reduceFamilyClustering(selected, pool).map((r) => r.id);
  assert.deepEqual(out1, out2);
});

// --- Regression tests for the two defects found in this closure --------

test("REGRESSION: prefers a real distinct family over an untagged item, regardless of pool order", () => {
  const selected = [q("x1", "famX"), q("x2", "famX"), q("y1", "famY")];
  // Untagged candidate appears BEFORE the real alternative in pool order.
  const pool = [...selected, q("n1"), q("z1", "famZ")];
  const out = reduceFamilyClustering(selected, pool);
  assert.ok(out.some((r) => r.familyId === "famZ"), "expected the real family to be preferred");
  assert.ok(!out.some((r) => r.familyId === undefined), "did not expect the untagged fallback to be used");
});

test("REGRESSION: a swap must not introduce a fresh collision with a different family already present", () => {
  const selected = [q("b1", "famB"), q("b2", "famB"), q("f1", "famF"), q("a1", "famA")];
  // f2 (same family as f1, already present) sorts before z1 (genuinely new) in pool order.
  const pool = [...selected, q("f2", "famF"), q("z1", "famZ")];
  const out = reduceFamilyClustering(selected, pool);
  const counts = countByFamily(out);
  assert.ok(Object.values(counts).every((c) => c <= 1), `expected no family to repeat, got ${JSON.stringify(counts)}`);
  assert.ok(out.some((r) => r.familyId === "famZ"));
});

// --- Category C: REMEDIATION --------------------------------------------

test("C: anti-clustering does not suppress necessary remediation when no alternative exists", () => {
  // A learner got famX wrong twice in a row and the deliberate selection
  // policy upstream chose to return famX twice; with no distinct-family
  // alternative in the pool, reduceFamilyClustering must not force a drop.
  const selected = [q("x1", "famX"), q("x2", "famX")];
  const pool = [...selected];
  const out = reduceFamilyClustering(selected, pool);
  assert.equal(out.length, 2);
  assert.equal(countByFamily(out).famX, 2);
});

test("C: applyRetrievalPriority only ever swaps MASTERY_MAINTENANCE items, never IMMEDIATE_REMEDIATION", () => {
  const remediationItem = q("r1", "famR");
  const alt = q("alt1", "famAlt");
  const history = new Map<string, StudentQuestionHistoryRow>([
    [remediationItem.id, historyRow({ lastAttemptCorrect: false, lastPresentedAt: daysAgo(1) })],
    [alt.id, historyRow({ lastAttemptCorrect: true, masteryState: "learning", lastPresentedAt: daysAgo(1) })],
  ]);
  const pool = [remediationItem, alt];
  const exposure = computeFamilyExposure(pool, history);
  const out = applyRetrievalPriority([remediationItem], pool, exposure);
  assert.equal(out[0].id, "r1", "a family under active remediation must never be swapped away");
});

// --- Category D: SPACED RETRIEVAL ---------------------------------------

test("D: a due (SPACED_RETRIEVAL) family is not swapped away by applyRetrievalPriority", () => {
  const due = q("d1", "famDue");
  const history = new Map<string, StudentQuestionHistoryRow>([
    [due.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(20) })],
  ]);
  const pool = [due];
  const exposure = computeFamilyExposure(pool, history);
  const out = applyRetrievalPriority([due], pool, exposure);
  assert.equal(out[0].id, "d1");
});

test("D: a recently-mastered (MASTERY_MAINTENANCE) family is deprioritised when an alternative exists", () => {
  const maintained = q("m1", "famMaintained");
  const fresh = q("f1", "famFresh");
  const history = new Map<string, StudentQuestionHistoryRow>([
    [maintained.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(2) })],
  ]);
  const pool = [maintained, fresh];
  const exposure = computeFamilyExposure(pool, history);
  const out = applyRetrievalPriority([maintained], pool, exposure);
  assert.equal(out[0].id, "f1", "expected the unseen alternative to replace the recently-confirmed family");
});

test("D: MASTERY_MAINTENANCE item is kept, never dropped, when no alternative exists", () => {
  const maintained = q("m1", "famMaintained");
  const history = new Map<string, StudentQuestionHistoryRow>([
    [maintained.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(2) })],
  ]);
  const pool = [maintained];
  const exposure = computeFamilyExposure(pool, history);
  const out = applyRetrievalPriority([maintained], pool, exposure);
  assert.equal(out.length, 1);
  assert.equal(out[0].id, "m1");
});

// --- helpers -------------------------------------------------------------

function countByFamily(items: BankQuestion[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = item.familyId ?? "NULL";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
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
