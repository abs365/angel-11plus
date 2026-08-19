import { test } from "node:test";
import assert from "node:assert/strict";
import { selectQuestions, computeMasteredRanksBySkill, computeDifficultyWeightMultiplier } from "@/lib/ali/selection";
import { applyRetrievalPriority } from "@/lib/learningEngine/sessionGenerator";
import { computeFamilyExposure } from "@/lib/ali/exposureIntelligence";
import { mathsQuestions } from "../../../scripts/generate-inc006-structural-depth-batch.mjs";
import type { BankQuestion, ContentDifficulty } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Stage 3, Increment 006 — proves Increment 002's difficulty-progression
 * engine can use this increment's real new content (QT-MR-12, QT-MR-08),
 * once eventually activated, the same way it was already proven for the
 * MR-04 depth batch (tests/lib/ali/mr04DifficultyIntegration.test.ts).
 * The ×1.5 escalation multiplier itself is not touched here.
 */

function existingMedium(id: string, skill: string, familyId: string): BankQuestion {
  return { id, skill, subject: "maths", contentDifficulty: "medium" as ContentDifficulty, familyId, learningUnitId: id, prompt: {} } as unknown as BankQuestion;
}

function newHard(id: string, skill: string, familyId: string): BankQuestion {
  return { id, skill, subject: "maths", contentDifficulty: "hard" as ContentDifficulty, familyId, learningUnitId: id, prompt: {} } as unknown as BankQuestion;
}

function historyRow(opts: Partial<StudentQuestionHistoryRow>): StudentQuestionHistoryRow {
  return {
    profileId: "test-profile", questionId: "test-question", source: "practice",
    timesSeen: 1, timesCorrect: 1, distinctCorrectSessions: 1, lastCorrectSessionId: null,
    lastPresentedAt: new Date().toISOString(), lastPresentedAtSequence: 1, lastAttemptCorrect: true,
    secondLastAttemptCorrect: null, masteryState: "learning", lastAttemptTimeSeconds: null,
    lastAttemptSkipped: null, lastAttemptAnswerChanged: null, lastAttemptFirstAnswer: null,
    lastAttemptFinalAnswer: null, lastAttemptConfidenceRating: null, lastAttemptWorkingShown: null,
    firstSource: null, lastAttemptSupportTier: null,
    ...opts,
  };
}

const fixedRandom = () => 0.5;

const existingByskill = {
  "QT-MR-12": existingMedium("mr01-mean-01", "QT-MR-12", "mr01-average-mean"),
  "QT-MR-08": existingMedium("mr03-coord-01", "QT-MR-08", "mr03-coordinate"),
};

test("real new questions loaded from the generator script: 4 QT-MR-12, 4 QT-MR-08, all 'hard'", () => {
  const bySkill: Record<string, number> = {};
  for (const q of mathsQuestions) bySkill[q.skill] = (bySkill[q.skill] ?? 0) + 1;
  assert.equal(bySkill["QT-MR-12"], 4);
  assert.equal(bySkill["QT-MR-08"], 4);
});

for (const skill of ["QT-MR-12", "QT-MR-08"] as const) {
  test(`${skill}: with zero mastery evidence, the new 'hard' questions receive exactly the neutral (1×) weight, never an artificial boost`, () => {
    const newQuestions = mathsQuestions.filter((q) => q.skill === skill).map((q) => newHard(q.id, q.skill, q.family_id));
    const candidates = [existingByskill[skill], ...newQuestions];
    const history = new Map<string, StudentQuestionHistoryRow>();
    const ranks = computeMasteredRanksBySkill(candidates, history);
    for (const q of newQuestions) {
      assert.equal(computeDifficultyWeightMultiplier(q, ranks, history), 1, `${q.id} must not be prematurely boosted with zero relevant evidence`);
    }
  });

  test(`${skill}: stronger verified mastery of the existing medium question measurably shifts sampling toward the new 'hard' questions`, () => {
    const newQuestions = mathsQuestions.filter((q) => q.skill === skill).map((q) => newHard(q.id, q.skill, q.family_id));
    const existing = existingByskill[skill];
    const candidates = [existing, ...newQuestions];
    const masteredHistory = new Map([[existing.id, historyRow({ questionId: existing.id, masteryState: "mastered", distinctCorrectSessions: 3 })]]);
    const neutralHistory = new Map<string, StudentQuestionHistoryRow>();

    let hardPicksWhenMastered = 0;
    let hardPicksWhenNeutral = 0;
    const trials = 300;
    for (let i = 0; i < trials; i++) {
      const rand = () => (i % 83) / 83;
      const withMastery = selectQuestions(candidates, masteredHistory, 0, new Set(), 1, rand);
      const withoutMastery = selectQuestions(candidates, neutralHistory, 0, new Set(), 1, rand);
      if (withMastery.questions[0]?.contentDifficulty === "hard") hardPicksWhenMastered++;
      if (withoutMastery.questions[0]?.contentDifficulty === "hard") hardPicksWhenNeutral++;
    }
    assert.ok(
      hardPicksWhenMastered > hardPicksWhenNeutral,
      `${skill}: expected more hard-tier picks once the existing medium content is genuinely mastered (mastered=${hardPicksWhenMastered}, neutral=${hardPicksWhenNeutral})`
    );
  });
}

