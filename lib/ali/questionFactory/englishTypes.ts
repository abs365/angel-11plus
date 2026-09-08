import type { CompetencyId, QuestionTypeId } from "@/lib/learningEngine/types";
import type { ValidationTier } from "@/lib/learningEngine/englishAnswerValidation";
import type { EnglishReasoningPattern } from "@/lib/ali/englishFamilyModel";
import type { TeachingUse } from "./types";

/**
 * Controlled Scale Increment 002 — English Question Factory Foundation.
 *
 * DELIBERATELY NOT a copy of the Maths `StructuralBlueprint`/
 * `MathsQuestionCandidate` contract (`types.ts`). Maths blueprints are
 * pure functions over numeric parameters (`sampleParams` -> arithmetic ->
 * `deriveCorrectAnswer`) -- there is no equivalent "sample a passage"
 * operation for English, because a passage is original creative/
 * informational writing, not a parametrised formula. English's candidate
 * "generation" step is therefore always: (a real, human-authored
 * passage) x (a genuine reasoning-pattern blueprint) -> ONE hand-crafted
 * candidate whose evidence is cited against that specific passage's real
 * text. This module names that shape honestly rather than forcing it
 * into the Maths shape.
 *
 * Reuses, rather than duplicates, three already-real, already-approved
 * pieces of this codebase:
 *   - `EnglishReasoningPattern` (englishFamilyModel.ts) -- the real,
 *     live-content-derived reasoning-pattern vocabulary.
 *   - `ValidationTier` (englishAnswerValidation.ts) -- the six real
 *     answer-validation contracts, each traced to real CSSE mark scheme
 *     behaviour, not invented for this increment.
 *   - `TeachingUse` (questionFactory/types.ts) -- the same ten
 *     educational-use values Maths blueprints already declare, since
 *     Section 11 of this increment's own directive requires generated
 *     metadata to feed the SAME TeachingState/remediation architecture,
 *     not a parallel English-only one.
 */

/**
 * The 12 educational families the Foundation confirmed
 * (`lib/ali/familyTaxonomy.ts` ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION).
 * Kept as a literal union (not `string`) so a blueprint can never silently
 * claim membership in a family that was never actually confirmed.
 *
 * Increment 002 Revision, Section 7 -- "Motive Inference" is no longer a
 * member of this union: it was consolidated into "Quotation +
 * Explanation" as a topic/subtype (see
 * `QE_BP_QUOTATION_FOR_INFERENCE` in englishQuotationExplanationFamily.ts
 * and the consolidation record in familyTaxonomy.ts). The historical
 * database family_id (wave1-fam-motive-inference) is unaffected and
 * unchanged -- this union describes the educational taxonomy only.
 */
export type EnglishEducationalFamilyName =
  | "Retrieval"
  | "Sequencing"
  | "Vocabulary / Meaning in Context"
  | "Synonym Selection"
  | "Quotation + Explanation"
  | "Multi-Select Reasoning"
  | "Multi-Select + Justification"
  | "Emotion & Cause"
  | "Language Effect / Word Choice"
  | "Atmosphere / Mood"
  | "Two-Character Reasoning"
  | "Comparison";

/**
 * Increment 002, Section 19 — the three-way validation-certainty split
 * the Founder's own directive requires, never collapsed into one
 * misleading "approved" status. Grounded in the REAL distinction
 * `englishAnswerValidation.ts` already draws (a quotation/named-component
 * is checkable; the accompanying free-text explanation is explicitly
 * `NOT_AUTOMATICALLY_GRADABLE`) -- this type names that same real
 * distinction at the FACTORY level (is this candidate's own claimed
 * answer/evidence itself correct?), not just at runtime-grading level.
 */
export type EnglishValidationCategory =
  /** The candidate's correctness can be fully mechanically confirmed against the passage's own text -- no human judgement required. */
  | "deterministic"
  /** A real, mechanical anchor check (does the cited word/phrase/quotation genuinely exist in the passage, at the claimed location?) is possible and performed, but the semantic/educational judgement on top of that anchor (is this really the intended meaning/synonym/best-supporting quotation?) still requires human confirmation. */
  | "evidence_anchored"
  /** No mechanical check is possible at all -- matches `englishAnswerValidation.ts`'s own `NOT_AUTOMATICALLY_GRADABLE` status exactly (free-text explanation quality). */
  | "human_required";

export type EnglishResponseType = "short_answer" | "ordered_list" | "single_select" | "quotation_plus_explanation";

export interface EnglishIndependentCheckResult {
  matches: boolean;
  category: EnglishValidationCategory;
  method: string;
  notes?: string;
}

