import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { CompetencyId, AssessmentComponent } from "./types";
import type { RecommendationTrigger } from "@/types/ali/recommendationOrchestration";
import { computeSubjectPreparationSummary, COMPONENT_TO_SUBJECT_KEY, type SubjectPreparationSummary } from "./preparationState";
import { derivePreparationStage, stagePrinciple, type PreparationStage, type SchoolYear } from "./preparationStage";
import { resolvePreparationClockFor, type PreparationClock } from "./preparationClock";
import { getRecommendations } from "./educationalIntelligenceService";
import { getSchoolYear, getTargetExamDate } from "@/lib/progress";
import { classifyMockAccess, type MockAccessAssessment } from "@/lib/ali/mockAccessPolicy";
import type { AssessmentPurpose } from "./assessmentPurpose";

/**
 * Programme Increment 019, Part 4 — the ONE canonical educational decision
 * contract, per this increment's own explicit instruction: "Create one
 * canonical educational decision contract/function rather than scattering
 * preparation logic across pages... The UI must not independently invent
 * educational logic."
 *
 * This module computes NOTHING new about mastery, confidence, evidence, or
 * recommendation ranking — every one of those conclusions is read,
 * unmodified, from the real engines this whole programme already built and
 * proved live (Increment 007V/007W's own preparationState.ts/
 * preparationStage.ts, and Sprint 2/3's own getRecommendations()). The only
 * genuinely new work here is ORCHESTRATION: calling those real engines with
 * the real inputs they already accept, and shaping their combined output
 * into the single explainable object this increment's own decision
 * contract names — reusing, per Part 1's explicit instruction, not
 * competing with, the existing Preparation Horizon engine.
 *
 * Reuses `getRecommendations()`'s own pre-existing `daysUntilExam`
 * parameter (previously always called with `null` by every real caller —
 * confirmed by direct search this increment) — this is the SAME Tier 3
 * exam-proximity reweighting mechanism `lib/ali/persistence/
 * recommendationRuntime.ts` already implements and has simply never been
 * fed a real value before. Passing `clock.daysRemaining` here is this
 * decision contract's one new behavioural connection, not a new engine.
 */

export type ActivityType =
  | "placement_check"
  | "teaching_lesson"
  | "guided_practice"
  | "independent_practice"
  | "revision_retrieval"
  | "unseen_transfer_check"
  | "timed_assessment";

/** Founder's own requested four-bucket rollup (Increment 019 Part 1) of the real, more granular 7-stage engine -- for messaging/reporting only, never a second stage-derivation. */
export type PreparationStageGroup = "foundation" | "development" | "exam_preparation" | "final_readiness";

const STAGE_GROUP: Record<PreparationStage, PreparationStageGroup> = {
  insufficient_evidence: "foundation",
  foundation: "foundation",
  teaching: "foundation",
  developing: "development",
  transfer: "development",
  exam_preparation: "exam_preparation",
  final_preparation: "final_readiness",
};

export interface PreparationDecision {
  preparationStage: PreparationStage;
  preparationStageGroup: PreparationStageGroup;
  stagePrincipleText: string;
  clock: PreparationClock;
  priorityCompetencies: CompetencyId[];
  secureCompetencies: CompetencyId[];
  weakCompetencies: CompetencyId[];
  insufficientEvidenceCompetencies: CompetencyId[];
  vetoedCompetencyCodes: string[];
  recommendedActivityType: ActivityType;
  recommendedCompetencyId: CompetencyId | null;
  /** Reuses the real, existing per-competency `ContentDifficulty` vocabulary qualitatively -- never a fabricated numeric threshold. Null when no real candidate exists to derive a difficulty steer from. */
  recommendedDifficultyLean: "favour_guided_and_easier" | "balanced" | "favour_independent_and_harder" | null;
  placementRequired: boolean;
  revisionRequired: boolean;
  assessmentAppropriate: boolean;
  assessmentPurpose: AssessmentPurpose | null;
  decisionReasons: string[];
}

const REAL_COMPONENTS: AssessmentComponent[] = ["Mathematics", "English Comprehension", "Continuous Writing"];

function flattenCompetencies(subjects: SubjectPreparationSummary[]) {
  return subjects.flatMap((s) => s.competencies);
}

