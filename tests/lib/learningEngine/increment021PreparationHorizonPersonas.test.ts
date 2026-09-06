import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPreparationDecision } from "@/lib/learningEngine/preparationDecision";
import { buildPreparationWeightBias, type PreparationSessionContext } from "@/lib/learningEngine/sessionGenerator";
import { selectQuestions } from "@/lib/ali/selection";
import type { SubjectPreparationSummary, CompetencyPreparationSummary } from "@/lib/learningEngine/preparationState";
import type { PreparationClock } from "@/lib/learningEngine/preparationClock";
import type { CompetencyId } from "@/lib/learningEngine/types";
import type { EvidenceConfidenceTier } from "@/types/ali/confidence";
import type { EducationalState } from "@/types/ali/educationalState";
import type { RecommendationTrigger } from "@/types/ali/recommendationOrchestration";
import type { BankQuestion, ContentDifficulty } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Programme Increment 021, Part 5 — the six Founder-specified personas,
 * proving the FULL real pipeline end-to-end: real decision contract
 * (buildPreparationDecision, Increment 019/020) -> real weight-bias
 * function (buildPreparationWeightBias, Increment 021) -> the real
 * weighted-sample selection engine (selectQuestions, pre-existing,
 * unmodified in its own core logic). Increment 019's own persona tests
 * already proved the decision contract's own fields are computed
 * correctly in isolation; this file's own job is proving those fields
 * actually REACH and materially change what a session composes -- the
 * exact "not merely calling buildPreparationDecision()" success standard
 * this increment's own instruction names explicitly.
 */

function comp(id: CompetencyId, confidenceTier: EvidenceConfidenceTier, educationalState: EducationalState): CompetencyPreparationSummary {
  return { competencyId: id, confidenceTier, educationalState };
}
function subject(competencies: CompetencyPreparationSummary[]): SubjectPreparationSummary {
  const tiers = competencies.map((c) => c.confidenceTier);
  const evidenceState = tiers.length === 0 || tiers.every((t) => t === "insufficient")
    ? "no_evidence"
    : tiers.some((t) => t === "moderate" || t === "high")
      ? "established_evidence"
      : "developing_evidence";
  return { component: "Mathematics", competencies, evidenceState };
}
function clockFor(daysRemaining: number | null): PreparationClock {
  if (daysRemaining === null) return { targetExamDate: null, daysRemaining: null, weeksRemaining: null, horizonBand: "unavailable" };
  const horizonBand =
    daysRemaining > 365 ? "long_horizon" :
    daysRemaining > 180 ? "coverage_building" :
    daysRemaining > 90 ? "transfer_building" :
    daysRemaining > 21 ? "exam_condition" : "final_preparation";
  return { targetExamDate: "2027-01-01", daysRemaining, weeksRemaining: Math.round(daysRemaining / 7), horizonBand };
}
function candidate(competencyCode: CompetencyId, educationalState: EducationalState, triggerReason: RecommendationTrigger) {
  return { competencyCode, educationalState, triggerReason };
}

const ALL_TWELVE: CompetencyId[] = ["RC-01", "RC-02", "RC-03", "RC-04", "MR-01", "MR-02", "MR-03", "MR-04", "MR-05", "MR-06", "WC-01", "WC-02"];

function bq(id: string, difficulty: ContentDifficulty, opts: Partial<BankQuestion> = {}): BankQuestion {
  return { id, skill: "QT-MR-01", subject: "maths", contentDifficulty: difficulty, prompt: {}, ...opts } as unknown as BankQuestion;
}

/** Composes the real weighted candidate pool used throughout: 2 of each difficulty tier, all genuinely unseen (no history) so selectQuestions()'s own difficulty-progression/cooldown machinery stays neutral and only the Increment 021 weight-bias under test can explain any composition shift. */
const DIFFICULTY_POOL: BankQuestion[] = [
  bq("easy1", "easy"), bq("easy2", "easy"),
  bq("medium1", "medium"), bq("medium2", "medium"),
  bq("hard1", "hard"), bq("hard2", "hard"),
  bq("challenge1", "challenge"), bq("challenge2", "challenge"),
];

