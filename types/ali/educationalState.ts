import type { QuestionEvidenceInput, EvidenceConfidenceTier } from "@/types/ali/confidence";

/**
 * Educational State Model (EAW-004_RECOMMENDATION_ENGINE_ARCHITECTURE.md
 * §3, Programme Decision APD-010). An internal coordination label only —
 * never shown to a learner or parent (`ANGEL_EXPERIENCE_MANIFESTO.md`'s
 * Invisible Intelligence doctrine applies to this label with the same
 * force as everywhere else). Always fully derived from the upstream layers
 * of the Derived State Hierarchy (Programme Decision APD-025): Question
 * Attempts -> Confidence -> Mastery -> Validated Mastery -> Durable
 * Mastery -> Educational State. Never independently stored as ground
 * truth.
 */
export type EducationalState =
  | "exploring"
  | "building-knowledge"
  | "practising"
  | "reinforcing"
  | "mastered"
  | "durably-mastered"
  | "reviewing"
  | "rebuilding";

/**
 * QuestionEvidenceInput (types/ali/confidence.ts) extended with the one
 * additional real field this module needs that no upstream layer already
 * exposes: the most recent attempt's outcome, used to detect a just-lost
 * mastery ("Rebuilding") from the same real data
 * ali_student_question_history.last_attempt_correct already captures — not
 * a new capture requirement.
 */
export interface EducationalStateQuestionEvidence extends QuestionEvidenceInput {
  lastAttemptCorrect: boolean | null;
}

export interface EducationalStateInput {
  competencyCode: string;
  questions: EducationalStateQuestionEvidence[];
  /** WP-05 output (lib/ali/confidence.ts) — consumed, not recomputed. */
  confidenceTier: EvidenceConfidenceTier;
  /** Existing, unmodified mastery_state mechanism's raw output — consumed, not recomputed. */
  masteryState: string;
  /** WP-06 output (lib/ali/masteryValidation.ts) — consumed, not recomputed. */
  validated: boolean;
  /** WP-07 output (lib/ali/durableMastery.ts) — consumed, not recomputed. */
  durable: boolean;
  /** WP-07's isMaintenanceReviewDue(), applied by the caller — consumed, not recomputed. */
  reviewDue: boolean;
}