/**
 * Maps a top-ranked real recommendation candidate's own `triggerReason`
 * (RecommendationTrigger, unmodified vocabulary) onto one of this
 * contract's activity types. `hasFullLessonAvailable` is supplied by the
 * caller (never hardcoded here) so this module never needs updating as
 * Teaching Expansion Wave 1 (Part 15) adds real lesson coverage — today
 * that predicate should be backed by exactly the 2 real lesson pages
 * (arithmetic, percentages) this programme's own audit confirmed exist.
 */
function deriveActivityFromTrigger(
  trigger: RecommendationTrigger | null,
  stage: PreparationStage,
  hasFullLessonAvailable: (competencyId: CompetencyId) => boolean,
  competencyId: CompetencyId | null
): ActivityType {
  if (trigger === "review-due") return "revision_retrieval";
  if (trigger === "weak-competency-remediation" || trigger === "never-attempted") {
    if (competencyId && hasFullLessonAvailable(competencyId) && (stage === "foundation" || stage === "teaching" || stage === "insufficient_evidence")) {
      return "teaching_lesson";
    }
    return "guided_practice";
  }
  if (trigger === "cooldown-expired" || trigger === "mastery-event-on-linked-competency") {
    return stage === "transfer" || stage === "exam_preparation" || stage === "final_preparation"
      ? "unseen_transfer_check"
      : "independent_practice";
  }
  return "independent_practice";
}

function deriveDifficultyLean(stage: PreparationStage): PreparationDecision["recommendedDifficultyLean"] {
  switch (stage) {
    case "insufficient_evidence":
    case "foundation":
    case "teaching":
      return "favour_guided_and_easier";
    case "developing":
      return "balanced";
    case "transfer":
    case "exam_preparation":
    case "final_preparation":
      return "favour_independent_and_harder";
  }
}

export interface ComputePreparationDecisionOptions {
  now?: Date;
  schoolYear?: SchoolYear;
  targetExamDate?: string;
  /** See deriveActivityFromTrigger's own docstring. Defaults to "no lesson available for any competency" -- the safe, honest default until a caller supplies real coverage. */
  hasFullLessonAvailable?: (competencyId: CompetencyId) => boolean;
  /** Real, existing `isMockFormAvailable()` result for the Mock relevant to this decision, if the caller already has one -- see lib/ali/mockAccessPolicy.ts. Omitted entirely when the caller has not checked (assessmentAppropriate/assessmentPurpose are then derived from stage alone, never assumed available). */
  mockTechnicallyAvailable?: boolean;
  founderAuthorisedMockOverride?: boolean;
}

/**
 * The real entry point — reads the parent's actual configured school
 * year/exam date (lib/progress.ts, unchanged) unless the caller overrides
 * them (tests, or a future server-side caller with its own source), then
 * delegates to the pure core below. Every Supabase read this function
 * performs is one of the two already-existing, already-proven-live real
 * engines (computeSubjectPreparationSummary / getRecommendations) — no
 * new table, no new persistence.
 */
export async function computePreparationDecision(
  supabase: SupabaseClient<Database>,
  profileId: string,
  options: ComputePreparationDecisionOptions = {}
): Promise<PreparationDecision> {
  const now = options.now ?? new Date();
  const schoolYear = options.schoolYear ?? getSchoolYear();
  const targetExamDate = options.targetExamDate ?? getTargetExamDate();
  const clock = resolvePreparationClockFor(targetExamDate, now);

  const subjects = await Promise.all(REAL_COMPONENTS.map((component) => computeSubjectPreparationSummary(supabase, profileId, component, now)));

  const allCompetencyIds = flattenCompetencies(subjects).map((c) => c.competencyId);
  const recommendations = await getRecommendations(supabase, profileId, allCompetencyIds, now, clock.daysRemaining);

  return buildPreparationDecision(subjects, clock, schoolYear, recommendations.ordered, recommendations.vetoedCompetencyCodes, options);
}

/**
 * Pure core, independently testable without any Supabase connection —
 * exactly the same "pure core takes real inputs explicitly" pattern
 * `resolvePreparationClockFor()` and `derivePreparationStage()` already
 * established (see this file's own callers in
 * tests/lib/learningEngine/preparationDecision.test.ts, including this
 * increment's own Part 20 persona tests).
 */
