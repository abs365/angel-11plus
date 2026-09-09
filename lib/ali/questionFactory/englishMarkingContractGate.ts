import { scoreEnglishComprehensionAnswer, type EnglishPromptValidationFields, type ValidationTier } from "../../learningEngine/englishAnswerValidation";
import { scoreEnglishAnswer } from "../../learningEngine/practiceContent";

/**
 * Educational Increment 003, Wave 3 — the pre-publication marking-
 * contract safety gate, built directly in response to two real Wave 2
 * incidents:
 *
 * Incident A: all 40 Wave 2 candidates were submitted with
 * `acceptedAnswers` but no `marks`/`modelAnswer`/`validationTier`. The
 * real Practice marking path fell through to LEGACY_HEURISTIC, which
 * read an undefined `modelAnswer` and undefined `marks`, producing
 * `NaN` -- a genuinely correct answer was shown as incorrect, for all
 * 40, with no signal at submission or publication time that anything
 * was wrong (migration 242).
 *
 * Incident B: after modelAnswer/marks were restored, 4 of the 40 had a
 * genuinely correct answer too short for LEGACY_HEURISTIC's own
 * pre-existing anti-gaming floors (an 8-character minimum on the
 * learner's answer; a keyword extractor that discards words of length
 * <= 3) to ever score correct -- a scorer/answer-form INCOMPATIBILITY,
 * not a missing field. Every required field was present and
 * well-formed; the chosen scorer simply could not recognise that
 * answer's shape (migration 243).
 *
 * Both incidents were only found by actually exercising the real
 * Practice marking function against real data, after publication. This
 * module exists to run that exact exercise BEFORE a candidate is
 * considered submission-ready, using the SAME imported production
 * scoring functions the real Practice page calls (never a
 * reimplementation or approximation), so a candidate whose declared
 * marking contract cannot actually be marked -- whichever specific way
 * it's broken -- fails closed here instead of reaching a real learner.
 *
 * This module does not redesign, extend, or alter LEGACY_HEURISTIC,
 * any validationTier, or the Practice page's own marking call --  it
 * only decides, before publication, whether a candidate's own declared
 * contract will actually work against them.
 */

export interface EnglishMarkingContract {
  /** For error messages only -- never used to change validation behaviour. */
  candidateId: string;
  marks: number;
  acceptedAnswers?: string[];
  modelAnswer?: string;
  validationTier?: ValidationTier;
  /** The exact answer that MUST score full marks -- normally acceptedAnswers[0] or modelAnswer. */
  canonicalAnswer: string;
  /** Every other value in acceptedAnswers (or any other answer form explicitly approved) that must ALSO score full marks. */
  approvedVariants?: string[];
  /**
   * A wrong answer already confirmed, by the caller, to share no real
   * keyword/token with any approved answer. Never generated inside this
   * gate -- see buildDisjointWrongAnswer() below for a reusable, honest
   * way to construct one, matching the discipline Wave 2's own
   * post-repair verification used after finding its first "wrong
   * answer" probe accidentally contained a real keyword substring
   * ("nonsense" containing "sense").
   */
  disjointWrongAnswer: string;
  /**
   * Optional: answers that are topically/superficially plausible but
   * still genuinely wrong (a scrambled order, a different real emotion
   * word, etc.) -- must also score zero. Not required, but strongly
   * recommended per-candidate wherever a plausible-wrong case is
   * educationally meaningful (matches the Wave 2 post-repair
   * verification's own §7 check).
   */
  plausibleWrongAnswers?: string[];
}

export interface MarkingContractFailure {
  candidateId: string;
  reason: string;
}

export interface MarkingContractValidationResult {
  candidateId: string;
  valid: boolean;
  failures: MarkingContractFailure[];
  /** The real scoring result for the canonical answer, for audit/debugging -- never used to decide validity beyond the checks below. */
  canonicalEarnedMarks: number | null;
}

