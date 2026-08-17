import { test } from "node:test";
import assert from "node:assert/strict";
import { derivePreparationStage } from "@/lib/learningEngine/preparationStage";
import { resolvePreparationClockFor } from "@/lib/learningEngine/preparationClock";
import type { SubjectPreparationSummary, CompetencyPreparationSummary } from "@/lib/learningEngine/preparationState";
import type { EducationalState } from "@/types/ali/educationalState";
import type { EvidenceConfidenceTier } from "@/types/ali/confidence";

/**
 * Educational Increment 007W, Part 6 — the exact six named scenarios the
 * Founder identified before 007U, each proven directly. Year group is
 * CONTEXT, never ability: every scenario below confirms the base
 * evidence-derived stage never changes because of school year, and that
 * school year only ever caps eligibility for the two late,
 * exam-condition-intensity stages.
 */

function competency(educationalState: EducationalState, confidenceTier: EvidenceConfidenceTier): CompetencyPreparationSummary {
  return { competencyId: "MR-01", educationalState, confidenceTier };
}

function subjects(competencies: CompetencyPreparationSummary[]): SubjectPreparationSummary[] {
  return [{ component: "Mathematics", competencies, evidenceState: "established_evidence" }];
}

const NOW = new Date("2026-08-17");
const littleTime = resolvePreparationClockFor(undefined, NOW); // no clock configured -- "far off"/unknown horizon
const closeExamClock = resolvePreparationClockFor("2026-09-05", NOW); // within 21 days

const noEvidence = subjects([competency("exploring", "insufficient")]);
const strongEvidence = subjects([
  competency("mastered", "high"),
  competency("mastered", "high"),
  competency("durably-mastered", "high"),
]);
const foundationalGaps = subjects([competency("exploring", "low"), competency("building-knowledge", "low")]);

test("Scenario: Year 4 + little evidence -> insufficient_evidence, never guessed at from school year alone", () => {
  const stage = derivePreparationStage(noEvidence, littleTime, "Year 4");
  assert.equal(stage, "insufficient_evidence");
});

test("Scenario: Year 4 + strong evidence -> reaches transfer (progresses), but is developmentally capped below exam-condition intensity", () => {
  const stage = derivePreparationStage(strongEvidence, closeExamClock, "Year 4");
  assert.equal(stage, "transfer", "a strong Year 4 learner must not be artificially held back from real evidence-based progression");
});

test("Scenario: Year 5 + foundational weakness -> foundation, teaching-appropriate, regardless of exam clock", () => {
  const stage = derivePreparationStage(foundationalGaps, closeExamClock, "Year 5");
  assert.equal(stage, "foundation");
});

test("Scenario: Year 5 + strong independent mastery -> reaches transfer, capped below exam-condition intensity exactly like Year 4", () => {
  // This design's own explicit rule is "Year 6, or unset, is eligible for
  // the two late stages" -- Year 5 is capped the same as Year 4, since the
  // CSSE examination is normally sat early in Year 6 specifically, and
  // exam-condition/Mock-adjacent intensity is tied to being in that real
  // exam year, not merely to strong evidence existing earlier.
  const stage = derivePreparationStage(strongEvidence, closeExamClock, "Year 5");
  assert.equal(stage, "transfer", "Year 5, like Year 4, is capped below exam-condition intensity by this design -- only Year 6 (or unset) reaches it");
});

test("Scenario: Year 6 + close examination + foundational weakness -> foundation/teaching, exam proximity does not override the real need", () => {
  const stage = derivePreparationStage(foundationalGaps, closeExamClock, "Year 6");
  assert.equal(stage, "foundation", "a struggling Year 6 learner must not be pushed into exam-condition work merely because the exam is close");
});

test("Scenario: Year 6 + close examination + strong evidence -> final_preparation, appropriately", () => {
  const stage = derivePreparationStage(strongEvidence, closeExamClock, "Year 6");
  assert.equal(stage, "final_preparation");
});

test("Confirms the Year 4/5 developmental cap is specifically about the two late stages, not about progression generally", () => {
  const year4 = derivePreparationStage(strongEvidence, closeExamClock, "Year 4");
  const year6 = derivePreparationStage(strongEvidence, closeExamClock, "Year 6");
  assert.notEqual(year4, year6, "identical strong evidence must still differ in labelled intensity by year group");
  assert.equal(year4, "transfer");
  assert.equal(year6, "final_preparation");
});
