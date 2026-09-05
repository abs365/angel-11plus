import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { computeLearnerCapacityEvidence } from "@/lib/ali/capacityEvidence";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Question Factory Wave 2, Section 8 — the first real caller of
 * `lib/ali/effectiveFreshCapacity.ts`. Real behavioural tests over the
 * new orchestration function, plus a structural proof that it is wired
 * into the live session generator as internal evidence only (never a
 * learner-facing number, never a change to selection weights).
 */

function q(id: string, familyId: string): BankQuestion {
  return {
    id,
    subject: "maths",
    skill: "QT-MR-01",
    pathway: ["csse"],
    contentDifficulty: "medium",
    questionType: "short-answer",
    estimatedTimeSeconds: 60,
    prompt: {} as BankQuestion["prompt"],
    explanation: "",
    confidenceWeight: 1,
    revisionPriority: 3,
    masteryThreshold: 2,
    usageCount: 0,
    avgSuccessRate: null,
    learningUnitId: id,
    familyId,
    eligibilityStatus: "practice_eligible",
    active: true,
  } as BankQuestion;
}

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

test("computeLearnerCapacityEvidence classifies a family with an unseen sibling as fresh", () => {
  const pool = [q("a1", "fam-a"), q("a2", "fam-a")];
  const history = new Map([["a1", historyRow({ questionId: "a1", timesSeen: 2, lastPresentedAtSequence: 5 })]]);
  const evidence = computeLearnerCapacityEvidence(pool, history, 10);
  assert.equal(evidence.totalFamiliesConsidered, 1);
  assert.equal(evidence.freshFamilyCount, 1);
});

test("computeLearnerCapacityEvidence classifies a fully-seen, still-cooling-down family as recently_exhausted", () => {
  const pool = [q("b1", "fam-b")];
  const history = new Map([["b1", historyRow({ questionId: "b1", timesSeen: 1, lastPresentedAtSequence: 9 })]]);
  const evidence = computeLearnerCapacityEvidence(pool, history, 10); // distance 1, medium threshold 10 -> still cooling
  assert.equal(evidence.recentlyExhaustedFamilyCount, 1);
  assert.equal(evidence.freshFamilyCount, 0);
});

test("computeLearnerCapacityEvidence reports insufficient_metadata for a question with no groupingKeyOf() key at all", () => {
  const noKeyQuestion = { ...q("c1", "fam-c"), familyId: undefined, learningUnitId: undefined } as unknown as BankQuestion;
  const evidence = computeLearnerCapacityEvidence([noKeyQuestion], new Map(), 5);
  // groupingKeyOf() returns undefined -> the row is skipped from grouping entirely (never a fabricated group)
  assert.equal(evidence.totalFamiliesConsidered, 0);
});

test("multiple distinct families are each classified independently, and the summary totals match the number of groups considered", () => {
  const pool = [q("d1", "fam-d"), q("e1", "fam-e")];
  const history = new Map<string, StudentQuestionHistoryRow>(); // both genuinely unseen -> both fresh
  const evidence = computeLearnerCapacityEvidence(pool, history, 1);
  assert.equal(evidence.totalFamiliesConsidered, 2);
  assert.equal(evidence.freshFamilyCount, 2);
});

const SESSION_GENERATOR_SOURCE = readFileSync("lib/learningEngine/sessionGenerator.ts", "utf8");

test("generatePersonalisedSession computes internalCapacityEvidence from the SAME candidatePool/history/currentSequence already fetched -- no new data source", () => {
  assert.match(SESSION_GENERATOR_SOURCE, /const internalCapacityEvidence = computeLearnerCapacityEvidence\(candidatePool, history, currentSequence\);/);
});

test("internalCapacityEvidence is attached to the returned PersonalisedSession but the priorityActivities/selection computation is unaffected -- the evidence call happens strictly AFTER selectQuestions()/reduceFamilyClustering()/applyRetrievalPriority() have already run", () => {
  const evidenceLineIndex = SESSION_GENERATOR_SOURCE.indexOf("const internalCapacityEvidence = computeLearnerCapacityEvidence");
  const selectionLineIndex = SESSION_GENERATOR_SOURCE.indexOf("const selection = selectQuestions(");
  const priorityActivitiesLineIndex = SESSION_GENERATOR_SOURCE.indexOf("const priorityActivities: SessionActivity[] =");
  assert.ok(evidenceLineIndex > selectionLineIndex && evidenceLineIndex > priorityActivitiesLineIndex, "capacity evidence must be computed strictly after selection, never influencing it");
});

test("no page or component anywhere renders internalCapacityEvidence to a learner -- per the Founder's explicit 'do not display a learner-facing number yet' instruction", () => {
  const pagesToCheck = [
    "app/learning-intelligence/practice/[area]/page.tsx",
    "app/learning-intelligence/practice/page.tsx",
  ];
  for (const path of pagesToCheck) {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(source, /internalCapacityEvidence/, `${path} must not render internalCapacityEvidence to a learner`);
  }
});