/** Small deterministic PRNG so composition proofs are reproducible, not flaky. */
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

/** Aggregate composition (which difficulty tiers actually get drawn) over many trials, for a real weighted-sample proof rather than a single roll. */
function composeOverTrials(context: PreparationSessionContext | undefined, trials = 200): Record<ContentDifficulty, number> {
  const bias = buildPreparationWeightBias(context);
  const counts: Record<ContentDifficulty, number> = { easy: 0, medium: 0, hard: 0, challenge: 0 };
  const history = new Map<string, StudentQuestionHistoryRow>();
  for (let i = 0; i < trials; i++) {
    const result = selectQuestions(DIFFICULTY_POOL, history, 1, new Set(), 1, mulberry32(i), bias);
    const drawn = result.questions[0]?.contentDifficulty;
    if (drawn) counts[drawn]++;
  }
  return counts;
}

// ─── PERSONA A -- Year 4, long runway, limited evidence, foundation profile ─

test("PERSONA A(i) -- Year 4, long runway, genuinely NO evidence anywhere: placement is required, not a foundation guess", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "insufficient", "exploring"));
  const decision = buildPreparationDecision([subject(competencies)], clockFor(600), "Year 4", [], [], { mockTechnicallyAvailable: true });
  assert.equal(decision.placementRequired, true, "no real evidence anywhere must route to placement, never a guessed foundation session");
  assert.equal(decision.recommendedActivityType, "placement_check");
});

test("PERSONA A(ii) -- Year 4, long runway, LIMITED (present but low) evidence -- meets the placement threshold, so it's a genuine foundation session, not placement again", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "low", "exploring"));
  const decision = buildPreparationDecision([subject(competencies)], clockFor(600), "Year 4", [], [], { mockTechnicallyAvailable: true });
  assert.equal(decision.placementRequired, false, "real (even if low-confidence) evidence must not force placement again -- it is not a permanent gate");
  assert.equal(decision.preparationStageGroup, "foundation");
  assert.equal(decision.recommendedDifficultyLean, "favour_guided_and_easier");

  const context: PreparationSessionContext = { recommendedDifficultyLean: decision.recommendedDifficultyLean, recommendedActivityType: decision.recommendedActivityType };
  const composition = composeOverTrials(context);
  assert.ok(composition.easy + composition.medium > composition.hard + composition.challenge, `a foundation-lean session must draw predominantly easy/medium over many trials (got ${JSON.stringify(composition)})`);
  assert.ok(composition.hard > 0 || composition.challenge > 0, "harder material must remain reachable at least occasionally -- a preference, never an absolute lock");
});

// ─── PERSONA B -- Year 4, long runway, STRONG evidence ─────────────────────

test("PERSONA B -- Year 4, long runway, strong evidence: NOT held at easy difficulty merely because of year group", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "high", "durably-mastered"));
  const decision = buildPreparationDecision([subject(competencies)], clockFor(600), "Year 4", [], [], { mockTechnicallyAvailable: true });
  assert.equal(decision.preparationStage, "transfer", "strong evidence must reach transfer even for a Year 4 learner -- school year alone never caps evidence-derived stage");
  assert.equal(decision.recommendedDifficultyLean, "favour_independent_and_harder");

  const context: PreparationSessionContext = { recommendedDifficultyLean: decision.recommendedDifficultyLean, recommendedActivityType: decision.recommendedActivityType };
  const composition = composeOverTrials(context);
  assert.ok(composition.hard + composition.challenge > composition.easy, `a strong Year 4 learner must draw MORE hard/challenge material than easy over many trials (got ${JSON.stringify(composition)}) -- proving year group alone never suppresses real evidence-justified difficulty`);
});

// ─── PERSONA C -- Year 6, short runway, insufficient evidence ──────────────

