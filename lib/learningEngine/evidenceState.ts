/**
 * Educational Increment 007U, Part 3 (Problem A) / Part 14 — a small,
 * reusable evidence-confidence contract distinguishing genuine absence of
 * evidence from confirmed low performance. Written after a live defect
 * (Founder screenshot: "Your writing average is 0%" shown for a subject
 * with zero Practice Eligible content) traced to `lib/adaptiveEngine.ts`
 * treating "0 attempts" and "confirmed 0% average" as the same case in
 * places that generate learner-facing copy or recommendation urgency.
 *
 * Deliberately generic (attempts-count only) so it can be reused by any
 * evidence source — this legacy `UserProgress.scores` system today, the
 * real ALI `ali_student_question_history` evidence tomorrow — without
 * assuming which one is asking. Thresholds are a disclosed, defensible
 * judgement call (not derived from any external standard): fewer than 3
 * attempts is too small a sample to characterise as a stable average;
 * 3-5 is a genuine but still-developing sample; 6+ is treated as an
 * established sample. Reusing the sibling-depth/mastery-threshold scale
 * already used elsewhere in this codebase (e.g. `mastery_threshold`
 * commonly 2-3) rather than inventing an unrelated number.
 */
export type EvidenceState = "no_evidence" | "insufficient_evidence" | "developing_evidence" | "established_evidence";

export function classifyEvidenceState(attempts: number): EvidenceState {
  if (attempts <= 0) return "no_evidence";
  if (attempts < 3) return "insufficient_evidence";
  if (attempts < 6) return "developing_evidence";
  return "established_evidence";
}

/** True for the two states where a percentage/average must never be stated as though it were a stable, reliable figure. */
export function isEvidenceTooThinForAverage(state: EvidenceState): boolean {
  return state === "no_evidence" || state === "insufficient_evidence";
}
