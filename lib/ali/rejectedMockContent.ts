/**
 * Content that was REJECTED or REPLACED for Mock use, kept as permanent evidence so it cannot return by accident (for example
 * by someone composing a Form later from a pool that still contains it). Keyed by `learningUnitId` (the passage id for English
 * Reading items). Consulted by `composeCandidateMock` (never selects it) and `validateManifest` (fails closed on it).
 *
 * Salmon: the Founder decided on 2026-10-08 to REPLACE "How Salmon Find Their Way Home" for English Form B because of its
 * overlap with the live bee Timed Section (shared sentence frames, topic and question formats; see
 * ANGEL_CSSE_SALMON_BEE_DECISION.md). It is not deleted: it stays as rejected/replaced evidence.
 */
export interface RejectedMockContent {
  reason: string;
  replacedBy?: string;
  decidedOn: string;
  evidence: string;
}

export const REJECTED_MOCK_LEARNING_UNITS: Readonly<Record<string, RejectedMockContent>> = {
  "eng-inc003-salmonnavigation": {
    reason: "Structural overlap with the live bee Timed Section: shared 8-word sentence frames, same topic and arc, matching question formats, shared worked-example vocabulary.",
    replacedBy: "eng-fb-greatstink",
    decidedOn: "2026-10-08",
    evidence: "ANGEL_CSSE_SALMON_BEE_DECISION.md",
  },
};

export function isRejectedMockContent(row: { learningUnitId?: string | null }): boolean {
  return !!row.learningUnitId && Object.prototype.hasOwnProperty.call(REJECTED_MOCK_LEARNING_UNITS, row.learningUnitId);
}
