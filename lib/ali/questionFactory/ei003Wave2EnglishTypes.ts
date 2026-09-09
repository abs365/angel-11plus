/**
 * Educational Increment 003, Wave 2 — a clean, self-contained English
 * candidate/blueprint contract for the five target families
 * (wave3-fam-rc06-sequencing, rc07-comparative, rc08-emotion,
 * rc10-atmosphere-mood, rc10-word-choice).
 *
 * Deliberately NOT built on `lib/ali/questionFactory/englishTypes.ts` --
 * that file is part of the same pre-existing, untracked, entangled
 * "Wave 1 Controlled Content Manufacturing" cluster this programme's
 * Wave 1 gate already found and deliberately left alone (see
 * `mathsCandidateStoreMapping.ts`'s own module docstring for the
 * precedent this follows). Depending on it here would reintroduce the
 * exact "my new work only exists in an untracked file" problem that
 * gate closed. This file has zero import-time dependency on anything
 * untracked -- it can be committed on its own.
 *
 * English candidate "generation" is inherently hand-authored, not
 * parametric (there is no formula for "sample a passage") -- this
 * mirrors that reality honestly: a blueprint here is a reasoning-pattern
 * DESCRIPTION (what kind of evidence/reasoning this demand requires),
 * and a candidate is one concrete, hand-written question against one
 * real passage's real text, with its evidence independently checkable
 * against that text.
 */

export type Wave2ReasoningRoute =
  | "explicit_chronology"
  | "dispersed_chronology"
  | "causal_ordering"
  | "compare_reactions"
  | "compare_across_time"
  | "compare_settings"
  | "similarity_and_difference"
  | "inferred_from_action"
  | "inferred_from_dialogue"
  | "emotion_arc"
  | "conflicting_evidence"
  | "single_sensory_atmosphere"
  | "accumulated_atmosphere"
  | "atmosphere_change"
  | "atmosphere_character_contrast"
  | "meaning_in_context"
  | "word_substitution_rationale"
  | "connotation_interpretation"
  | "word_choice_to_atmosphere";

export type Wave2Family =
  | "wave3-fam-rc06-sequencing"
  | "wave3-fam-rc07-comparative"
  | "wave3-fam-rc08-emotion"
  | "wave3-fam-rc10-atmosphere-mood"
  | "wave3-fam-rc10-word-choice";

export const WAVE2_FAMILY_SKILL: Record<Wave2Family, string> = {
  "wave3-fam-rc06-sequencing": "QT-RC-06",
  "wave3-fam-rc07-comparative": "QT-RC-07",
  "wave3-fam-rc08-emotion": "QT-RC-08",
  "wave3-fam-rc10-atmosphere-mood": "QT-RC-10",
  "wave3-fam-rc10-word-choice": "QT-RC-10",
};

/** A named, genuinely distinct reasoning-pattern blueprint within one family. */
export interface Wave2Blueprint {
  blueprintId: string;
  familyId: Wave2Family;
  reasoningRoute: Wave2ReasoningRoute;
  /** What real cognitive demand this blueprint tests, distinct from its siblings -- never "same shape, different passage." */
  demand: string;
  /** Foundation | Development | Independent | Transfer | Far Transfer, per this wave's own ladder. */
  stage: "FOUNDATION" | "DEVELOPMENT" | "INDEPENDENT" | "TRANSFER" | "FAR_TRANSFER";
}

/** One hand-authored candidate: one blueprint, applied to one real passage, with independently-checkable evidence. */
export interface Wave2Candidate {
  candidateId: string;
  blueprintId: string;
  familyId: Wave2Family;
  passageId: string;
  difficulty: "easy" | "medium" | "hard" | "challenge";
  question: string;
  /** The exact accepted answer forms -- a learner's answer is scored via the SAME TIER-appropriate contract the existing English families already use (paraphrase-tolerant token/phrase matching), never a single rigid string. */
  acceptedAnswers: string[];
  /** The exact substring(s) from the passage's own real text that ground this answer -- independently verified against the passage, never asserted without a quotable anchor. */
  evidenceQuotes: string[];
  explanationGuidance: string;
  distractorRationale?: string;
}