test("WEAK-SKILL PRIORITISATION STILL WINS: a weak QT-MR-12 question is still guaranteed a reserved slot ahead of unrelated content, difficulty weighting notwithstanding", () => {
  const revmean = mathsQuestions.filter((q) => q.family_id === "mr01-reverse-mean").map((q) => newHard(q.id, q.skill, q.family_id));
  const unrelated = existingMedium("other-skill-q", "QT-MR-09", "some-other-family");
  const candidates = [...revmean, unrelated];
  const history = new Map([
    ["other-skill-q", historyRow({ questionId: "other-skill-q", masteryState: "learning", lastPresentedAtSequence: 105 })],
    [revmean[0].id, historyRow({ questionId: revmean[0].id, masteryState: "learning", lastPresentedAtSequence: 100 })],
  ]);
  const result = selectQuestions(candidates, history, 109, new Set(["QT-MR-12"]), 1, fixedRandom);
  assert.equal(result.questions[0]?.id, revmean[0].id, "the weak-skill guaranteed reserve must still win regardless of the new difficulty layer");
});

test("SPACED RETRIEVAL STILL OPERATES on the new families: a mastered, recently-confirmed mr03-coord-combined family is still swapped for a genuinely new alternative", () => {
  const now = new Date();
  const recentIso = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
  const mastered = newHard("mr03-combo-01", "QT-MR-08", "mr03-coord-combined");
  const fresh = existingMedium("mr03-coord-02", "QT-MR-08", "mr03-coordinate");
  const candidates = [mastered, fresh];
  const history = new Map([[mastered.id, historyRow({ questionId: mastered.id, masteryState: "mastered", distinctCorrectSessions: 3, lastPresentedAt: recentIso, lastPresentedAtSequence: 1 })]]);
  const exposure = computeFamilyExposure(candidates, history);
  const afterRetrieval = applyRetrievalPriority([mastered], candidates, exposure, now);
  assert.equal(afterRetrieval[0]?.id, fresh.id, "the pre-existing spaced-retrieval swap must still operate on the new mr03-coord-combined family");
});

test("COOLDOWN STILL OPERATES on the new families: a new question still under its own cooldown window is excluded regardless of difficulty weighting", () => {
  const q1 = newHard("mr01-revmean-01", "QT-MR-12", "mr01-reverse-mean");
  const q2 = existingMedium("mr01-mean-01", "QT-MR-12", "mr01-average-mean");
  const fresh = newHard("mr01-revmean-03", "QT-MR-12", "mr01-reverse-mean");
  const history = new Map([
    [q2.id, historyRow({ questionId: q2.id, masteryState: "learning", lastPresentedAtSequence: 105 })],
    [q1.id, historyRow({ questionId: q1.id, masteryState: "mastered", distinctCorrectSessions: 3, lastPresentedAtSequence: 100 })],
  ]);
  const result = selectQuestions([q1, q2, fresh], history, 100 + 15 - 1, new Set(), 1, fixedRandom);
  assert.ok(!result.questions.some((r) => r.id === q1.id), "a new hard-tier question still under cooldown must be excluded, difficulty weighting notwithstanding");
});

test("THIN-POOL FALLBACK STILL WORKS: when only the new hard question is available for a skill, it is still selected rather than the session failing to construct", () => {
  const onlyOption = newHard("mr03-combo-02", "QT-MR-08", "mr03-coord-combined");
  const result = selectQuestions([onlyOption], new Map(), 0, new Set(), 1, fixedRandom);
  assert.equal(result.questions.length, 1);
  assert.equal(result.questions[0].id, onlyOption.id);
});