/**
 * A large, deliberately unrelated word pool (fantastical/domestic-
 * object vocabulary), filtered per call to guarantee zero overlap with
 * a specific candidate's own approved-answer keywords, so a caller can
 * build a genuinely disjoint wrong answer without accidentally reusing
 * a real keyword -- the exact class of test-construction mistake this
 * module's own design was informed by (see module docstring).
 */
const DISJOINT_WORD_POOL = [
  "purple", "elephants", "bicycles", "trombone", "spaghetti", "umbrella", "kangaroo",
  "volcano", "glitter", "sandwich", "tuesday", "planet", "hamster", "bubblegum",
  "skateboard", "pancake", "octopus", "helicopter", "marshmallow", "dinosaur",
  "telescope", "raincoat", "jellybean", "penguin", "typewriter", "waterfall",
];

function extractKeywordsForDisjointCheck(text: string): Set<string> {
  const stopwords = new Set([
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "this", "that",
    "these", "those", "his", "her", "their", "its", "to", "of", "in", "on", "for",
    "with", "as", "by", "at", "it", "he", "she", "they", "we", "you", "which", "who",
  ]);
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopwords.has(w))
  );
}

/**
 * Builds a wrong answer guaranteed to share zero real keywords (by the
 * same length/stopword rule LEGACY_HEURISTIC's own extractKeywords()
 * uses) with the supplied approved answers, and containing no
 * substring of any approved answer's own keywords either (the
 * "nonsense" contains "sense" mistake). Never a plausible-wrong probe
 * on its own -- callers should still supply their own
 * plausibleWrongAnswers where educationally meaningful.
 */
export function buildDisjointWrongAnswer(approvedAnswers: string[]): string {
  const approvedKeywords = new Set<string>();
  for (const a of approvedAnswers) for (const kw of extractKeywordsForDisjointCheck(a)) approvedKeywords.add(kw);

  const disjointWords = DISJOINT_WORD_POOL.filter((w) => {
    if (approvedKeywords.has(w)) return false;
    // Guard against the "nonsense" contains "sense" class of accidental
    // substring collision in either direction.
    for (const kw of approvedKeywords) {
      if (w.includes(kw) || kw.includes(w)) return false;
    }
    return true;
  });

  return disjointWords.slice(0, 12).join(" ") + " completely irrelevant gibberish";
}

/**
 * Exercises the REAL, imported production scoring functions
 * (scoreEnglishComprehensionAnswer / scoreEnglishAnswer -- never a
 * reimplementation) against a candidate's declared marking contract.
 * Fails closed: any one problem makes the whole candidate invalid.
 */
