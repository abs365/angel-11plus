/**
 * Educational Increment 007C, Part 8 — Wrong-answer learning, extended
 * beyond multi-select. Classifies likely error patterns strictly from
 * what an EnglishScoringResult (lib/learningEngine/englishAnswerValidation.ts)
 * actually demonstrates, never inventing a diagnosis a tier's own scoring
 * mechanism cannot support.
 *
 * Two distinct sources, kept structurally separate so neither is
 * overstated as the other:
 *
 * - classifyAutomaticError(): for Tier 2/4/6 (automatically-verified
 *   tiers), where the scoring result itself contains enough structure to
 *   name a real, evidenced category (e.g. Tier 6's overSelected flag ->
 *   OVER_SELECTION is the literal fact the scorer computed, not a guess).
 *
 * - getSelfReflectionCategories(): for Tier 3/5 (self-assessed tiers),
 *   where Angel cannot verify correctness at all. These are offered to the
 *   LEARNER as a bounded checklist for their own self-reflection after
 *   comparing their answer to the model answer — never presented as
 *   something Angel detected or diagnosed automatically.
 */

import type { EnglishScoringResult } from "./englishAnswerValidation";

export type WrongAnswerCategory =
  | "EVIDENCE_NOT_LOCATED"
  | "UNSUPPORTED_INFERENCE"
  | "WEAK_QUOTATION"
  | "EXPLANATION_MISMATCH"
  | "SEQUENCE_ERROR"
  | "VOCABULARY_CONTEXT_ERROR"
  | "OVER_SELECTION"
  | "UNDER_SELECTION"
  | "CHARACTER_COMPARISON_WITHOUT_EVIDENCE";

export const WRONG_ANSWER_CATEGORY_LABEL: Record<WrongAnswerCategory, string> = {
  EVIDENCE_NOT_LOCATED: "The evidence needed wasn't found in your answer.",
  UNSUPPORTED_INFERENCE: "Your answer goes beyond what the passage actually states.",
  WEAK_QUOTATION: "The quotation doesn't quite match the exact words in the passage.",
  EXPLANATION_MISMATCH: "Your explanation doesn't clearly connect to the quotation you gave.",
  SEQUENCE_ERROR: "The right things are there, but not in the right order.",
  VOCABULARY_CONTEXT_ERROR: "This isn't quite the right meaning for how the word is used here.",
  OVER_SELECTION: "You ticked more boxes than the question asked for.",
  UNDER_SELECTION: "You didn't tick all of the correct boxes.",
  CHARACTER_COMPARISON_WITHOUT_EVIDENCE: "Your answer doesn't yet give separate evidence for both people or characters.",
};

const VOCAB_FAMILIES = new Set(["wave1-fam-vocab-explain", "wave1-fam-synonym-battery"]);

/**
 * Derives categories ONLY from tiers whose own scoring mechanism actually
 * demonstrates the pattern claimed. Returns [] where the tier's structure
 * genuinely cannot support a specific claim beyond "incorrect" — silence
 * is the honest answer there, not a fabricated fallback category.
 */
export function classifyAutomaticError(result: EnglishScoringResult, familyId?: string | null): WrongAnswerCategory[] {
  if (result.tier === "TIER6_MULTI_SELECT" && result.multiSelectDetail) {
    const d = result.multiSelectDetail;
    if (d.overSelected) return ["OVER_SELECTION"];
    if (d.correctCount < d.requiredCount) return ["UNDER_SELECTION"];
    return [];
  }

  if (result.tier === "TIER4_ORDERED_LIST" && result.sequenceDetail) {
    const d = result.sequenceDetail;
    // A real, evidenced distinction only the sequencer's own count comparison
    // can support: if fewer items were supplied than positions exist, at
    // least some evidence was never located at all; if all positions were
    // attempted but marks fell short, the likely pattern is ordering, not
    // missing evidence — this mirrors the real CSSE mark scheme's own
    // worked example (Tier 4's docstring) of correct-but-misordered items.
    if (d.marks === 0 && d.totalPositions > 0) return ["EVIDENCE_NOT_LOCATED"];
    if (d.marks > 0 && d.marks < d.totalPositions) return ["SEQUENCE_ERROR"];
    return [];
  }

  if (result.tier === "TIER2_ACCEPTED_SET" && result.earnedMarks === 0 && familyId && VOCAB_FAMILIES.has(familyId)) {
    return ["VOCABULARY_CONTEXT_ERROR"];
  }

  return [];
}

const SELF_REFLECTION_CATEGORIES: Partial<Record<string, WrongAnswerCategory[]>> = {
  "wave1-fam-two-character": ["CHARACTER_COMPARISON_WITHOUT_EVIDENCE", "WEAK_QUOTATION"],
  "wave1-fam-quote-explain": ["WEAK_QUOTATION", "EXPLANATION_MISMATCH"],
  "wave1-fam-emotion-cause": ["EVIDENCE_NOT_LOCATED", "UNSUPPORTED_INFERENCE"],
};

/**
 * For Tier 3/5 self-assessed answers, offered to the LEARNER as a bounded
 * checklist for their own reflection once they've compared their answer to
 * the model answer — Angel never claims to have detected these itself,
 * since it structurally cannot verify a free-text explanation (see
 * englishAnswerValidation.ts's module docstring).
 */
export function getSelfReflectionCategories(familyId?: string | null): WrongAnswerCategory[] {
  if (!familyId) return [];
  return SELF_REFLECTION_CATEGORIES[familyId] ?? [];
}