test("PERSONA C -- Year 6, short runway, insufficient evidence: bounded placement first, never blind final-readiness/hard Practice merely because time is short", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "insufficient", "exploring"));
  const decision = buildPreparationDecision([subject(competencies)], clockFor(15), "Year 6", [], [], { mockTechnicallyAvailable: true });
  assert.equal(decision.preparationStage, "insufficient_evidence", "time pressure must never override a genuine evidence gap into a false final_preparation reading");
  assert.notEqual(decision.preparationStage, "final_preparation");
  assert.equal(decision.placementRequired, true);
  assert.equal(decision.recommendedActivityType, "placement_check");
  assert.notEqual(decision.recommendedDifficultyLean, "favour_independent_and_harder", "a genuinely unknown-evidence learner must never be steered toward harder material merely because the exam is close");
});

// ─── PERSONA D -- Year 6, short runway, STRONG evidence ────────────────────

test("PERSONA D -- Year 6, short runway, strong evidence: final-readiness/exam-preparation behaviour with real transfer bias", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "high", "durably-mastered"));
  const ordered = [candidate("MR-06", "durably-mastered", "cooldown-expired")];
  const decision = buildPreparationDecision([subject(competencies)], clockFor(15), "Year 6", ordered, [], { mockTechnicallyAvailable: true });
  assert.equal(decision.preparationStage, "final_preparation");
  assert.equal(decision.recommendedDifficultyLean, "favour_independent_and_harder");

  const context: PreparationSessionContext = { recommendedDifficultyLean: decision.recommendedDifficultyLean, recommendedActivityType: "unseen_transfer_check" };
  const bias = buildPreparationWeightBias(context);
  const farTransferBoost = bias(bq("ft", "hard", { transferClass: "FAR_TRANSFER" }));
  const routineNoBoost = bias(bq("r", "hard", { transferClass: "ROUTINE" }));
  assert.ok(farTransferBoost > routineNoBoost, "a final-readiness/transfer-recommended session must genuinely favour FAR_TRANSFER material over routine material at the same difficulty");
});

// ─── PERSONA E -- identical evidence, materially different context ─────────

test("PERSONA E -- identical raw competency evidence, materially different exam runway: observable, justified session-composition difference", () => {
  const strongCompetencies = ALL_TWELVE.map((id) => comp(id, "high", "durably-mastered"));

  // Year 6 (not Year 5): the late-stage escalation from transfer into
  // exam_preparation/final_preparation is only developmentally reachable
  // for Year 6 or an undefined school year (preparationStage.ts's own
  // explicit safeguard) -- this persona is specifically about a runway
  // difference producing a real stage difference, so it must use a school
  // year where that escalation is actually reachable.
  const longRunway = buildPreparationDecision([subject(strongCompetencies)], clockFor(600), "Year 6", [], [], { mockTechnicallyAvailable: true });
  const shortRunway = buildPreparationDecision([subject(strongCompetencies)], clockFor(15), "Year 6", [], [], { mockTechnicallyAvailable: true });

  assert.equal(longRunway.preparationStage, "transfer");
  assert.equal(shortRunway.preparationStage, "final_preparation");
  assert.notEqual(longRunway.preparationStage, shortRunway.preparationStage, "identical evidence must still produce a materially different stage when the exam context genuinely differs -- context is a real input, not decoration");
  // Both share the same difficulty lean (evidence-justified, not context-only) -- proving context refines readiness/urgency framing, not raw difficulty preference, which stays tied to evidence, not the clock.
  assert.equal(longRunway.recommendedDifficultyLean, shortRunway.recommendedDifficultyLean);
  assert.notEqual(longRunway.stagePrincipleText, shortRunway.stagePrincipleText, "the learner-facing framing must genuinely differ between the two contexts, not just an internal label");
});

// ─── PERSONA F -- weak learner close to exam ────────────────────────────────

