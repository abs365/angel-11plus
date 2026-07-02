/**
 * Internal-only Learning Gain signal (Phase ALI 1.4) — measures improvement
 * over time, not raw scores. Not exposed to any UI in this phase; stored
 * purely so a future phase (e.g. the Readiness Shadow Model flagged in
 * ALI_DECISION_LOG.md Decision 24) has a real trend signal to build on.
 */
export interface LearningGainSnapshot {
  subject: string;
  /** This mock's contribution to the trend — can be negative. */
  delta: number;
  /** Running total across every recorded mock for this subject. */
  cumulative: number;
  computedAt: string;
}
