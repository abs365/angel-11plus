/**
 * Durable Mastery Model (AEP-004_LEARNING_JOURNEY_FRAMEWORK.md §9.6,
 * AEP-005_ASSESSMENT_FRAMEWORK.md §10, AIW-001_EDUCATIONAL_DATA_MODEL.md
 * §7). Sits beside the existing, unmodified `mastery_state` mechanism —
 * never replaces it. A competency is Durably Mastered only once it has
 * survived a genuine-gap Maintenance Review, and — where a real transfer
 * link exists — been independently corroborated in that linked competency.
 */
export interface MaintenanceReviewRecord {
  attemptedAt: string; // ISO timestamp
  daysSinceLastEvidence: number;
  correct: boolean;
}

export interface TransferCorroboration {
  /** Null when no strong transfer link exists for this competency (AEP-002 §10) — condition 3 of Durable Mastery is then skipped entirely, per AEP-005 §10's explicit exception, not treated as a failure. */
  linkedCompetencyCode: string | null;
  /** Null (not false) when a link exists but hasn't been checked yet — honestly distinct from "checked and not corroborated," same discipline as CompetencyConfidenceInput.transferCorroborated (types/ali/confidence.ts). */
  corroborated: boolean | null;
}

export interface DurableMasteryRecord {
  competencyCode: string;
  /**
   * WP-06's Mastery Validation gate output (lib/ali/masteryValidation.ts),
   * not the raw mastery_state string — per Programme Decision APD-025's
   * Derived State Hierarchy, Durable Mastery consumes the validated output
   * of the preceding layer, not the unvalidated one it sits above.
   */
  validated: boolean;
  maintenanceReviews: MaintenanceReviewRecord[];
  transferCorroboration: TransferCorroboration;
  durable: boolean;
}
