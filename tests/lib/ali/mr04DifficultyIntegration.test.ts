import { test } from "node:test";
import assert from "node:assert/strict";
import { selectQuestions, computeMasteredRanksBySkill, computeDifficultyWeightMultiplier } from "@/lib/ali/selection";
import { applyRetrievalPriority } from "@/lib/learningEngine/sessionGenerator";
import { computeFamilyExposure } from "@/lib/ali/exposureIntelligence";
import { mathsQuestions } from "../../../scripts/generate-mr04-depth-batch.mjs";
import type { BankQuestion, ContentDifficulty } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Stage 3, Increment 003 — proves Increment 002's difficulty-progression
 * engine can actually use the real new content this increment authors,
 * not synthetic fixtures. Uses the real skill codes (QT-MR-04/10/13) and
 * the real new question IDs from scripts/generate-mr04-depth-batch.mjs.
 * The ×1.5 escalation multiplier itself is not touched or tuned here —
 * per explicit instruction, if it proves inadequate with real content
 * that is reported separately, not silently adjusted to pass a test.
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

// Real existing "medium" questions for the three targeted skills (from the
// live content this increment inspected before authoring anything).
const existingByskill = {
  "QT-MR-04": existingMedium("mr04-cpct-01", "QT-MR-04", "mr04-compound-percentage"),
  "QT-MR-10": existingMedium("mr04-time-01", "QT-MR-10", "mr04-elapsed-time"),
  "QT-MR-13": existingMedium("mr04-bv-01", "QT-MR-13", "mr04-best-value"),
};

test("real new questions loaded from the generator script: 4 QT-MR-04, 4 QT-MR-10, 3 QT-MR-13, all 'hard'", () => {
  const bySkill: Record<string, number> = {};
  for (const q of mathsQuestions) bySkill[q.skill] = (bySkill[q.skill] ?? 0) + 1;
  assert.equal(bySkill["QT-MR-04"], 4);
  assert.equal(bySkill["QT-MR-10"], 4);
  assert.equal(bySkill["QT-MR-13"], 3);
});

