/**
 * Educational Supply & Progression Integration Gate — Subject Teaching
 * Contracts (Sections 16-17).
 *
 * The Founder's brief explicitly warned "English must not inherit a
 * Maths teaching model blindly" and asked for subject-appropriate
 * pedagogical sequences. This module declares those sequences as typed
 * DATA -- a contract other code (a future teaching UI, or the Question
 * Factory's `teachingUses` metadata) can reference -- it does not
 * implement a rendering engine or reasoning-tutor for any of them.
 * Real, already-built content that instantiates parts of these
 * sequences is cross-referenced per contract, not duplicated:
 *   - Maths CONCEPT/REPRESENTATION/MODELLED_METHOD is real, live content
 *     in `lib/learningEngine/mathsTeachingContent.ts`
 *     (`MathsFamilyTeachingContent.model`).
 *   - GUIDED_APPLICATION is real, live content in
 *     `lib/learningEngine/guidedPractice.ts` (`GuidedScaffoldKind`).
 *   - English's own guided-practice scaffolds (selection-count-check,
 *     sequence-anchor, staged-quotation, locate-instruction) are the
 *     SAME `guidedPractice.ts` module, reused, not a parallel mechanism.
 *
 * Where no real content exists yet for a stage, this module says so
 * explicitly (`implemented: false`) -- never claims coverage that has
 * not been built, per this whole increment's evidence standard.
 */

export interface TeachingContractStage {
  stage: string;
  description: string;
  /** True only when real, live production code/content already instantiates this stage -- cited by module path. */
  implemented: boolean;
  /** Where the real implementation lives, when implemented is true. */
  realImplementationRef?: string;
}

export interface SubjectTeachingContract {
  competencyCategory: string;
  sequence: TeachingContractStage[];
}

// ============================================================
// Maths (Section 17)
// ============================================================

export const MATHS_TEACHING_CONTRACT: SubjectTeachingContract = {
  competencyCategory: "maths_general",
  sequence: [
    { stage: "CONCEPT", description: "What is genuinely being asked, and why it matters mathematically.", implemented: true, realImplementationRef: "lib/learningEngine/mathsTeachingContent.ts (MathsFamilyTeachingContent.model.whatToNotice)" },
    { stage: "REPRESENTATION", description: "How the concept is shown (diagram, table, number line, prose).", implemented: true, realImplementationRef: "lib/ali/questionFactory/types.ts StructuralBlueprint.representationType" },
    { stage: "MODELLED_METHOD", description: "Angel demonstrates the full worked reasoning.", implemented: true, realImplementationRef: "lib/learningEngine/mathsTeachingContent.ts (MathsModelExample.reasoning)" },
    { stage: "GUIDED_APPLICATION", description: "Learner applies the method with active support.", implemented: true, realImplementationRef: "lib/learningEngine/guidedPractice.ts" },
    { stage: "INDEPENDENT_APPLICATION", description: "Learner applies the method alone.", implemented: true, realImplementationRef: "lib/ali/mastery.ts applyAttemptOutcome(supportTier='independent')" },
    { stage: "STRUCTURAL_VARIATION", description: "The same competency in a genuinely different structural blueprint (not a renumbered clone).", implemented: true, realImplementationRef: "lib/ali/questionFactory/types.ts StructuralBlueprint (Scale Architecture increment)" },
    { stage: "REVERSE_TRANSFER_REASONING", description: "Applying the concept in an unfamiliar direction or context.", implemented: false },
    { stage: "RETENTION", description: "Spaced re-exposure after a genuine gap to confirm the result survives.", implemented: true, realImplementationRef: "lib/ali/durableMastery.ts isMaintenanceReviewDue/evaluateDurableMastery" },
  ],
};

// ============================================================
// English (Section 16) -- four named competency shapes, each its own
// sequence, deliberately NOT forced into the Maths shape above.
// ============================================================

export const ENGLISH_INFERENCE_CONTRACT: SubjectTeachingContract = {
  competencyCategory: "english_inference",
  sequence: [
    { stage: "EVIDENCE", description: "Locate the specific textual evidence the question turns on.", implemented: true, realImplementationRef: "lib/learningEngine/guidedPractice.ts (locate-instruction scaffold)" },
    { stage: "INTERPRETATION", description: "What the evidence literally states." , implemented: false },
    { stage: "INFERENCE", description: "What can reasonably be concluded beyond the literal statement." , implemented: false },
    { stage: "JUSTIFICATION", description: "Why that inference is the best-supported one, not merely plausible." , implemented: true, realImplementationRef: "lib/learningEngine/practiceInteractionGuard.ts shouldRenderMisconceptionNote (post-answer justification)" },
  ],
};

