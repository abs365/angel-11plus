import type { EnglishStructuralBlueprint, EnglishQuestionCandidate } from "./englishTypes";
import { LIGHTHOUSE_PASSAGE, RECYCLED_PAPER_PASSAGE, KITE_FESTIVAL_PASSAGE, PENGUIN_PASSAGE } from "./englishPassages";

const NOW = new Date().toISOString();

/**
 * Candidate Store Submission Gate, Section 4 — Language Effect / Word
 * Choice family, RE-HOMED here from `englishVocabularyFamily.ts`'s
 * `VOC_BP_EFFECT_OF_CHOICE`.
 *
 * The Final Bounded Educational Recalibration independently re-derived
 * (not merely re-stated) that this blueprint's own declared objective --
 * "Explain WHY the author chose this specific word rather than a
 * plainer alternative -- connects vocabulary choice to authorial
 * effect" -- and all 4 of its built candidates (specific word/phrase ->
 * connotation/effect -> author's choice -> impact on image/meaning) test
 * the SAME reasoning demand the pre-existing "Language Effect / Word
 * Choice" educational family already exists for
 * (`wave3-fam-rc10-word-choice` + `wave1-fam-effect-of-language`,
 * `lib/ali/familyTaxonomy.ts`) -- NOT the context-decoding demand
 * ("context -> clues -> intended meaning -> check fit") that defines
 * Vocabulary/Meaning-in-Context's other blueprints. The Founder has now
 * approved this consolidation.
 *
 * This is a TAXONOMY correction, not new content: the blueprintId,
 * every candidate's id/content/passage/answers, and provenance are
 * UNCHANGED from their original authoring -- only `familyName` (on the
 * blueprint and its 4 candidates) and their file location moved. No
 * historical database family_id is affected -- this blueprint was never
 * tied to one (it is Increment 002 factory content, unpublished), so
 * unlike the Motive Inference consolidation there is no
 * `memberDatabaseFamilyIds` entry to preserve or edit.
 *
 * Deliberately NOT scaled to the usual 4-8-blueprint depth target this
 * pass -- "Language Effect / Word Choice" was never one of Increment
 * 002's 5 deliberately-selected factory families; re-homing one
 * mis-classified blueprint is a correction, not new family
 * construction, and generating further blueprints here is out of this
 * bounded gate's scope (no mass generation).
 */
export const LE_BP_EFFECT_OF_CHOICE: EnglishStructuralBlueprint = {
  blueprintId: "eng-voc-bp-effect-of-choice",
  familyName: "Language Effect / Word Choice",
  competencyId: "RC-03",
  questionTypeId: "QT-RC-03",
  reasoningPattern: "vocabulary_in_context",
  validationTier: "TIER2_ACCEPTED_SET",
  validationCategory: "evidence_anchored",
  responseType: "short_answer",
  educationalObjective: "Explain WHY the author chose this specific word rather than a plainer alternative -- connects a specific word/phrase choice to its connotation/effect and impact on meaning or image, a genuinely different demand from decoding an unfamiliar word's meaning from context (Vocabulary / Meaning in Context).",
  difficultyDimensions: ["subtlety_of_connotation_difference"],
  teachingUses: ["scaffolded_practice", "transfer"],
  provenance: "angel_original",
};

export const ENGLISH_LANGUAGE_EFFECT_BLUEPRINTS: EnglishStructuralBlueprint[] = [LE_BP_EFFECT_OF_CHOICE];

export const ENGLISH_LANGUAGE_EFFECT_CANDIDATES: EnglishQuestionCandidate[] = [
  {
    candidateId: "eng-voc-13", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: LE_BP_EFFECT_OF_CHOICE.blueprintId, familyName: "Language Effect / Word Choice",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "Why might the author have chosen the word 'streaked' rather than simply 'dirty' to describe the glass walls?",
    responseType: "short_answer", acceptedAnswers: ["'streaked' suggests long, thin marks left by salt over time, a more specific and vivid image than just 'dirty'"],
    evidenceLocation: "paragraph 3", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-14", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: LE_BP_EFFECT_OF_CHOICE.blueprintId, familyName: "Language Effect / Word Choice",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "Why might the author have chosen 'tightened' rather than 'hurt' to describe Ravi's stomach?",
    responseType: "short_answer", acceptedAnswers: ["'tightened' suggests a feeling of nervousness building up, which is more precise than a general word like 'hurt'"],
    evidenceLocation: "paragraph 2", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-15", passageId: PENGUIN_PASSAGE.passageId, blueprintId: LE_BP_EFFECT_OF_CHOICE.blueprintId, familyName: "Language Effect / Word Choice",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "Why might the author have chosen 'plunge' rather than 'go down' to describe how temperatures fall?",
    responseType: "short_answer", acceptedAnswers: ["'plunge' suggests a sudden, dramatic drop, emphasising how extreme the temperature change is"],
    evidenceLocation: "paragraph 1", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-16", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: LE_BP_EFFECT_OF_CHOICE.blueprintId, familyName: "Language Effect / Word Choice",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "Why might the author have chosen 'soupy' rather than 'wet' to describe the pulp mixture?",
    responseType: "short_answer", acceptedAnswers: ["'soupy' gives a more specific, vivid image of a thick liquid mixture than a plain word like 'wet'"],
    evidenceLocation: "paragraph 2", difficulty: "medium", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
];