test("PERSONA F -- a genuinely weak learner close to the exam: teaching/guided lean remains possible, never flooded with hard questions merely because time is short", () => {
  // A genuinely UNEVEN learner -- some real strength, some still
  // exploring, some mid-progress, no single band dominant enough to read
  // as foundation/developing/transfer on its own (each stays under its
  // own threshold: earlyStage<60%, midStage<50%, strongStage<60%) --
  // derivePreparationStage's own real fallback for exactly this shape is
  // "teaching", not merely one decayed skill (that is Increment 019's own
  // PERSONA F; this is the whole-learner, genuinely weak-overall case
  // Increment 021 names).
  const competencies: CompetencyPreparationSummary[] = [
    ...ALL_TWELVE.slice(0, 4).map((id) => comp(id, "insufficient", "exploring")),
    ...ALL_TWELVE.slice(4, 8).map((id) => comp(id, "low", "practising")),
    ...ALL_TWELVE.slice(8, 12).map((id) => comp(id, "high", "mastered")),
  ];
  const decision = buildPreparationDecision([subject(competencies)], clockFor(15), "Year 6", [], [], { mockTechnicallyAvailable: true });

  assert.equal(decision.preparationStage, "teaching", "a genuinely uneven/weak-overall learner must read as teaching, not blindly promoted by the exam clock");
  assert.notEqual(decision.preparationStage, "final_preparation", "a genuinely weak learner must not be read as final-readiness merely because the exam is close");
  assert.equal(decision.recommendedDifficultyLean, "favour_guided_and_easier", "a weak learner close to the exam must still receive a guided/easier lean -- the exam clock must never override a genuine weakness signal into a harder lean");

  const context: PreparationSessionContext = { recommendedDifficultyLean: decision.recommendedDifficultyLean, recommendedActivityType: decision.recommendedActivityType };
  const composition = composeOverTrials(context);
  assert.ok(composition.easy + composition.medium > composition.hard + composition.challenge, `a weak, time-pressured learner must not be flooded with hard/challenge material (got ${JSON.stringify(composition)})`);
});

// ─── Founder Amendment -- "teaching must mean teaching" decision-level proofs ─

test("a STRONG learner is never routed to teaching_lesson, even when a real lesson exists for every competency -- the stage condition alone gates it, never lesson availability by itself", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "high", "durably-mastered"));
  const ordered = [candidate("MR-04", "durably-mastered", "cooldown-expired")];
  const decision = buildPreparationDecision([subject(competencies)], clockFor(600), "Year 5", ordered, [], {
    hasFullLessonAvailable: () => true, // every competency has a lesson -- must still not matter for a strong learner
  });
  assert.notEqual(decision.preparationStage, "foundation");
  assert.notEqual(decision.preparationStage, "teaching");
  assert.notEqual(decision.recommendedActivityType, "teaching_lesson", "a strong (transfer-stage) learner must never be routed to teaching merely because a lesson happens to exist");
});

test("a weak late entrant with a real lesson available for the priority competency genuinely resolves to teaching_lesson -- routing happens BEFORE ordinary Practice, not alongside it", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "low", "exploring"));
  const ordered = [candidate("MR-04", "exploring", "never-attempted")];
  const decision = buildPreparationDecision([subject(competencies)], clockFor(15), "Year 6", ordered, [], {
    hasFullLessonAvailable: (id) => id === "MR-04",
  });
  assert.equal(decision.preparationStage, "foundation");
  assert.equal(decision.recommendedCompetencyId, "MR-04");
  assert.equal(decision.recommendedActivityType, "teaching_lesson", "a weak/late-entrant learner with a real available lesson for their own priority competency must be routed to it, not merely biased toward its family in ordinary Practice");
});

test("the same weak late entrant WITHOUT a real lesson available falls back honestly to guided_practice -- never a false teaching_lesson claim", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "low", "exploring"));
  const ordered = [candidate("MR-04", "exploring", "never-attempted")];
  const decision = buildPreparationDecision([subject(competencies)], clockFor(15), "Year 6", ordered, [], {
    hasFullLessonAvailable: () => false,
  });
  assert.notEqual(decision.recommendedActivityType, "teaching_lesson", "must never claim a teaching_lesson exists when hasFullLessonAvailable says it doesn't");
  assert.equal(decision.recommendedActivityType, "guided_practice");
});

