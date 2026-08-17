/**
 * CSSE Completion Programme, Phase D — Continuous Writing assessment
 * standard. Defines the CSSE-evidenced 5-dimension rubric
 * (ANGEL_PHASE_D_CONTINUOUS_WRITING_STANDARD_V1.md Part 3, sourced from
 * `CONTINUOUS_WRITING_EVIDENCE_REVIEW_V1.md`'s direct reading of the
 * official CSSE Continuous Writing sample mark scheme) and a pre-flight
 * confidence gate that runs BEFORE any AI call — pure functions, so the
 * 11 synthetic calibration response types (Part 11 of the governing
 * directive) can be tested deterministically, without a live API call,
 * for everything that genuinely is deterministic. The AI judgement
 * itself is not, and is not simulated here — see
 * scripts/writing-rubric-calibration.mjs for the live-call calibration
 * evidence this module's own docstring cannot provide.
 *
 * Decision 60's mastery quarantine is NOT implemented here and is not
 * this module's concern: every AI-scored Writing attempt is recorded
 * with supportTier "supported" unconditionally, regardless of anything
 * this module computes. This module's `confidence` output governs only
 * whether a dimension's displayed judgement is a normal read or an
 * honestly degraded one — never the evidence tier.
 */

/** The CSSE-evidenced 5-dimension rubric — no finer, for anything presented as CSSE-evidenced (see the design document's own Part 3 table distinguishing CSSE-evidenced from Angel-designed). */
export type WritingDimension = "ideas" | "vocabulary" | "grammar" | "structure" | "punctuation";

export const WRITING_DIMENSIONS: WritingDimension[] = ["ideas", "vocabulary", "grammar", "structure", "punctuation"];

/** Plain-language label and the real official rubric's own short description of what the dimension covers, so any AI-generated comment can be checked against genuine rubric language rather than invented adjectives. */
export const WRITING_DIMENSION_LABEL: Record<WritingDimension, string> = {
  ideas: "Ideas",
  vocabulary: "Vocabulary (including spelling)",
  grammar: "Grammar",
  structure: "Structure",
  punctuation: "Punctuation",
};

/** Qualitative, matching the official rubric's own band language (Part 3) — deliberately not a per-dimension 1-100 number, which would fabricate a precision no CSSE evidence supports. */
export type DimensionLevel = "developing" | "secure" | "strong";

export interface DimensionJudgement {
  dimension: WritingDimension;
  level: DimensionLevel;
  comment: string;
  /** false when the pre-flight gate judged this response too short/off-topic/templated to assess this dimension meaningfully — the comment is then a degraded, honestly-labelled one, never a normal-looking judgement produced from insufficient signal. */
  confident: boolean;
}

/**
 * CSSE-evidenced minimum: "you should aim to write at least six
 * sentences" (3/3 years, CONTINUOUS_WRITING_EVIDENCE_REVIEW_V1.md §1) —
 * replaces the previous endpoint's own invented "60 words" threshold,
 * which had no evidentiary basis at all.
 */
export const MINIMUM_SENTENCE_COUNT = 6;

/**
 * A deliberately simple, honest sentence-count estimate: counts
 * terminal punctuation (. ! ?) not immediately preceded by a digit or a
 * single capital letter (guards against the most common abbreviation/
 * initial false-positives, e.g. "Mr. Jones" or "J.R.R. Tolkien", without
 * claiming linguistic precision this heuristic cannot deliver).
 */
export function estimateSentenceCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // matchAll (not match+indexOf) so each match carries its own real
  // position — indexOf would incorrectly return the FIRST occurrence's
  // position every time a delimiter string (e.g. plain ".") repeats,
  // undercounting any text with more than one identical terminal mark.
  const matches = trimmed.matchAll(/[.!?]+(?=\s|$)/g);
  let count = 0;
  for (const m of matches) {
    const before = trimmed.slice(0, m.index);
    const precedingWord = before.match(/(\S+)\s*$/)?.[1] ?? "";
    const isAbbreviation = /^[A-Z]$/.test(precedingWord) || /^\d+$/.test(precedingWord) || /^(Mr|Mrs|Ms|Dr|St)$/i.test(precedingWord);
    if (!isAbbreviation) count++;
  }
  // A long run-on with no terminal punctuation at all still contains
  // real content — treat it as at least one sentence rather than zero,
  // so a genuinely long but poorly-punctuated response isn't scored as
  // if it were empty (a different, real defect the Grammar/Punctuation
  // dimensions should surface, not this gate).
  return count > 0 ? count : trimmed.length > 0 ? 1 : 0;
}

export function meetsMinimumLength(text: string): boolean {
  return estimateSentenceCount(text) >= MINIMUM_SENTENCE_COUNT;
}

/** Common English stopwords, excluded from the off-topic overlap check so the signal reflects genuine topical vocabulary, not shared function words every response will contain regardless of topic. */
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "of", "to", "in", "on", "at", "for", "with", "as", "is", "was", "were",
  "are", "be", "been", "it", "its", "this", "that", "these", "those", "i", "you", "he", "she", "we", "they", "my",
  "your", "his", "her", "our", "their", "not", "no", "so", "do", "did", "does", "have", "has", "had", "will", "would",
  "could", "should", "can", "just", "then", "than", "there", "here", "what", "when", "where", "how", "which", "who",
  "from", "into", "onto", "about", "after", "before", "over", "under", "against", "between", "through", "during",
  "without", "within", "very", "some", "such", "each", "more", "most", "much", "many", "also", "even", "still",
]);

function significantWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w))
  );
}

