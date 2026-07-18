/**
 * Operational Event (EAW-003_ASSESSMENT_ENGINE_ARCHITECTURE.md §10,
 * extended with a retention strategy per Defect Correction Hotfix
 * EAW-ERR-HOTFIX-001, Engineering Action 2). Lightweight monitoring record
 * for Automatic-tier decisions (EAW-002 §2) — carries no evidence trail,
 * no confidence tier, no explainability payload, and is never a substitute
 * for an EducationalAuditRecord (types/ali/audit.ts).
 */
export interface OperationalEvent {
  eventType: string;
  learnerId: string;
  competencyCode: string;
  timestamp: string; // ISO
}

/**
 * The rolled-up, long-term-retained form of a group of OperationalEvents —
 * per the hotfix's retention strategy, raw events are kept only for a
 * bounded window; beyond that, only this learner-identifier-free aggregate
 * survives.
 */
export interface AggregatedEventCount {
  eventType: string;
  competencyCode: string;
  /** e.g. "2026-07" — a month bucket; the exact granularity is an implementation choice, not fixed by this type. */
  timeBucket: string;
  count: number;
}
