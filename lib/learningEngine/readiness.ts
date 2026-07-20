import type { AssessmentComponent, ComponentReadiness, CompetencyStatus, ReadinessBand } from "./types";
import { COMPETENCIES, ALL_ASSESSMENT_COMPONENTS } from "./assessmentBrainMap";

/**
 * LEARNING_ENGINE_V1.md §6 — Readiness Model. Component-scoped, qualitative
 * banding only — no percentage, no aggregate score, no exam-outcome
 * inference. A band describes the shape of the evidence distribution
 * already computed elsewhere (rollup.ts, diagnostics.ts); it does not add
 * new information.
 */
function bandFor(strengthCount: number, developmentCount: number, notYetCount: number, total: number): ReadinessBand {
  if (notYetCount === total) return "Not Yet Evidenced";
  if (strengthCount >= developmentCount && strengthCount > 0 && notYetCount === 0) return "Well Evidenced";
  return "Partially Evidenced";
}

export function computeComponentReadiness(competencies: CompetencyStatus[]): ComponentReadiness[] {
  return ALL_ASSESSMENT_COMPONENTS.map((component: AssessmentComponent) => {
    const inComponent = competencies.filter((c) => COMPETENCIES[c.competencyId].component === component);
    const competencyIds = inComponent.map((c) => c.competencyId);

    const strengths = inComponent
      .filter((c) => c.signal === "Demonstrated" && (c.tier === "ET-3" || c.tier === "ET-4"))
      .map((c) => c.competencyId);
    const developmentAreas = inComponent
      .filter((c) => c.signal === "Not Yet Demonstrated" && c.tier !== "ET-0")
      .map((c) => c.competencyId);
    const notYetEvidenced = inComponent.filter((c) => c.tier === "ET-0").map((c) => c.competencyId);

    return {
      component,
      band: bandFor(strengths.length, developmentAreas.length, notYetEvidenced.length, inComponent.length),
      competencyIds,
      strengths,
      developmentAreas,
      notYetEvidenced,
    };
  });
}
