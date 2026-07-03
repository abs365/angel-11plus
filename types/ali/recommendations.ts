export type RelationshipType = "shared-mechanism" | "sequential-dependency";
export type RelationshipStrength = "strong" | "moderate" | "weak";

/**
 * A human-authored edge in the cross-subject competency relationship graph
 * (ALI_CROSS_SUBJECT_INTELLIGENCE.md §1.3, ALI_RECOMMENDATION_ENGINE.md).
 * Authored by hand against real curriculum structure — never mined from
 * usage correlation (same "do not automate" principle as competency
 * tagging). `toSubject` is a plain string, not `AliSubject`, so an edge can
 * point at a subject ALI doesn't cover yet (e.g. numerical-reasoning) —
 * such an edge is real and documented, but structurally inert until that
 * subject has real competency data to check against.
 */
export interface CompetencyRelationship {
  fromCompetency: string;
  toCompetency: string;
  toSubject: string;
  relationshipType: RelationshipType;
  strength: RelationshipStrength;
  rationale: string;
}

export type RecommendationConfidence = "high" | "moderate";

/**
 * One conservative, supplementary suggestion — never a replacement for
 * direct competency-level remediation (ALI_RECOMMENDATION_ENGINE.md §2's
 * safety rule, enforced structurally in lib/ali/recommendations.ts, not
 * just by convention).
 */
export interface CrossSubjectRecommendation {
  targetCompetency: string;
  targetSubject: string;
  sourceCompetency: string;
  sourceSubject: string;
  relationshipType: RelationshipType;
  confidence: RecommendationConfidence;
  reason: string;
}
