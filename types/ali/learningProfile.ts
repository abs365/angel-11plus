/**
 * Internal Learning Profile (ALI Foundation Completion, Part 3) — a derived
 * interpretation of existing ALI evidence, NOT a new source of truth and
 * NOT a new stored fact about the student. Every non-null dimension is
 * recomputed from `aliCompetencySignal`/`aliLearningGain` already bridged
 * into UserProgress; nothing here is collected or asked of the student
 * directly. See LEARNING_PROFILE_MODEL.md for the full interpretation and
 * an honest accounting of which dimensions can and cannot be computed from
 * what ALI currently tracks.
 */
export interface LearningProfileDimensions {
  /** Mastery ratio across rule-application/multi-step competencies (VR sequences/codes, Maths algebra/problem-solving/powers-roots). 0-100, null if nothing attempted yet. */
  logicalReasoning: number | null;
  /** Mastery ratio across language-relationship competencies (VR analogies/synonyms/antonyms/etc., Vocabulary, English vocabulary-in-context). 0-100, null if nothing attempted yet. */
  verbalReasoning: number | null;
  /** Mastery ratio across Mathematics competencies. 0-100, null if nothing attempted yet. */
  numericalConfidence: number | null;
  /**
   * NOT COMPUTABLE from current evidence — would need per-session variance
   * from raw ali_student_question_history (timestamps/sequence), which
   * isn't bridged into UserProgress. Always null. See LEARNING_PROFILE_
   * MODEL.md §3.
   */
  learningConsistency: null;
  /** NOT COMPUTABLE — would need distinct-session timestamps to measure sessions-to-mastery. Always null. */
  learningSpeed: null;
  /** NOT COMPUTABLE — would need per-question response time, which nothing in the app records yet (same gap ALI_CROSS_SUBJECT_INTELLIGENCE.md §2.4 already flagged). Always null. */
  confidenceVsAccuracy: null;
  /** Coarse resilience signal — see LEARNING_PROFILE_MODEL.md §2.4. 0-100, null if no Learning Gain data exists for any subject yet. */
  persistence: number | null;
  /** NOT COMPUTABLE — would need to distinguish voluntary revision from cooldown-driven resurfacing, not present in the coarse signal. Always null. */
  revisionBehaviour: null;
}

export interface LearningProfile {
  dimensions: LearningProfileDimensions;
  /** Parent-friendly phrases derived from whichever dimensions are non-null. Stored internally only — not rendered anywhere yet. */
  interpretation: string[];
  computedAt: string;
}