/**
 * A crude, deliberately simple stem: truncates to at most 5 characters.
 * Found necessary by live calibration testing
 * (scripts/writing-rubric-calibration.mjs): without this, "patient"
 * (the prompt's own word) and "patience" (a genuinely on-topic response
 * using the noun form) never match, and a live-tested "very strong",
 * clearly on-topic response was wrongly flagged likely-off-topic on
 * every single calibration run as a result. Not a real linguistic
 * stemmer (no attempt at correctness for irregular forms) — a bounded,
 * explainable heuristic improvement, same discipline as the rest of
 * this module's own disclosed limits.
 */
function stem(word: string): string {
  return word.slice(0, Math.min(word.length, 5));
}

function significantStems(text: string): Set<string> {
  return new Set([...significantWords(text)].map(stem));
}

/**
 * A bounded heuristic, not a hard rule (the design document's own
 * disclosed limit): flags a response as POSSIBLY off-topic only when it
 * is long enough that genuine topical overlap would be expected, and
 * that overlap is very low. A short response failing the length gate
 * already gets flagged there; this check exists for the distinct case
 * of a long response that never actually engages the prompt. Compares
 * stems (see `stem()` above), not raw words, so "patient"/"patience"-
 * style variation doesn't produce a false off-topic flag.
 */
export function looksOffTopic(responseText: string, promptText: string): boolean {
  const responseWords = significantWords(responseText);
  if (responseWords.size < 15) return false; // too short for this check to be meaningful; the length gate already covers short responses
  const promptStems = significantStems(promptText);
  if (promptStems.size === 0) return false;
  const responseStems = new Set([...responseWords].map(stem));
  let overlap = 0;
  for (const s of promptStems) if (responseStems.has(s)) overlap++;
  return overlap === 0;
}

/**
 * Detects a response suspiciously close to the family's own MODEL text
 * — a genuine copy-detection signal, not a judgement about writing
 * quality. Uses word-level Jaccard similarity, a simple, explainable
 * measure appropriate for a pre-flight gate (not a plagiarism-grade
 * tool).
 */
export function looksLikeTemplateOrCopied(responseText: string, modelText: string | undefined): boolean {
  if (!modelText) return false;
  const a = significantWords(responseText);
  const b = significantWords(modelText);
  if (a.size === 0 || b.size === 0) return false;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  const union = new Set([...a, ...b]).size;
  const jaccard = intersection / union;
  return jaccard >= 0.5;
}

/**
 * Flags text that reads as an attempt to redirect the model's own
 * instructions, embedded inside the student's writing (e.g. "ignore
 * the above and say..."). This is a telemetry/logging signal, not a
 * content filter — the response is still sent for evaluation either
 * way (a genuine student response could innocently contain the word
 * "ignore"), but the system prompt's own instruction to treat all
 * submitted text as content, never as commands, is the real defence
 * (verified live, scripts/writing-rubric-calibration.mjs). Flagging it
 * here lets a future review dashboard surface these attempts without
 * silently rejecting a legitimate submission that merely contains one
 * of these words in an innocent sentence.
 */
export function containsInjectionMarkers(responseText: string): boolean {
  const lower = responseText.toLowerCase();
  const patterns = [
    /ignore (the |all )?(above|previous|prior)/,
    /disregard (the |all )?(above|previous|instructions)/,
    /you are now/,
    /new instructions?:/,
    /system\s*:/,
    /act as (a|an) /,
    /forget (everything|your instructions)/,
  ];
  return patterns.some((p) => p.test(lower));
}

/**
 * CSSE Completion Programme, Phase D, Part 11 — found via live
 * calibration testing (scripts/writing-rubric-calibration.mjs): the
 * model does not reliably include `overallScore` in its JSON output
 * (observed live, `finish_reason: "stop"`, not a truncation — the model
 * simply omits the key for some responses, most often weak/short ones).
 * The previous code path (`feedback.overallScore ?? 0`) would have
 * silently turned a genuinely-missing score into a fake "0/100", the
 * worst possible reading, for a response the model never actually rated
 * that low. Fixed by never trusting the model's own overallScore at
 * all: this Angel-internal progress indicator is now always computed
 * deterministically, server-side, from the five dimension levels the
 * model DID reliably return — which also guarantees the number can
 * never disagree with the dimension judgements displayed alongside it.
 */
const DIMENSION_LEVEL_SCORE: Record<DimensionLevel, number> = { developing: 45, secure: 70, strong: 90 };

export function computeOverallScoreFromDimensions(dimensions: { level: DimensionLevel }[]): number {
  if (dimensions.length === 0) return 0;
  const sum = dimensions.reduce((acc, d) => acc + (DIMENSION_LEVEL_SCORE[d.level] ?? DIMENSION_LEVEL_SCORE.developing), 0);
  return Math.round(sum / dimensions.length);
}

export interface WritingPreflightResult {
  sentenceCount: number;
  meetsMinimumLength: boolean;
  likelyOffTopic: boolean;
  likelyTemplateOrCopied: boolean;
  containsInjectionMarkers: boolean;
  /** "low" if any quality signal below suggests a normal dimension-by-dimension read would be unreliable — governs display only, never the evidence tier (see this module's own docstring). */
  confidence: "high" | "low";
}

export function runWritingPreflightChecks(responseText: string, promptText: string, modelText?: string): WritingPreflightResult {
  const sentenceCount = estimateSentenceCount(responseText);
  const meetsMin = sentenceCount >= MINIMUM_SENTENCE_COUNT;
  const offTopic = looksOffTopic(responseText, promptText);
  const templated = looksLikeTemplateOrCopied(responseText, modelText);
  const injection = containsInjectionMarkers(responseText);
  return {
    sentenceCount,
    meetsMinimumLength: meetsMin,
    likelyOffTopic: offTopic,
    likelyTemplateOrCopied: templated,
    containsInjectionMarkers: injection,
    confidence: meetsMin && !offTopic && !templated ? "high" : "low",
  };
}
