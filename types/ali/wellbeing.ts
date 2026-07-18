import type { EducationalState } from "@/types/ali/educationalState";

/**
 * Wellbeing Signal Contract (Programme Decision APD-043). Defines the
 * interface a real Wellbeing implementation must satisfy and that
 * Recommendation Orchestration (WP-19) consumes — per APD-043's explicit
 * instruction, this file defines the CONTRACT only. It does not implement
 * WP-21_WELLBEING_DESIGN.md §6's candidate veto conditions — that
 * remains a separate, not-yet-authorised implementation step. No function
 * in this file computes anything; it is types only, the same "type before
 * logic" sequencing this whole programme has used since AEP-003/AIW-001.
 */

/**
 * A single recent attempt, most-recent-last, bounded to whatever window
 * a real implementation chooses (not fixed by this contract) — the
 * minimal shape WP-21 §6 Condition A (compounding failure) needs.
 */
export interface RecentAttemptSignal {
  competencyCode: string;
  correct: boolean;
}

/**
 * Every field is honestly optional/nullable where the underlying data may
 * not exist — per WP-21 §3's provenance table, `sessionAbandonmentCount`
 * in particular is a real, currently-absent capture gap, not defaulted to
 * a value that would let Condition C fire on fabricated data.
 */
export interface WellbeingSignalInput {
  learnerId: string;
  competencyCode: string;
  recentAttempts: RecentAttemptSignal[];
  /** WP-08 output, consumed not recomputed — detects e.g. "rebuilding". */
  currentEducationalState: EducationalState;
  /** From aliLearningGain (ALI_PARENT_INTELLIGENCE.md Phase 1.4) — null if not computed for this subject yet, never defaulted to a sign. */
  learningGainTrend: "positive" | "flat" | "negative" | null;
  /** Real capture gap (WP-21 §3) — undefined until session-start/session-completion events exist. A real implementation must treat `undefined` as "condition cannot evaluate," never as 0. */
  sessionAbandonmentCount?: number;
}

/**
 * Matches WP-21 §6's three candidate conditions by name — a fixed
 * vocabulary, not free text, so downstream consumers (audit records,
 * future review) can reason about which condition fired without parsing
 * a string. `null` means no veto occurred.
 */
export type WellbeingVetoReason =
  | "compounding-failure"
  | "mastery-reversal-low-engagement"
  | "session-abandonment-pattern"
  | null;

export interface WellbeingSignalResult {
  veto: boolean;
  reason: WellbeingVetoReason;
  /**
   * Matches AIW-001 §9's already-committed ParentReport.wellbeingSignal
   * field type exactly (types/parent.ts, shipped in WP-12) — this
   * contract is what would eventually compute that field's real value,
   * without altering its shape.
   */
  parentFacingSignal: "steady" | "may benefit from a lighter week" | null;
}

/**
 * The function signature a real Wellbeing implementation must satisfy.
 * Not implemented anywhere yet — this type exists so WP-19 can be built
 * against a stable interface while the actual computation (WP-21 §6's
 * conditions, evidence-thresholded per WELLBEING_SIGNAL_CONTRACT.md) is
 * authorised and built separately.
 */
export type ComputeWellbeingSignal = (input: WellbeingSignalInput) => WellbeingSignalResult;
