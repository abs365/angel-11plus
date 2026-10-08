/**
 * Continuous Writing revision, Tier 1 (ANGEL_CSSE_WRITING_REVISION_CONTRACT.md): first attempt -> feedback -> learner
 * reflection -> optional revision -> comparison, in Practice only, WITHOUT storing the child's writing.
 *
 * What this module guarantees (each is tested):
 *  - the comparison is descriptive only ("reads stronger now"), never a number and never "improved by";
 *  - a read that was not confident, on either version, is not compared at all;
 *  - the evidence event that may be recorded is TEXT-FREE (enumerated values and the five dimension reads only);
 *  - a revision is formative: it is supported tier and never counts towards mastery;
 *  - at most one revision per original attempt.
 * Mock Writing never imports this module.
 */

export type RevisionDimension = "ideas" | "vocabulary" | "grammar" | "structure" | "punctuation";
export type RevisionLevel = "developing" | "secure" | "strong";

export interface DimensionRead {
  dimension: RevisionDimension;
  level: RevisionLevel;
  confident: boolean;
}

export const REVISION_DIMENSIONS: RevisionDimension[] = ["ideas", "vocabulary", "grammar", "structure", "punctuation"];
export const MAX_REVISIONS_PER_ORIGINAL = 1;

const LEVEL_ORDER: Record<RevisionLevel, number> = { developing: 0, secure: 1, strong: 2 };

export function canOfferRevision(state: { hasFeedback: boolean; revisionsMade: number }): boolean {
  return state.hasFeedback && state.revisionsMade < MAX_REVISIONS_PER_ORIGINAL;
}

export type Movement = "moved_up" | "same" | "moved_down" | "not_compared";

/** Per-dimension movement between two reads. Not compared unless BOTH reads were confident. */
export function compareDimensionReads(original: readonly DimensionRead[], revised: readonly DimensionRead[]): { dimension: RevisionDimension; movement: Movement }[] {
  return REVISION_DIMENSIONS.map((dimension) => {
    const a = original.find((r) => r.dimension === dimension);
    const b = revised.find((r) => r.dimension === dimension);
    if (!a || !b || !a.confident || !b.confident) return { dimension, movement: "not_compared" as const };
    const d = LEVEL_ORDER[b.level] - LEVEL_ORDER[a.level];
    return { dimension, movement: d > 0 ? ("moved_up" as const) : d < 0 ? ("moved_down" as const) : ("same" as const) };
  });
}

/** Plain, non-numeric wording. A downward move is described neutrally because the read can vary between runs. */
export function describeMovement(m: Movement): string {
  switch (m) {
    case "moved_up":
      return "reads stronger now";
    case "same":
      return "reads about the same";
    case "moved_down":
      return "reads a little differently (this kind of read can vary, so look at the writing itself)";
    case "not_compared":
      return "there is not enough writing here to compare this";
  }
}

export interface RevisionAreaOption {
  id: string;
  label: string;
  /** The rubric dimension this choice is about, when it is one (otherwise the event records "other"). */
  dimension: RevisionDimension | null;
}

const DIMENSION_LABEL: Record<RevisionDimension, string> = {
  ideas: "Ideas",
  vocabulary: "Vocabulary (including spelling)",
  grammar: "Grammar",
  structure: "Structure",
  punctuation: "Punctuation",
};

/**
 * The areas a learner may choose to work on: dimensions read as developing (confidently), then the feedback's own
 * "areas to improve" lines, at most four choices in total, so the learner picks ONE thing, not everything.
 */
export function chooseableAreas(feedback: { areasToImprove?: string[]; dimensions?: DimensionRead[] }): RevisionAreaOption[] {
  const out: RevisionAreaOption[] = [];
  for (const d of feedback.dimensions ?? []) {
    if (d.level === "developing" && d.confident) out.push({ id: `dim-${d.dimension}`, label: DIMENSION_LABEL[d.dimension], dimension: d.dimension });
  }
  (feedback.areasToImprove ?? []).slice(0, 4).forEach((text, i) => {
    if (out.length < 4 && text.trim()) out.push({ id: `area-${i}`, label: text.trim(), dimension: null });
  });
  return out.slice(0, 4);
}

export type WordCountChangeBand = "much_shorter" | "shorter" | "similar" | "longer" | "much_longer";

export function wordCountChangeBand(originalWords: number, revisedWords: number): WordCountChangeBand {
  if (originalWords <= 0) return "similar";
  const ratio = revisedWords / originalWords;
  if (ratio < 0.7) return "much_shorter";
  if (ratio < 0.92) return "shorter";
  if (ratio <= 1.08) return "similar";
  if (ratio <= 1.3) return "longer";
  return "much_longer";
}

export interface RevisionEvidenceEvent {
  schema: 1;
  kind: "writing_revision";
  questionId: string;
  sessionKey: string;
  chosenArea: RevisionDimension | "other";
  originalReads: DimensionRead[];
  revisedReads: DimensionRead[];
  wordCountChangeBand: WordCountChangeBand;
  /** Always supported and never counted: a post-feedback revision is not independent evidence. */
  supportTier: "supported";
  countsTowardMastery: false;
}

export function buildRevisionEvidenceEvent(input: {
  questionId: string;
  sessionKey: string;
  chosenArea: RevisionDimension | null;
  originalReads: readonly DimensionRead[];
  revisedReads: readonly DimensionRead[];
  originalWords: number;
  revisedWords: number;
}): RevisionEvidenceEvent {
  const pick = (r: readonly DimensionRead[]) => REVISION_DIMENSIONS.flatMap((d) => r.filter((x) => x.dimension === d).slice(0, 1).map((x) => ({ dimension: x.dimension, level: x.level, confident: x.confident })));
  return {
    schema: 1,
    kind: "writing_revision",
    questionId: input.questionId,
    sessionKey: input.sessionKey,
    chosenArea: input.chosenArea ?? "other",
    originalReads: pick(input.originalReads),
    revisedReads: pick(input.revisedReads),
    wordCountChangeBand: wordCountChangeBand(input.originalWords, input.revisedWords),
    supportTier: "supported",
    countsTowardMastery: false,
  };
}

/** True only if the event holds identifiers, enumerated values and booleans: no free text anywhere. */
export function isTextFreeEvent(event: unknown): boolean {
  const ok = (v: unknown): boolean => {
    if (v === null || typeof v === "boolean" || typeof v === "number") return true;
    if (typeof v === "string") return /^[A-Za-z0-9_:\-]{1,80}$/.test(v);
    if (Array.isArray(v)) return v.every(ok);
    if (typeof v === "object") return Object.values(v as Record<string, unknown>).every(ok);
    return false;
  };
  return ok(event);
}

/** Wording a comparison view must never contain. */
export const FORBIDDEN_COMPARISON_PHRASES = [/improved by/i, /\bpoints?\b/i, /\bscore\b/i, /\bmarks?\b/i, /\d+\s*%/];
