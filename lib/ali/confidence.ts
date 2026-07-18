import type {
  EvidenceConfidenceTier,
  CompetencyConfidenceInput,
  QuestionEvidenceInput,
} from "@/types/ali/confidence";

/**
 * Work Package WP-05 (Implementation Programme) — Confidence Processing.
 * Implements the Evidence Confidence Model (AEP-005 §6, EAW-002 §6) as a
 * pure, derived computation — no I/O, no independent storage, matching the
 * established convention (lib/ali/mastery.ts's applyAttemptOutcome()) and
 * the standing "derived, never a new source of truth" invariant
 * (ALI_CROSS_SUBJECT_INTELLIGENCE.md §2.3, restated throughout the EAW
 * series). Must be recomputed from real evidence every time it is needed,
 * never cached as an independent fact that could drift from the
 * StudentQuestionHistoryRow/ali_question_bank data it summarises.
 *
 * Calibration provenance (per Programme Decision APD-017): the two
 * thresholds below (GUESSABLE_CONFIDENCE_WEIGHT, HIGH_TIER_SPREAD_MARGIN)
 * are provisional interim defaults, not independently validated findings —
 * assigned per EAW-005 §4.1's calibration ownership ("Founder + first
 * implementation engineer jointly, before Confidence Processing ships to
 * production"). This is that assignment being exercised, not skipped.
 */

/** Below this confidenceWeight, a question is treated as guessable enough that evidence from it caps at Low confidence regardless of how many times the threshold is met (AEP-005 §6's "Low Confidence... low-confidence_weight (easily guessable) format" criterion places this case at Low outright, not Moderate). Provisional. */
const GUESSABLE_CONFIDENCE_WEIGHT = 0.85;

/** How far total distinct-correct-session evidence must exceed the bare mastery_threshold minimum before High confidence is warranted, absent transfer corroboration. Provisional — a real proxy for "evidence across time" (AEP-005 §7), not a per-day time gap, since no per-attempt timestamp log exists to compute that directly (the same honest limitation LEARNING_PROFILE_MODEL.md §1 already found for its Learning Consistency dimension). */
const HIGH_TIER_SPREAD_MARGIN = 2;

/**
 * Computes the Evidence Confidence tier for one competency from its real,
 * per-question history — never asserts a tier without at least one
 * recorded attempt (AEP-005 §6's "Insufficient Evidence" floor).
 */
export function computeCompetencyConfidence(
  input: CompetencyConfidenceInput
): EvidenceConfidenceTier {
  const { questions, transferCorroborated } = input;

  const anyEvidence = questions.some((q) => q.timesSeen > 0);
  if (!anyEvidence) return "insufficient";

  const thresholdMet = questions.filter(
    (q) => q.distinctCorrectSessions >= q.masteryThreshold
  );
  if (thresholdMet.length === 0) return "low";

  const avgConfidenceWeight =
    thresholdMet.reduce((sum, q) => sum + q.confidenceWeight, 0) / thresholdMet.length;

  // Per AEP-005 §6's own tier definitions, evidence from a low-
  // confidence_weight (easily guessable) format belongs at Low confidence
  // outright, not Moderate — meeting the mastery_threshold on a guessable
  // question is not strong evidence just because the raw count is met.
  // (Corrected during WP-06 cross-verification against the Mastery
  // Validation gate — the original WP-05 implementation capped this case
  // at "moderate," which would have let a guessable-format-only result
  // pass the WP-06 gate; AEP-005 §6's own wording places it at Low.)
  if (avgConfidenceWeight < GUESSABLE_CONFIDENCE_WEIGHT) return "low";

  const totalDistinctSessions = thresholdMet.reduce(
    (sum, q) => sum + q.distinctCorrectSessions,
    0
  );
  const minMasteryThreshold = Math.min(...thresholdMet.map((q) => q.masteryThreshold));

  const evidenceMeaningfullyExceedsMinimum =
    totalDistinctSessions >= minMasteryThreshold + HIGH_TIER_SPREAD_MARGIN;

  // Per AEP-005 §7: transfer corroboration (evidence across contexts) can
  // independently justify High confidence even where same-context spread
  // alone would not — but only ever as a supplement, never a substitute for
  // direct evidence already existing (thresholdMet.length > 0 is already
  // guaranteed by this point).
  if (evidenceMeaningfullyExceedsMinimum || transferCorroborated === true) {
    return "high";
  }

  return "moderate";
}

/** Re-exported for convenience — callers building a CompetencyConfidenceInput from raw Supabase rows import this type alongside the function. */
export type { EvidenceConfidenceTier, CompetencyConfidenceInput, QuestionEvidenceInput };
