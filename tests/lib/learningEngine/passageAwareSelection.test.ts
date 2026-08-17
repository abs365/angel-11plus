import { test } from "node:test";
import assert from "node:assert/strict";
import { reduceFamilyClustering, applyRetrievalPriority } from "@/lib/learningEngine/sessionGenerator";
import { computeFamilyExposure, groupingKeyOf, passageGroupingKeyOf } from "@/lib/ali/exposureIntelligence";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Educational Increment 007S, Part 4 — regression coverage for the
 * passage-aware exposure correction. Root cause (007R, re-confirmed live
 * against production this increment): 15 of 19 shared English passages
 * each feed 5-7 DIFFERENT named families (each with its own family_id),
 * so groupingKeyOf() (which prefers family_id) never resolved to the
 * passage id for any of them — reduceFamilyClustering() and
 * applyRetrievalPriority() were both blind to same-passage, different-
 * family repetition. Fixed by generalising both functions to accept a key
 * function and calling them a second time with passageGroupingKeyOf().
 *
 * Test helpers deliberately model the REAL current production shape: an
 * English question carries BOTH a family_id (structural QT family) and a
 * learning_unit_id (shared passage) — unlike the older
 * englishPassageExposure.test.ts helpers, which modelled the pre-Wave-1
 * shape (no family_id at all) and remain valid coverage for the legacy
 * pool today.
 */

function engQ(id: string, familyId: string, passageId: string, skill = "QT-RC-01"): BankQuestion {
  return { id, skill, subject: "english", familyId, learningUnitId: passageId, prompt: {} } as unknown as BankQuestion;
}

function mathsQ(id: string, familyId?: string): BankQuestion {
  return { id, skill: "QT-MR-01", subject: "maths", familyId, learningUnitId: id, prompt: {} } as unknown as BankQuestion;
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

function twoPass(selected: BankQuestion[], pool: BankQuestion[]): BankQuestion[] {
  const familyPass = reduceFamilyClustering(selected, pool);
  return reduceFamilyClustering(familyPass, pool, passageGroupingKeyOf);
}

// --- 1. Duplicate question avoidance remains intact ------------------------

test("1: exact duplicate questions are never both selected (unaffected by the passage pass)", () => {
  const selected = [engQ("q1", "famA", "passageA"), engQ("q1", "famA", "passageA")];
  // selectQuestions() itself is what guarantees no duplicate IDs reach this
  // stage; this proves the new pass does not somehow reintroduce one via a
  // swap (it never adds items already present, by construction: `!selectedIds.has(c.id)`).
  const pool = [engQ("q1", "famA", "passageA"), engQ("q2", "famB", "passageB")];
  const out = twoPass(selected, pool);
  const ids = out.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length, "no duplicate id introduced by either pass");
});

// --- 2. Family diversification remains intact -------------------------------

test("2: same-family repeats are still reduced to one, exactly as before this increment", () => {
  const selected = [engQ("q1", "famA", "passageA"), engQ("q2", "famA", "passageB"), engQ("q3", "famB", "passageC")];
  const pool = [...selected, engQ("q4", "famC", "passageD")];
  const out = twoPass(selected, pool);
  const familyCounts: Record<string, number> = {};
  for (const q of out) familyCounts[groupingKeyOf(q)!] = (familyCounts[groupingKeyOf(q)!] ?? 0) + 1;
  assert.ok(Object.values(familyCounts).every((c) => c <= 1), `expected no family to repeat, got ${JSON.stringify(familyCounts)}`);
});

// --- 3. Passage diversification works across DIFFERENT English families ----

test("3: two different families sharing one passage are reduced to one passage occurrence (the real production pattern)", () => {
  // Mirrors live production exactly: wave1-eng-kitemaker feeds 7 different
  // named families. Here two DIFFERENT families both draw on "passageA".
  const selected = [
    engQ("q1", "famDirectRetrieval", "passageA", "QT-RC-01"),
    engQ("q2", "famVocabExplain", "passageA", "QT-RC-03"),
    engQ("q3", "famSequencing", "passageB", "QT-RC-06"),
  ];
  const pool = [...selected, engQ("q4", "famEmotionCause", "passageC", "QT-RC-08")];
  const out = twoPass(selected, pool);
  const passageCounts: Record<string, number> = {};
  for (const q of out) passageCounts[passageGroupingKeyOf(q)!] = (passageCounts[passageGroupingKeyOf(q)!] ?? 0) + 1;
  assert.ok(Object.values(passageCounts).every((c) => c <= 1), `expected no passage to repeat across families, got ${JSON.stringify(passageCounts)}`);
  assert.equal(out.length, 3);
});

