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
const REBUILDING_TRIGGERS_TEACHING_RATIO = 0.2;
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
  const rebuilding = allCompetencies.filter((c) => c.educationalState === "rebuilding").length;
  if (rebuilding / total >= REBUILDING_TRIGGERS_TEACHING_RATIO) return "teaching";

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
