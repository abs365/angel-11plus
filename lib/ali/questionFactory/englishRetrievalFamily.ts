import type { EnglishStructuralBlueprint, EnglishQuestionCandidate } from "./englishTypes";
import { LIGHTHOUSE_PASSAGE, RECYCLED_PAPER_PASSAGE, KITE_FESTIVAL_PASSAGE, PENGUIN_PASSAGE } from "./englishPassages";

/**
 * Controlled Scale Increment 002 — English Factory, Retrieval family.
 *
 * RC-01 ("Literal Retrieval from Narrative Text"), QT-RC-01. Every
 * candidate's `acceptedAnswers` was verified present verbatim in its
 * source passage before being written here (and is re-verified
 * mechanically by `verifyRetrievalEvidenced`, never merely trusted).
 * Five genuinely distinct demands, not five wordings of "find a fact":
 * a direct single-fact lookup, discriminating the RIGHT nearby detail
 * from a similar-looking one, a number/quantity lookup (a different
 * answer shape), a fact requiring two adjacent sentences (not one), and
 * a negative-condition lookup ("what does NOT happen").
 */

const NOW = new Date().toISOString();

export const RET_BP_DIRECT_FACT: EnglishStructuralBlueprint = {
  blueprintId: "eng-ret-bp-direct-fact",
  familyName: "Retrieval",
  competencyId: "RC-01",
  questionTypeId: "QT-RC-01",
  reasoningPattern: "retrieval",
  validationTier: "TIER2_ACCEPTED_SET",
  validationCategory: "deterministic",
  responseType: "short_answer",
  educationalObjective: "Locate and state a single fact that is explicitly, literally stated in the passage.",
  difficultyDimensions: ["evidence_distance_from_question_cue"],
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
  provenance: "angel_original",
};

export const RET_BP_DEFINING_DETAIL: EnglishStructuralBlueprint = {
  blueprintId: "eng-ret-bp-defining-detail",
  familyName: "Retrieval",
  competencyId: "RC-01",
  questionTypeId: "QT-RC-01",
  reasoningPattern: "retrieval",
  validationTier: "TIER2_ACCEPTED_SET",
  validationCategory: "deterministic",
  responseType: "short_answer",
  educationalObjective: "Distinguish the exact relevant detail from nearby, similar-looking distractor detail in the same passage region -- ENGLISH_RETRIEVAL_CONTRACT's own DISCRIMINATE_RELEVANT_EVIDENCE stage.",
  difficultyDimensions: ["distractor_detail_similarity"],
  teachingUses: ["scaffolded_practice", "mastery_check"],
  provenance: "angel_original",
};

export const RET_BP_NUMBER_QUANTITY: EnglishStructuralBlueprint = {
  blueprintId: "eng-ret-bp-number-quantity",
  familyName: "Retrieval",
  competencyId: "RC-01",
  questionTypeId: "QT-RC-01",
  reasoningPattern: "retrieval",
  validationTier: "TIER1_EXACT_MATCH",
  validationCategory: "deterministic",
  responseType: "short_answer",
  educationalObjective: "Retrieve a stated number or quantity -- a different, more precisely-checkable answer shape from a prose fact.",
  difficultyDimensions: ["number_word_vs_digit_form"],
  teachingUses: ["independent_practice", "mastery_check"],
  provenance: "angel_original",
};

export const RET_BP_CROSS_SENTENCE: EnglishStructuralBlueprint = {
  blueprintId: "eng-ret-bp-cross-sentence",
  familyName: "Retrieval",
  competencyId: "RC-01",
  questionTypeId: "QT-RC-01",
  reasoningPattern: "retrieval",
  validationTier: "TIER2_ACCEPTED_SET",
  validationCategory: "deterministic",
  responseType: "short_answer",
  educationalObjective: "Combine information from two adjacent sentences to answer a question no single sentence answers alone -- a genuine step toward cross-paragraph integration, not yet full inference.",
  difficultyDimensions: ["number_of_sentences_combined"],
  teachingUses: ["scaffolded_practice", "transfer"],
  provenance: "angel_original",
};

export const RET_BP_NEGATIVE_CONDITION: EnglishStructuralBlueprint = {
  blueprintId: "eng-ret-bp-negative-condition",
  familyName: "Retrieval",
  competencyId: "RC-01",
  questionTypeId: "QT-RC-01",
  reasoningPattern: "retrieval",
  validationTier: "TIER2_ACCEPTED_SET",
  validationCategory: "deterministic",
  responseType: "short_answer",
  educationalObjective: "Retrieve what the passage states does NOT happen or is NOT true -- a genuinely different unknown-position/reasoning framing from a positive-fact lookup.",
  difficultyDimensions: ["negation_framing"],
  misconceptionTargeted: "answering with a positive/unrelated fact instead of the specific negative condition the question asks about",
  teachingUses: ["explicit_teaching", "scaffolded_practice"],
  provenance: "angel_original",
};