export function validateEnglishMarkingContract(contract: EnglishMarkingContract): MarkingContractValidationResult {
  const failures: MarkingContractFailure[] = [];
  const push = (reason: string) => failures.push({ candidateId: contract.candidateId, reason });

  // 1. marks exists and is a valid positive integer.
  if (!Number.isInteger(contract.marks) || contract.marks <= 0) {
    push(`marks must be a positive integer, got ${JSON.stringify(contract.marks)}`);
  }

  // 2. required fields present for the declared (or implicit legacy) tier.
  const tierRequiresAcceptedAnswers: ValidationTier[] = ["TIER1_EXACT_MATCH", "TIER2_ACCEPTED_SET", "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION"];
  if (contract.validationTier && tierRequiresAcceptedAnswers.includes(contract.validationTier)) {
    if (!contract.acceptedAnswers || contract.acceptedAnswers.length === 0) {
      push(`validationTier ${contract.validationTier} requires a non-empty acceptedAnswers array, none was supplied`);
    }
  }
  if (!contract.validationTier) {
    // Falls through to LEGACY_HEURISTIC -- this is exactly Incident A's
    // shape if modelAnswer is missing.
    if (!contract.modelAnswer) {
      push("no validationTier set, so this candidate falls through to LEGACY_HEURISTIC, which requires modelAnswer -- none was supplied (this is exactly the Wave 2 Incident A shape)");
    }
  }

  // If the required-field checks above already failed, don't bother
  // exercising the real scorer against known-incomplete input -- report
  // the precise reason instead of a downstream NaN.
  if (failures.length > 0) {
    return { candidateId: contract.candidateId, valid: false, failures, canonicalEarnedMarks: null };
  }

  const prompt: EnglishPromptValidationFields = {
    marks: contract.marks,
    acceptedAnswers: contract.acceptedAnswers ?? null,
    modelAnswer: contract.modelAnswer,
    validationTier: contract.validationTier ?? null,
  };

  // 3. The canonical approved answer must earn exactly `marks` through
  // the REAL production scorer, with no NaN anywhere.
  const canonicalResult = scoreEnglishComprehensionAnswer(contract.canonicalAnswer, prompt, scoreEnglishAnswer);
  const canonicalEarnedMarks = canonicalResult.earnedMarks;

  if (Number.isNaN(canonicalEarnedMarks)) {
    push(`canonical answer "${contract.canonicalAnswer}" produced NaN via the real scorer (tier: ${canonicalResult.tier}) -- this is exactly the Wave 2 Incident A failure mode`);
  } else if (canonicalResult.requiresSelfComparison) {
    push(`canonical answer routes to a self-comparison tier (${canonicalResult.tier}), which cannot be automatically verified as full marks -- an automatically-gradable tier (TIER1/TIER2/TIER4/TIER6, or LEGACY_HEURISTIC) must be used for a candidate this gate can certify`);
  } else if (canonicalEarnedMarks !== contract.marks) {
    push(`canonical answer "${contract.canonicalAnswer}" earned ${canonicalEarnedMarks}/${contract.marks} marks through the real scorer (tier: ${canonicalResult.tier}), not full marks -- this is exactly the Wave 2 Incident B failure mode (a well-formed answer the selected scorer cannot recognise)`);
  }

  // 4. Every approved variant must also earn full marks.
  for (const variant of contract.approvedVariants ?? []) {
    const variantResult = scoreEnglishComprehensionAnswer(variant, prompt, scoreEnglishAnswer);
    if (Number.isNaN(variantResult.earnedMarks) || variantResult.earnedMarks !== contract.marks) {
      push(`approved variant "${variant}" did not earn full marks (got ${variantResult.earnedMarks})`);
    }
  }

  // 5. A genuinely disjoint wrong answer must earn zero.
  const wrongResult = scoreEnglishComprehensionAnswer(contract.disjointWrongAnswer, prompt, scoreEnglishAnswer);
  if (wrongResult.earnedMarks !== 0) {
    push(`disjoint wrong answer "${contract.disjointWrongAnswer}" incorrectly earned ${wrongResult.earnedMarks} marks -- the scorer is accepting materially wrong content`);
  }

  // 6. Every plausible-wrong answer, where supplied, must also earn zero.
  for (const pw of contract.plausibleWrongAnswers ?? []) {
    const pwResult = scoreEnglishComprehensionAnswer(pw, prompt, scoreEnglishAnswer);
    if (pwResult.earnedMarks !== 0) {
      push(`plausible-wrong answer "${pw}" incorrectly earned ${pwResult.earnedMarks} marks -- the scorer is not discriminating a genuinely wrong-but-similar answer`);
    }
  }

  return {
    candidateId: contract.candidateId,
    valid: failures.length === 0,
    failures,
    canonicalEarnedMarks: Number.isNaN(canonicalEarnedMarks) ? null : canonicalEarnedMarks,
  };
}

/** Convenience batch runner -- validates many candidates, returns only the failing ones plus a summary count. */
export function validateEnglishMarkingContractBatch(contracts: EnglishMarkingContract[]): {
  total: number;
  passed: number;
  failed: number;
  failures: MarkingContractFailure[];
} {
  const results = contracts.map(validateEnglishMarkingContract);
  const failures = results.filter((r) => !r.valid).flatMap((r) => r.failures);
  return {
    total: results.length,
    passed: results.filter((r) => r.valid).length,
    failed: results.filter((r) => !r.valid).length,
    failures,
  };
}
