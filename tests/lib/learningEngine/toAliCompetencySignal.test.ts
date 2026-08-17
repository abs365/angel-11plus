import { test } from "node:test";
import assert from "node:assert/strict";
import { toAliCompetencySignal, COMPONENT_TO_SUBJECT_KEY } from "@/lib/learningEngine/preparationState";
import type { SubjectPreparationSummary, CompetencyPreparationSummary } from "@/lib/learningEngine/preparationState";
import type { EducationalState } from "@/types/ali/educationalState";
import type { EvidenceConfidenceTier } from "@/types/ali/confidence";

/**
 * Educational Increment 007W, Part 2 — the CSSE-correct signal builder
 * that finally feeds lib/adaptiveEngine.ts's already-existing,
 * already-correct real-evidence branch (urgency()'s `aliSignal` check,
 * aliReasonText()) real data for a genuine CSSE learner, closing the root
 * cause this increment traced: recordAliCompetencySignal() was never
 * called by the real CSSE Practice pathway.
 */

function competency(
  id: string,
  educationalState: EducationalState,
  confidenceTier: EvidenceConfidenceTier
): CompetencyPreparationSummary {
  return { competencyId: id as never, educationalState, confidenceTier };
}

function summary(competencies: CompetencyPreparationSummary[]): SubjectPreparationSummary {
  return { component: "Mathematics", competencies, evidenceState: "established_evidence" };
}

test("attemptedCompetencies excludes anything with real confidenceTier insufficient (no evidence at all)", () => {
  const s = summary([
    competency("MR-01", "exploring", "insufficient"),
    competency("MR-02", "practising", "low"),
  ]);
  const signal = toAliCompetencySignal(s, "maths");
  assert.deepEqual(signal.attemptedCompetencies, ["MR-02"]);
});

test("masteredCompetencies includes both mastered and durably-mastered", () => {
  const s = summary([
    competency("MR-01", "mastered", "high"),
    competency("MR-02", "durably-mastered", "high"),
    competency("MR-03", "reinforcing", "moderate"),
  ]);
  const signal = toAliCompetencySignal(s, "maths");
  assert.deepEqual(new Set(signal.masteredCompetencies), new Set(["MR-01", "MR-02"]));
});

test("weakCompetencies is exactly the rebuilding (real regression) set -- narrower than every early-stage state", () => {
  const s = summary([
    competency("MR-01", "rebuilding", "high"),
    competency("MR-02", "exploring", "low"),
    competency("MR-03", "building-knowledge", "low"),
  ]);
  const signal = toAliCompetencySignal(s, "maths");
  assert.deepEqual(signal.weakCompetencies, ["MR-01"], "only a genuine regression counts as weak, never mere early progress");
});

test("recentlyMasteredCompetencies is the set-difference against the previous signal, matching deriveCompetencySignal's own convention", () => {
  const s = summary([competency("MR-01", "mastered", "high"), competency("MR-02", "mastered", "high")]);
  const previous = toAliCompetencySignal(summary([competency("MR-01", "mastered", "high")]), "maths");
  const signal = toAliCompetencySignal(s, "maths", previous);
  assert.deepEqual(signal.recentlyMasteredCompetencies, ["MR-02"]);
});

test("subject key is set exactly as given, matching p.aliCompetencySignal's own keying convention", () => {
  const signal = toAliCompetencySignal(summary([]), "english");
  assert.equal(signal.subject, "english");
});

test("COMPONENT_TO_SUBJECT_KEY maps every real CSSE component with content, and Applied Reasoning is intentionally absent", () => {
  assert.equal(COMPONENT_TO_SUBJECT_KEY["Mathematics"], "maths");
  assert.equal(COMPONENT_TO_SUBJECT_KEY["English Comprehension"], "english");
  assert.equal(COMPONENT_TO_SUBJECT_KEY["Continuous Writing"], "writing");
  assert.equal(COMPONENT_TO_SUBJECT_KEY["Applied Reasoning"], undefined);
});