test("3: family-level pass alone (pre-007S behaviour) would NOT have caught the cross-family passage repeat — proves the gap was real", () => {
  const selected = [
    engQ("q1", "famDirectRetrieval", "passageA", "QT-RC-01"),
    engQ("q2", "famVocabExplain", "passageA", "QT-RC-03"),
  ];
  const pool = [...selected];
  const familyOnly = reduceFamilyClustering(selected, pool); // old single-pass behaviour
  const passageCounts: Record<string, number> = {};
  for (const q of familyOnly) passageCounts[passageGroupingKeyOf(q)!] = (passageCounts[passageGroupingKeyOf(q)!] ?? 0) + 1;
  assert.equal(passageCounts.passageA, 2, "confirms the pre-fix mechanism truly could not see this collision");
});

// --- 4. Mathematics selection is unaffected ---------------------------------

test("4: Mathematics selection is byte-for-byte unaffected by the passage pass (passageGroupingKeyOf is inert for non-English)", () => {
  const selected = [mathsQ("m1", "famX"), mathsQ("m2", "famX"), mathsQ("m3", "famY")];
  const pool = [...selected, mathsQ("m4", "famZ")];
  const familyOnly = reduceFamilyClustering(selected, pool);
  const both = twoPass(selected, pool);
  assert.deepEqual(both.map((q) => q.id), familyOnly.map((q) => q.id), "the second (passage) pass must be a no-op for Mathematics");
});

test("4: Mathematics retrieval-priority pass is unaffected by the passage exposure pass", () => {
  const maintained = mathsQ("m1", "famX");
  const fresh = mathsQ("m2", "famY");
  const history = new Map([[maintained.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(2) })]]);
  const pool = [maintained, fresh];
  const familyExposure = computeFamilyExposure(pool, history);
  const familyOnly = applyRetrievalPriority([maintained], pool, familyExposure);
  const passageExposure = computeFamilyExposure(pool, history, passageGroupingKeyOf);
  const both = applyRetrievalPriority(familyOnly, pool, passageExposure, new Date(), passageGroupingKeyOf);
  assert.deepEqual(both.map((q) => q.id), familyOnly.map((q) => q.id));
});

// --- 5. Shallow pools degrade gracefully ------------------------------------

test("5: shallow pool (no alternative passage exists) leaves the repeat in place, never drops a question", () => {
  const selected = [engQ("q1", "famA", "passageA"), engQ("q2", "famB", "passageA")];
  const pool = [...selected]; // no other passage available anywhere
  const out = twoPass(selected, pool);
  assert.equal(out.length, 2, "must never reduce a session to fewer questions than selected");
});

// --- 6. No deadlock when every passage has prior exposure -------------------

test("6: does not deadlock or throw when every candidate passage is already mastery-maintained", () => {
  const q1 = engQ("q1", "famA", "passageA");
  const q2 = engQ("q2", "famB", "passageB");
  const history = new Map([
    [q1.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(1) })],
    [q2.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(1) })],
  ]);
  const pool = [q1, q2];
  const passageExposure = computeFamilyExposure(pool, history, passageGroupingKeyOf);
  assert.doesNotThrow(() => {
    const out = applyRetrievalPriority([q1, q2], pool, passageExposure, new Date(), passageGroupingKeyOf);
    assert.equal(out.length, 2, "both questions remain even though no fresher passage exists");
  });
});

// --- 7. No internal IDs leak to learners ------------------------------------

test("7: both passes only ever return references to real pool items, never synthesise new objects that could carry stray fields", () => {
  const selected = [engQ("q1", "famA", "passageA"), engQ("q2", "famA", "passageB")];
  const pool = [...selected, engQ("q3", "famC", "passageC")];
  const out = twoPass(selected, pool);
  for (const item of out) {
    assert.ok(pool.includes(item), "every returned item must be a reference-identical pool member, never a constructed object");
  }
});
