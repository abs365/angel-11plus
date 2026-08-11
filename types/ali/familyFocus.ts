/**
 * Family Choice Pilot — controlled implementation increment
 * (FAMILY_CHOICE_AND_RECOMMENDED_FOCUS_MODEL_V1.md's "family-selected"
 * provenance source, given a real schema for the first time). Sits
 * beside — never replaces — Angel's own evidence-based recommendation
 * (RecommendationCandidate, computed live, never stored). This pilot
 * scope is exactly one active chosen competency per learner at a time.
 */
export interface FamilyFocusSelection {
  profileId: string;
  competencyCode: string;
  source: "family-selected";
  active: boolean;
  selectedAt: string; // ISO timestamp
  removedAt: string | null;
}
