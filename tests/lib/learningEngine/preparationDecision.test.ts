import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPreparationDecision } from "@/lib/learningEngine/preparationDecision";
import type { SubjectPreparationSummary, CompetencyPreparationSummary } from "@/lib/learningEngine/preparationState";
import type { PreparationClock } from "@/lib/learningEngine/preparationClock";
import type { CompetencyId } from "@/lib/learningEngine/types";
import type { EvidenceConfidenceTier } from "@/types/ali/confidence";
import type { EducationalState } from "@/types/ali/educationalState";
import type { RecommendationTrigger } from "@/types/ali/recommendationOrchestration";

/**
 * Programme Increment 019, Part 20 — deterministic tests for the six
 * Founder-specified educational personas, run against the pure core
 * (`buildPreparationDecision`), independently testable without any
 * Supabase connection exactly like `derivePreparationStage`/
 * `resolvePreparationClockFor` before it.
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

test("PERSONA A -- Year 4, long runway, little evidence: foundation/development behaviour, no repetitive Mock drilling", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "insufficient", "exploring"));
  const decision = buildPreparationDecision([subject(competencies)], clockFor(600), "Year 4", [], [], { mockTechnicallyAvailable: true });

  assert.ok(
    ["insufficient_evidence", "foundation"].includes(decision.preparationStage),
    `expected foundation-band stage, got "${decision.preparationStage}"`
  );
  assert.equal(decision.preparationStageGroup, "foundation");
  assert.notEqual(decision.recommendedActivityType, "timed_assessment", "a Year 4 long-runway learner with little evidence must never be steered toward timed assessment");
  assert.notEqual(decision.assessmentPurpose, "full_mock");
});

test("PERSONA B -- Year 5, strong, substantial evidence, medium runway: accelerated pathway, no unnecessary beginner sequence", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "high", "durably-mastered"));
  const decision = buildPreparationDecision([subject(competencies)], clockFor(200), "Year 5", [], [], { mockTechnicallyAvailable: true });

  assert.equal(decision.preparationStage, "transfer", `expected an accelerated ("transfer") stage for a strong Year 5 learner, got "${decision.preparationStage}"`);
  assert.notEqual(decision.recommendedDifficultyLean, "favour_guided_and_easier", "a strong learner must not be steered toward an easier/guided lean");
  assert.equal(decision.placementRequired, false);
});

test("PERSONA C -- Year 5, uneven, medium/short runway: priority weakness intervention", () => {
  const competencies = [
    ...ALL_TWELVE.slice(0, 6).map((id) => comp(id, "high", "mastered")),
    ...ALL_TWELVE.slice(6).map((id) => comp(id, "low", "practising")),
  ];
  const ordered = [candidate("MR-06", "practising", "weak-competency-remediation")];
  const decision = buildPreparationDecision([subject(competencies)], clockFor(120), "Year 5", ordered, [], { mockTechnicallyAvailable: true });

  assert.ok(decision.priorityCompetencies.includes("MR-06"), "the weak competency must appear as a priority");
  assert.ok(["guided_practice", "teaching_lesson"].includes(decision.recommendedActivityType), `expected a remediation-shaped activity, got "${decision.recommendedActivityType}"`);
  assert.equal(decision.recommendedCompetencyId, "MR-06");
});

test("PERSONA D -- Year 6, short runway, unknown evidence: placement/diagnostic first, rapid prioritisation", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "insufficient", "exploring"));
  const decision = buildPreparationDecision([subject(competencies)], clockFor(15), "Year 6", [], [], { mockTechnicallyAvailable: true });

  assert.equal(decision.preparationStage, "insufficient_evidence");
  assert.equal(decision.placementRequired, true, "a Year 6 learner with unknown evidence must be routed to placement before anything else");
  assert.equal(decision.recommendedActivityType, "placement_check");
  assert.equal(decision.assessmentPurpose, "placement");
});

test("PERSONA E -- Year 6, short runway, strong baseline: exam preparation/final readiness, targeted gaps, timed transfer/assessment", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "high", "durably-mastered"));
  const decision = buildPreparationDecision([subject(competencies)], clockFor(15), "Year 6", [], [], { mockTechnicallyAvailable: true });

  assert.equal(decision.preparationStage, "final_preparation", `expected final_preparation for a strong Year 6 learner with 15 days remaining, got "${decision.preparationStage}"`);
  assert.equal(decision.preparationStageGroup, "final_readiness");
  assert.equal(decision.recommendedDifficultyLean, "favour_independent_and_harder");
  assert.equal(decision.assessmentAppropriate, true, "a technically-available Mock must be assessment-appropriate for a final-readiness learner");
  assert.equal(decision.assessmentPurpose, "full_mock");
});

test("PERSONA F -- a previously secure skill has decayed: retrieval/reconfirmation, never a permanent-mastery assumption", () => {
  const competencies = [
    ...ALL_TWELVE.slice(0, 11).map((id) => comp(id, "high", "durably-mastered")),
    comp("MR-06", "moderate", "rebuilding"),
  ];
  const decision = buildPreparationDecision([subject(competencies)], clockFor(200), "Year 6", [], [], { mockTechnicallyAvailable: true });

  assert.ok(decision.weakCompetencies.includes("MR-06"), "a rebuilding competency must be surfaced as weak, not silently absorbed into 'secure'");
  assert.ok(!decision.secureCompetencies.includes("MR-06"), "a rebuilding competency must never be reported as secure -- mastery is not permanent");
  assert.equal(decision.revisionRequired, true);
  assert.equal(decision.preparationStage, "teaching", "a real regression signal must force a return to targeted teaching, overriding the otherwise-strong aggregate");
});

// ─── Non-persona structural tests ────────────────────────────────────────

test("wellbeing-vetoed competencies never appear in priorityCompetencies, even when top-ranked", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "low", "practising"));
  const ordered = [candidate("MR-01", "practising", "weak-competency-remediation"), candidate("MR-02", "practising", "cooldown-expired")];
  const decision = buildPreparationDecision([subject(competencies)], clockFor(200), "Year 5", ordered, ["MR-01"], {});

  assert.ok(!decision.priorityCompetencies.includes("MR-01"), "a vetoed competency must never appear in priorityCompetencies");
  assert.equal(decision.recommendedCompetencyId, "MR-02", "the recommendation must skip the vetoed top candidate and fall through to the next real one");
});

test("insufficientEvidenceCompetencies reflects real confidenceTier only, independent of educationalState", () => {
  const competencies = [comp("MR-01", "insufficient", "exploring"), comp("MR-02", "low", "practising")];
  const decision = buildPreparationDecision([subject(competencies)], clockFor(200), undefined, [], [], {});
  assert.deepEqual(decision.insufficientEvidenceCompetencies, ["MR-01"]);
});

test("decisionReasons is never empty and always names the real stage and clock state", () => {
  const decision = buildPreparationDecision([subject([comp("MR-01", "insufficient", "exploring")])], clockFor(null), undefined, [], [], {});
  assert.ok(decision.decisionReasons.length > 0);
  assert.ok(decision.decisionReasons[0].includes(decision.preparationStage));
  assert.ok(decision.decisionReasons.some((r) => r.includes("No target exam date")));
});

test("mockTechnicallyAvailable omitted -- assessmentAppropriate/assessmentPurpose never assume a Mock exists", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "high", "durably-mastered"));
  const decision = buildPreparationDecision([subject(competencies)], clockFor(15), "Year 6", [], [], {});
  assert.equal(decision.assessmentAppropriate, false, "with no mock-availability input supplied, a full_mock must never be silently assumed appropriate");
  assert.equal(decision.assessmentPurpose, null);
});

test("Increment 020, Part 12 -- with the real 3-lesson set supplied (MR-01/MR-04/MR-03), a weak MR-03 recommendation at foundation stage resolves to teaching_lesson, not guided_practice", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "low", "exploring"));
  const ordered = [candidate("MR-03", "exploring", "weak-competency-remediation")];
  const decision = buildPreparationDecision([subject(competencies)], clockFor(400), "Year 5", ordered, [], {
    hasFullLessonAvailable: (id) => ["MR-01", "MR-04", "MR-03"].includes(id),
  });
  assert.equal(decision.preparationStage, "foundation");
  assert.equal(decision.recommendedCompetencyId, "MR-03");
  assert.equal(decision.recommendedActivityType, "teaching_lesson", "a real lesson exists for MR-03 (Increment 020's own compound-shapes lesson) -- the decision contract must actually recommend it, not fall back to guided_practice as it silently did before any real caller supplied this callback");
});

test("Increment 020, Part 12 -- the same weak-MR-03 case falls back to guided_practice when no lesson-availability callback is supplied at all (the pre-020 default, still honest for every other page)", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "low", "exploring"));
  const ordered = [candidate("MR-03", "exploring", "weak-competency-remediation")];
  const decision = buildPreparationDecision([subject(competencies)], clockFor(400), "Year 5", ordered, [], {});
  assert.equal(decision.recommendedActivityType, "guided_practice", "omitting hasFullLessonAvailable must never silently assume a lesson exists");
});
