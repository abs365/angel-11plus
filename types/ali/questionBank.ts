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
}
