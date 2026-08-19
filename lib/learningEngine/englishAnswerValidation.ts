/**
 * English Answer Validation Architecture (Educational Increment 007A
 * design, 007B implementation). Four tiers, each directly derived from
 * reading the real CSSE 2022/2023 Main Test marking schemes (not
 * invented) — reading comprehension marking there is genuinely
 * partial-credit and multi-form, never a single exact-match rule the way
 * Mathematics' checkMathsAnswer() is.
 *
 * Deliberately does NOT attempt to grade free-text explanation quality
 * (the second half of a quotation+explanation answer) — the mark scheme
 * itself requires human judgement there ("reward what is there... unless
 * there is obvious blind copying without any sense of understanding"),
 * and fabricating precision Angel cannot back is exactly what 007A's
 * directive prohibited. Where this module cannot validate a component,
 * it says so via `NOT_AUTOMATICALLY_GRADABLE` rather than guessing.
 */

export type ValidationTier =
  | "TIER1_EXACT_MATCH"
  | "TIER2_ACCEPTED_SET"
  | "TIER3_QUOTATION_PLUS_EXPLANATION"
  | "TIER4_ORDERED_LIST"
  | "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION"
  | "TIER6_MULTI_SELECT";

export interface AcceptedSetResult {
  correct: boolean;
  matchedOn: string | null;
}

/** Splits a normalised string into non-empty word tokens (alphanumeric runs). Shared by every token-boundary check below so "hi"/"his" or "x"/"excitement" can never collide as character substrings of one another. */
function tokenise(normalised: string): string[] {
  return normalised.split(/[^a-z0-9]+/).filter((t) => t.length > 0);
}

/**
 * True if `needle` appears as a contiguous, in-order run inside `haystack`
 * (token identity, not character containment) — e.g. ["checked","his",
 * "spikes"] is found inside ["jogged","warmed","up","and","checked","his",
 * "spikes"], but ["up"] alone is not treated specially by this function;
 * the caller decides whether a single-token needle is allowed to match.
 */
function containsTokenSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0 || needle.length > haystack.length) return false;
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

/**
 * Tier 1/2 — retrieval and vocabulary-in-context answers. Case-insensitive,
 * whitespace-normalised matching against an author-curated accepted-answer
 * list, per the mark scheme's own demonstrated tolerance (e.g. accepting
 * "relax" for "bask", rejecting "bathe" — a curated list, not a generic
 * keyword-overlap heuristic, which cannot make that distinction).
 *
 * Educational Integrity Correction (Stage 2) — the prior implementation
 * matched via raw character `.includes()` in both directions, which is
 * false-positive-prone: "hi" is a character substring of "...checked
 * his spikes...", and "x" is a character substring of "excitement",
 * despite neither being a real word match. Both directions below now
 * operate on whole-word TOKENS, closing that class of defect
 * structurally (a token boundary, not a percentage or minimum-character
 * heuristic) rather than by picking an arbitrary threshold:
 *
 *   - Direction 1 (expanded/reworded answers) — the full accepted phrase,
 *     however long, must appear as an intact token sequence inside the
 *     user's answer. Always allowed, at any length, including a single
 *     accepted token (e.g. "excitement" found inside "a feeling of
 *     excitement and worry") — the accepted phrase itself is
 *     author-curated, so this is exactly the "user gave the right
 *     content plus extra words" case the tier is meant to reward.
 *   - Direction 2 (abbreviated answers) — the user's own answer must
 *     appear as an intact token sequence inside one accepted phrase.
 *     Gated to user answers of 2+ tokens: a single incidental word
 *     ("hi", "up", "x") is never enough on its own to stand in for a
 *     longer curated phrase, since a lone token has no way to
 *     distinguish "the core of the right answer, abbreviated" from "a
 *     coincidental word that happens to also appear in the phrase". Two
 *     or more matching tokens in the exact accepted order is not
 *     coincidental in the same way — it is real, meaningful overlap. A
 *     single-token user answer can still match, but only via exact
 *     equality against a single-token accepted answer (handled above by
 *     the direct string-equality check), never via this direction.
 */
