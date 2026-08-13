import { test } from "node:test";
import assert from "node:assert/strict";
import { reduceFamilyClustering, applyRetrievalPriority } from "@/lib/learningEngine/sessionGenerator";
import { computeFamilyExposure, groupingKeyOf, classifyRetrievalStage } from "@/lib/ali/exposureIntelligence";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Educational Increment 007A — English Scale Foundation. Passage-level
 * exposure/anti-clustering, proven via the SAME generalised mechanism
 * Mathematics uses (groupingKeyOf() falls back to learningUnitId when
 * familyId is absent — see lib/ali/exposureIntelligence.ts), not a
 * parallel English engine. English questions here deliberately have no
 * familyId (matches live production: 0/13 English rows carry one) and a
 * shared learningUnitId per passage (matches the real learning_unit_id
 * convention already used by lib/ali/learningUnit.ts).
 */

function rc(id: string, passageId: string): BankQuestion {
  return { id, skill: "QT-RC-01", subject: "english", learningUnitId: passageId, prompt: {} } as unknown as BankQuestion;
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

function countByGroup(items: BankQuestion[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = groupingKeyOf(item) ?? "NULL";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

// --- No unnecessary Learning-Unit (passage) clustering -------------------

test("no unnecessary passage clustering: 3 questions from one passage reduced to 1 when other passages are available", () => {
  const selected = [rc("p1-q1", "passageA"), rc("p1-q2", "passageA"), rc("p1-q3", "passageA"), rc("p2-q1", "passageB")];
  const pool = [...selected, rc("p3-q1", "passageC"), rc("p4-q1", "passageD")];
  const out = reduceFamilyClustering(selected, pool);
  const counts = countByGroup(out);
  assert.ok(Object.values(counts).every((c) => c <= 1), `expected no passage to repeat, got ${JSON.stringify(counts)}`);
  assert.equal(out.length, 4);
});

test("insufficient-alternative behaviour: repeat is left in place when no other passage exists, never dropped", () => {
  const selected = [rc("p1-q1", "passageA"), rc("p1-q2", "passageA"), rc("p1-q3", "passageA")];
  const pool = [...selected]; // no alternative passage available
  const out = reduceFamilyClustering(selected, pool);
  assert.equal(out.length, 3);
  assert.equal(countByGroup(out).passageA, 3);
});

test("deliberate remediation may legitimately keep the learner within one passage (no alternative offered)", () => {
  // Two questions from the same passage, deliberately selected for remediation,
  // with only same-passage candidates in the pool — the diversity preference
  // must not force a drop when nothing else is available.
  const selected = [rc("p1-q1", "passageA"), rc("p1-q2", "passageA")];
  const pool = [rc("p1-q1", "passageA"), rc("p1-q2", "passageA"), rc("p1-q3", "passageA")];
  const out = reduceFamilyClustering(selected, pool);
  assert.equal(countByGroup(out).passageA, 2, "remediation on the same passage must not be forcibly broken up");
});

test("deterministic: identical inputs produce identical passage-diversification output", () => {
  const selected = [rc("p1-q1", "passageA"), rc("p1-q2", "passageA"), rc("p2-q1", "passageB")];
  const pool = [...selected, rc("p3-q1", "passageC")];
  const out1 = reduceFamilyClustering(selected, pool).map((r) => r.id);
  const out2 = reduceFamilyClustering(selected, pool).map((r) => r.id);
  assert.deepEqual(out1, out2);
});

// --- Passage exposure stages (via the same generalised classifier) -------

test("unseen passage selection: a passage with no history classifies as NEW", () => {
  const item = rc("p1-q1", "passageA");
  const history = new Map<string, StudentQuestionHistoryRow>();
  const exposure = computeFamilyExposure([item], history);
  assert.equal(classifyRetrievalStage(exposure.get("passageA")), "NEW");
});

test("short-term retrieval: recently correct on a passage, not yet secure", () => {
  const item = rc("p1-q1", "passageA");
  const history = new Map([[item.id, historyRow({ lastAttemptCorrect: true, masteryState: "learning", lastPresentedAt: daysAgo(1) })]]);
  const exposure = computeFamilyExposure([item], history);
  assert.equal(classifyRetrievalStage(exposure.get("passageA")), "SHORT_TERM_RETRIEVAL");
});

test("spaced passage retrieval: mastered passage, maintenance window elapsed", () => {
  const item = rc("p1-q1", "passageA");
  const history = new Map([[item.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(20) })]]);
  const exposure = computeFamilyExposure([item], history);
  assert.equal(classifyRetrievalStage(exposure.get("passageA")), "SPACED_RETRIEVAL");
});

test("mastered-passage deprioritisation: applyRetrievalPriority swaps a recently-confirmed passage for an unseen one", () => {
  const maintained = rc("p1-q1", "passageA");
  const fresh = rc("p2-q1", "passageB");
  const history = new Map([[maintained.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(2) })]]);
  const pool = [maintained, fresh];
  const exposure = computeFamilyExposure(pool, history);
  const out = applyRetrievalPriority([maintained], pool, exposure);
  assert.equal(out[0].id, "p2-q1", "expected the unseen passage to replace the recently-confirmed one");
});

test("new question on a previously memorised passage is not treated as fully unseen: exposure attaches to the passage, not the question", () => {
  // Learner has history on p1-q1 only; p1-q2 (a different question, same passage)
  // has never been individually seen, but the passage itself is heavily exposed.
  const seenQuestion = rc("p1-q1", "passageA");
  const neverSeenQuestionSamePassage = rc("p1-q2", "passageA");
  const history = new Map([[seenQuestion.id, historyRow({ lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(2) })]]);
  const pool = [seenQuestion, neverSeenQuestionSamePassage];
  const exposure = computeFamilyExposure(pool, history);
  // The passage-level exposure record is keyed by passageA and reflects the
  // learner's real contact with it, regardless of which specific question
  // within it was answered.
  const stage = classifyRetrievalStage(exposure.get("passageA"));
  assert.equal(stage, "MASTERY_MAINTENANCE", "a new question ID on a recently-mastered passage must not present as NEW");
});
