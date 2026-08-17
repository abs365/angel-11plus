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

/**
 * Programme Increment 008B, Part 8/24 — the remaining named scenarios
 * (C, E, F, G, H) this directive's own list requires proven directly,
 * completing the full A-H set alongside 007W's own A/B/D/F above.
 */

const mixedEvidence = subjects([
  competency("mastered", "high"),
  competency("practising", "moderate"),
  competency("exploring", "low"),
]);

test("Scenario C: early Year 5 + mixed evidence -> a real, non-extreme stage, never rounded up or down to a clean label", () => {
  const stage = derivePreparationStage(mixedEvidence, littleTime, "Year 5");
  assert.ok(
    ["developing", "teaching", "foundation"].includes(stage),
    `mixed evidence must not resolve to an extreme stage like insufficient_evidence or final_preparation, got ${stage}`
  );
});

test("Scenario E: late Year 5, strong academically -> reaches transfer but remains capped, exactly like every other Year 5 case (no timed-experience shortcut exists at the stage layer)", () => {
  const stage = derivePreparationStage(strongEvidence, closeExamClock, "Year 5");
  assert.equal(stage, "transfer", "strong evidence alone cannot bypass the Year 5 cap, regardless of how close the exam is");
});

test("Scenario F: early Year 6 + mixed readiness -> a real intermediate stage, not forced to either extreme by proximity to the exam", () => {
  const stage = derivePreparationStage(mixedEvidence, closeExamClock, "Year 6");
  assert.ok(
    stage !== "insufficient_evidence" && stage !== "final_preparation",
    `genuinely mixed Year 6 readiness must not be flattened to an extreme, got ${stage}`
  );
});

test("Scenario G: unknown year group -> treated as developmentally eligible (the documented, safe default), never blocked or guessed at", () => {
  const withUnknownYear = derivePreparationStage(strongEvidence, closeExamClock, undefined);
  const withYear6 = derivePreparationStage(strongEvidence, closeExamClock, "Year 6");
  assert.equal(withUnknownYear, withYear6, "an unset year group must resolve identically to Year 6, its documented safe default, not to a capped Year 4/5-like restriction");
});

test("Scenario H: year group present but target exam date unavailable -> stage still derives correctly from real evidence alone, clock never fabricates urgency", () => {
  const unavailableClock = resolvePreparationClockFor(undefined, NOW);
  assert.equal(unavailableClock.horizonBand, "unavailable");
  const stage = derivePreparationStage(strongEvidence, unavailableClock, "Year 6");
  // With no clock to promote it further, strong evidence still reaches its
  // real evidence-only ceiling (transfer) -- exam-condition/final-prep
  // upgrades require BOTH a late-enough year group AND a real clock, never
  // year group alone.
  assert.equal(stage, "transfer", "an unavailable clock must never be treated as 'close', nor block a real evidence-based stage from resolving honestly");
});