export function checkAcceptedAnswerSet(userAnswer: string, acceptedAnswers: string[]): AcceptedSetResult {
  const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const userNorm = normalise(userAnswer);
  if (!userNorm) return { correct: false, matchedOn: null };
  const userTokens = tokenise(userNorm);

  for (const accepted of acceptedAnswers) {
    const acceptedNorm = normalise(accepted);
    if (userNorm === acceptedNorm) return { correct: true, matchedOn: accepted };

    const acceptedTokens = tokenise(acceptedNorm);
    if (containsTokenSequence(userTokens, acceptedTokens)) return { correct: true, matchedOn: accepted };
    if (userTokens.length >= 2 && containsTokenSequence(acceptedTokens, userTokens)) {
      return { correct: true, matchedOn: accepted };
    }
  }
  return { correct: false, matchedOn: null };
}

export interface QuotationCheckResult {
  quotationFound: boolean;
  explanationStatus: "NOT_AUTOMATICALLY_GRADABLE";
}

/**
 * Tier 3, quotation half only. Verbatim-with-tolerance: exact substring
 * match after normalising whitespace and stripping the specific
 * punctuation the real mark scheme explicitly allows to differ ("accurate
 * word for word, but spelling and punctuation mistakes are allowed").
 * Does not attempt to validate the accompanying free-text explanation —
 * see module docstring.
 */
export function checkQuotationPresent(userAnswer: string, requiredQuotation: string): QuotationCheckResult {
  const normalise = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:'"()]/g, "")
      .replace(/\s+/g, " ");
  const userNorm = normalise(userAnswer);
  const quoteNorm = normalise(requiredQuotation);
  return {
    quotationFound: quoteNorm.length > 0 && userNorm.includes(quoteNorm),
    explanationStatus: "NOT_AUTOMATICALLY_GRADABLE",
  };
}

export interface OrderedSequenceResult {
  correctInPosition: number;
  totalPositions: number;
  marks: number;
}

/**
 * Tier 4 — ordered multi-part answers (sequencing). Mirrors the exact
 * partial-credit rule demonstrated in the 2023 CSSE mark scheme: a mark
 * is earned only for an item that is BOTH individually correct (matches
 * its position's accepted set) AND in the correct position — an item that
 * is correct but out of order earns nothing for that position, exactly as
 * the mark scheme's own worked examples show ("bask/read/wash" earns only
 * 1 of 3 marks, not 3, despite every item being individually correct).
 */
export function checkOrderedSequence(userAnswer: string[], correctOrderAcceptedSets: string[][]): OrderedSequenceResult {
  const totalPositions = correctOrderAcceptedSets.length;
  let correctInPosition = 0;
  for (let i = 0; i < totalPositions; i++) {
    const userItem = userAnswer[i];
    if (!userItem) continue;
    const acceptedForPosition = correctOrderAcceptedSets[i];
    if (checkAcceptedAnswerSet(userItem, acceptedForPosition).correct) {
      correctInPosition++;
    }
  }
  return { correctInPosition, totalPositions, marks: correctInPosition };
}

export interface NamedComponentResult {
  namedComponentCorrect: boolean;
  matchedOn: string | null;
  explanationStatus: "NOT_AUTOMATICALLY_GRADABLE";
}

/**
 * Tier 5 — "how does X feel, and why" style questions (007B's emotion-
 * cause family). Distinct from Tier 3: there is no quotation requirement,
 * but exactly like Tier 3, the causal explanation half cannot be reliably
 * auto-graded and is never claimed to be. Caught by programmatic
 * verification of the live Wave 1 content, which found these questions
 * mislabelled as Tier 3 (they have `acceptedAnswers`, not
 * `quotationRequired`) — a real content bug, fixed at the source rather
 * than forced to fit an ill-matching tier.
 */
export function checkNamedComponent(userAnswer: string, acceptedComponents: string[]): NamedComponentResult {
  const result = checkAcceptedAnswerSet(userAnswer, acceptedComponents);
  return {
    namedComponentCorrect: result.correct,
    matchedOn: result.matchedOn,
    explanationStatus: "NOT_AUTOMATICALLY_GRADABLE",
  };
}