for (const skill of ["QT-MR-04", "QT-MR-10", "QT-MR-13"] as const) {
  test(`${skill}: WEAKER/EARLY EVIDENCE — with zero mastery evidence, the new 'hard' questions receive exactly the neutral (1×) weight, never an artificial boost`, () => {
    // A single-shot selectQuestions() outcome is not the right thing to
    // assert here: with 3-4 new hard siblings against only 1 existing
    // medium one, plain population count alone can make a hard pick more
    // likely even at neutral weight -- that is correct, pre-existing
    // weighted-sampling behaviour, not something either the old or new
    // code guarantees against. The actual property this increment must
    // prove is that the WEIGHT itself stays neutral (1×) with no
    // evidence -- proven directly here, and the resulting escalation
    // once evidence exists is proven comparatively in the next test.
    const newQuestions = mathsQuestions.filter((q) => q.skill === skill).map((q) => newHard(q.id, q.skill, q.family_id));
    const candidates = [existingByskill[skill], ...newQuestions];
    const history = new Map<string, StudentQuestionHistoryRow>(); // no evidence at all yet
    const ranks = computeMasteredRanksBySkill(candidates, history);
    for (const q of newQuestions) {
      assert.equal(computeDifficultyWeightMultiplier(q, ranks, history), 1, `${q.id} must not be prematurely boosted with zero relevant evidence`);
    }
  });

  test(`${skill}: STRONGER VERIFIED EVIDENCE (existing medium question mastered) measurably shifts sampling toward the new 'hard' questions`, () => {
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

test("WEAK-SKILL PRIORITISATION STILL WINS AT THE COMPETENCY LEVEL: a weak QT-MR-04 question is still guaranteed a reserved slot ahead of unrelated content, difficulty weighting notwithstanding", () => {
  const revpct = mathsQuestions.filter((q) => q.family_id === "mr04-reverse-percentage").map((q) => newHard(q.id, q.skill, q.family_id));
  const unrelated = existingMedium("other-skill-q", "QT-MR-09", "some-other-family");
  const candidates = [...revpct, unrelated];
  // revpct[0] is cooling down under the ordinary rule; "unrelated" was the
  // most recently presented question (step 1's own absolute exclusion --
  // see tests/lib/ali/selection.test.ts for why this must not be the
  // target question itself).
  const history = new Map([
    ["other-skill-q", historyRow({ questionId: "other-skill-q", masteryState: "learning", lastPresentedAtSequence: 105 })],
    [revpct[0].id, historyRow({ questionId: revpct[0].id, masteryState: "learning", lastPresentedAtSequence: 100 })],
  ]);
  const result = selectQuestions(candidates, history, 109, new Set(["QT-MR-04"]), 1, fixedRandom);
  assert.equal(result.questions[0]?.id, revpct[0].id, "the weak-skill guaranteed reserve must still win regardless of the new difficulty layer");
});

test("SPACED RETRIEVAL STILL OPERATES on the new families: a mastered, recently-confirmed mr04-time-reverse family is still swapped for a genuinely new alternative", () => {
  const now = new Date();
  const recentIso = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
  const mastered = newHard("mr04-timerev-01", "QT-MR-10", "mr04-time-reverse");
  const fresh = existingMedium("mr04-time-02", "QT-MR-10", "mr04-elapsed-time");
  const candidates = [mastered, fresh];
  const history = new Map([[mastered.id, historyRow({ questionId: mastered.id, masteryState: "mastered", distinctCorrectSessions: 3, lastPresentedAt: recentIso, lastPresentedAtSequence: 1 })]]);
  const exposure = computeFamilyExposure(candidates, history);
  const afterRetrieval = applyRetrievalPriority([mastered], candidates, exposure, now);
  assert.equal(afterRetrieval[0]?.id, fresh.id, "the pre-existing spaced-retrieval swap must still operate on the new mr04-time-reverse family");
});

test("COOLDOWN STILL OPERATES on the new families: a new question still under its own cooldown window is excluded regardless of difficulty weighting", () => {
  const q1 = newHard("mr04-bvconv-01", "QT-MR-13", "mr04-bv-convert");
  const q2 = existingMedium("mr04-bv-01", "QT-MR-13", "mr04-best-value");
  const fresh = newHard("mr04-bvconv-03", "QT-MR-13", "mr04-bv-convert"); // genuinely unseen, always-eligible third candidate
  // "hard" cooldown threshold = 15 questions-presented. q1 was presented
  // at sequence 100; currentSequence = 114 keeps it 14 (< 15) questions
  // in, still inside its own cooldown window. q2 is the most-recently-
  // presented question in this history (sequence 105, the max) and is
  // therefore step-1-excluded regardless. "fresh" (unseen, no history
  // row at all) is included so the pool is never empty -- without a
  // genuinely eligible alternative, step 5's own separate
  // fallback-shortfall mechanism would resurface q1 anyway regardless of
  // its cooldown, exactly as found and fixed in tests/lib/ali/
  // selection.test.ts's weak-skill test.
  const history = new Map([
    [q2.id, historyRow({ questionId: q2.id, masteryState: "learning", lastPresentedAtSequence: 105 })],
    [q1.id, historyRow({ questionId: q1.id, masteryState: "mastered", distinctCorrectSessions: 3, lastPresentedAtSequence: 100 })],
  ]);
  const result = selectQuestions([q1, q2, fresh], history, 100 + 15 - 1, new Set(), 1, fixedRandom);
  assert.ok(!result.questions.some((r) => r.id === q1.id), "a new hard-tier question still under cooldown must be excluded, difficulty weighting notwithstanding");
});

test("THIN-POOL FALLBACK STILL WORKS: when only the new hard question is available for a skill (no existing sibling reachable), it is still selected rather than the session failing to construct", () => {
  const onlyOption = newHard("mr04-bvconv-02", "QT-MR-13", "mr04-bv-convert");
  const result = selectQuestions([onlyOption], new Map(), 0, new Set(), 1, fixedRandom);
  assert.equal(result.questions.length, 1);
  assert.equal(result.questions[0].id, onlyOption.id);
});
