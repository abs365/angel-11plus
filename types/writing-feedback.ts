export interface SuggestedUpgrade {
  original: string;
  improved: string;
  explanation: string;
}

/**
 * CSSE Completion Programme, Phase D — the CSSE-evidenced 5-dimension
 * analytic judgement (ANGEL_PHASE_D_CONTINUOUS_WRITING_STANDARD_V1.md
 * Part 4), additive to the existing fields below, not a replacement —
 * the legacy `/writing` route's own WritingFeedback component (not part
 * of the CSSE pathway, out of this phase's scope) continues to render
 * `overallScore` unchanged and simply ignores this new field.
 */
export interface WritingDimensionFeedback {
  dimension: "ideas" | "vocabulary" | "grammar" | "structure" | "punctuation";
  level: "developing" | "secure" | "strong";
  comment: string;
  confident: boolean;
}

export interface WritingFeedback {
  strengths: [string, string];
  areasToImprove: string[];
  suggestedUpgrade: SuggestedUpgrade;
  tutorTip: string;
  /** An Angel-internal progress indicator only — never a CSSE-equivalent mark (enforced by the system prompt and disclosed in every rendering of this field). */
  overallScore: number;
  /** CSSE-evidenced dimension-level judgement (Phase D). Absent for any feedback generated before this phase, or for the legacy /writing route, which does not request it. */
  dimensions?: WritingDimensionFeedback[];
}

export interface WritingFeedbackRequest {
  promptTitle: string;
  promptType: string;
  promptText: string;
  writingText: string;
  checkedItems: string[];
}