export interface MultiSelectResult {
  correctCount: number;
  requiredCount: number;
  selectedCount: number;
  overSelected: boolean;
  exactMatch: boolean;
  marks: number;
}

/**
 * Tier 6 — multi-select recognition (Educational Increment 007C's new
 * `wave2-fam-multiselect` family, evidenced by CSSE-013/2021 Q11: "Tick 4
 * boxes that accurately match the action"). Over-selection handling is
 * directly evidenced, not invented: the 2023 paper's own cover-page
 * instruction states "Candidates must NOT tick more boxes than they are
 * instructed to. Any who do will lose all the marks for that question" —
 * a general CSSE tick-box rule, applied here exactly. Under-selection/
 * partial-correctness credit (1 mark per correct selection, capped at
 * `requiredCount`) is a defensible, disclosed POLICY choice, not a
 * directly-evidenced rule — the specific mark scheme for a multi-select
 * item was not among the papers read, and this is named as an inference,
 * not fabricated as confirmed.
 */
export function checkMultiSelect(selectedOptions: string[], correctOptions: string[], requiredCount: number): MultiSelectResult {
  // Educational Increment 007C completion, Part 9 — every real question in
  // this family uses single-letter options (A-H), so stripping anything
  // that isn't a letter or digit is always safe and never collapses two
  // genuinely distinct options together. Found via a malformed-input
  // boundary test: a trailing full stop a learner might naturally type
  // ("G.") was silently failing to match "G" before this fix.
  const normalise = (s: string) => s.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const selected = new Set(selectedOptions.map(normalise).filter((s) => s.length > 0));
  const correct = new Set(correctOptions.map(normalise));

  const overSelected = selected.size > requiredCount;
  if (overSelected) {
    // Directly evidenced: over-selection loses all marks for the question.
    return { correctCount: 0, requiredCount, selectedCount: selected.size, overSelected: true, exactMatch: false, marks: 0 };
  }

  let correctCount = 0;
  for (const s of selected) if (correct.has(s)) correctCount++;
  const exactMatch = correctCount === requiredCount && selected.size === requiredCount;

  return {
    correctCount,
    requiredCount,
    selectedCount: selected.size,
    overSelected: false,
    exactMatch,
    marks: correctCount, // 1 mark per correct selection, capped at requiredCount by construction (overSelected already handled above)
  };
}

// ---------------------------------------------------------------------
// Live-loop dispatcher (Educational Increment 007B, Part 3). The single
// entry point every Practice/adaptive-mock page should call for English
// comprehension scoring, so the tiered architecture and the legacy
// keyword-overlap heuristic (still correct for the original 13 rows,
// which carry no validationTier metadata) are both reachable from one
// place — not two competing engines.
// ---------------------------------------------------------------------

export interface EnglishPromptValidationFields {
  modelAnswer?: string;
  marks: number;
  acceptedAnswers?: string[] | null;
  quotationRequired?: string[] | null;
  orderedAnswer?: string[] | null;
  correctOptions?: string[] | null;
  requiredSelectionCount?: number | null;
  validationTier?: ValidationTier | null;
}

export interface EnglishScoringResult {
  tier: ValidationTier | "LEGACY_HEURISTIC";
  /** True only when Angel can state correctness with confidence, with no human/self judgement involved. */
  automaticallyVerified: boolean;
  earnedMarks: number;
  /** True when the learner must compare their own explanation to a model answer — Angel cannot grade it. */
  requiresSelfComparison: boolean;
  quotationFound?: boolean;
  namedComponentCorrect?: boolean;
  sequenceDetail?: OrderedSequenceResult;
  multiSelectDetail?: MultiSelectResult;
}

