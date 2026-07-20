import type { CompetencyId, CompetencyStatus, DiagnosticFindings, Recommendation } from "./types";
import { COMPETENCIES } from "./assessmentBrainMap";

/**
 * LEARNING_ENGINE_V1.md §7 — Recommendation Model. Categories only: each
 * Diagnostic finding maps to exactly the category §7 assigns it. No
 * priority ordering between categories or between competencies within one
 * category is computed or implied here — callers must not sort this list
 * as if it were ranked (§7, §9: "no selection logic decides which fires
 * when").
 *
 * "Review" is deliberately not produced by this function. §7 defines it as
 * responding to Historical Progress showing evidence "has not been
 * refreshed in some time" — that requires comparing against a prior
 * time-stamped snapshot (§3.6), which no persistence mechanism exists for
 * yet (Wave 1 computes a live snapshot only). Emitting a Review
 * recommendation without real historical data to compare against would be
 * exactly the kind of unsupported claim §9 forbids — left as a documented
 * gap rather than approximated.
 */
export function computeRecommendations(competencies: CompetencyStatus[], findings: DiagnosticFindings): Recommendation[] {
  const recs: Recommendation[] = [];
  const named = (id: CompetencyId) => COMPETENCIES[id].name;
  const byId = new Map(competencies.map((c) => [c.competencyId, c]));

  for (const id of findings.emergingSkills) {
    recs.push({
      category: "Practice",
      competencyId: id,
      reason: `${named(id)} shows a positive but thin pattern of evidence — more practice would help establish it more broadly.`,
    });

    // Consolidation is the ET-2-specific case within Emerging Skills: demonstrated,
    // but confined to a single mapped Question Type/format (§7).
    if (byId.get(id)?.tier === "ET-2") {
      recs.push({
        category: "Consolidation",
        competencyId: id,
        reason: `${named(id)} is demonstrated within one question format only — broadening to this competency's other mapped formats would strengthen it.`,
      });
    }
  }

  for (const id of findings.developmentAreas) {
    recs.push({
      category: "Revision",
      competencyId: id,
      reason: `${named(id)}'s evidence indicates this competency's demands are not yet being met — revisiting it directly is indicated.`,
    });
  }

  for (const id of findings.masteredSkills) {
    recs.push({
      category: "Extension",
      competencyId: id,
      reason: `${named(id)} has reached this model's evidence ceiling — attention could reasonably move elsewhere.`,
    });
  }

  return recs;
}
