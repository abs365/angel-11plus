import type { RecommendationCandidate } from "@/types/ali/recommendationOrchestration";
import type { AudienceExplanation, ExplainabilityAudience } from "@/types/ali/explainability";
import { competencyLabel } from "@/lib/ali/labels";

/**
 * Work Package WP-10 (Implementation Programme) — Explainability
 * Integration. Implements the three-audience model (`EAW-003` §8) as a
 * pure formatting layer over `RecommendationCandidate` (WP-09, extended
 * per Programme Decision APD-027's engineering note with `confidenceTier`,
 * `sourceCompetencyCode`, `triggerReason`) — this function generates no
 * new educational reasoning of its own. Every fact it renders was already
 * decided upstream (Confidence Processing, Mastery Validation, Durable
 * Mastery, Educational State, Recommendation Orchestration); this module
 * only chooses which of those facts each audience sees, and how.
 *
 * Known limitation, stated honestly rather than silently worked around:
 * `competencyLabel()` (lib/ali/labels.ts) does not yet have entries for
 * the NVR/Spatial/Mathematical Reasoning competency codes proposed in
 * WP-02 (`WP-02_PROPOSED_METADATA.md`, still pending human review) — its
 * safe fallback returns the raw code string for any code it doesn't
 * recognise. Until those labels are added (a content-authoring task, not
 * an explainability one), Learner/Parent-tier text for those three domains
 * may leak a raw competency code, which would otherwise violate Invisible
 * Intelligence — flagged here rather than papered over with a fabricated
 * label.
 */
export function generateExplanation(
  candidate: RecommendationCandidate,
  audience: ExplainabilityAudience
): AudienceExplanation {
  if (audience === "engineering-audit") {
    return {
      audience,
      text: `basis=${candidate.basis} tier=${candidate.confidenceTier} state=${candidate.educationalState} trigger=${candidate.triggerReason}`,
      data: candidate,
    };
  }

  if (audience === "learner") {
    return { audience, text: learnerText(candidate) };
  }

  return { audience, text: parentText(candidate) };
}

function learnerText(candidate: RecommendationCandidate): string {
  // Age-appropriate, encouraging, educational (Programme Decision APD-009
  // item 2) — driven entirely by Educational State (WP-08), never by a
  // confidence tier, competency code, or any mechanism name.
  switch (candidate.educationalState) {
    case "exploring":
    case "building-knowledge":
      return "Let's try something new!";
    case "practising":
      return "Keep going — you're getting the hang of this!";
    case "reinforcing":
      return "You're getting really good at this — let's keep it up!";
    case "mastered":
      return "You've got this one down — nice work!";
    case "durably-mastered":
      return "You've really mastered this — amazing!";
    case "reviewing":
      return "Let's check you've still got this!";
    case "rebuilding":
      return "Let's practise this again — you'll get there!";
  }
}

function parentText(candidate: RecommendationCandidate): string {
  const label = competencyLabel(candidate.competencyCode);

  // Confidence-calibrated language (AEP-005 §12) — a claim is only ever as
  // confident as the evidence tier that produced it. Durable Mastery gets
  // the strongest phrasing of all, since it is the strongest claim this
  // architecture makes.
  let confidenceClause: string;
  if (candidate.educationalState === "durably-mastered") {
    confidenceClause = `has shown lasting understanding of ${label}, even after a break`;
  } else {
    switch (candidate.confidenceTier) {
      case "high":
        confidenceClause = `has consistently answered ${label} questions correctly across several sessions`;
        break;
      case "moderate":
        confidenceClause = `is showing early strength in ${label}`;
        break;
      case "low":
        confidenceClause = `is just starting to explore ${label}`;
        break;
      case "insufficient":
        confidenceClause = `hasn't tried ${label} yet`;
        break;
    }
  }

  // Basis-aware framing (EAW-004 §12) — transfer-based suggestions are
  // named as connections, never as an unexplained recommendation, and
  // never phrased with the same certainty as direct evidence.
  if (candidate.basis !== "direct-evidence" && candidate.sourceCompetencyCode) {
    const sourceLabel = competencyLabel(candidate.sourceCompetencyCode);
    return `Your child ${confidenceClause} — we're suggesting this because it connects to their progress in ${sourceLabel}.`;
  }

  if (candidate.triggerReason === "review-due") {
    return `Your child ${confidenceClause} — we're checking back in to make sure it's still solid.`;
  }

  return `Your child ${confidenceClause}.`;
}