/** Splits a free-text multi-select answer ("A, D, E, G" or one letter per line) into option tokens. */
function parseMultiSelectAnswer(userAnswer: string): string[] {
  return userAnswer
    .split(/[\r\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Splits a free-text sequencing answer into ordered lines for Tier 4,
 * tolerating numbered-list input ("1. bask" / "1) bask") since the
 * existing Practice UI is a single textarea, not per-item fields.
 */
function parseOrderedAnswer(userAnswer: string): string[] {
  return userAnswer
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

export interface ScoreEnglishComprehensionOptions {
  /**
   * Educational Increment 007G defect correction. When true, Guided
   * Practice has shown the learner the first ordered item as an anchor
   * ("Given: 1. ...") and instructed them to supply only the remaining
   * items — the learner's raw textarea content therefore does not
   * include that first item at all. TIER4_ORDERED_LIST reconstructs the
   * complete sequence by prepending the exact anchor text before
   * scoring, so a learner who follows the on-screen instruction exactly
   * is scored correctly. checkOrderedSequence() itself is unchanged; an
   * independent attempt (this flag absent/false) is scored identically
   * to before this correction.
   */
  guidedSequenceAnchorSupplied?: boolean;
}

export function scoreEnglishComprehensionAnswer(
  userAnswer: string,
  prompt: EnglishPromptValidationFields,
  legacyHeuristic: (userAnswer: string, modelAnswer: string | undefined, maxMarks: number) => number,
  options?: ScoreEnglishComprehensionOptions
): EnglishScoringResult {
  const tier = prompt.validationTier;

  if (!tier) {
    // Legacy path — the original 13 rows and any future content without
    // validation metadata. Behaviour is byte-for-byte unchanged from the
    // pre-007B keyword-overlap heuristic.
    const earnedMarks = legacyHeuristic(userAnswer, prompt.modelAnswer, prompt.marks);
    return { tier: "LEGACY_HEURISTIC", automaticallyVerified: true, earnedMarks, requiresSelfComparison: false };
  }

  switch (tier) {
    case "TIER2_ACCEPTED_SET": {
      const result = checkAcceptedAnswerSet(userAnswer, prompt.acceptedAnswers ?? []);
      return {
        tier, automaticallyVerified: true, requiresSelfComparison: false,
        earnedMarks: result.correct ? prompt.marks : 0,
      };
    }
    case "TIER4_ORDERED_LIST": {
      const lines = parseOrderedAnswer(userAnswer);
      const acceptedSets = (prompt.orderedAnswer ?? []).map((item) => [item]);
      // 007G correction — see ScoreEnglishComprehensionOptions above. The
      // anchor is only ever the real position-1 accepted text Angel
      // actually displayed, never fabricated, and only applied when the
      // caller explicitly says the anchor was shown.
      const anchor = prompt.orderedAnswer?.[0];
      const combinedLines = options?.guidedSequenceAnchorSupplied && anchor ? [anchor, ...lines] : lines;
      const result = checkOrderedSequence(combinedLines, acceptedSets);
      return {
        tier, automaticallyVerified: true, requiresSelfComparison: false,
        earnedMarks: result.marks, sequenceDetail: result,
      };
    }
    case "TIER3_QUOTATION_PLUS_EXPLANATION": {
      const requiredQuotes = prompt.quotationRequired ?? [];
      const quotationFound = requiredQuotes.length > 0 && requiredQuotes.some((q) => checkQuotationPresent(userAnswer, q).quotationFound);
      return {
        tier, automaticallyVerified: false, requiresSelfComparison: true,
        earnedMarks: 0, quotationFound,
      };
    }
    case "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION": {
      const result = checkNamedComponent(userAnswer, prompt.acceptedAnswers ?? []);
      return {
        tier, automaticallyVerified: false, requiresSelfComparison: true,
        earnedMarks: 0, namedComponentCorrect: result.namedComponentCorrect,
      };
    }
    case "TIER6_MULTI_SELECT": {
      const selected = parseMultiSelectAnswer(userAnswer);
      const result = checkMultiSelect(selected, prompt.correctOptions ?? [], prompt.requiredSelectionCount ?? prompt.marks);
      return {
        tier, automaticallyVerified: true, requiresSelfComparison: false,
        earnedMarks: result.marks, multiSelectDetail: result,
      };
    }
    default: {
      const earnedMarks = legacyHeuristic(userAnswer, prompt.modelAnswer, prompt.marks);
      return { tier: "LEGACY_HEURISTIC", automaticallyVerified: true, earnedMarks, requiresSelfComparison: false };
    }
  }
}