export const ENGLISH_MEANING_IN_CONTEXT_CONTRACT: SubjectTeachingContract = {
  competencyCategory: "english_meaning_in_context",
  sequence: [
    { stage: "SURROUNDING_TEXT", description: "Read the sentence/passage around the target word or phrase.", implemented: false },
    { stage: "CONTEXTUAL_CLUE", description: "Identify the specific clue narrowing possible meaning.", implemented: false },
    { stage: "POSSIBLE_MEANING", description: "Propose a candidate meaning.", implemented: false },
    { stage: "TEST_AGAINST_PASSAGE", description: "Substitute the candidate meaning back into the sentence to confirm it holds.", implemented: false },
  ],
};

export const ENGLISH_RETRIEVAL_CONTRACT: SubjectTeachingContract = {
  competencyCategory: "english_retrieval",
  sequence: [
    { stage: "LOCATE", description: "Find the region of text containing the answer.", implemented: true, realImplementationRef: "lib/learningEngine/guidedPractice.ts (locate-instruction scaffold)" },
    { stage: "DISCRIMINATE_RELEVANT_EVIDENCE", description: "Distinguish the exact relevant detail from nearby distractor detail.", implemented: true, realImplementationRef: "lib/learningEngine/guidedPractice.ts (selection-count-check scaffold)" },
    { stage: "ANSWER_PRECISELY", description: "State the answer at the precision the question demands.", implemented: true, realImplementationRef: "lib/learningEngine/englishAnswerValidation.ts" },
  ],
};

export const ENGLISH_SEQUENCING_CONTRACT: SubjectTeachingContract = {
  competencyCategory: "english_sequencing",
  sequence: [
    { stage: "IDENTIFY_TEXTUAL_EVIDENCE", description: "Find the events/statements to be ordered.", implemented: false },
    { stage: "ESTABLISH_RELATIONSHIP", description: "Determine the real relationship (temporal, causal, logical) between them.", implemented: true, realImplementationRef: "lib/learningEngine/guidedPractice.ts (sequence-anchor scaffold)" },
    { stage: "ELIMINATE_INCONSISTENT_SEQUENCE", description: "Rule out orderings that contradict the established relationship.", implemented: false },
  ],
};

export const ENGLISH_LANGUAGE_EFFECT_CONTRACT: SubjectTeachingContract = {
  competencyCategory: "english_language_effect",
  sequence: [
    { stage: "IDENTIFY_LANGUAGE_CHOICE", description: "Name the specific word/phrase/device used.", implemented: false },
    { stage: "INTERPRET_EFFECT", description: "Explain the effect that choice creates.", implemented: false },
    { stage: "CONNECT_TO_MEANING", description: "Link the effect back to the passage's meaning or purpose.", implemented: false },
  ],
};

export const ENGLISH_TEACHING_CONTRACTS: readonly SubjectTeachingContract[] = [
  ENGLISH_INFERENCE_CONTRACT,
  ENGLISH_MEANING_IN_CONTEXT_CONTRACT,
  ENGLISH_RETRIEVAL_CONTRACT,
  ENGLISH_SEQUENCING_CONTRACT,
  ENGLISH_LANGUAGE_EFFECT_CONTRACT,
];

// ============================================================
// Writing (Section 18) -- currently ONE bounded task family in
// production (lib/learningEngine/writingTeachingContent.ts:
// "writing-reflective-discursive"), disclosed honestly as narrower than
// the sequences above, not padded to look equivalent.
// ============================================================

export const WRITING_TEACHING_CONTRACT: SubjectTeachingContract = {
  competencyCategory: "writing_reflective_discursive",
  sequence: [
    { stage: "MODEL", description: "A worked example response.", implemented: true, realImplementationRef: "lib/learningEngine/writingTeachingContent.ts (WritingFamilyTeachingContent.model)" },
    { stage: "PLANNING_SCAFFOLD", description: "Structured planning questions before drafting.", implemented: true, realImplementationRef: "lib/learningEngine/writingTeachingContent.ts (planningScaffold)" },
    { stage: "DRAFT", description: "Learner produces a free-text response.", implemented: true, realImplementationRef: "app/api/writing-feedback/route.ts" },
    { stage: "FEEDBACK", description: "Rubric-based feedback on the draft.", implemented: true, realImplementationRef: "lib/learningEngine/writingRubric.ts (uncalibrated AI score, quarantined from mastery per Decision 60)" },
    { stage: "MASTERY_EVIDENCE", description: "Whether the response counts as independently-demonstrated mastery.", implemented: false, realImplementationRef: "Deliberately NOT implemented -- writingRubric.ts always records supportTier='supported', structurally excluding Writing from ever reaching 'mastered' state (lib/ali/mastery.ts). This is intentional governance (Decision 60), not a gap to close casually." },
  ],
};
