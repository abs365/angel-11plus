import type { CompetencyId, CompetencyStatus, EvidenceSignal, EvidenceTier, QuestionTypeExposure, QuestionTypeOutcome } from "./types";
import { COMPETENCIES, getQuestionTypesForCompetency } from "./assessmentBrainMap";

/**
 * Pure functions implementing LEARNING_ENGINE_V1.md §3.1-§3.3's roll-up
 * rules. No I/O, no invented weighting constants — every threshold below is
 * a literal, minimal reading of that document's own prose (cited inline).
 * Not run against real data yet: every mapped Question Type has zero
 * authored content today (see profile.ts), so in production this always
 * resolves to ET-0/"Not Yet Observed" for every competency until a future,
 * separately-authorised content pipeline exists. See
 * LEARNING_ENGINE_V1.md §10(1).
 */

/** LEARNING_ENGINE_V1.md §3.1 — derives the outcome directly from real ali_student_question_history aggregates (times_seen/times_correct), no new calibration. */
export function deriveQuestionTypeOutcome(timesSeen: number, timesCorrect: number): QuestionTypeOutcome {
  if (timesSeen <= 0) return "none";
  if (timesCorrect === timesSeen) return "success";
  if (timesCorrect === 0) return "struggle";
  return "mixed";
}

/** A Question Type counts as "stable" (a repeated, non-mixed pattern) once it has 2+ attempts with a single consistent outcome direction — the minimal discrete reading of §3.3's "a small number of instances" (ET-1, below this bar) versus "a consistent pattern" (ET-2+, at or above it). */
function isStable(exposure: QuestionTypeExposure): boolean {
  return exposure.timesSeen >= 2 && (exposure.outcome === "success" || exposure.outcome === "struggle");
}

/** LEARNING_ENGINE_V1.md §3.2. Signal is direction-only and independent of Tier (Principle 3 / §3.3's explicit statement that the two axes are independent). */
export function deriveEvidenceSignal(mapped: QuestionTypeExposure[]): EvidenceSignal {
  const withEvidence = mapped.filter((q) => q.outcome !== "none");
  if (withEvidence.length === 0) return "Not Yet Observed";

  const anySuccess = withEvidence.some((q) => q.outcome === "success");
  const anyStruggle = withEvidence.some((q) => q.outcome === "struggle");
  const anyMixed = withEvidence.some((q) => q.outcome === "mixed");

  if (anyMixed || (anySuccess && anyStruggle)) return "Developing";
  if (anySuccess) return "Demonstrated";
  return "Not Yet Demonstrated";
}

/** LEARNING_ENGINE_V1.md §3.3. `distinctCorrectSessions` is the real, existing column this codebase's pre-existing ALI Evidence Confidence Model (lib/ali/confidence.ts's HIGH_TIER_SPREAD_MARGIN) already uses as its own "evidence across time" proxy — reused here for the same purpose, not re-derived. */
export function deriveEvidenceTier(mapped: QuestionTypeExposure[]): EvidenceTier {
  const withContent = mapped.filter((q) => q.contentExists);
  const withEvidence = mapped.filter((q) => q.timesSeen > 0);
  if (withEvidence.length === 0) return "ET-0";

  const stable = withEvidence.filter(isStable);
  if (stable.length === 0) return "ET-1";

  const allContentIsStable = withContent.length > 0 && stable.length === withContent.length;
  const anySustained = stable.some((q) => q.distinctCorrectSessions >= 2);

  if (allContentIsStable && anySustained) return "ET-4";
  if (stable.length >= 2) return "ET-3";
  return "ET-2";
}

/** Ties the above together for one competency's full mapped-Question-Type evidence. */
export function computeCompetencyStatus(competencyId: CompetencyId, mapped: QuestionTypeExposure[]): CompetencyStatus {
  return {
    competencyId,
    signal: deriveEvidenceSignal(mapped),
    tier: deriveEvidenceTier(mapped),
    examEvidenceMaturity: COMPETENCIES[competencyId].emc,
    mappedQuestionTypes: mapped,
  };
}

/** Convenience — asserts every competency has at least an (empty) mapped-Question-Type list, so downstream code never has to special-case a missing entry. */
export function getExpectedQuestionTypeCount(competencyId: CompetencyId): number {
  return getQuestionTypesForCompetency(competencyId).length;
}