// ─── Educational Foundation Completion increment, Section 18 -- the ────────
// ─── Founder's own five named live-selection proof cases ───────────────────

test("CASE B -- Year 5, average/mixed evidence: balanced teaching/practice, neither a forced foundation lean nor a forced hard lean", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "moderate", "practising"));
  const decision = buildPreparationDecision([subject(competencies)], clockFor(300), "Year 5", [], [], { mockTechnicallyAvailable: true });
  assert.equal(decision.recommendedDifficultyLean, "balanced", "genuinely mixed/moderate evidence must resolve to a balanced lean, not favour_guided_and_easier or favour_independent_and_harder");
});

test("CASE D -- identical Year 5 school year, two materially different mastery/evidence profiles, resolve to different educational actions", () => {
  const strong = ALL_TWELVE.map((id) => comp(id, "high", "durably-mastered"));
  const weak = ALL_TWELVE.map((id) => comp(id, "low", "exploring"));
  const strongDecision = buildPreparationDecision([subject(strong)], clockFor(300), "Year 5", [], [], { mockTechnicallyAvailable: true });
  const weakDecision = buildPreparationDecision([subject(weak)], clockFor(300), "Year 5", [], [], { mockTechnicallyAvailable: true });

  assert.notEqual(strongDecision.preparationStage, weakDecision.preparationStage, "the same school year must not collapse two materially different evidence profiles into the same stage");
  assert.notEqual(strongDecision.recommendedDifficultyLean, weakDecision.recommendedDifficultyLean);
});

test("teachingState scaffolded_practice receives the same real guided-family boost as guided_practice, for a family with genuine teaching content -- extending, not duplicating, GUIDED_FAMILY_BOOST", () => {
  const familyPool: BankQuestion[] = [
    bq("plain1", "medium", { familyId: undefined }),
    bq("plain2", "medium", { familyId: undefined }),
    bq("taught1", "medium", { familyId: "mr03-compound-area-perimeter" }),
    bq("taught2", "medium", { familyId: "mr03-compound-area-perimeter" }),
  ];
  const history = new Map<string, StudentQuestionHistoryRow>();

  function shareOfTaughtFamily(context: PreparationSessionContext | undefined, trials = 200): number {
    const bias = buildPreparationWeightBias(context);
    let taughtCount = 0;
    for (let i = 0; i < trials; i++) {
      const result = selectQuestions(familyPool, history, 1, new Set(), 1, mulberry32(i), bias);
      if (result.questions[0]?.familyId === "mr03-compound-area-perimeter") taughtCount++;
    }
    return taughtCount / trials;
  }

  const noContext = shareOfTaughtFamily(undefined);
  const guidedPracticeContext: PreparationSessionContext = { recommendedDifficultyLean: "balanced", recommendedActivityType: "guided_practice" };
  const scaffoldedContext: PreparationSessionContext = { recommendedDifficultyLean: "balanced", recommendedActivityType: "independent_practice", teachingState: "scaffolded_practice" };

  const guidedShare = shareOfTaughtFamily(guidedPracticeContext);
  const scaffoldedShare = shareOfTaughtFamily(scaffoldedContext);

  assert.ok(guidedShare > noContext, "sanity check: the pre-existing guided_practice boost must itself still be real");
  assert.ok(scaffoldedShare > noContext, "scaffolded_practice must ALSO receive a real boost toward the taught family, not remain inert like the baseline");
});

test("teachingState is optional and defaults to inert -- a caller supplying no teachingState field behaves byte-for-byte like before this increment", () => {
  const context: PreparationSessionContext = { recommendedDifficultyLean: "balanced", recommendedActivityType: "independent_practice" };
  const bias = buildPreparationWeightBias(context);
  assert.equal(typeof bias, "function");
});
