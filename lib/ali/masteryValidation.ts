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
   * True only when both AEP-005 §9 conditions hold AND the evidence is broad enough to be evidence of the SKILL
   * rather than memory of a question or family. A `thresholdMet: true` result with `validated: false` (e.g.
   * threshold technically met on a guessable-format question, or on one family only) must not be treated as
   * equivalent to a fully validated mastery claim for downstream purposes such as Parent Reporting or Readiness
   * Assessment (AEP-005 §9's explicit warning).
   */
  validated: boolean;
  /**
   * none        -> no independently verified success at the threshold yet
   * developing  -> independent success exists, but not yet across enough distinct structures (provisional)
   * validated   -> broad enough, and confidence is at least Moderate
   * (Durable mastery is separate and stricter: lib/ali/durableMastery.ts requires `validated` PLUS a delayed
   * maintenance review and, where a link exists, transfer corroboration.)
   */
  grade: "none" | "developing" | "validated";
  breadth: { familiesMet: number; skeletonsMet: number; familiesInPool: number; familiesRequired: number };
}

/**
 * Breadth rule ("mastery is evidence of the skill, not memory of a question or family"):
 *  - if the competency has two or more question families, the threshold must be met in at least two of them;
 *  - if it has a single family, the threshold must be met on at least two distinct skeletons within it
 *    (a skeleton is the normalised stem, so the same question with new numbers does not count twice);
 *  - a pool that cannot offer two structures can never be fully validated -- it stays "developing".
 * Each question's own threshold already counts only independent attempts across distinct sessions
 * (lib/ali/mastery.ts), so supported-correct answers never contribute here.
 */
export function validateCompetencyMastery(
  input: CompetencyConfidenceInput
): MasteryValidationResult {
  type Q = CompetencyConfidenceInput["questions"][number];
  const familyOf = (q: Q) => q.familyId ?? `q:${q.questionId}`;
  const skeletonOf = (q: Q) => `${familyOf(q)}|${q.skeletonKey ?? q.questionId}`;

  const met = input.questions.filter((q) => q.distinctCorrectSessions >= q.masteryThreshold);
  const poolFamilies = new Set(input.questions.map(familyOf));
  const poolSkeletons = new Set(input.questions.map(skeletonOf));
  const familiesMet = new Set(met.map(familyOf)).size;
  const skeletonsMet = new Set(met.map(skeletonOf)).size;

  const multiFamilyPool = poolFamilies.size >= 2;
  const familiesRequired = multiFamilyPool ? MIN_DISTINCT_STRUCTURES : 1;
  const breadthSatisfied = multiFamilyPool
    ? familiesMet >= MIN_DISTINCT_STRUCTURES
    : poolSkeletons.size >= MIN_DISTINCT_STRUCTURES && skeletonsMet >= MIN_DISTINCT_STRUCTURES;

  const thresholdMet = met.length > 0 && breadthSatisfied;
  const confidenceTier = computeCompetencyConfidence(input);
  const validated = thresholdMet && (confidenceTier === "moderate" || confidenceTier === "high");
  const grade: MasteryValidationResult["grade"] = validated ? "validated" : met.length > 0 ? "developing" : "none";

  return {
    competencyCode: input.competencyCode,
    thresholdMet,
    confidenceTier,
    validated,
    grade,
    breadth: { familiesMet, skeletonsMet, familiesInPool: poolFamilies.size, familiesRequired },
  };
}
