import type { BankQuestion, ContentDifficulty, CompetencyCode, AliSubject } from "@/types/ali/questionBank";
import type { SelectionTraceEntry } from "@/types/ali/observability";

/**
 * A Learning Unit (ALI_DECISION_LOG.md Decision 36) is the schedulable,
 * never-split unit of adaptive selection — introduced as a permanent
 * architectural concept alongside the individual `BankQuestion`. For atomic
 * subjects (Verbal Reasoning, Mathematics) a unit has exactly one question.
 * For Reading Comprehension a unit is one passage and every question
 * linked to it. Future subjects (Writing = one writing task, Vocabulary =
 * one word set) plug into the same grouping, per
 * ALI_ENGLISH_IMPLEMENTATION_PLAN.md's expansion framing.
 */
export interface LearningUnit {
  id: string;
  subject: AliSubject;
  questions: BankQuestion[];
  /** Distinct competency codes across every question in the unit. */
  skills: CompetencyCode[];
  /** Hardest constituent question's tier — see lib/ali/learningUnit.ts for why. */
  contentDifficulty: ContentDifficulty;
}

export interface LearningUnitSelectionResult {
  unit: LearningUnit | null;
  questions: BankQuestion[];
  trace: SelectionTraceEntry[];
}
