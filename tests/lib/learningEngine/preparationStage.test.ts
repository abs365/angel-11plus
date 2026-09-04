import { test } from "node:test";
import assert from "node:assert/strict";
import { derivePreparationStage } from "@/lib/learningEngine/preparationStage";
import { resolvePreparationClockFor } from "@/lib/learningEngine/preparationClock";
import type { SubjectPreparationSummary, CompetencyPreparationSummary } from "@/lib/learningEngine/preparationState";
import type { EducationalState } from "@/types/ali/educationalState";
import type { EvidenceConfidenceTier } from "@/types/ali/confidence";

/**
 * Educational Increment 007V, Part 7/16 — the six explicit failure modes
 * this function must resist, each with its own direct test:
 *   4. school year treated as ability;
 *   5. exam proximity overriding foundational need;
 *   6. strong attainment causing premature Mock saturation (via school year).
 * Plus the general "insufficient evidence must not be guessed at" rule.
 */

function competency(educationalState: EducationalState, confidenceTier: EvidenceConfidenceTier = "high"): CompetencyPreparationSummary {
  return { competencyId: "MR-01", educationalState, confidenceTier };
}

function subject(competencies: CompetencyPreparationSummary[]): SubjectPreparationSummary {
  return { component: "Mathematics", competencies, evidenceState: "established_evidence" };
}

const NOW = new Date("2026-08-17");
const noClock = resolvePreparationClockFor(undefined, NOW);
const finalPrepClock = resolvePreparationClockFor("2026-09-05", NOW); // within 21 days
const longHorizonClock = resolvePreparationClockFor("2028-09-19", NOW);

test("no evidence anywhere -> insufficient_evidence, never guessed", () => {
  const stage = derivePreparationStage([subject([competency("exploring", "insufficient")])], noClock);
  assert.equal(stage, "insufficient_evidence");
});

test("mostly exploring/building-knowledge -> foundation", () => {
  const competencies = [
    competency("exploring", "low"),
    competency("exploring", "low"),
    competency("building-knowledge", "low"),
  ];
  assert.equal(derivePreparationStage([subject(competencies)], noClock), "foundation");
});

test("a real regression (rebuilding) forces teaching, overriding an otherwise-strong distribution", () => {
  const competencies = [
    competency("mastered", "high"),
    competency("mastered", "high"),
    competency("rebuilding", "high"),
  ];
  assert.equal(derivePreparationStage([subject(competencies)], noClock), "teaching");
});

test("a single regression among many strong competencies still forces teaching (Increment 019 Persona F) -- the trigger is never ratio-gated", () => {
  const competencies = [
    ...Array.from({ length: 11 }, () => competency("durably-mastered", "high")),
    competency("rebuilding", "moderate"),
  ];
  assert.equal(
    derivePreparationStage([subject(competencies)], noClock),
    "teaching",
    "one real regression signal out of twelve competencies (well under any plausible ratio) must still force teaching"
  );
});

test("time remaining alone cannot determine stage: a long-horizon clock never pushes a weak-evidence learner into a late stage", () => {
  const competencies = [competency("exploring", "low"), competency("building-knowledge", "low")];
  // Even with a final_preparation-band clock, weak evidence must stay at its evidence-derived stage.
  const stage = derivePreparationStage([subject(competencies)], finalPrepClock);
  assert.equal(stage, "foundation", "exam proximity must not override a genuine foundational need");
});

test("school year alone cannot determine stage: undefined school year with strong evidence and a close exam reaches exam_preparation/final_preparation", () => {
  const competencies = [
    competency("mastered", "high"),
    competency("mastered", "high"),
    competency("durably-mastered", "high"),
  ];
  const stage = derivePreparationStage([subject(competencies)], finalPrepClock);
  assert.equal(stage, "final_preparation");
});

test("a strong Year 4 learner reaches transfer-level evidence but is developmentally capped below exam_preparation/final_preparation", () => {
  const competencies = [
    competency("mastered", "high"),
    competency("mastered", "high"),
    competency("durably-mastered", "high"),
  ];
  const stageYear4 = derivePreparationStage([subject(competencies)], finalPrepClock, "Year 4");
  assert.equal(stageYear4, "transfer", "strong Year 4 evidence must still progress, just not into exam-condition/final-prep intensity");

  const stageYear6 = derivePreparationStage([subject(competencies)], finalPrepClock, "Year 6");
  assert.equal(stageYear6, "final_preparation", "the same evidence for a Year 6 learner near the exam should reach final_preparation");
});

test("a Year 5/6 learner with foundational gaps near the exam still receives teaching, not exam-condition pressure", () => {
  const competencies = [competency("exploring", "low"), competency("building-knowledge", "low")];
  const stage = derivePreparationStage([subject(competencies)], finalPrepClock, "Year 6");
  assert.equal(stage, "foundation", "foundational gaps are not overridden by exam proximity even for an exam-year learner");
});

test("long horizon does not force endless easy work for a genuinely strong learner: developing evidence still reaches developing/transfer on its own merit", () => {
  const competencies = [competency("practising", "moderate"), competency("reinforcing", "moderate"), competency("mastered", "high")];
  const stage = derivePreparationStage([subject(competencies)], longHorizonClock);
  assert.ok(stage === "developing" || stage === "transfer", `expected developing or transfer, got ${stage}`);
});
