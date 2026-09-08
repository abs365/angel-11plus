import type { EnglishStructuralBlueprint, EnglishQuestionCandidate } from "./englishTypes";
import { LIGHTHOUSE_PASSAGE, RECYCLED_PAPER_PASSAGE, KITE_FESTIVAL_PASSAGE, PENGUIN_PASSAGE } from "./englishPassages";

/**
 * Controlled Scale Increment 002 — English Factory, Vocabulary / Meaning
 * in Context family.
 *
 * RC-03 ("Word/Phrase Meaning-in-Context Explanation"), QT-RC-03. Every
 * candidate's target word/phrase is independently confirmed present in
 * its source passage by `verifyTargetWordEvidenced` -- but per
 * `EnglishValidationCategory`'s own honest definition, the semantic
 * correctness of the claimed MEANING is evidence_anchored, not
 * deterministic: no formula can confirm "glum is a correct explanation
 * of downcast here" the way a passage-text search can confirm a fact is
 * stated. Five genuinely distinct demands, matching
 * ENGLISH_MEANING_IN_CONTEXT_CONTRACT's own stage sequence: explaining a
 * single word, explaining a multi-word phrase (a different lexical
 * unit), resolving a polysemous word's CONTEXTUALLY correct sense,
 * connecting a word choice to authorial effect, and identifying the
 * CONTEXTUAL_CLUE itself rather than the meaning it points to.
 */

const NOW = new Date().toISOString();

export const VOC_BP_EXPLAIN_MEANING: EnglishStructuralBlueprint = {
  blueprintId: "eng-voc-bp-explain-meaning",
  familyName: "Vocabulary / Meaning in Context",
  competencyId: "RC-03",
  questionTypeId: "QT-RC-03",
  reasoningPattern: "vocabulary_in_context",
  validationTier: "TIER2_ACCEPTED_SET",
  validationCategory: "evidence_anchored",
  responseType: "short_answer",
  educationalObjective: "Explain what a single target word means as used in its specific sentence.",
  difficultyDimensions: ["word_familiarity", "context_richness_of_surrounding_sentence"],
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
  provenance: "angel_original",
};

export const VOC_BP_EXPLAIN_PHRASE: EnglishStructuralBlueprint = {
  blueprintId: "eng-voc-bp-explain-phrase",
  familyName: "Vocabulary / Meaning in Context",
  competencyId: "RC-03",
  questionTypeId: "QT-RC-03",
  reasoningPattern: "vocabulary_in_context",
  validationTier: "TIER2_ACCEPTED_SET",
  validationCategory: "evidence_anchored",
  responseType: "short_answer",
  educationalObjective: "Explain a multi-word figurative phrase, not a single word -- a genuinely different lexical unit and reasoning demand from single-word meaning.",
  difficultyDimensions: ["figurative_vs_literal_language"],
  teachingUses: ["scaffolded_practice", "transfer"],
  provenance: "angel_original",
};

export const VOC_BP_CONTRASTING_CONTEXT: EnglishStructuralBlueprint = {
  blueprintId: "eng-voc-bp-contrasting-context",
  familyName: "Vocabulary / Meaning in Context",
  competencyId: "RC-03",
  questionTypeId: "QT-RC-03",
  reasoningPattern: "vocabulary_in_context",
  validationTier: "TIER2_ACCEPTED_SET",
  validationCategory: "evidence_anchored",
  responseType: "short_answer",
  educationalObjective: "Resolve which of a polysemous word's several meanings is the one genuinely intended here, and justify the choice from context -- targets the specific misconception of applying a word's most common everyday sense regardless of context.",
  difficultyDimensions: ["number_of_plausible_alternate_senses"],
  misconceptionTargeted: "applying a word's most common everyday meaning without checking whether it actually fits the surrounding context",
  teachingUses: ["explicit_teaching", "mastery_check"],
  provenance: "angel_original",
};

export const VOC_BP_CONTEXT_CLUE_IDENTIFICATION: EnglishStructuralBlueprint = {
  blueprintId: "eng-voc-bp-context-clue-identification",
  familyName: "Vocabulary / Meaning in Context",
  competencyId: "RC-03",
  questionTypeId: "QT-RC-03",
  reasoningPattern: "vocabulary_in_context",
  validationTier: "TIER2_ACCEPTED_SET",
  validationCategory: "evidence_anchored",
  responseType: "short_answer",
  educationalObjective: "Identify the specific CLUE that helps establish a word's meaning -- ENGLISH_MEANING_IN_CONTEXT_CONTRACT's own CONTEXTUAL_CLUE stage -- a different unknown position from stating the meaning itself.",
  difficultyDimensions: ["clue_distance_from_target_word"],
  teachingUses: ["guided_practice", "independent_practice"],
  provenance: "angel_original",
};

