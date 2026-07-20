import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import type { CompetencyStatus, LearnerIntelligenceProfile } from "./types";
import { ALL_COMPETENCY_IDS, getQuestionTypesForCompetency } from "./assessmentBrainMap";
import { fetchAllQuestionTypeExposure } from "./evidence";
import { computeCompetencyStatus } from "./rollup";
import { computeDiagnosticFindings } from "./diagnostics";
import { computeComponentReadiness } from "./readiness";
import { computeRecommendations } from "./recommendations";

/**
 * Top-level orchestrator for the Learning Engine V1 model
 * (docs/intelligence/LEARNING_ENGINE_V1.md). Combines the real data layer
 * (evidence.ts) with the pure computation layer (rollup/diagnostics/
 * readiness/recommendations.ts) into one snapshot.
 *
 * CSSE-scoped only, per every source document — callers must check
 * `pathwayEligible` before treating the result as meaningful for a learner
 * on a different pathway (LEARNING_ENGINE_V1.md §9: "no invented
 * constructs" — this model has no basis for GL/CEM/ISEB learners).
 */
export async function fetchLearnerIntelligenceProfile(pathwayId: string | undefined): Promise<LearnerIntelligenceProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const pathwayEligible = pathwayId === "csse";

  const profileId = await ensureProfile();
  if (!profileId) return null;

  if (!pathwayEligible) {
    return {
      profileId,
      pathwayEligible: false,
      competencies: [],
      diagnostics: { strengths: [], masteredSkills: [], emergingSkills: [], developmentAreas: [], lowConfidenceAreas: [], notYetEvidenced: [] },
      readiness: [],
      recommendations: [],
      hasAnyContent: false,
      hasAnyEvidence: false,
    };
  }

  const exposureByType = await fetchAllQuestionTypeExposure(supabase, profileId);

  const competencies: CompetencyStatus[] = ALL_COMPETENCY_IDS.map((id) => {
    const mapped = getQuestionTypesForCompetency(id).map((qt) => exposureByType[qt]);
    return computeCompetencyStatus(id, mapped);
  });

  const diagnostics = computeDiagnosticFindings(competencies);
  const readiness = computeComponentReadiness(competencies);
  const recommendations = computeRecommendations(competencies, diagnostics);

  const hasAnyContent = Object.values(exposureByType).some((e) => e.contentExists);
  const hasAnyEvidence = competencies.some((c) => c.tier !== "ET-0");

  return {
    profileId,
    pathwayEligible: true,
    competencies,
    diagnostics,
    readiness,
    recommendations,
    hasAnyContent,
    hasAnyEvidence,
  };
}
