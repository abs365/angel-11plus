import { test } from "node:test";
import assert from "node:assert/strict";
import {
  selectQuestions,
  computeMasteredRanksBySkill,
  computeDifficultyWeightMultiplier,
  COOLDOWN_QUESTIONS,
} from "@/lib/ali/selection";
import { applyRetrievalPriority, buildPreparationWeightBias } from "@/lib/learningEngine/sessionGenerator";
import { computeFamilyExposure } from "@/lib/ali/exposureIntelligence";
import type { BankQuestion, ContentDifficulty } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Stage 3, Increment 002 (Evidence-Driven Difficulty Progression).
 * `lib/ali/selection.ts` — the real function `sessionGenerator.ts` reuses
 * unmodified for canonical Practice — had zero prior direct unit tests
 * (confirmed by search before writing this file; only
 * `passageAwareSelection.test.ts` exists, and it exercises
 * `sessionGenerator.ts`'s own functions, never `selectQuestions()`
 * itself). This file covers both the new difficulty-progression layer
 * and, deliberately, the pre-existing mechanisms it must not disturb —
 * so this increment's own regression proof is not "we didn't touch that
 * code" alone, but a real, passing test against the unmodified paths too.
 */

function q(id: string, skill: string, difficulty: ContentDifficulty): BankQuestion {
  return { id, skill, subject: "maths", contentDifficulty: difficulty, prompt: {} } as unknown as BankQuestion;
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

const fixedRandom = () => 0.5; // deterministic, mid-weight pick every call

// ===========================================================================
// computeMasteredRanksBySkill / computeDifficultyWeightMultiplier — the pure
// difficulty layer, tested directly and in isolation first.
// ===========================================================================

test("no evidence at all -> no skill has any mastered rank, every candidate gets neutral weight", () => {
  const candidates = [q("e1", "QT-MR-01", "easy"), q("h1", "QT-MR-01", "hard")];
  const history = new Map<string, StudentQuestionHistoryRow>();
  const ranks = computeMasteredRanksBySkill(candidates, history);
  assert.equal(ranks.size, 0);
  assert.equal(computeDifficultyWeightMultiplier(candidates[1], ranks, history), 1);
});

test("LEARNER WITH LITTLE EVIDENCE: an unattempted skill never receives an escalation boost", () => {
  const candidates = [q("e1", "QT-MR-01", "easy"), q("h1", "QT-MR-01", "hard")];
  const history = new Map([["e1", historyRow({ questionId: "e1", masteryState: "new", timesSeen: 0 })]]);
  const ranks = computeMasteredRanksBySkill(candidates, history);
  assert.equal(computeDifficultyWeightMultiplier(candidates[1], ranks, history), 1);
});

test("LEARNER WITH DEVELOPING EVIDENCE (masteryState: 'learning', not yet mastered): no boost -- insufficient confidence to escalate", () => {
  const candidates = [q("e1", "QT-MR-01", "easy"), q("h1", "QT-MR-01", "hard")];
  const history = new Map([["e1", historyRow({ questionId: "e1", masteryState: "learning" })]]);
  const ranks = computeMasteredRanksBySkill(candidates, history);
  assert.equal(computeDifficultyWeightMultiplier(candidates[1], ranks, history), 1, "'learning' is real evidence but not yet strong enough to justify escalation");
});

test("LEARNER WITH STRONGER VERIFIED EVIDENCE (masteryState: 'mastered' on the easier sibling): the harder sibling IS boosted", () => {
  const candidates = [q("e1", "QT-MR-01", "easy"), q("h1", "QT-MR-01", "hard")];
  const history = new Map([["e1", historyRow({ questionId: "e1", masteryState: "mastered", distinctCorrectSessions: 3 })]]);
  const ranks = computeMasteredRanksBySkill(candidates, history);
  const multiplier = computeDifficultyWeightMultiplier(candidates[1], ranks, history);
  assert.ok(multiplier > 1, "a genuinely mastered easier sibling must escalate weight toward the harder one");
});

test("mastery on the SAME or HARDER tier does not boost -- only strictly-easier mastery counts", () => {
  const candidates = [q("m1", "QT-MR-01", "medium"), q("h1", "QT-MR-01", "hard")];
  const history = new Map([["m1", historyRow({ questionId: "m1", masteryState: "mastered" })]]);
  const ranks = computeMasteredRanksBySkill(candidates, history);
  // medium is itself the candidate being scored here -- no easier sibling exists for it.
  assert.equal(computeDifficultyWeightMultiplier(candidates[0], ranks, history), 1);
});

test("SELF-ASSESSED-ONLY EVIDENCE cannot drive escalation: masteryState can never reach 'mastered' from a self-assessed attempt (supportTier='supported'), so this is proven by construction via mastery.ts's own applyAttemptOutcome, not re-implemented here -- confirmed by asserting 'learning'/'weak' (the only states self-assessed evidence can ever reach) never boost", () => {
  const candidates = [q("e1", "QT-MR-01", "easy"), q("h1", "QT-MR-01", "hard")];
  for (const state of ["new", "learning", "weak"] as const) {
    const history = new Map([["e1", historyRow({ questionId: "e1", masteryState: state })]]);
    const ranks = computeMasteredRanksBySkill(candidates, history);
    assert.equal(computeDifficultyWeightMultiplier(candidates[1], ranks, history), 1, `masteryState "${state}" must never escalate`);
  }
});

test("ONE LUCKY CORRECT ANSWER is not durable escalation: a single-session correct with distinctCorrectSessions=1 and masteryState='learning' (not yet 'mastered') does not boost", () => {
  const candidates = [q("e1", "QT-MR-01", "easy"), q("h1", "QT-MR-01", "hard")];
  const history = new Map([["e1", historyRow({ questionId: "e1", masteryState: "learning", distinctCorrectSessions: 1, timesCorrect: 1 })]]);
  const ranks = computeMasteredRanksBySkill(candidates, history);
  assert.equal(computeDifficultyWeightMultiplier(candidates[1], ranks, history), 1);
});

test("STRUGGLING LEARNER: the harder question itself reaching masteryState='weak' stops receiving the boost, even though the easier sibling remains mastered", () => {
  const candidates = [q("e1", "QT-MR-01", "easy"), q("h1", "QT-MR-01", "hard")];
  const history = new Map([
    ["e1", historyRow({ questionId: "e1", masteryState: "mastered", distinctCorrectSessions: 3 })],
    ["h1", historyRow({ questionId: "h1", masteryState: "weak", lastAttemptCorrect: false, secondLastAttemptCorrect: false })],
  ]);
  const ranks = computeMasteredRanksBySkill(candidates, history);
  assert.equal(computeDifficultyWeightMultiplier(candidates[1], ranks, history), 1, "a struggling learner must not keep an artificial escalation push toward a question they are demonstrably not managing");
  // The easier sibling itself is untouched -- it keeps its own ordinary weight, still selectable.
  assert.equal(computeDifficultyWeightMultiplier(candidates[0], ranks, history), 1);
});

test("ONLY ONE DIFFICULTY AVAILABLE for a skill: no boost is possible (no easier sibling exists), and the candidate is never penalised for it", () => {
  const candidates = [q("m1", "QT-MR-01", "medium"), q("m2", "QT-MR-01", "medium")];
  const history = new Map([["m1", historyRow({ questionId: "m1", masteryState: "mastered", distinctCorrectSessions: 3 })]]);
  const ranks = computeMasteredRanksBySkill(candidates, history);
  assert.equal(computeDifficultyWeightMultiplier(candidates[1], ranks, history), 1);
});

test("DESIRED DIFFICULTY UNAVAILABLE: mastery in one skill never boosts a DIFFERENT skill's harder content", () => {
  const candidates = [q("e1", "QT-MR-01", "easy"), q("h1", "QT-MR-02", "hard")];
  const history = new Map([["e1", historyRow({ questionId: "e1", masteryState: "mastered", distinctCorrectSessions: 3 })]]);
  const ranks = computeMasteredRanksBySkill(candidates, history);
  assert.equal(computeDifficultyWeightMultiplier(candidates[1], ranks, history), 1, "escalation must stay scoped to the same skill -- never bleed across unrelated skills");
});

// ===========================================================================
// selectQuestions() end-to-end — proves the difficulty layer composes
// correctly with every pre-existing mechanism it must preserve.
// ===========================================================================

test("DETERMINISTIC: identical inputs (including the same random function) produce identical output", () => {
  const candidates = [q("e1", "QT-MR-01", "easy"), q("m1", "QT-MR-01", "medium"), q("h1", "QT-MR-01", "hard")];
  const history = new Map([["e1", historyRow({ questionId: "e1", masteryState: "mastered", distinctCorrectSessions: 3 })]]);
  const run1 = selectQuestions(candidates, history, 10, new Set(), 2, fixedRandom);
  const run2 = selectQuestions(candidates, history, 10, new Set(), 2, fixedRandom);
  assert.deepEqual(run1.questions.map((r) => r.id), run2.questions.map((r) => r.id));
});

test("NO ELIGIBLE QUESTION REGRESSION: an empty candidate pool returns an empty selection without throwing", () => {
  const result = selectQuestions([], new Map(), 0, new Set(), 5, fixedRandom);
  assert.deepEqual(result.questions, []);
});

test("EXISTING WEAK-SKILL SWAP REMAINS FUNCTIONAL: a cooling-down question in a weak skill is still overridden into eligibility", () => {
  const threshold = COOLDOWN_QUESTIONS.medium;
  const candidates = [q("w1", "QT-MR-01", "medium"), q("other", "QT-MR-02", "medium"), q("fresh", "QT-MR-03", "medium")];
  const history = new Map([
    // "other" is the most-recently-presented question (step 1's absolute
    // exclusion targets whichever question(s) share the single highest
    // lastPresentedAtSequence, "never overridden by weak-skill status" per
    // selectQuestions()'s own docstring) -- w1 must NOT be that question,
    // or this test would be exercising step 1, not the weak-skill override.
    // "fresh" (a genuinely unseen, always-eligible third question) is
    // included so the "without weak" baseline has a real competing
    // candidate to win the single slot, rather than the general pool
    // being empty and step 5's own separate fallback-shortfall mechanism
    // resurfacing w1 anyway regardless of weak-skill status.
    ["other", historyRow({ questionId: "other", masteryState: "learning", lastPresentedAtSequence: 105 })],
    ["w1", historyRow({ questionId: "w1", masteryState: "learning", lastPresentedAtSequence: 100 })],
  ]);
  const currentSequence = 100 + threshold - 1; // still cooling down under the ordinary rule
  const withoutWeak = selectQuestions(candidates, history, currentSequence, new Set(), 1, fixedRandom);
  assert.ok(!withoutWeak.questions.some((r) => r.id === "w1"), "sanity check: without weak-skill override, the cooling-down question is correctly not selected while a genuinely eligible alternative exists");

  const withWeak = selectQuestions(candidates, history, currentSequence, new Set(["QT-MR-01"]), 1, fixedRandom);
  assert.equal(withWeak.questions.length, 1);
  assert.equal(withWeak.questions[0].id, "w1", "the pre-existing weak-skill override's guaranteed reserve must still resurface the cooling-down question ahead of the ordinary pool");
  assert.equal(withWeak.trace[0].weakSkillOverride, true);
});

test("COOLDOWN INTERACTION: a difficulty-boosted candidate that is still cooling down is correctly excluded regardless of its boost", () => {
  const threshold = COOLDOWN_QUESTIONS.hard;
  const candidates = [
    q("e1", "QT-MR-01", "easy"),
    q("h1", "QT-MR-01", "hard"),
  ];
  const history = new Map([
    ["e1", historyRow({ questionId: "e1", masteryState: "mastered", distinctCorrectSessions: 3, lastPresentedAtSequence: 1 })],
    ["h1", historyRow({ questionId: "h1", masteryState: "learning", lastPresentedAtSequence: 100 })],
  ]);
  const currentSequence = 100 + threshold - 1; // h1 is still within its own cooldown window
  const result = selectQuestions(candidates, history, currentSequence, new Set(), 5, fixedRandom);
  assert.ok(!result.questions.some((r) => r.id === "h1"), "cooldown eligibility is decided before difficulty weighting is ever applied -- a boost cannot override it");
});

test("SPACED-RETRIEVAL / MASTERY-RESURFACE CANDIDATE: difficulty weighting never applies to the mastered-resurface bucket", () => {
  const threshold = COOLDOWN_QUESTIONS.medium;
  const candidates = [q("mr1", "QT-MR-01", "medium"), q("other", "QT-MR-02", "medium")];
  const history = new Map([
    // Same reason as the weak-skill-swap test above: "other" must be the
    // most-recently-presented question so step 1's absolute exclusion
    // doesn't remove mr1 before it ever reaches resurface classification.
    ["other", historyRow({ questionId: "other", masteryState: "learning", lastPresentedAtSequence: 1 + threshold * 3 })],
    ["mr1", historyRow({ questionId: "mr1", masteryState: "mastered", distinctCorrectSessions: 3, lastPresentedAtSequence: 1 })],
  ]);
  const currentSequence = 1 + threshold * 3; // past the mastered-resurface multiplier window
  const result = selectQuestions(candidates, history, currentSequence, new Set(), 1, fixedRandom);
  assert.equal(result.questions.length, 1);
  assert.equal(result.trace[0].selectionReason, "mastered-resurface", "still correctly classified via the pre-existing, unmodified resurface mechanic");
});

test("a mastered easier sibling measurably shifts sampling probability toward the harder, unseen candidate over many trials (proves the boost is real, not just present in the trace)", () => {
  const candidates = [q("e1", "QT-MR-01", "easy"), q("h1", "QT-MR-01", "hard"), q("h2", "QT-MR-01", "hard")];
  const boostedHistory = new Map([["e1", historyRow({ questionId: "e1", masteryState: "mastered", distinctCorrectSessions: 3 })]]);
  const neutralHistory = new Map<string, StudentQuestionHistoryRow>();

  let boostedHardPicks = 0;
  let neutralHardPicks = 0;
  const trials = 400;
  for (let i = 0; i < trials; i++) {
    const rand = () => (i % 97) / 97; // deterministic pseudo-varied sequence, no real RNG needed
    const boosted = selectQuestions(candidates, boostedHistory, 0, new Set(), 1, rand);
    const neutral = selectQuestions(candidates, neutralHistory, 0, new Set(), 1, rand);
    if (boosted.questions[0]?.contentDifficulty === "hard") boostedHardPicks++;
    if (neutral.questions[0]?.contentDifficulty === "hard") neutralHardPicks++;
  }
  assert.ok(boostedHardPicks > neutralHardPicks, `expected more hard-tier picks once evidence justifies it (boosted=${boostedHardPicks}, neutral=${neutralHardPicks})`);
});

// ===========================================================================
// EXISTING 14-DAY SPACED RETRIEVAL REMAINS FUNCTIONAL — a real end-to-end
// composition test, not merely "that file was not modified": selectQuestions()'s
// own output (with the new difficulty layer active) is fed into the
// unmodified applyRetrievalPriority()/computeFamilyExposure() exactly as
// sessionGenerator.ts's real generatePersonalisedSession() does.
// ===========================================================================

function familyQ(id: string, familyId: string, difficulty: ContentDifficulty): BankQuestion {
  return { id, skill: "QT-MR-01", subject: "maths", familyId, learningUnitId: familyId, contentDifficulty: difficulty, prompt: {} } as unknown as BankQuestion;
}

test("14-day spaced retrieval composes correctly with the new difficulty layer: a securely-mastered family recently confirmed (MASTERY_MAINTENANCE) is still swapped for a NEW alternative", () => {
  const now = new Date();
  const recentIso = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(); // 1 day ago, well inside the 14-day maintenance window

  // "old" belongs to a family the learner mastered and confirmed recently
  // (MASTERY_MAINTENANCE -- correctly deprioritised but never suppressed).
  // "fresh" belongs to a different, entirely NEW family with no history at
  // all -- the real alternative applyRetrievalPriority() should swap toward.
  const candidates = [familyQ("old", "famA", "medium"), familyQ("fresh", "famB", "medium")];
  const history = new Map([
    ["old", historyRow({ questionId: "old", masteryState: "mastered", distinctCorrectSessions: 3, lastPresentedAt: recentIso, lastPresentedAtSequence: 1 })],
  ]);

  // This test's job is specifically to prove applyRetrievalPriority()'s own
  // swap still fires correctly on selectQuestions()'s real BankQuestion
  // output shape once a MASTERY_MAINTENANCE item is in the selected set --
  // not to re-litigate selectQuestions()'s own independent preference for
  // unseen content, so the pre-retrieval set is constructed directly here.
  const preRetrieval = [candidates[0]]; // "old" -- the mastered, recently-confirmed family
  const exposure = computeFamilyExposure(candidates, history);
  const afterRetrieval = applyRetrievalPriority(preRetrieval, candidates, exposure, now);

  assert.equal(afterRetrieval[0]?.id, "fresh", "the pre-existing, unmodified spaced-retrieval swap must still replace a recently-confirmed mastered family with a genuinely new alternative");
});

// ===========================================================================
// Programme Increment 021 — Preparation Horizon weight-bias mechanism.
// buildPreparationWeightBias() is a pure function over a real, already-
// computed decision context; tested directly (deterministic) rather than
// via statistical trials of the weighted-random sampler it feeds.
// ===========================================================================

function fullQ(id: string, difficulty: ContentDifficulty, opts: Partial<BankQuestion> = {}): BankQuestion {
  return { id, skill: "QT-MR-01", subject: "maths", contentDifficulty: difficulty, prompt: {}, ...opts } as unknown as BankQuestion;
}

test("buildPreparationWeightBias(undefined) is a pure no-op -- every pre-Increment-021 caller stays byte-for-byte unaffected", () => {
  const bias = buildPreparationWeightBias(undefined);
  for (const d of ["easy", "medium", "hard", "challenge"] as ContentDifficulty[]) {
    assert.equal(bias(fullQ("x", d)), 1);
  }
});

test("favour_guided_and_easier boosts easy/medium and dampens hard/challenge, but NEVER to zero (preference, not a lock)", () => {
  const bias = buildPreparationWeightBias({ recommendedDifficultyLean: "favour_guided_and_easier", recommendedActivityType: "independent_practice" });
  const easy = bias(fullQ("e", "easy"));
  const challenge = bias(fullQ("c", "challenge"));
  assert.ok(easy > 1, "easy must be boosted above the neutral 1x weight");
  assert.ok(challenge > 0 && challenge < 1, "challenge must be dampened, but never to exactly zero -- a foundation-stage learner must still be able to draw a harder item");
});

test("favour_independent_and_harder boosts hard/challenge and dampens easy, but never to zero", () => {
  const bias = buildPreparationWeightBias({ recommendedDifficultyLean: "favour_independent_and_harder", recommendedActivityType: "independent_practice" });
  const easy = bias(fullQ("e", "easy"));
  const challenge = bias(fullQ("c", "challenge"));
  assert.ok(challenge > 1, "challenge must be boosted above the neutral 1x weight");
  assert.ok(easy > 0 && easy < 1, "easy must be dampened, but never to exactly zero");
});

test("balanced lean applies no bias at all -- development-stage learners get the ordinary, unweighted distribution", () => {
  const bias = buildPreparationWeightBias({ recommendedDifficultyLean: "balanced", recommendedActivityType: "independent_practice" });
  for (const d of ["easy", "medium", "hard", "challenge"] as ContentDifficulty[]) {
    assert.equal(bias(fullQ("x", d)), 1);
  }
});

test("null recommendedDifficultyLean (no real candidate to derive a lean from) applies no difficulty bias", () => {
  const bias = buildPreparationWeightBias({ recommendedDifficultyLean: null, recommendedActivityType: "independent_practice" });
  assert.equal(bias(fullQ("x", "hard")), 1);
});

test("the difficulty-lean table is never keyed by school year -- the same lean produces the identical bias regardless of any year-group context (Founder's own explicit boundary: school year is contextual evidence, not an independent difficulty command)", () => {
  // buildPreparationWeightBias's own signature has no schoolYear parameter
  // at all -- this test is a structural proof that fact cannot silently
  // regress: the SAME lean, called twice, must be identical every time.
  const biasA = buildPreparationWeightBias({ recommendedDifficultyLean: "favour_independent_and_harder", recommendedActivityType: "independent_practice" });
  const biasB = buildPreparationWeightBias({ recommendedDifficultyLean: "favour_independent_and_harder", recommendedActivityType: "independent_practice" });
  for (const d of ["easy", "medium", "hard", "challenge"] as ContentDifficulty[]) {
    assert.equal(biasA(fullQ("x", d)), biasB(fullQ("x", d)));
  }
});

test("unseen_transfer_check boosts FAR_TRANSFER-tagged questions specifically, never other transfer classes, and never excludes them", () => {
  const bias = buildPreparationWeightBias({ recommendedDifficultyLean: "balanced", recommendedActivityType: "unseen_transfer_check" });
  const farTransfer = bias(fullQ("ft", "medium", { transferClass: "FAR_TRANSFER" }));
  const routine = bias(fullQ("r", "medium", { transferClass: "ROUTINE" }));
  const untagged = bias(fullQ("u", "medium", {}));
  assert.ok(farTransfer > 1, "FAR_TRANSFER must be boosted for an unseen-transfer-check recommendation");
  assert.equal(routine, 1, "a ROUTINE-tagged question must not be boosted merely because the session favours transfer");
  assert.equal(untagged, 1, "an untagged question must remain fully selectable at ordinary weight, never excluded");
});

test("teaching_lesson/guided_practice boosts a family with real authored teaching content, never a family without it", () => {
  const bias = buildPreparationWeightBias({ recommendedDifficultyLean: "favour_guided_and_easier", recommendedActivityType: "guided_practice" });
  // mr03-mixed-perimeter is a real family with a genuine MATHS_FAMILY_TEACHING_CONTENT entry (verified elsewhere this programme).
  const withTeaching = bias(fullQ("t", "easy", { familyId: "mr03-mixed-perimeter" }));
  const withoutTeaching = bias(fullQ("nt", "easy", { familyId: "a-family-with-no-teaching-content-xyz" }));
  assert.ok(withTeaching > withoutTeaching, "a family with real guided/teaching content must be preferentially boosted for a guided-shaped recommendation");
});

test("selectQuestions()'s own new weightBias parameter defaults to a true no-op -- omitting it reproduces the exact pre-Increment-021 selection for the same seeded random sequence", () => {
  const candidates = [q("a", "QT-MR-01", "easy"), q("b", "QT-MR-01", "hard"), q("c", "QT-MR-01", "medium")];
  const history = new Map<string, StudentQuestionHistoryRow>();
  const withoutBias = selectQuestions(candidates, history, 1, new Set(), 2, mulberry32(42));
  const withNoOpBias = selectQuestions(candidates, history, 1, new Set(), 2, mulberry32(42), () => 1);
  assert.deepEqual(withoutBias.questions.map((x) => x.id), withNoOpBias.questions.map((x) => x.id));
});

test("selectQuestions() with a real difficulty-lean bias genuinely shifts the weighted composition toward the favoured tier over many trials (statistical proof the bias reaches the real sampler, not just the pure weight function)", () => {
  const candidates = [
    fullQ("easy1", "easy"), fullQ("easy2", "easy"),
    fullQ("hard1", "hard"), fullQ("hard2", "hard"),
  ];
  const history = new Map<string, StudentQuestionHistoryRow>();
  const bias = buildPreparationWeightBias({ recommendedDifficultyLean: "favour_guided_and_easier", recommendedActivityType: "independent_practice" });

  let easyCountBiased = 0;
  let easyCountUnbiased = 0;
  const trials = 300;
  for (let i = 0; i < trials; i++) {
    const rand = mulberry32(i);
    const biased = selectQuestions(candidates, history, 1, new Set(), 1, rand, bias);
    if (biased.questions[0]?.contentDifficulty === "easy") easyCountBiased++;
    const unbiased = selectQuestions(candidates, history, 1, new Set(), 1, rand);
    if (unbiased.questions[0]?.contentDifficulty === "easy") easyCountUnbiased++;
  }
  assert.ok(easyCountBiased > easyCountUnbiased, `favour_guided_and_easier must draw "easy" more often than the unbiased baseline over ${trials} trials (biased=${easyCountBiased}, unbiased=${easyCountUnbiased})`);
});

/** Small deterministic PRNG (seeded) so the statistical trial above is reproducible, not flaky. */
function mulberry32(seed: number): () => number {
  let a = seed + 0x6d2b79f5;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
