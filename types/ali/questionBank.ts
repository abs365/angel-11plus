import type { ReasoningQuestion } from "@/types/reasoning";
import type { MathsQuestion, Question, SkillType, WritingPrompt } from "@/types/index";
import type { MockPathwayId } from "@/types/mock";

/**
 * Proficiency-facing difficulty label. Distinct from the app's existing
 * year-group `Difficulty` type (types/index.ts) — see
 * QUESTION_AUTHORING_STANDARD.md §1.
 */
export type ContentDifficulty = "easy" | "medium" | "hard" | "challenge";

/**
 * Fine-grained competency code (e.g. "vr.analogies", "vr.letter-codes").
 * NOT the app's existing coarse SkillType, which is uniformly
 * "verbal-reasoning" for every VR question. See
 * QUESTION_AUTHORING_STANDARD.md §3 and ALI_DECISION_LOG.md Decision 13.
 */
export type CompetencyCode = string;

export type AliSubject =
  | "verbal-reasoning"
  | "non-verbal-reasoning"
  | "spatial-reasoning"
  | "numerical-reasoning"
  | "english"
  | "maths"
  | "vocabulary"
  | "writing";

/**
 * Reading Comprehension's prompt shape — extends the app's existing
 * `Question` (types/index.ts, used by data/lessons.ts) with the passage
 * text/title, since a Learning Unit's questions are each self-contained
 * (ALI_ENGLISH_IMPLEMENTATION_PLAN.md §2.1 — no separate passage-registry
 * lookup, matching how ReasoningQuestion/MathsQuestion are also fully
 * self-contained per question). `skill` is the app's legacy SkillType
 * (e.g. "inference") for the §0.5.3 bridge write, NOT the fine-grained
 * `english.*` competency code, which lives one level up on `BankQuestion.skill`
 * — same split as MathsQuestion's `skill` field (Decision 32).
 */
export interface EnglishComprehensionPrompt extends Question {
  passageTitle: string;
  passageText: string;
  // Educational Increment 007C, Part 5/9 — these have always been present
  // in the real JSON prompt payload since 007B's tiered validation
  // architecture (see lib/learningEngine/englishAnswerValidation.ts's
  // EnglishPromptValidationFields), just not previously declared here;
  // callers used inline intersection casts instead. Declared properly now
  // that Guided Practice needs to read them directly from a typed prop
  // rather than through another ad hoc cast.
  acceptedAnswers?: string[];
  quotationRequired?: string[];
  orderedAnswer?: string[];
  correctOptions?: string[];
  requiredSelectionCount?: number;
  // Mirrors lib/learningEngine/englishAnswerValidation.ts's ValidationTier
  // union as a literal string type rather than importing it — types/
  // never imports from lib/ elsewhere in this codebase, and duplicating
  // 6 literal strings is cheaper than inverting that convention.
  validationTier?:
    | "TIER1_EXACT_MATCH"
    | "TIER2_ACCEPTED_SET"
    | "TIER3_QUOTATION_PLUS_EXPLANATION"
    | "TIER4_ORDERED_LIST"
    | "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION"
    | "TIER6_MULTI_SELECT";
}

/**
 * Vocabulary's prompt shape (Phase ALI 2.2) — a genuine multiple-choice
 * item, reshaping a real VocabWord's synonyms/antonyms/exampleSentence
 * (VOCABULARY_COMPETENCY_FRAMEWORK.md §2) into an exact-match question.
 * `skill` is the legacy SkillType ("vocabulary") for the bridge write, not
 * the fine-grained `vocabulary.*` competency code — same split as
 * MathsQuestion/EnglishComprehensionPrompt's `skill` field.
 */
export interface VocabularyPrompt {
  id: string;
  word: string;
  question: string;
  options: string[];
  correctAnswer: string;
  skill: SkillType;
  marks: number;
}

