import type {
  ConclusionType,
  EducationalAuditRecord,
  SupersedeReason,
} from "@/types/ali/audit";
import type { EvidenceConfidenceTier } from "@/types/ali/confidence";

/**
 * Work Package WP-11 (Implementation Programme) — Educational Audit
 * Integration. Pure functions, no I/O — `id` is always caller-supplied
 * (e.g. a real UUID generated at the call site) rather than generated
 * internally, keeping construction fully deterministic and testable, the
 * same discipline every prior lib/ali/* module in this programme has
 * followed.
 */

/**
 * The Decision Boundaries rule (`EAW-002` §2), made checkable: only
 * Higher Evidence Required conclusions get a full audit record.
 * Automatic-tier decisions use an Operational Event instead
 * (lib/ali/operationalEvent.ts) — this function is the single place that
 * distinction is decided, so it can never drift between two call sites.
 */
export function requiresFullAudit(
  decisionCategory: "automatic" | "higher-evidence-required"
): boolean {
  return decisionCategory === "higher-evidence-required";
}

export function createAuditRecord(params: {
  id: string;
  conclusionType: ConclusionType;
  learnerId: string;
  competencyOrDimension: string;
  confidenceTierAtTime: EvidenceConfidenceTier;
  concludedAt: string;
  /** Migration 015 — required for 'readiness-dimension' (the ReadinessBand reached), null/omitted for other conclusion types. */
  conclusionValue?: string | null;
}): EducationalAuditRecord {
  return {
    id: params.id,
    conclusionType: params.conclusionType,
    learnerId: params.learnerId,
    competencyOrDimension: params.competencyOrDimension,
    confidenceTierAtTime: params.confidenceTierAtTime,
    concludedAt: params.concludedAt,
    supersededBy: null,
    supersedeReason: null,
    conclusionValue: params.conclusionValue ?? null,
  };
}

/**
 * Marks a prior audit record as superseded by a new one — the record
 * itself is never deleted or mutated in place (AIW-001 §10's implicit
 * append-only model, consistent with CURRICULUM_GAP_REGISTER.md and every
 * other register in this programme being append-only rather than
 * edit-in-place). Returns a new object; the caller is responsible for
 * persisting both the updated previous record and the new one it points
 * to.
 */
export function supersedeAuditRecord(
  previous: EducationalAuditRecord,
  newRecordId: string,
  reason: SupersedeReason
): EducationalAuditRecord {
  return { ...previous, supersededBy: newRecordId, supersedeReason: reason };
}
