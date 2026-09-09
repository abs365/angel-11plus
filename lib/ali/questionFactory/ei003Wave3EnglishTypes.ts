/**
 * Educational Increment 003, Wave 3 — a clean, self-contained English
 * candidate/blueprint contract for the four target families
 * (wave3-fam-rc01-retrieval, wave1-fam-comparative-extraction,
 * wave1-fam-motive-inference, wave1-fam-effect-of-language).
 *
 * Deliberately NOT built on `lib/ali/questionFactory/englishTypes.ts` --
 * that file is part of the pre-existing, untracked, entangled "Wave 1
 * Controlled Content Manufacturing" cluster this programme has
 * deliberately left alone since Wave 1's own gate (see
 * `ei003Wave2EnglishTypes.ts`'s own docstring for the precedent this
 * follows). This file has zero import-time dependency on anything
 * untracked -- it can be committed on its own.
 *
 * Unlike Wave 2's five families, these four are PRE-EXISTING production
 * families with their own already-live content, real skill codes, and
 * an established `marks` convention this wave preserves rather than
 * invents: `wave3-fam-rc01-retrieval` is a 1-mark, single-fact-retrieval
 * family; the other three are 2-mark, fuller-explanation families. Every
 * new Wave 3 candidate matches its own family's existing mark value, not
 * a new one.
 */

export type Wave3ReasoningRoute =
  | "explicit_single_detail"
  | "distinguish_from_distractor"
  | "combine_two_details"
  | "retrieve_across_distance"
  | "single_character_before_after"
  | "compare_two_characters_reaction"
  | "compare_settings_or_descriptions"
  | "similarity_and_difference"
  | "motive_from_direct_action"
  | "motive_from_dialogue"
  | "motive_weighing_two_reasons"
  | "motive_shift_across_passage"
  | "single_figurative_effect"
  | "meaning_in_context"
  | "word_substitution_rationale"
  | "cumulative_word_choice_pattern";

export type Wave3Family =
  | "wave3-fam-rc01-retrieval"
  | "wave1-fam-comparative-extraction"
  | "wave1-fam-motive-inference"
  | "wave1-fam-effect-of-language";

export const WAVE3_FAMILY_SKILL: Record<Wave3Family, string> = {
  "wave3-fam-rc01-retrieval": "QT-RC-01",
  "wave1-fam-comparative-extraction": "QT-RC-07",
  "wave1-fam-motive-inference": "QT-RC-02",
  "wave1-fam-effect-of-language": "QT-RC-10",
};

/** Matches each family's own existing, live production convention -- never a new value invented for this wave. */
export const WAVE3_FAMILY_MARKS: Record<Wave3Family, number> = {
  "wave3-fam-rc01-retrieval": 1,
  "wave1-fam-comparative-extraction": 2,
  "wave1-fam-motive-inference": 2,
  "wave1-fam-effect-of-language": 2,
};

/** A named, genuinely distinct reasoning-pattern blueprint within one family. */
export interface Wave3Blueprint {
  blueprintId: string;
  familyId: Wave3Family;
  reasoningRoute: Wave3ReasoningRoute;
  /** What real cognitive demand this blueprint tests, distinct from its siblings -- never "same shape, different passage." */
  demand: string;
  /** Foundation | Development | Independent | Transfer, per this wave's own ladder. */
  stage: "FOUNDATION" | "DEVELOPMENT" | "INDEPENDENT" | "TRANSFER";
}

/**
 * One hand-authored candidate: one blueprint, applied to one real,
 * ALREADY-LIVE passage (these four families reuse Wave 1's/Wave 3
 * retrieval's own existing passage pool -- no new passages are minted
 * by this wave), with independently-checkable evidence.
 */
export interface Wave3Candidate {
  candidateId: string;
  blueprintId: string;
  familyId: Wave3Family;
  /** The real, already-live ali_passage_bank id this candidate's evidence is checked against. */
  passageId: string;
  difficulty: "easy" | "medium" | "hard" | "challenge";
  question: string;
  /** The exact accepted answer forms -- scored via the family's own existing TIER2_ACCEPTED_SET contract. */
  acceptedAnswers: string[];
  /** The exact substring(s) from the passage's own real text that ground this answer -- independently verified against the passage. */
  evidenceQuotes: string[];
  explanationGuidance: string;
  distractorRationale?: string;
}
