import type { ContentDifficulty, CompetencyCode } from "@/types/ali/questionBank";
import type { AdaptiveTier } from "@/types/adaptive";

/**
 * Internal-only debugging/validation record — ALI_VALIDATION_PROTOCOL.md and
 * ALI_DECISION_LOG.md "Add lightweight internal observability" (Phase ALI
 * 1.1). Never rendered to end users; console-logged only (lib/ali/
 * observability.ts's logSelectionTrace()).
 */
export type SelectionReason =
  | "unseen"
  | "eligible-seen"
  | "weak-skill-override-reserved"
  | "weak-skill-override-pool"
  | "mastered-resurface"
  | "fallback-shortfall";

export interface SelectionTraceEntry {
  questionId: string;
  competency: CompetencyCode;
  difficultyTier: ContentDifficulty;
  selectionReason: SelectionReason;
  cooldownStatus: {
    distance: number | null; // null = never presented before
    threshold: number;
    eligible: boolean;
  };
  weakSkillOverride: boolean;
  replayReason: string | null;
}

export interface MockGenerationTrace {
  generatedAt: string;
  sectionId: string;
  confidenceInfluence: {
    tier: AdaptiveTier;
    targetDistribution: Record<ContentDifficulty, number>;
  };
  entries: SelectionTraceEntry[];
}
