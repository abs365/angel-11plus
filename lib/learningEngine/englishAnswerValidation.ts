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
  | "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION";

export interface AcceptedSetResult {
  correct: boolean;
  matchedOn: string | null;
}

/**
 * Tier 1/2 — retrieval and vocabulary-in-context answers. Case-insensitive,
 * whitespace-normalised containment against an author-curated accepted-
 * answer list, per the mark scheme's own demonstrated tolerance (e.g.
 * accepting "relax" for "bask", rejecting "bathe" — a curated list, not a
 * generic keyword-overlap heuristic, which cannot make that distinction).
 */
export function checkAcceptedAnswerSet(userAnswer: string, acceptedAnswers: string[]): AcceptedSetResult {
  const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const userNorm = normalise(userAnswer);
  if (!userNorm) return { correct: false, matchedOn: null };

  for (const accepted of acceptedAnswers) {
    const acceptedNorm = normalise(accepted);
    if (userNorm === acceptedNorm || userNorm.includes(acceptedNorm) || acceptedNorm.includes(userNorm)) {
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

export function scoreEnglishComprehensionAnswer(
  userAnswer: string,
  prompt: EnglishPromptValidationFields,
  legacyHeuristic: (userAnswer: string, modelAnswer: string | undefined, maxMarks: number) => number
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
      const result = checkOrderedSequence(lines, acceptedSets);
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
    default: {
      const earnedMarks = legacyHeuristic(userAnswer, prompt.modelAnswer, prompt.marks);
      return { tier: "LEGACY_HEURISTIC", automaticallyVerified: true, earnedMarks, requiresSelfComparison: false };
    }
  }
}