/**
 * A passage-bound structural blueprint -- the English equivalent of a
 * Maths `StructuralBlueprint`, but describing a REASONING DEMAND PATTERN
 * to be applied to a specific passage by a human author, not a
 * parametric generation function. `independentCheck` mirrors the Maths
 * contract's naming (Wave 1 Correction lesson applied from the start,
 * never retrofitted) but operates on a candidate + its source passage,
 * since the passage's own text is English's equivalent of a Maths
 * diagram's vertices -- the real, independently-inspectable ground truth.
 */
export interface EnglishStructuralBlueprint {
  blueprintId: string;
  familyName: EnglishEducationalFamilyName;
  competencyId: CompetencyId;
  questionTypeId: QuestionTypeId;
  reasoningPattern: EnglishReasoningPattern;
  validationTier: ValidationTier;
  validationCategory: EnglishValidationCategory;
  responseType: EnglishResponseType;
  educationalObjective: string;
  /** The real, measurable characteristics this blueprint's difficulty derives from -- never passage length/word length/vocabulary rarity alone (Section 10's own explicit prohibition). */
  difficultyDimensions: string[];
  misconceptionTargeted?: string;
  /** For single_select candidates: the DESIGN principle behind this blueprint's distractors (Section 9) -- disclosed per-blueprint, never "obviously wrong" filler. */
  distractorLogic?: string;
  teachingUses: TeachingUse[];
  provenance: "angel_original";
}

export interface EnglishQuestionCandidate {
  candidateId: string;
  passageId: string;
  blueprintId: string;
  familyName: EnglishEducationalFamilyName;
  competencyId: CompetencyId;
  questionTypeId: QuestionTypeId;
  question: string;
  responseType: EnglishResponseType;
  /** TIER1/TIER2 (short_answer): every mathematically/textually-equivalent accepted written form, canonical first. */
  acceptedAnswers?: string[];
  /** TIER4 (ordered_list): one accepted-answer array PER POSITION, in the intended correct order. */
  correctOrderAcceptedSets?: string[][];
  /** single_select: the full option list, in DISPLAY order (never pre-sorted to put the correct answer in a fixed position). */
  options?: string[];
  correctOptionIndex?: number;
  /** single_select: one rationale string per DISTRACTOR (never the correct option) -- Section 9's own misconception-informed-distractor requirement, disclosed per option. */
  distractorRationale?: Record<number, string>;
  /** TIER3/TIER5 (quotation_plus_explanation): the required verbatim (tolerant) evidence quotation. For `eng-qe-bp-two-part-quotation`, this is the FIRST of the two required quotations -- see `secondRequiredQuotation`. */
  requiredQuotation?: string;
  /**
   * Increment 002 Revision, Section 2 -- the SECOND required verbatim
   * (tolerant) quotation, present ONLY for blueprints whose educational
   * objective genuinely requires evidence spanning two separate
   * quotations (`eng-qe-bp-two-part-quotation`). Calibration found the
   * prior version of this blueprint declared this requirement in prose
   * (`explanationGuidance`) but never machine-checked it -- this field
   * makes it a real, independently verifiable claim, closing that
   * systemic gap. Absent (not an empty string) for every other
   * `quotation_plus_explanation` candidate, which only ever needed one
   * quotation to begin with.
   */
  secondRequiredQuotation?: string;
  /** Guidance for a HUMAN reviewer on what a satisfactory explanation must cover -- never a graded answer key, per `englishAnswerValidation.ts`'s own NOT_AUTOMATICALLY_GRADABLE discipline. */
  explanationGuidance?: string;
  /** Disclosed citation of where in the passage the answer is evidenced -- e.g. "paragraph 2". Required for every candidate; a candidate whose answer cannot be located here is a defect, not a passing item. */
  evidenceLocation: string;
  difficulty: "easy" | "medium" | "hard";
  teachingUses: TeachingUse[];
  misconceptionTargeted?: string;
  validationCategory: EnglishValidationCategory;
  provenance: "angel_original";
  generatedAt: string;
}

export interface EnglishPassage {
  passageId: string;
  title: string;
  genre: "narrative" | "non_fiction";
  /** Full original text, paragraph breaks preserved as \n\n. */
  text: string;
  /** Same text, pre-split into paragraphs for evidence-location citation and independent verification. */
  paragraphs: string[];
  wordCount: number;
  provenance: "angel_original";
  /** Disclosed, human judgement -- never claimed to be independently verified by any automated readability formula (Section 7's own "reading level indicators where legitimate" -- word count is the one legitimate, mechanically-true figure; grade-level banding is not claimed). */
  ageAppropriatenessNote: string;
}
