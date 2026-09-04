import type { SubjectPreparationSummary } from "./preparationState";
import type { PreparationClock } from "./preparationClock";

/**
 * Educational Increment 007V, Part 7 — operationalises 007U's six-stage
 * preparation model, but only to the extent real evidence supports it.
 * Deterministic and pure (no I/O), taking the canonical
 * SubjectPreparationSummary[] (lib/learningEngine/preparationState.ts,
 * itself a thin roll-up of real, unmodified lib/ali/* evidence) and the
 * Preparation Clock (lib/learningEngine/preparationClock.ts) as its only
 * inputs.
 *
 * Every safeguard below is a direct implementation of an explicit 007U/
 * 007V instruction, not an incidental side effect:
 *   - School year alone cannot determine stage: `schoolYear` only ever
 *     CAPS which late stages are reachable; it never by itself selects a
 *     stage — the base stage is always evidence-derived first.
 *   - Time remaining alone cannot determine stage: `clock` only ever
 *     refines an ALREADY-"transfer"-level evidence stage into
 *     exam_preparation/final_preparation; it can never push a weaker
 *     evidence stage forward, and it is never consulted before the
 *     evidence-derived base stage is computed.
 *   - Supported success cannot masquerade as independent mastery: this
 *     function reads `educationalState`/`confidenceTier` as computed by
 *     the real, unmodified lib/ali/mastery.ts (`supportTier` gate) and
 *     lib/ali/educationalState.ts — inherited, not re-implemented here.
 *   - A real regression signal ("rebuilding" — mastery just revoked)
 *     always forces a return to targeted teaching, overriding whatever
 *     the aggregate distribution would otherwise suggest.
 *   - Insufficient evidence is represented explicitly ("insufficient_evidence"),
 *     never guessed at.
 */
export type PreparationStage =
  | "insufficient_evidence"
  | "foundation"
  | "teaching"
  | "developing"
  | "transfer"
  | "exam_preparation"
  | "final_preparation";

export type SchoolYear = "Year 4" | "Year 5" | "Year 6";

/** Proportion-of-competencies thresholds are a disclosed, provisional judgement call (same calibration-ownership discipline as lib/ali/confidence.ts's own thresholds) — not derived from an external standard. */
const FOUNDATION_EARLY_STAGE_RATIO = 0.6;
const DEVELOPING_MID_STAGE_RATIO = 0.5;
const TRANSFER_STRONG_STAGE_RATIO = 0.6;

export function derivePreparationStage(
  subjects: SubjectPreparationSummary[],
  clock: PreparationClock,
  schoolYear?: SchoolYear
): PreparationStage {
  const allCompetencies = subjects.flatMap((s) => s.competencies);

  if (allCompetencies.length === 0 || allCompetencies.every((c) => c.confidenceTier === "insufficient")) {
    return "insufficient_evidence";
  }

  const total = allCompetencies.length;
  // Any real regression signal forces teaching -- per this function's own documented invariant
  // above, never gated on what proportion of the map it represents. A single competency that
  // has just been revoked from mastery is exactly "the specific skill that slipped" (see
  // stagePrinciple("teaching") below), not a bulk-distribution event.
  const hasRegression = allCompetencies.some((c) => c.educationalState === "rebuilding");
  if (hasRegression) return "teaching";

  const earlyStage = allCompetencies.filter(
    (c) => c.educationalState === "exploring" || c.educationalState === "building-knowledge"
  ).length;
  const midStage = allCompetencies.filter(
    (c) => c.educationalState === "practising" || c.educationalState === "reinforcing"
  ).length;
  const strongStage = allCompetencies.filter(
    (c) => c.educationalState === "mastered" || c.educationalState === "durably-mastered"
  ).length;

  let evidenceStage: PreparationStage;
  if (earlyStage / total >= FOUNDATION_EARLY_STAGE_RATIO) evidenceStage = "foundation";
  else if (midStage / total >= DEVELOPING_MID_STAGE_RATIO) evidenceStage = "developing";
  else if (strongStage / total >= TRANSFER_STRONG_STAGE_RATIO) evidenceStage = "transfer";
  else evidenceStage = "teaching";

  // Developmental safeguard (007U's own explicit example: "A Year 4
  // learner should not receive full Mock saturation merely because their
  // attainment is high") — undefined school year (not yet captured) is
  // treated as eligible, matching this whole codebase's own
  // "never block on missing optional data" convention elsewhere
  // (getEligibleSubjectKeys' own undefined-pathway fallback).
  const developmentallyEligibleForLateStage = schoolYear === "Year 6" || schoolYear === undefined;

  if (evidenceStage === "transfer" && developmentallyEligibleForLateStage) {
    if (clock.horizonBand === "final_preparation") return "final_preparation";
    if (clock.horizonBand === "exam_condition" || clock.horizonBand === "transfer_building") return "exam_preparation";
  }

  return evidenceStage;
}

/**
 * Educational Increment 007W, Part 5 — proves the preparation stage has
 * real, distinct operational value rather than being a label with no
 * consequence. Each principle below is the disclosed, learner-facing
 * consequence of that stage (never engine terminology, never a specific
 * activity promise — "a stage may only select activities that actually
 * exist" is honoured by keeping this to priority/emphasis language, not a
 * concrete content pointer). Deliberately kept to messaging/emphasis only
 * this increment, not wired into which questions get selected, per the
 * disclosed 007W scoping decision to keep this addition small and safe.
 */
export function stagePrinciple(stage: PreparationStage): string {
  switch (stage) {
    case "insufficient_evidence":
      return "Not enough practice yet to judge where to focus. A short first session in each area will help build a real picture.";
    case "foundation":
      return "Building the core ideas first. Sessions favour worked examples and guided steps before independent practice.";
    case "teaching":
      return "A recent area needs re-teaching before more practice. Sessions focus on the specific skill that slipped.";
    case "developing":
      return "Core ideas are in place. Sessions mix guided and independent practice to build reliability.";
    case "transfer":
      return "Skills are solid. Sessions favour independent practice and applying skills in less familiar question styles.";
    case "exam_preparation":
      return "The exam is approaching and the fundamentals are solid. Sessions favour timed, independent practice.";
    case "final_preparation":
      return "In the final stretch before the exam. Sessions favour full independent practice and steady review of strengths.";
  }
}
