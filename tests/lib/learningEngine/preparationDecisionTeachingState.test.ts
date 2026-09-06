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
 * Educational Foundation Completion increment, Section 6/25 -- proves
 * `PreparationDecision.teachingState` is a real, live-computed field
 * (not a decorative always-null placeholder), derived from exactly the
 * same real evidence `buildPreparationDecision` already consumes, and
 * that it never contradicts the pre-existing `recommendedActivityType`
 * this file's own sibling persona suite already proves correct.
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
const NEAR_TERM_CLOCK: PreparationClock = { targetExamDate: "2027-01-01", daysRemaining: 300, weeksRemaining: 43, horizonBand: "coverage_building" };
function candidate(competencyCode: CompetencyId, educationalState: EducationalState, triggerReason: RecommendationTrigger) {
  return { competencyCode, educationalState, triggerReason };
}

const ALL_TWELVE: CompetencyId[] = ["RC-01", "RC-02", "RC-03", "RC-04", "MR-01", "MR-02", "MR-03", "MR-04", "MR-05", "MR-06", "WC-01", "WC-02"];

test("no real top candidate (everything vetoed) -> teachingState is null, never guessed", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "high", "mastered"));
  const decision = buildPreparationDecision([subject(competencies)], NEAR_TERM_CLOCK, "Year 6", [candidate("MR-01", "mastered", "cooldown-expired")], ["MR-01"]);
  assert.equal(decision.teachingState, null);
});

test("a top candidate in 'reviewing' state (review-due trigger) resolves to maintenance_retrieval -- the one real, exact (non-proxy) signal this wiring uses", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "high", "mastered"));
  const decision = buildPreparationDecision(
    [subject(competencies)],
    NEAR_TERM_CLOCK,
    "Year 6",
    [candidate("MR-03", "reviewing", "review-due")],
    []
  );
  assert.equal(decision.teachingState, "maintenance_retrieval");
  assert.equal(decision.recommendedActivityType, "revision_retrieval", "teachingState must never contradict the existing, already-proven activity-type derivation");
});

test("a top candidate that is 'mastered' resolves to transfer, consistent with unseen_transfer_check where the stage supports it", () => {
  const competencies = [
    ...ALL_TWELVE.filter((id) => id !== "MR-03").map((id) => comp(id, "high", "mastered")),
    comp("MR-03", "high", "mastered"),
  ];
  const decision = buildPreparationDecision(
    [subject(competencies)],
    NEAR_TERM_CLOCK,
    "Year 6",
    [candidate("MR-03", "mastered", "mastery-event-on-linked-competency")],
    []
  );
  assert.equal(decision.teachingState, "transfer");
});

test("a weak, rebuilding top candidate resolves to explicit_teaching when a real lesson exists, guided_practice otherwise -- matching the existing teaching_lesson/guided_practice split exactly", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "moderate", "practising"));
  const withRebuilding = [...competencies.filter((c) => c.competencyId !== "MR-03"), comp("MR-03", "low", "rebuilding")];

  const withLesson = buildPreparationDecision(
    [subject(withRebuilding)],
    NEAR_TERM_CLOCK,
    "Year 6",
    [candidate("MR-03", "rebuilding", "weak-competency-remediation")],
    [],
    { hasFullLessonAvailable: (id) => id === "MR-03" }
  );
  assert.equal(withLesson.teachingState, "explicit_teaching");
  assert.equal(withLesson.recommendedActivityType, "teaching_lesson");

  const withoutLesson = buildPreparationDecision(
    [subject(withRebuilding)],
    NEAR_TERM_CLOCK,
    "Year 6",
    [candidate("MR-03", "rebuilding", "weak-competency-remediation")],
    [],
    { hasFullLessonAvailable: () => false }
  );
  assert.equal(withoutLesson.teachingState, "guided_practice");
  assert.equal(withoutLesson.recommendedActivityType, "guided_practice");
});

test("remediationAction is null whenever no real regression (rebuilding) signal exists anywhere -- never guessed for a healthy competency map", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "high", "mastered"));
  const decision = buildPreparationDecision([subject(competencies)], NEAR_TERM_CLOCK, "Year 6", [candidate("MR-01", "mastered", "cooldown-expired")], []);
  assert.equal(decision.remediationAction, null);
});

test("a genuine rebuilding (regression) signal produces a real, live remediationAction -- re_teaching when a lesson exists for the WEAK competency specifically, not the unrelated top-priority candidate", () => {
  const competencies = [
    ...ALL_TWELVE.filter((id) => id !== "MR-03").map((id) => comp(id, "high", "mastered")),
    comp("MR-03", "low", "rebuilding"),
  ];
  // The top-priority candidate is a DIFFERENT competency (MR-01, never-attempted) than the
  // one actually regressing (MR-03) -- remediationAction must reason about MR-03's own lesson
  // availability, not MR-01's.
  const ordered = [candidate("MR-01", "exploring", "never-attempted"), candidate("MR-03", "rebuilding", "weak-competency-remediation")];
  const decision = buildPreparationDecision([subject(competencies)], NEAR_TERM_CLOCK, "Year 6", ordered, [], {
    hasFullLessonAvailable: (id) => id === "MR-03", // deliberately NOT MR-01
  });
  assert.equal(decision.remediationAction, "re_teaching", "must check the weak competency's own lesson availability (MR-03), not the unrelated top-priority candidate's (MR-01)");
});

test("a genuine rebuilding signal without a lesson for the weak competency resolves to worked_example, never a false re_teaching claim", () => {
  const competencies = [
    ...ALL_TWELVE.filter((id) => id !== "MR-03").map((id) => comp(id, "high", "mastered")),
    comp("MR-03", "low", "rebuilding"),
  ];
  const decision = buildPreparationDecision(
    [subject(competencies)],
    NEAR_TERM_CLOCK,
    "Year 6",
    [candidate("MR-03", "rebuilding", "weak-competency-remediation")],
    [],
    { hasFullLessonAvailable: () => false }
  );
  assert.equal(decision.remediationAction, "worked_example");
});

test("an unrecognised/legacy educationalState string never crashes and never guesses a teachingState -- fails closed to null", () => {
  const competencies = ALL_TWELVE.map((id) => comp(id, "high", "mastered"));
  const decision = buildPreparationDecision(
    [subject(competencies)],
    NEAR_TERM_CLOCK,
    "Year 6",
    // Deliberately an out-of-union string, simulating a future/legacy value this layer has never seen.
    [{ competencyCode: "MR-01" as CompetencyId, educationalState: "not-a-real-state" as EducationalState, triggerReason: "cooldown-expired" as RecommendationTrigger }],
    []
  );
  assert.equal(decision.teachingState, null);
});
