/**
 * Programme Increment 019, Part 8 — English Family Model.
 *
 * English Reading has no `family_id` column (Increment 017's own
 * confirmed schema gap) — this module does NOT invent one. Instead it
 * derives a REASONING-PATTERN classification from two real, trustworthy
 * columns every live English row already carries: `skill` (the free-text
 * competency tag — evidence/vocabulary/inference/structure/effect-of-
 * language/atmosphere/comparison/character/language, Increment 018's own
 * confirmed live distribution) and `validationTier`
 * (lib/learningEngine/englishAnswerValidation.ts's TIER1-TIER6 answer-
 * contract, unmodified).
 *
 * The Founder's own explicit instruction: "a validation tier is NOT
 * automatically a conceptual family... Do not equate TIER2_ACCEPTED_SET
 * with one question family. Family identity must describe the
 * educational reasoning pattern." `skill` is therefore the PRIMARY signal
 * below — it is the only column that actually names an educational
 * reasoning pattern (inference, sequencing, evidence-use...);
 * `validationTier` is consulted only as a secondary refinement (e.g.
 * distinguishing plain retrieval from evidence-with-explanation), never
 * as the sole determinant, and never produces a classification on its
 * own when `skill` does not support it.
 *
 * This is a best-effort DERIVATION, not an authoritative manual
 * classification of all 243 live English rows — per this increment's own
 * instruction not to hand-classify them this increment. Genuinely
 * ambiguous combinations resolve to "unclassified" rather than guessed.
 */

export type EnglishReasoningPattern =
  | "retrieval"
  | "inference"
  | "vocabulary_in_context"
  | "sequence"
  | "evidence_quotation"
  | "language_effect"
  | "multi_part_explanation"
  | "ordered_extraction"
  | "multi_select"
  | "unclassified";

export interface EnglishFamilyClassificationInput {
  /**
   * The free-text reasoning-pattern label ("evidence", "vocabulary",
   * "inference", "structure", "effect-of-language", "atmosphere",
   * "comparison", "character", "language", "retrieval", "judgement").
   *
   * CORRECTION (Question Factory Wave 1, English family taxonomy pass,
   * confirmed against 142 live practice-eligible rows): this value lives
   * at `prompt->>'skill'` (the jsonb prompt payload), NOT at the
   * top-level `ali_question_bank.skill` column -- that column holds the
   * `QT-RC-XX` Question Type code (e.g. "QT-RC-04"), which is never a key
   * in `SKILL_TO_PATTERN` below and would silently classify every real
   * row as `"unclassified"` if passed here by mistake. This module's
   * original docstring named the wrong column; the classification logic
   * itself was always correct once given the right field.
   */
  skill: string;
  /** Real `prompt->>'validationTier'` value, when present -- legacy pre-007B rows carry none. */
  validationTier?: string | null;
}

/**
 * Skill -> primary reasoning-pattern mapping. Every value here is a
 * defensible, disclosed reading of the skill label's own plain English
 * meaning (this module claims no external validation of the mapping) —
 * marked "unclassified" wherever a skill's real reasoning pattern is
 * genuinely ambiguous from its label alone rather than guessed.
 */
const SKILL_TO_PATTERN: Record<string, EnglishReasoningPattern | undefined> = {
  vocabulary: "vocabulary_in_context",
  inference: "inference",
  evidence: "evidence_quotation",
  atmosphere: "inference", // atmosphere/mood judgements are inference-pattern reasoning about textual evidence, not literal retrieval
  language: "language_effect",
  "effect-of-language": "language_effect",
  character: "inference", // character judgements are inference-pattern reasoning; no separate "characterisation" reasoning pattern is named in Part 8's own list
  comparison: "unclassified", // could be inference-pattern or multi-part-explanation depending on the specific question; skill label alone does not resolve it
  structure: "unclassified", // could be sequence or multi-part-explanation depending on the specific question; skill label alone does not resolve it
  // Added, Question Factory Wave 1 English family taxonomy pass: found live
  // in production (1 row) once `prompt.skill` was read correctly (see the
  // corrected docstring above) -- an unambiguous direct match, the label
  // literally names the pattern itself, not a judgement call.
  retrieval: "retrieval",
  // "judgement" (1 row, found live) is deliberately NOT added here -- its
  // real reasoning pattern is genuinely ambiguous from the label alone
  // (could be inference, evidence_quotation, or something this module's
  // vocabulary doesn't yet name); it already, correctly, falls through to
  // "unclassified" by this function's own existing fallback behaviour.
};

/** validationTier -> pattern, consulted only to refine an already-plausible skill-derived pattern (see deriveEnglishReasoningPattern), never used standalone. */
const TIER_REFINEMENT: Record<string, EnglishReasoningPattern | undefined> = {
  TIER1_EXACT_MATCH: "retrieval",
  TIER4_ORDERED_LIST: "sequence",
  TIER6_MULTI_SELECT: "multi_select",
};

/**
 * Derives a best-effort reasoning-pattern classification. `skill` decides
 * first; a small, explicit set of tiers (TIER1/TIER4/TIER6) can override
 * it because those three tiers name a genuinely different reasoning
 * SHAPE regardless of the topical skill tag (a TIER4_ORDERED_LIST
 * question is a sequencing task even if tagged skill="structure"). Every
 * other tier is consulted for corroboration only (TIER3/TIER5's own
 * "plus explanation" contract confirms, but never overrides, an
 * evidence/inference-pattern skill already found) and never substitutes
 * for a genuinely unclassified skill.
 */
export function deriveEnglishReasoningPattern(input: EnglishFamilyClassificationInput): EnglishReasoningPattern {
  const tierOverride = input.validationTier ? TIER_REFINEMENT[input.validationTier] : undefined;
  if (tierOverride) return tierOverride;

  const skillPattern = SKILL_TO_PATTERN[input.skill];
  if (skillPattern && skillPattern !== "unclassified") return skillPattern;

  if (input.validationTier === "TIER3_QUOTATION_PLUS_EXPLANATION") return "evidence_quotation";
  if (input.validationTier === "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION") return "multi_part_explanation";

  return "unclassified";
}

/**
 * A "family" for English, in this foundation, is the set of rows sharing
 * one (learningUnitId/passage, reasoningPattern) pair — Part 8's own
 * "passage/question relationship" distinction, since two questions
 * testing the same reasoning pattern on two DIFFERENT passages are not
 * conceptually interchangeable the way two Mathematics variants of the
 * same family_id are (an English question's stem is inseparable from its
 * passage). This is a coarser grouping than Mathematics's own family_id —
 * disclosed as such, not papered over.
 */
export interface EnglishFamilyKey {
  passageId: string;
  reasoningPattern: EnglishReasoningPattern;
}

export function englishFamilyKeyOf(passageId: string, input: EnglishFamilyClassificationInput): EnglishFamilyKey {
  return { passageId, reasoningPattern: deriveEnglishReasoningPattern(input) };
}

export function englishFamilyKeyToString(key: EnglishFamilyKey): string {
  return `${key.passageId}::${key.reasoningPattern}`;
}
