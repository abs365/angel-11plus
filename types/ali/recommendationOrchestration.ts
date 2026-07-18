import type { EducationalState } from "@/types/ali/educationalState";

/**
 * Recommendation Orchestration (EAW-004_RECOMMENDATION_ENGINE_ARCHITECTURE.md
 * §4-§5, Programme Decision APD-025's Derived State Hierarchy). A candidate
 * carries its Educational State (WP-08 output, consumed not recomputed)
 * rather than raw confidence/mastery signals, per APD-025 and this work
 * package's requirement not to duplicate upstream conclusions.
 */
export interface RecommendationCandidate {
  competencyCode: string;
  basis: "direct-evidence" | "shared-mechanism" | "sequential-dependency";
  educationalState: EducationalState;
  /** Required for non-direct-evidence candidates (AEP-002 §10's relationship graph); irrelevant for direct-evidence. */
  relationshipStrength?: "strong" | "moderate" | "weak";
  /**
   * Whether this candidate's content resembles the learner's target board's
   * summative/mock-exam format (AEP-002 §6) — used only for Tier 3
   * reweighting. Honestly optional: no consumer yet populates this from
   * real per-question metadata (a future work package's job), so it is
   * never defaulted to true or false, only left undefined when unknown.
   */
  matchesExamFormat?: boolean;
}

/**
 * Tier 0 predicate — honestly delegated, not computed here. No real
 * Wellbeing signal exists anywhere in this codebase yet (AEP-005 §13
 * deliberately specifies it must never be reduced to a score, and no
 * document beyond that qualitative statement has designed what it actually
 * is). This type exists so the veto mechanism is structurally ready to
 * receive a real signal once one is designed — inventing a formula here
 * would misrepresent an undesigned capability as a shipped one.
 */
export type WellbeingVeto = (candidate: RecommendationCandidate) => boolean;

export interface OrchestrationInput {
  candidates: RecommendationCandidate[];
  wellbeingVeto: WellbeingVeto;
  /** Null when no target_exam_date is set (lib/progress.ts getTargetExamDate()) — Tier 3 does not activate, per EAW-004 §2.1's "behaviour when absent" specification. */
  daysUntilExam: number | null;
}
