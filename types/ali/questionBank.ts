import type { ReasoningQuestion } from "@/types/reasoning";
import type { MathsQuestion } from "@/types/index";
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

export interface BankQuestion {
  id: string;
  subject: AliSubject;
  skill: CompetencyCode;
  pathway: MockPathwayId[];
  contentDifficulty: ContentDifficulty;
  questionType: "multiple-choice" | "short-answer";
  estimatedTimeSeconds: number;
  prompt: ReasoningQuestion | MathsQuestion;
  explanation: string;
  hint?: string;
  confidenceWeight: number;
  learningObjective?: string;
  revisionPriority: 1 | 2 | 3 | 4 | 5;
  masteryThreshold: number;
  usageCount: number;
  avgSuccessRate: number | null;
}
