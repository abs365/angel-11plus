/**
 * Evidence Confidence Model (AEP-005_ASSESSMENT_FRAMEWORK.md §6,
 * EAW-002_LEARNING_INTELLIGENCE_ENGINE_ARCHITECTURE.md §6). Rates how much
 * real evidence exists about a specific learner's specific competency right
 * now — a genuinely different scale from AEP-001's Evidence Strength rating
 * (which rates published research quality, not a specific learner's data).
 * The two must never be merged into one number (AEP-005 §6's own warning).
 */
export type EvidenceConfidenceTier = "high" | "moderate" | "low" | "insufficient";

/**
 * The minimal per-question fields Confidence Processing needs, deliberately
 * a subset of StudentQuestionHistoryRow (types/ali/history.ts) plus the two
 * BankQuestion fields (types/ali/questionBank.ts) that bear on confidence —
 * not the full row shapes, to keep this function's dependency surface
 * small and independently testable.
 */
export interface QuestionEvidenceInput {
  questionId: string;
  timesSeen: number;
  distinctCorrectSessions: number;
  masteryThreshold: number;
  confidenceWeight: number;
  /**
   * Stage 2 Educational Integrity Correction (migration 076) — whether the
   * most recent attempt was automatically verified by Angel, as opposed to
   * self-assessed by the learner against a model answer Angel could not
   * automatically grade. Optional and defaults to `true` at the point of
   * use (lib/ali/confidence.ts's anyEvidence check) so every existing
   * caller that does not yet populate it (Mock's evidenceAdapter, any
   * pre-migration history row) behaves exactly as before — this field only
   * ever narrows evidence that would otherwise count, never invents new
   * evidence.
   */
  verified?: boolean;
}

export interface CompetencyConfidenceInput {
  competencyCode: string;
  questions: QuestionEvidenceInput[];
  /**
   * Per AEP-005 §7 ("evidence across contexts") — whether a strong,
   * transfer-linked competency (AIW-001 §2's Knowledge Graph) independently
   * shows mastery too. Optional and honestly absent by default: no
   * consumer yet performs the cross-competency Knowledge Graph traversal
   * needed to populate this (that is a future work package, not this one)
   * — never defaulted to `false` and silently treated as "checked and
   * absent," which would misrepresent an unperformed check as a negative
   * finding.
   */
  transferCorroborated?: boolean;
}