export const ENGLISH_RETRIEVAL_BLUEPRINTS: EnglishStructuralBlueprint[] = [
  RET_BP_DIRECT_FACT,
  RET_BP_DEFINING_DETAIL,
  RET_BP_NUMBER_QUANTITY,
  RET_BP_CROSS_SENTENCE,
  RET_BP_NEGATIVE_CONDITION,
];

export const ENGLISH_RETRIEVAL_CANDIDATES: EnglishQuestionCandidate[] = [
  // RET_BP_DIRECT_FACT
  {
    candidateId: "eng-ret-01", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: RET_BP_DIRECT_FACT.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "What did Maya's grandfather warn her to be careful of on the staircase?",
    responseType: "short_answer", acceptedAnswers: ["the thirteenth step", "thirteenth step", "step thirteen"],
    evidenceLocation: "paragraph 1", difficulty: "easy", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-02", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: RET_BP_DIRECT_FACT.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "What is the thick, soupy mixture that shredded paper turns into after being mixed with water?",
    responseType: "short_answer", acceptedAnswers: ["pulp"],
    evidenceLocation: "paragraph 2", difficulty: "easy", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-03", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: RET_BP_DIRECT_FACT.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "What materials was Ravi's kite made from?",
    responseType: "short_answer", acceptedAnswers: ["bamboo strips and red silk", "bamboo and silk", "bamboo strips and silk"],
    evidenceLocation: "paragraph 1", difficulty: "easy", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-04", passageId: PENGUIN_PASSAGE.passageId, blueprintId: RET_BP_DIRECT_FACT.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "Where does the male penguin keep the egg warm?",
    responseType: "short_answer", acceptedAnswers: ["under a brood pouch", "in a brood pouch", "beneath a warm fold of skin", "brood pouch"],
    evidenceLocation: "paragraph 3", difficulty: "medium", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  // RET_BP_DEFINING_DETAIL
  {
    candidateId: "eng-ret-05", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: RET_BP_DEFINING_DETAIL.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "According to the passage, what does the giant lens actually do to the light from the bulb?",
    responseType: "short_answer", acceptedAnswers: ["bent and focused a single bulb's glow into a beam", "it bends and focuses it into a beam", "bends and focuses the light"],
    evidenceLocation: "paragraph 3", difficulty: "medium", teachingUses: ["scaffolded_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-06", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: RET_BP_DEFINING_DETAIL.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "Which stage removes ink from the paper fibres -- the screening stage or the de-inking stage?",
    responseType: "short_answer", acceptedAnswers: ["the de-inking stage", "de-inking"],
    evidenceLocation: "paragraph 4", difficulty: "medium", teachingUses: ["scaffolded_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-07", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: RET_BP_DEFINING_DETAIL.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    // Increment 002 Revision, Section 4 -- the prior version offered only
    // two named candidates ("Ravi's, or the boy Priya pointed at?"), which
    // a child could answer correctly from the grammar of the question
    // alone (elimination between two named options) without retrieving
    // the actual detail from the passage. This version requires the
    // child to locate and state the detail itself, with no candidate
    // answers embedded in the question -- genuine open retrieval, not an
    // artificially hard rewrite either (the detail is stated plainly,
    // once, in paragraph 2).
    question: "What had already happened to the kite belonging to the boy Priya pointed at?",
    responseType: "short_answer", acceptedAnswers: ["it had crashed twice already", "crashed twice", "his kite had crashed twice"],
    evidenceLocation: "paragraph 2", difficulty: "easy", teachingUses: ["scaffolded_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-08", passageId: PENGUIN_PASSAGE.passageId, blueprintId: RET_BP_DEFINING_DETAIL.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "Which parent incubates the egg -- the male or the female?",
    responseType: "short_answer", acceptedAnswers: ["the male", "male"],
    evidenceLocation: "paragraph 3", difficulty: "easy", teachingUses: ["scaffolded_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  // RET_BP_NUMBER_QUANTITY
  {
    candidateId: "eng-ret-09", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: RET_BP_NUMBER_QUANTITY.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "How many miles out to sea can the lighthouse beam be seen?",
    responseType: "short_answer", acceptedAnswers: ["20", "twenty", "20 miles", "twenty miles"],
    evidenceLocation: "paragraph 3", difficulty: "easy", teachingUses: ["independent_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-10", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: RET_BP_NUMBER_QUANTITY.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "How many times can recycled paper typically be reprocessed before its fibres become too weak?",
    responseType: "short_answer", acceptedAnswers: ["4 to 6", "four to six", "4-6", "four to six times"],
    evidenceLocation: "paragraph 5", difficulty: "medium", teachingUses: ["independent_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-11", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: RET_BP_NUMBER_QUANTITY.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "How many weeks did Ravi spend building his kite?",
    responseType: "short_answer", acceptedAnswers: ["3", "three", "3 weeks", "three weeks"],
    evidenceLocation: "paragraph 1", difficulty: "easy", teachingUses: ["independent_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-12", passageId: PENGUIN_PASSAGE.passageId, blueprintId: RET_BP_NUMBER_QUANTITY.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "How many species of penguin are found around the world?",
    responseType: "short_answer", acceptedAnswers: ["17", "seventeen"],
    evidenceLocation: "paragraph 1", difficulty: "easy", teachingUses: ["independent_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  // RET_BP_CROSS_SENTENCE
  {
    candidateId: "eng-ret-13", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: RET_BP_CROSS_SENTENCE.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "Why does Maya's grandfather still climb the stairs every evening, even though a computer now lights the lamp?",
    responseType: "short_answer", acceptedAnswers: ["somebody still has to check that computer is telling the truth", "to check the computer is telling the truth", "someone still has to check the computer"],
    evidenceLocation: "paragraph 4", difficulty: "medium", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-14", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: RET_BP_CROSS_SENTENCE.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "Why are newspaper, cardboard, and office paper sorted into separate grades before processing?",
    responseType: "short_answer", acceptedAnswers: ["they contain different types of fibre and cannot be processed together without weakening the final product", "because they contain different types of fibre and mixing them would weaken the final product"],
    evidenceLocation: "paragraph 2", difficulty: "medium", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-15", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: RET_BP_CROSS_SENTENCE.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "Why might Ravi have felt relieved when his kite finally lifted into the sky?",
    responseType: "short_answer", acceptedAnswers: ["ravi's stomach tightened", "he had been nervous it wouldn't fly, and it didn't lift straight away", "for a heart-stopping second, nothing happened"],
    evidenceLocation: "paragraph 2 and paragraph 3", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-16", passageId: PENGUIN_PASSAGE.passageId, blueprintId: RET_BP_CROSS_SENTENCE.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "How does the emperor penguins' huddling behaviour make sure no single penguin gets too cold?",
    responseType: "short_answer", acceptedAnswers: ["individuals continuously rotate from the freezing outer edge of the huddle toward the sheltered centre", "they rotate from the outer edge to the centre, so everyone shares a similar amount of cold exposure"],
    evidenceLocation: "paragraph 4", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  // RET_BP_NEGATIVE_CONDITION
  {
    candidateId: "eng-ret-17", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: RET_BP_NEGATIVE_CONDITION.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "According to the passage, what does the great lens NOT do by itself?",
    responseType: "short_answer", acceptedAnswers: ["the lens did not create light of its own", "it does not create light of its own", "create its own light"],
    evidenceLocation: "paragraph 3", difficulty: "medium", teachingUses: ["explicit_teaching", "scaffolded_practice"],
    misconceptionTargeted: "answering with a positive/unrelated fact instead of the specific negative condition the question asks about",
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-18", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: RET_BP_NEGATIVE_CONDITION.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "Paper fibres cannot be recycled forever. What eventually happens to them, according to the passage?",
    responseType: "short_answer", acceptedAnswers: ["they become too short and weak to hold together", "too short and weak"],
    evidenceLocation: "paragraph 5", difficulty: "medium", teachingUses: ["explicit_teaching", "scaffolded_practice"],
    misconceptionTargeted: "answering with a positive/unrelated fact instead of the specific negative condition the question asks about",
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-19", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: RET_BP_NEGATIVE_CONDITION.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "According to the elderly man, what does NOT make a kite fly well?",
    responseType: "short_answer", acceptedAnswers: ["trying to be something it's not", "being weighed down trying to be something it isn't"],
    evidenceLocation: "paragraph 4", difficulty: "hard", teachingUses: ["explicit_teaching", "scaffolded_practice"],
    misconceptionTargeted: "answering with a positive/unrelated fact instead of the specific negative condition the question asks about",
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-ret-20", passageId: PENGUIN_PASSAGE.passageId, blueprintId: RET_BP_NEGATIVE_CONDITION.blueprintId, familyName: "Retrieval",
    competencyId: "RC-01", questionTypeId: "QT-RC-01",
    question: "What do emperor penguins NOT do that most other birds do when winter comes?",
    responseType: "short_answer", acceptedAnswers: ["migrate away from the harsh winter", "they don't migrate away", "migrate"],
    evidenceLocation: "paragraph 2", difficulty: "medium", teachingUses: ["explicit_teaching", "scaffolded_practice"],
    misconceptionTargeted: "answering with a positive/unrelated fact instead of the specific negative condition the question asks about",
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
];
