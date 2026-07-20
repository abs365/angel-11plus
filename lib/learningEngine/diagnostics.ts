import type { CompetencyStatus, DiagnosticFindings } from "./types";

/**
 * LEARNING_ENGINE_V1.md §4 — Diagnostic Intelligence. Pure bucketing of
 * each competency's already-computed Signal x Tier into the five named
 * categories, exactly as that section defines them. No scoring, no
 * threshold not already stated in §4's own prose.
 */
export function computeDiagnosticFindings(competencies: CompetencyStatus[]): DiagnosticFindings {
  const findings: DiagnosticFindings = {
    strengths: [],
    masteredSkills: [],
    emergingSkills: [],
    developmentAreas: [],
    lowConfidenceAreas: [],
    notYetEvidenced: [],
  };

  for (const c of competencies) {
    const { competencyId: id, signal, tier } = c;

    if (tier === "ET-0") {
      findings.notYetEvidenced.push(id);
      continue; // §4: an ET-0 competency is never a Development Area or any other diagnostic category.
    }

    if (signal === "Demonstrated" && (tier === "ET-3" || tier === "ET-4")) {
      findings.strengths.push(id);
    }
    if (signal === "Demonstrated" && tier === "ET-4") {
      findings.masteredSkills.push(id);
    }
    if (signal === "Demonstrated" && (tier === "ET-1" || tier === "ET-2")) {
      findings.emergingSkills.push(id);
    }
    if (signal === "Not Yet Demonstrated") {
      // tier is already guaranteed !== "ET-0" by the continue above.
      findings.developmentAreas.push(id);
    }
    if (signal === "Developing" || ((signal === "Demonstrated" || signal === "Not Yet Demonstrated") && tier === "ET-1")) {
      findings.lowConfidenceAreas.push(id);
    }
  }

  return findings;
}