export function buildPreparationDecision(
  subjects: SubjectPreparationSummary[],
  clock: PreparationClock,
  schoolYear: SchoolYear | undefined,
  orderedCandidates: { competencyCode: string; educationalState: string; triggerReason: RecommendationTrigger }[],
  vetoedCompetencyCodes: string[],
  options: ComputePreparationDecisionOptions = {}
): PreparationDecision {
  const stage = derivePreparationStage(subjects, clock, schoolYear);
  const competencies = flattenCompetencies(subjects);

  // A competency can carry more than one record when historic and current evidence disagree
  // (see PERSONA F). A rebuilding signal always wins -- mastery is never treated as permanent
  // merely because an older/other record for the same competency still says "mastered".
  const weakCompetencies = [...new Set(competencies.filter((c) => c.educationalState === "rebuilding").map((c) => c.competencyId))];
  const weakCompetencySet = new Set(weakCompetencies);
  const secureCompetencies = [
    ...new Set(
      competencies
        .filter((c) => (c.educationalState === "mastered" || c.educationalState === "durably-mastered") && !weakCompetencySet.has(c.competencyId))
        .map((c) => c.competencyId)
    ),
  ];
  const insufficientEvidenceCompetencies = competencies
    .filter((c) => c.confidenceTier === "insufficient")
    .map((c) => c.competencyId);

  const priorityCompetencies = orderedCandidates
    .filter((c) => !vetoedCompetencyCodes.includes(c.competencyCode))
    .map((c) => c.competencyCode as CompetencyId);

  const topCandidate = orderedCandidates.find((c) => !vetoedCompetencyCodes.includes(c.competencyCode)) ?? null;
  const recommendedCompetencyId = (topCandidate?.competencyCode as CompetencyId | undefined) ?? null;

  const placementRequired = stage === "insufficient_evidence";
  const revisionRequired = weakCompetencies.length > 0 || (topCandidate?.triggerReason === "review-due");

  const mockAccess: MockAccessAssessment | null =
    options.mockTechnicallyAvailable === undefined
      ? null
      : classifyMockAccess({
          technicallyAvailable: options.mockTechnicallyAvailable,
          stage,
          clock,
          founderAuthorisedOverride: options.founderAuthorisedMockOverride,
        });

  const assessmentAppropriate = placementRequired
    ? true // a placement check is always an appropriate assessment activity for insufficient-evidence learners -- that is exactly what it is for
    : mockAccess !== null && (mockAccess.availabilityLevel === "educationally_recommended");
  const assessmentPurpose: AssessmentPurpose | null = placementRequired
    ? "placement"
    : assessmentAppropriate
      ? "full_mock"
      : null;

  const recommendedActivityType: ActivityType = placementRequired
    ? "placement_check"
    : deriveActivityFromTrigger(
        topCandidate?.triggerReason ?? null,
        stage,
        options.hasFullLessonAvailable ?? (() => false),
        recommendedCompetencyId
      );

  const decisionReasons: string[] = [
    `Preparation stage: "${stage}" (${STAGE_GROUP[stage]}).`,
    clock.horizonBand === "unavailable"
      ? "No target exam date is configured -- exam-proximity reweighting is inactive."
      : `${clock.daysRemaining} days remain to the configured exam date (horizon: ${clock.horizonBand}).`,
  ];
  if (placementRequired) {
    decisionReasons.push("Insufficient real evidence exists yet across the competency map -- a placement check is recommended before further sequencing decisions.");
  } else if (recommendedCompetencyId) {
    decisionReasons.push(`Top-priority competency "${recommendedCompetencyId}" (trigger: ${topCandidate?.triggerReason}).`);
  }
  if (weakCompetencies.length > 0) {
    decisionReasons.push(`${weakCompetencies.length} competenc${weakCompetencies.length === 1 ? "y has" : "ies have"} a genuine regression signal (rebuilding).`);
  }

  return {
    preparationStage: stage,
    preparationStageGroup: STAGE_GROUP[stage],
    stagePrincipleText: stagePrinciple(stage),
    clock,
    priorityCompetencies,
    secureCompetencies,
    weakCompetencies,
    insufficientEvidenceCompetencies,
    vetoedCompetencyCodes,
    recommendedActivityType,
    recommendedCompetencyId,
    recommendedDifficultyLean: deriveDifficultyLean(stage),
    placementRequired,
    revisionRequired,
    assessmentAppropriate,
    assessmentPurpose,
    decisionReasons,
  };
}

export { COMPONENT_TO_SUBJECT_KEY };
