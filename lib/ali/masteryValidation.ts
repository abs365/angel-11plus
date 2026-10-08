import { computeCompetencyConfidence } from "./confidence";
import type {
  CompetencyConfidenceInput,
  EvidenceConfidenceTier,
} from "@/types/ali/confidence";

/**
 * Work Package WP-06 (Implementation Programme) — Mastery Validation gate.
 * Implements AEP-005_ASSESSMENT_FRAMEWORK.md §9 ("Mastery Decisions") and
 * EAW-003_ASSESSMENT_ENGINE_ARCHITECTURE.md §6: a mastery claim may only
 * proceed to Decision Generation when BOTH conditions hold — the existing,
 * unmodified `mastery_threshold` mechanism (lib/ali/mastery.ts, distinct
 * correct sessions) is satisfied, AND the Evidence Confidence tier (WP-05,
 * lib/ali/confidence.ts) is at least Moderate.
 *
 * This does not change what `mastery_state` means or how it's computed —
 * `thresholdMet` below is the same distinct-session check
 * applyAttemptOutcome() already applies per-question, read here at
 * competency granularity. This module adds a second, additional gate on
 * top of it; it does not replace or duplicate the existing mechanism.
 */
/** Distinct question families in which the mastery threshold must be met before competency mastery counts as validated. */
export const MIN_DISTINCT_STRUCTURES = 2;

export interface MasteryValidationResult {
  competencyCode: string;
  thresholdMet: boolean;
  confidenceTier: EvidenceConfidenceTier;
  /**
   * True only when both AEP-005 §9 conditions hold. A `thresholdMet: true`
   * result with `validated: false` (e.g. threshold technically met on a
   * guessable-format question, capping confidence at Moderate-or-below —
   * see lib/ali/confidence.ts's GUESSABLE_CONFIDENCE_WEIGHT) must not be
   * treated as equivalent to a fully validated mastery claim for
   * downstream purposes such as Parent Reporting or Readiness Assessment
   * (AEP-005 §9's explicit warning).
   */
  validated: boolean;
}

export function validateCompetencyMastery(
  input: CompetencyConfidenceInput
): MasteryValidationResult {
  // "Mastery must not be achievable merely by remembering the same question": the threshold has to be met
  // across at least MIN_DISTINCT_STRUCTURES different question families (or every family that exists, if fewer).
  const structureOf = (q: CompetencyConfidenceInput["questions"][number]) => q.familyId ?? `q:${q.questionId}`;
  const poolStructures = new Set(input.questions.map(structureOf));
  const requiredStructures = Math.min(MIN_DISTINCT_STRUCTURES, poolStructures.size);
  const metStructures = new Set(
    input.questions.filter((q) => q.distinctCorrectSessions >= q.masteryThreshold).map(structureOf)
  );
  const thresholdMet = metStructures.size >= Math.max(1, requiredStructures);
  const confidenceTier = computeCompetencyConfidence(input);
  const validated = thresholdMet && (confidenceTier === "moderate" || confidenceTier === "high");

  return {
    competencyCode: input.competencyCode,
    thresholdMet,
    confidenceTier,
    validated,
  };
}
