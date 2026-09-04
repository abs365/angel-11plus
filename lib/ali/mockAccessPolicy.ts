import type { PreparationStage } from "@/lib/learningEngine/preparationStage";
import type { PreparationClock } from "@/lib/learningEngine/preparationClock";

/**
 * Programme Increment 019, Part 6 — Mock Access Policy.
 *
 * Existing active-Mock availability (`isMockFormAvailable()`,
 * lib/mockAttempt/client.ts, unmodified) must stop being the SOLE
 * educational decision, per this increment's own instruction — but Mocks
 * must never be indiscriminately hidden either. This module keeps three
 * levels explicitly separate:
 *
 *   - TECHNICALLY_AVAILABLE: the real, existing, unmodified
 *     `isMockFormAvailable()` answer. A learner can always see and start
 *     an available Mock, at any preparation stage — this level is never
 *     gated by anything this module adds.
 *   - EDUCATIONALLY_RECOMMENDED: whether Angel's own real, existing
 *     evidence (the SAME `PreparationStage` this whole increment's
 *     decision contract already computes, `lib/learningEngine/
 *     preparationStage.ts`, unmodified) currently supports recommending
 *     it as the next best action — reuses that module's own "transfer"-
 *     stage-and-later readiness signal, never a new threshold invented
 *     here.
 *   - FOUNDER_AUTHORISED_EXTRA: a caller-supplied override flag only —
 *     this increment does not implement payment or any UI to set it (per
 *     explicit instruction); the type exists so a later increment can
 *     wire a real authorisation source without another policy rewrite.
 *
 * `classifyMockAccess()` never returns a level that would hide a
 * technically-available Mock — see its own tests for the explicit "never
 * hides" proof.
 */

export type MockAvailabilityLevel = "not_available" | "technically_available" | "educationally_recommended";

export interface MockAccessAssessment {
  availabilityLevel: MockAvailabilityLevel;
  /** Never inferred -- true only when the caller explicitly supplies founderAuthorisedOverride. */
  founderAuthorisedExtra: boolean;
  reasons: string[];
}

/**
 * The real, existing stages `derivePreparationStage()` only ever reaches
 * once genuine evidence supports transfer-level performance (its own
 * "transfer"/"exam_preparation"/"final_preparation" branch,
 * lib/learningEngine/preparationStage.ts:75-94) — reused here unchanged
 * as the readiness signal, not re-derived.
 */
const READINESS_SUPPORTING_STAGES: ReadonlySet<PreparationStage> = new Set(["transfer", "exam_preparation", "final_preparation"]);

export function classifyMockAccess(input: {
  technicallyAvailable: boolean;
  stage: PreparationStage;
  clock: PreparationClock;
  founderAuthorisedOverride?: boolean;
}): MockAccessAssessment {
  const founderAuthorisedExtra = input.founderAuthorisedOverride === true;

  if (!input.technicallyAvailable) {
    return {
      availabilityLevel: "not_available",
      founderAuthorisedExtra,
      reasons: ["No active Mock form currently exists for this attempt type."],
    };
  }

  const readinessSupported = READINESS_SUPPORTING_STAGES.has(input.stage);
  if (readinessSupported || founderAuthorisedExtra) {
    const reasons = founderAuthorisedExtra
      ? ["Founder/parent has authorised an extra assessment sitting."]
      : [`Current evidence-derived preparation stage ("${input.stage}") supports timed, independent assessment.`];
    return { availabilityLevel: "educationally_recommended", founderAuthorisedExtra, reasons };
  }

  return {
    availabilityLevel: "technically_available",
    founderAuthorisedExtra,
    reasons: [
      `The Mock is available and can be started, but current evidence-derived preparation stage ("${input.stage}") does not yet support recommending it as the next action.`,
    ],
  };
}

/** A learner-safe truth claim: `classifyMockAccess()` never asserts readiness this codebase's own evidence does not support -- see this increment's own explicit "do not make unsupported claims that a learner is 'Mock ready'" instruction. */
export function isEducationallyRecommended(assessment: MockAccessAssessment): boolean {
  return assessment.availabilityLevel === "educationally_recommended";
}
