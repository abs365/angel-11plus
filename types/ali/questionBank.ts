import type { ReasoningQuestion } from "@/types/reasoning";
import type { MathsQuestion, Question } from "@/types/index";
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

export interface BankQuestion {
  id: string;
  subject: AliSubject;
  skill: CompetencyCode;
  pathway: MockPathwayId[];
  contentDifficulty: ContentDifficulty;
  questionType: "multiple-choice" | "short-answer" | "open-response";
  estimatedTimeSeconds: number;
  prompt: ReasoningQuestion | MathsQuestion | EnglishComprehensionPrompt;
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
}