export interface BankQuestion {
  id: string;
  subject: AliSubject;
  skill: CompetencyCode;
  pathway: MockPathwayId[];
  contentDifficulty: ContentDifficulty;
  questionType: "multiple-choice" | "short-answer" | "open-response";
  estimatedTimeSeconds: number;
  /**
   * WritingPrompt added for Capability 3 Wave 2 (Continuous Writing practice)
   * — additive only, same pattern as every other subject's prompt shape
   * already in this union.
   */
  prompt: ReasoningQuestion | MathsQuestion | EnglishComprehensionPrompt | VocabularyPrompt | WritingPrompt;
  explanation: string;
  hint?: string;
  confidenceWeight: number;
  learningObjective?: string;
  revisionPriority: 1 | 2 | 3 | 4 | 5;
  masteryThreshold: number;
  usageCount: number;
  avgSuccessRate: number | null;
  /**
   * Learning Unit id (ALI_DECISION_LOG.md Decision 36) — the schedulable,
   * never-split unit of adaptive selection. Atomic subjects (VR, Maths) set
   * this equal to their own `id` (a Learning Unit of exactly one question).
   * Reading Comprehension sets this to the shared passage id, so every
   * question belonging to one passage resolves to one Learning Unit.
   * See lib/ali/learningUnit.ts.
   */
  learningUnitId: string;
  /**
   * Optional link to a named misconception this question is designed to
   * surface or correct (AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md §4).
   * Undefined for the large majority of questions — not every question
   * targets a specific misconception, and this field is never required.
   */
  addressesMisconception?: string;
  /**
   * Optional related competency codes this question supports transfer
   * reinforcement for (AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md §7,
   * AIW-001_EDUCATIONAL_DATA_MODEL.md §2's Knowledge Graph). Additive only —
   * not read by any selection/recommendation logic yet (that is WP-09, not
   * this work package).
   */
  transferLinks?: CompetencyCode[];
  /** Migration 030/031 (Content Scale Gate). Undefined for any row that predates migration 030. */
  familyId?: string;
  provenance?: string;
  eligibilityStatus?: string;
  active?: boolean;
  /**
   * Migration 093 (Mock Programme Increment 005, Decision 148). Undefined
   * (the current value of every existing row) means this item is a
   * standalone, atomic numbered question -- current-day meaning,
   * unchanged. A value shared by several BankQuestions means those rows
   * are subparts/response-components of one displayed numbered question,
   * ordered by `groupOrder`. Deliberately distinct from `familyId`
   * (sibling reasoning-variant grouping) and `learningUnitId` (read by
   * every subject in live Practice selection, see
   * lib/ali/exposureIntelligence.ts's groupingKeyOf() — reusing it here
   * would have risked silently affecting Practice exposure/clustering).
   * See lib/ali/assessmentHierarchy.ts.
   */
  questionGroupId?: string;
  /** Migration 093. Deterministic 1-based position within a `questionGroupId` group. Undefined for a standalone item. */
  groupOrder?: number;
  /** Migration 093. Free-text display label within a numbered question (e.g. "(a)", "6(b)-i"). Undefined for a standalone item. */
  subpartLabel?: string;
  /** Migration 093. See `MarkingMode` and lib/ali/assessmentHierarchy.ts. Undefined is a deliberate non-claim, not "deterministic". */
  markingMode?: MarkingMode;
  /**
   * Programme Increment 021 — the real `ali_question_bank.transfer_class`
   * column (migration 035: `ROUTINE`/`NEAR_TRANSFER`/`FAR_TRANSFER`/
   * `MIXED_TRANSFER`), exposed on `BankQuestion` for the first time so the
   * Preparation Horizon weight-bias mechanism
   * (lib/learningEngine/sessionGenerator.ts's own `buildPreparationWeightBias()`)
   * can genuinely favour unseen-transfer material for an
   * `unseen_transfer_check`-recommended session, matching
   * `lib/ali/inventoryClass.ts`'s own `isFarTransfer` reuse of this same
   * real column. Undefined for any row that predates migration 035, or
   * whose eventual transfer classification was never assigned -- never
   * fabricated.
   */
  transferClass?: string;
}

/**
 * Migration 093 (Mock Programme Increment 005, Decision 148 Part 9).
 * `deterministic` — the only mode the live `mock_score_attempt()`
 * (migrations 074/075) currently implements. `structured_acceptable_response`
 * — a comprehension response whose marks depend on multiple acceptable
 * evidence components/quotations/reasons (Decision 148 Part 4), not yet
 * scored by any live function. `criterion_rubric` — Continuous Writing or
 * any future criteria-judged response (Decision 148 Part 5), not yet
 * scored by any live function, and not automated AI scoring (Decisions
 * 47/61/106's Writing AI-score quarantine is untouched).
 */
export type MarkingMode = "deterministic" | "structured_acceptable_response" | "criterion_rubric";
