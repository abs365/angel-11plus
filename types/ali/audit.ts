import type { EvidenceConfidenceTier } from "@/types/ali/confidence";

/**
 * Educational Audit Model (AIW-001_EDUCATIONAL_DATA_MODEL.md §10,
 * EAW-002_LEARNING_INTELLIGENCE_ENGINE_ARCHITECTURE.md §9). Reserved for
 * Higher Evidence Required decisions (EAW-002 §2) — mastery, Durable
 * Mastery, recommendations that clear that boundary, and readiness
 * dimensions. Automatic-tier decisions use the lighter Operational Event
 * (types/ali/operationalEvent.ts) instead — see lib/ali/audit.ts's
 * `requiresFullAudit()` for the exact boundary.
 */
export type ConclusionType =
  | "mastery"
  | "durable-mastery"
  | "recommendation"
  | "readiness-dimension"
  /** Migration 011 (WP-21A) — a Tier 0 pacing veto (WP-21_WELLBEING_DESIGN.md, WELLBEING_SIGNAL_CONTRACT.md). */
  | "wellbeing-veto";

export type SupersedeReason = "new-evidence" | "defect-correction" | "programme-decision";

export interface EducationalAuditRecord {
  id: string;
  conclusionType: ConclusionType;
  learnerId: string;
  competencyOrDimension: string;
  confidenceTierAtTime: EvidenceConfidenceTier;
  concludedAt: string; // ISO timestamp
  /** Id of the record that superseded this one, or null while this record is still the current conclusion. */
  supersededBy: string | null;
  supersedeReason: SupersedeReason | null;
}
