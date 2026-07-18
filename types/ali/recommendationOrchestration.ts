import type { EducationalState } from "@/types/ali/educationalState";
import type { EvidenceConfidenceTier } from "@/types/ali/confidence";

/**
 * Why this candidate was generated now (`EAW-002` §5's "why is this
 * recommendation being shown now" question) — a fixed, named vocabulary
 * rather than free text, so WP-10's explanation generator can map each
 * value to fixed phrasing per audience instead of parsing/reconstructing
 * intent from a string. Extend this union, don't replace it, if a future
 * work package introduces a genuinely new trigger type.
 */
export type RecommendationTrigger =
  | "cooldown-expired"
  | "review-due"
  | "mastery-event-on-linked-competency"
  | "never-attempted"
  | "weak-competency-remediation";

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

  // ─── Fields added per Engineering Note, APD-027 — carried so WP-10's
  // explainability layer can consume this candidate's own reasoning
  // directly rather than reconstructing it. All three answer one of
  // EAW-002 §5's three required Explainability questions. ───────────────

  /** WP-05 output (lib/ali/confidence.ts) — "what evidence supports this," combined with `basis`/`relationshipStrength` above. Consumed, not recomputed, same discipline as `educationalState`. */
  confidenceTier: EvidenceConfidenceTier;
  /** For shared-mechanism/sequential-dependency candidates: which competency the supporting evidence actually came from (AIW-001 §8's `source_competency_code`). Undefined for direct-evidence candidates, which need no second competency to point to. */
  sourceCompetencyCode?: string;
  /** "Why is this recommendation being shown now" (EAW-002 §5) — the triggering event, not merely the resulting recommendation. */
  triggerReason: RecommendationTrigger;
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
