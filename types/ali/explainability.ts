import type { RecommendationCandidate } from "@/types/ali/recommendationOrchestration";

/**
 * Three Explainability Audiences (EAW-003_ASSESSMENT_ENGINE_ARCHITECTURE.md
 * §8, Programme Decision APD-009 item 2) — a refinement of, not a
 * contradiction to, EAW-002 §5's original engine-vs-UI binary distinction.
 */
export type ExplainabilityAudience = "learner" | "parent" | "engineering-audit";

export interface AudienceExplanation {
  audience: ExplainabilityAudience;
  /** Plain-language text for "learner"/"parent"; a compact one-line summary for "engineering-audit" (the full structured data lives in `data`). */
  text: string;
  /**
   * Only populated for the "engineering-audit" audience — the full
   * RecommendationCandidate fields, exactly as generated upstream, never
   * summarised or reworded. Never populated for "learner"/"parent": no
   * confidence tier, competency code, mechanism name, or "algorithm"
   * language may ever reach either of those two audiences
   * (`ANGEL_EXPERIENCE_MANIFESTO.md`'s Invisible Intelligence doctrine).
   */
  data?: RecommendationCandidate;
}