export const ENGLISH_VOCABULARY_BLUEPRINTS: EnglishStructuralBlueprint[] = [
  VOC_BP_EXPLAIN_MEANING,
  VOC_BP_EXPLAIN_PHRASE,
  VOC_BP_CONTRASTING_CONTEXT,
  VOC_BP_CONTEXT_CLUE_IDENTIFICATION,
];

export const ENGLISH_VOCABULARY_CANDIDATES: EnglishQuestionCandidate[] = [
  // VOC_BP_EXPLAIN_MEANING
  {
    candidateId: "eng-voc-01", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: VOC_BP_EXPLAIN_MEANING.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "What does 'dizzying' mean as used in 'The staircase wound upward in tight, dizzying loops'?",
    responseType: "short_answer", acceptedAnswers: ["making you feel dizzy or confused from spinning/turning", "causing a spinning, disorientating feeling"],
    evidenceLocation: "paragraph 2", difficulty: "medium", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-02", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: VOC_BP_EXPLAIN_MEANING.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "What does 'contaminants' mean as used in 'removes staples, plastic film, and other contaminants'?",
    responseType: "short_answer", acceptedAnswers: ["unwanted or harmful substances that make something impure", "things that dirty or spoil something"],
    evidenceLocation: "paragraph 3", difficulty: "medium", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-03", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: VOC_BP_EXPLAIN_MEANING.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "What does 'elaborate' mean as used in 'compared his simple diamond shape to the elaborate creations soaring above him'?",
    responseType: "short_answer", acceptedAnswers: ["detailed and complicated", "very fancy and detailed"],
    evidenceLocation: "paragraph 2", difficulty: "easy", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-04", passageId: PENGUIN_PASSAGE.passageId, blueprintId: VOC_BP_EXPLAIN_MEANING.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "What does 'conserve' mean as used in 'To conserve warmth during this period'?",
    responseType: "short_answer", acceptedAnswers: ["to save or keep something from being used up", "to keep or protect"],
    evidenceLocation: "paragraph 4", difficulty: "medium", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  // VOC_BP_EXPLAIN_PHRASE
  {
    candidateId: "eng-voc-05", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: VOC_BP_EXPLAIN_PHRASE.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "What does the phrase 'ships have been lost for less' suggest about the importance of checking the lamp?",
    responseType: "short_answer", acceptedAnswers: ["even a small mistake could cause a ship to be lost or wrecked", "a small oversight has been serious enough to cause disaster before"],
    evidenceLocation: "paragraph 4", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-06", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: VOC_BP_EXPLAIN_PHRASE.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "What does the comparison 'trailing behind him like a confused kitten chasing its own tail' suggest about the boy's kite string?",
    responseType: "short_answer", acceptedAnswers: ["the string was tangled and moving in a messy, confused way", "it was chaotic and out of control"],
    evidenceLocation: "paragraph 2", difficulty: "medium", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-07", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: VOC_BP_EXPLAIN_PHRASE.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "What does 'the end of the line' mean in 'emerging at the end of the line as fresh, usable paper'?",
    responseType: "short_answer", acceptedAnswers: ["the final stage of the process", "the last step"],
    evidenceLocation: "paragraph 4", difficulty: "medium", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-08", passageId: PENGUIN_PASSAGE.passageId, blueprintId: VOC_BP_EXPLAIN_PHRASE.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "What does 'a feat of vocal memory' suggest about the female penguins' ability to find their chicks?",
    responseType: "short_answer", acceptedAnswers: ["an impressive or remarkable achievement of remembering sounds", "a difficult accomplishment involving memory of sound"],
    evidenceLocation: "paragraph 5", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  // VOC_BP_CONTRASTING_CONTEXT
  {
    candidateId: "eng-voc-09", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: VOC_BP_CONTRASTING_CONTEXT.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "The word 'beam' is used to describe the lighthouse's light. 'Beam' can also mean a long piece of wood or metal. Which meaning is used here, and how do you know?",
    responseType: "short_answer", acceptedAnswers: ["a ray or shaft of light, because it is described being seen for twenty miles out to sea", "light -- because a piece of wood could not be seen for twenty miles"],
    evidenceLocation: "paragraph 3", difficulty: "hard", teachingUses: ["explicit_teaching", "mastery_check"],
    misconceptionTargeted: "applying a word's most common everyday meaning without checking whether it actually fits the surrounding context",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-10", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: VOC_BP_CONTRASTING_CONTEXT.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "The word 'spool' is used in 'let the string spool out further'. 'Spool' can also mean the small reel thread is wound around. Which meaning fits here?",
    responseType: "short_answer", acceptedAnswers: ["to unwind or let out gradually, because it describes the string being released, not an object", "the action of letting string out, not the reel itself"],
    evidenceLocation: "paragraph 3", difficulty: "hard", teachingUses: ["explicit_teaching", "mastery_check"],
    misconceptionTargeted: "applying a word's most common everyday meaning without checking whether it actually fits the surrounding context",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-11", passageId: PENGUIN_PASSAGE.passageId, blueprintId: VOC_BP_CONTRASTING_CONTEXT.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    // Increment 002 Revision, Section 3 -- replaces the original "march"
    // target, which calibration found was disambiguable via
    // capitalisation alone ("march" the verb vs "March" the month) with
    // no genuine reading required. "call" has no such shortcut: every
    // plausible sense (a vocal cry, a phone call, a decision) is
    // written identically in lower case, so only reading the actual
    // surrounding context ("vocal memory", "recognising... among
    // thousands of near-identical birds") resolves it.
    question: "The word 'call' is used in 'recognising the unique call each pair has developed'. 'Call' can also mean a phone conversation, or a difficult decision someone has to make. Which meaning is used here, and how do you know?",
    responseType: "short_answer", acceptedAnswers: ["a vocal sound or cry the penguins make, because the sentence links it to vocal memory and recognising sounds among many birds", "a sound/cry -- the passage is about penguins recognising each other by sound, not a telephone or a decision"],
    evidenceLocation: "paragraph 5", difficulty: "medium", teachingUses: ["explicit_teaching", "mastery_check"],
    misconceptionTargeted: "applying a word's most common everyday meaning without checking whether it actually fits the surrounding context",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-12", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: VOC_BP_CONTRASTING_CONTEXT.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "The word 'grades' is used in 'sorted... into different grades'. 'Grade' can also mean a school year or a test mark. Which meaning fits here?",
    responseType: "short_answer", acceptedAnswers: ["a category or quality classification, because the passage is about sorting types of paper, not school", "a type/category of paper, not a mark or year group"],
    evidenceLocation: "paragraph 2", difficulty: "medium", teachingUses: ["explicit_teaching", "mastery_check"],
    misconceptionTargeted: "applying a word's most common everyday meaning without checking whether it actually fits the surrounding context",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  // VOC_BP_CONTEXT_CLUE_IDENTIFICATION
  {
    candidateId: "eng-voc-17", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: VOC_BP_CONTEXT_CLUE_IDENTIFICATION.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "Which words in the sentence help you work out that 'dizzying' means confusing or unsteady?",
    responseType: "short_answer", acceptedAnswers: ["tight loops", "the tight, repeated turning of the staircase"],
    evidenceLocation: "paragraph 2", difficulty: "medium", teachingUses: ["guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-18", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: VOC_BP_CONTEXT_CLUE_IDENTIFICATION.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "Which part of the sentence helps you work out what a 'pulper' does?",
    responseType: "short_answer", acceptedAnswers: ["breaks it down into a thick, soupy mixture known as pulp"],
    evidenceLocation: "paragraph 2", difficulty: "easy", teachingUses: ["guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-19", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: VOC_BP_CONTEXT_CLUE_IDENTIFICATION.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "Which words help you work out that 'elaborate' means detailed or fancy?",
    responseType: "short_answer", acceptedAnswers: ["simple diamond shape", "compared his simple diamond shape"],
    evidenceLocation: "paragraph 2", difficulty: "medium", teachingUses: ["guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-voc-20", passageId: PENGUIN_PASSAGE.passageId, blueprintId: VOC_BP_CONTEXT_CLUE_IDENTIFICATION.blueprintId, familyName: "Vocabulary / Meaning in Context",
    competencyId: "RC-03", questionTypeId: "QT-RC-03",
    question: "Which part of the sentence helps you work out what 'incubate' means?",
    responseType: "short_answer", acceptedAnswers: ["beneath a warm fold of skin", "surviving entirely on stored body fat"],
    evidenceLocation: "paragraph 3", difficulty: "medium", teachingUses: ["guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
];
