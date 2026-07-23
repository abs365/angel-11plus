export type MockPathwayId = "gl" | "cem" | "csse" | "iseb";

export interface MockSectionResult {
  sectionId: string;
  sectionName: string;
  bank: string;
  correct: number;
  total: number;
  score: number;
  /**
   * true for sections built via ALI (Angel Learning Intelligence), false/
   * undefined for sections still using a static content slice. Optional —
   * most mock surfaces have no adaptive/static distinction and omit it.
   * Phase 4 Sprint 1, Increment 1: promoted from the former, now-retired
   * AdaptiveMockSectionResult into the one canonical section-result shape.
   */
  adaptive?: boolean;
}

export interface MockResult {
  id: string;
  pathway: MockPathwayId;
  pathwayName: string;
  date: string;
  totalScore: number;
  sectionResults: MockSectionResult[];
  durationMinutes: number;
}

/**
 * Phase 4 Sprint 1, Increment 2 — the lifecycle-tracking half of the Mock
 * Attempt Ledger. Deliberately kept separate from MockResult rather than
 * adding optional/nullable fields to it: MockResult is read by ~14 call
 * sites today, all of which assume totalScore/sectionResults/durationMinutes
 * are always present. An attempt only has those once it's completed, so
 * this type exists to represent "started, not yet completed" without
 * touching MockResult's shape or any of its existing readers.
 *
 * Presence of a record under this key (see lib/mockProgress.ts's
 * getInProgressMockAttempt()) that has no matching MockResult in
 * mockResults[] IS the "abandoned" state — read-time interpretation, no
 * separate write required (see MOCK_ATTEMPT_LEDGER_SPECIFICATION_V1.md §6).
 */
export interface MockAttemptInProgress {
  id: string;
  pathway: MockPathwayId;
  pathwayName: string;
  startedAt: string;
}
