import type { EnglishStructuralBlueprint, EnglishQuestionCandidate } from "./englishTypes";
import { LIGHTHOUSE_PASSAGE, RECYCLED_PAPER_PASSAGE, KITE_FESTIVAL_PASSAGE, PENGUIN_PASSAGE } from "./englishPassages";

/**
 * Controlled Scale Increment 002 — English Factory, Synonym Selection
 * family.
 *
 * RC-03, QT-RC-04 -- a CLOSED-SET word-relationship matching demand,
 * kept deliberately separate from Vocabulary/Meaning-in-Context's open
 * explanation task (`lib/ali/familyTaxonomy.ts`'s own consolidation
 * table names this exact distinction). Every candidate's structural
 * integrity (exactly one correct option, every distractor carrying a
 * disclosed misconception rationale, no duplicate options) is verified
 * by `verifySingleSelectStructure`; the target word's real presence in
 * the passage is verified by `verifyTargetWordEvidenced`. Five
 * genuinely distinct demands: closest meaning, a context-trap version
 * where the everyday synonym is wrong here, odd-one-out elimination,
 * an intensity/gradient judgement among near-synonyms, and a
 * part-of-speech trap (a distractor synonymous with a DIFFERENT sense
 * of the target word).
 */

const NOW = new Date().toISOString();

export const SYN_BP_CLOSEST_MEANING: EnglishStructuralBlueprint = {
  blueprintId: "eng-syn-bp-closest-meaning",
  familyName: "Synonym Selection",
  competencyId: "RC-03",
  questionTypeId: "QT-RC-04",
  reasoningPattern: "vocabulary_in_context",
  // Answer-Integrity Incident correction — every candidate this blueprint
  // produces is single_select MCQ evidence (options/correctOptionIndex,
  // mapped by candidateStoreMapping.ts into correctOptions +
  // requiredSelectionCount), which only TIER6_MULTI_SELECT's dispatcher
  // branch reads (lib/learningEngine/englishAnswerValidation.ts). Tagging
  // it TIER1_EXACT_MATCH sent every candidate through the
  // acceptedAnswers-based check instead, against a field this blueprint
  // never populates -- always scoring incorrect regardless of the
  // learner's real answer. See ANGEL_PUBLISHED_ANSWER_INTEGRITY_INCIDENT_REPORT.md.
  validationTier: "TIER6_MULTI_SELECT",
  validationCategory: "evidence_anchored",
  responseType: "single_select",
  educationalObjective: "Select the word closest in meaning to a target word, from four options none of which requires resolving a genuine contextual trap.",
  difficultyDimensions: ["semantic_distance_of_distractors"],
  distractorLogic: "One opposite-meaning distractor, two unrelated-attribute distractors (plausible topically, wrong semantically).",
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
  provenance: "angel_original",
};

export const SYN_BP_CLOSEST_CONTEXTUAL: EnglishStructuralBlueprint = {
  blueprintId: "eng-syn-bp-closest-contextual",
  familyName: "Synonym Selection",
  competencyId: "RC-03",
  questionTypeId: "QT-RC-04",
  reasoningPattern: "vocabulary_in_context",
  // Answer-Integrity Incident correction — see SYN_BP_CLOSEST_MEANING's
  // comment above; identical single_select evidence shape, same fix.
  validationTier: "TIER6_MULTI_SELECT",
  validationCategory: "evidence_anchored",
  responseType: "single_select",
  educationalObjective: "Select the correct sense of a word whose MORE common everyday synonym would be wrong in this specific context -- targets ignoring context in favour of the most familiar sense.",
  difficultyDimensions: ["familiarity_of_the_wrong_common_sense"],
  distractorLogic: "Distractors are genuine alternate senses/synonyms of the target word that are contextually wrong here, not random unrelated words.",
  misconceptionTargeted: "selecting a word's most familiar everyday synonym without checking whether that sense actually fits this context",
  teachingUses: ["explicit_teaching", "mastery_check"],
  provenance: "angel_original",
};

export const SYN_BP_OPPOSITE_ELIMINATION: EnglishStructuralBlueprint = {
  blueprintId: "eng-syn-bp-opposite-elimination",
  familyName: "Synonym Selection",
  competencyId: "RC-03",
  questionTypeId: "QT-RC-04",
  reasoningPattern: "vocabulary_in_context",
  // Answer-Integrity Incident correction — see SYN_BP_CLOSEST_MEANING's
  // comment above; identical single_select evidence shape, same fix.
  validationTier: "TIER6_MULTI_SELECT",
  validationCategory: "evidence_anchored",
  responseType: "single_select",
  educationalObjective: "Identify the ONE option that does NOT share the target word's meaning -- an inverse selection task (odd-one-out), a different unknown position from 'pick the matching one'.",
  difficultyDimensions: ["closeness_of_the_odd_one_out_to_a_near_synonym"],
  distractorLogic: "Three genuine near-synonyms plus one antonym/unrelated word as the correct 'odd one out' answer.",
  teachingUses: ["independent_practice", "mastery_check"],
  provenance: "angel_original",
};

export const SYN_BP_INTENSITY_GRADIENT: EnglishStructuralBlueprint = {
  blueprintId: "eng-syn-bp-intensity-gradient",
  familyName: "Synonym Selection",
  competencyId: "RC-03",
  questionTypeId: "QT-RC-04",
  reasoningPattern: "vocabulary_in_context",
  // Answer-Integrity Incident correction — see SYN_BP_CLOSEST_MEANING's
  // comment above; identical single_select evidence shape, same fix.
  validationTier: "TIER6_MULTI_SELECT",
  validationCategory: "evidence_anchored",
  responseType: "single_select",
  educationalObjective: "Select a word representing a MORE or LESS extreme shade of meaning than a reference word -- tests fine-grained sense distinctions among genuine near-synonyms, not just rough word-matching.",
  difficultyDimensions: ["fineness_of_the_intensity_distinction"],
  distractorLogic: "Options span a genuine intensity gradient (or are unrelated/opposite) around the reference word, never a single obviously-wrong filler.",
  teachingUses: ["scaffolded_practice", "transfer"],
  provenance: "angel_original",
};

export const SYN_BP_PART_OF_SPEECH_TRAP: EnglishStructuralBlueprint = {
  blueprintId: "eng-syn-bp-part-of-speech-trap",
  familyName: "Synonym Selection",
  competencyId: "RC-03",
  questionTypeId: "QT-RC-04",
  reasoningPattern: "vocabulary_in_context",
  // Answer-Integrity Incident correction — see SYN_BP_CLOSEST_MEANING's
  // comment above; identical single_select evidence shape, same fix.
  validationTier: "TIER6_MULTI_SELECT",
  validationCategory: "evidence_anchored",
  responseType: "single_select",
  educationalObjective: "Select the synonym matching the target word's ACTUAL part of speech/sense here, rejecting distractors that are synonyms of a different sense or sound-alike words.",
  difficultyDimensions: ["plausibility_of_the_wrong_sense_distractor"],
  distractorLogic: "One noun-sense-of-the-same-word trap, one or two sound-alike ('false friend') traps -- never an arbitrary unrelated word.",
  misconceptionTargeted: "matching a word by its most common part of speech or a similar sound, rather than the specific sense used in this sentence",
  teachingUses: ["explicit_teaching", "scaffolded_practice"],
  provenance: "angel_original",
};

export const ENGLISH_SYNONYM_BLUEPRINTS: EnglishStructuralBlueprint[] = [
  SYN_BP_CLOSEST_MEANING,
  SYN_BP_CLOSEST_CONTEXTUAL,
  SYN_BP_OPPOSITE_ELIMINATION,
  SYN_BP_INTENSITY_GRADIENT,
  SYN_BP_PART_OF_SPEECH_TRAP,
];

export const ENGLISH_SYNONYM_CANDIDATES: EnglishQuestionCandidate[] = [
  // SYN_BP_CLOSEST_MEANING
  {
    candidateId: "eng-syn-01", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: SYN_BP_CLOSEST_MEANING.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word is closest in meaning to 'enormous' as used in 'An enormous lens, taller than Maya herself'?",
    responseType: "single_select", options: ["huge", "tiny", "ancient", "fragile"], correctOptionIndex: 0,
    distractorRationale: { 1: "opposite meaning (a common size-word confusion)", 2: "describes age, not size", 3: "describes durability, not size" },
    evidenceLocation: "paragraph 3", difficulty: "easy", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-02", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: SYN_BP_CLOSEST_MEANING.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word is closest in meaning to 'trickiest' as used in 'One of the trickiest stages is de-inking'?",
    responseType: "single_select", options: ["most difficult", "quickest", "cleanest", "cheapest"], correctOptionIndex: 0,
    distractorRationale: { 1: "confuses difficulty with speed", 2: "confuses difficulty with cleanliness", 3: "confuses difficulty with cost" },
    evidenceLocation: "paragraph 4", difficulty: "medium", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-03", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: SYN_BP_CLOSEST_MEANING.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word is closest in meaning to 'soaring' as used in 'the elaborate creations soaring above him'?",
    responseType: "single_select", options: ["flying high", "falling", "spinning", "resting"], correctOptionIndex: 0,
    distractorRationale: { 1: "opposite direction of motion", 2: "a different type of motion entirely", 3: "implies no motion at all" },
    evidenceLocation: "paragraph 2", difficulty: "easy", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-04", passageId: PENGUIN_PASSAGE.passageId, blueprintId: SYN_BP_CLOSEST_MEANING.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word is closest in meaning to 'endures' as used in 'none endures conditions as extreme as the emperor penguin'?",
    responseType: "single_select", options: ["survives through", "avoids", "creates", "studies"], correctOptionIndex: 0,
    distractorRationale: { 1: "opposite meaning", 2: "unrelated action", 3: "confuses the penguin's own experience with the researchers who study it" },
    evidenceLocation: "paragraph 1", difficulty: "medium", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  // SYN_BP_CLOSEST_CONTEXTUAL
  {
    candidateId: "eng-syn-05", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: SYN_BP_CLOSEST_CONTEXTUAL.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word is closest in meaning to 'bent' as used in 'it bent and focused a single bulb's glow'?",
    responseType: "single_select", options: ["curved/redirected", "broke", "obeyed", "exercised"], correctOptionIndex: 0,
    distractorRationale: { 1: "a plausible-sounding near-miss -- bending is not the same as breaking", 2: "the 'submit/comply' sense of bend (as in 'bend to someone's will'), wrong here", 3: "the physical-exercise sense of bend (as in 'bends and stretches'), wrong here" },
    evidenceLocation: "paragraph 3", difficulty: "hard", teachingUses: ["explicit_teaching", "mastery_check"],
    misconceptionTargeted: "selecting a word's most familiar everyday synonym without checking whether that sense actually fits this context",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-06", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: SYN_BP_CLOSEST_CONTEXTUAL.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word is closest in meaning to 'grades' as used in 'sorted... into different grades'?",
    responseType: "single_select", options: ["categories", "marks", "slopes", "school years"], correctOptionIndex: 0,
    distractorRationale: { 1: "the test-score sense of grade, wrong here", 2: "the road-incline sense of grade, wrong here", 3: "the school-year sense of grade, wrong here" },
    evidenceLocation: "paragraph 2", difficulty: "hard", teachingUses: ["explicit_teaching", "mastery_check"],
    misconceptionTargeted: "selecting a word's most familiar everyday synonym without checking whether that sense actually fits this context",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-07", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: SYN_BP_CLOSEST_CONTEXTUAL.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word is closest in meaning to 'plainest' as used in 'the plainest kite flies the truest'?",
    responseType: "single_select", options: ["simplest", "clearest to see", "most obvious", "most honest"], correctOptionIndex: 0,
    distractorRationale: { 1: "the 'plain to see' (visible) sense of plain, wrong here", 2: "also the visibility sense, wrong here", 3: "confuses 'plain' the design word with 'plain-speaking' honesty" },
    evidenceLocation: "paragraph 4", difficulty: "hard", teachingUses: ["explicit_teaching", "mastery_check"],
    misconceptionTargeted: "selecting a word's most familiar everyday synonym without checking whether that sense actually fits this context",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-08", passageId: PENGUIN_PASSAGE.passageId, blueprintId: SYN_BP_CLOSEST_CONTEXTUAL.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    // Increment 002 Revision, Section 3 -- same fix and same replacement
    // target word as eng-voc-11 (kept consistent across the two
    // families' parallel word lists): "march"/"March" let a reader
    // disambiguate by capitalisation alone, never requiring real
    // context reasoning. "call" has no such shortcut.
    question: "Which word is closest in meaning to 'call' as used in 'the unique call each pair has developed'?",
    responseType: "single_select", options: ["a vocal cry", "a phone conversation", "a difficult decision", "a brief visit"], correctOptionIndex: 0,
    distractorRationale: { 1: "the 'telephone call' sense, wrong here", 2: "the 'your call/judgement call' sense, wrong here", 3: "the 'pay a call/visit' sense, wrong here" },
    evidenceLocation: "paragraph 5", difficulty: "medium", teachingUses: ["explicit_teaching", "mastery_check"],
    misconceptionTargeted: "selecting a word's most familiar everyday synonym without checking whether that sense actually fits this context",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  // SYN_BP_OPPOSITE_ELIMINATION
  {
    candidateId: "eng-syn-09", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: SYN_BP_OPPOSITE_ELIMINATION.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word does NOT mean the same as 'colder' as used in 'the air grew colder with every turn'?",
    responseType: "single_select", options: ["chillier", "icier", "warmer", "more frigid"], correctOptionIndex: 2,
    distractorRationale: { 0: "a genuine near-synonym of colder", 1: "a genuine near-synonym of colder", 3: "a genuine near-synonym of colder" },
    evidenceLocation: "paragraph 2", difficulty: "easy", teachingUses: ["independent_practice", "mastery_check"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-10", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: SYN_BP_OPPOSITE_ELIMINATION.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word does NOT mean the same as 'removes' as used in 'This step removes staples, plastic film'?",
    responseType: "single_select", options: ["takes away", "eliminates", "adds", "gets rid of"], correctOptionIndex: 2,
    distractorRationale: { 0: "a genuine near-synonym of removes", 1: "a genuine near-synonym of removes", 3: "a genuine near-synonym of removes" },
    evidenceLocation: "paragraph 3", difficulty: "easy", teachingUses: ["independent_practice", "mastery_check"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-11", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: SYN_BP_OPPOSITE_ELIMINATION.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word does NOT mean the same as 'steadily' as used in 'climbed steadily into the pale blue sky'?",
    responseType: "single_select", options: ["consistently", "erratically", "evenly", "smoothly"], correctOptionIndex: 1,
    distractorRationale: { 0: "a genuine near-synonym of steadily", 2: "a genuine near-synonym of steadily", 3: "a genuine near-synonym of steadily" },
    evidenceLocation: "paragraph 3", difficulty: "medium", teachingUses: ["independent_practice", "mastery_check"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-12", passageId: PENGUIN_PASSAGE.passageId, blueprintId: SYN_BP_OPPOSITE_ELIMINATION.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word does NOT mean the same as 'brutal' as used in 'the brutal Antarctic winter'?",
    responseType: "single_select", options: ["harsh", "severe", "gentle", "fierce"], correctOptionIndex: 2,
    distractorRationale: { 0: "a genuine near-synonym of brutal", 1: "a genuine near-synonym of brutal", 3: "a genuine near-synonym of brutal" },
    evidenceLocation: "paragraph 1", difficulty: "easy", teachingUses: ["independent_practice", "mastery_check"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  // SYN_BP_INTENSITY_GRADIENT
  {
    candidateId: "eng-syn-13", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: SYN_BP_INTENSITY_GRADIENT.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "The passage describes the air growing 'colder'. Which word means a MORE extreme version of cold than 'chilly'?",
    responseType: "single_select", options: ["cool", "freezing", "mild", "fresh"], correctOptionIndex: 1,
    distractorRationale: { 0: "milder than chilly, the wrong direction", 2: "not cold at all", 3: "not clearly about temperature intensity" },
    evidenceLocation: "paragraph 2", difficulty: "medium", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-14", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: SYN_BP_INTENSITY_GRADIENT.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "The passage describes the cleaning process 'flinging out' heavier impurities using centrifugal force. Which word means a LESS forceful version of 'flinging'?",
    responseType: "single_select", options: ["hurled", "tossed", "launched", "catapulted"], correctOptionIndex: 1,
    distractorRationale: { 0: "as forceful as or more forceful than flung", 2: "as forceful as flung", 3: "more forceful than flung" },
    evidenceLocation: "paragraph 3", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-15", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: SYN_BP_INTENSITY_GRADIENT.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "The passage says Ravi's stomach 'tightened'. Which word means a MORE extreme version of tightened than 'tensed'?",
    responseType: "single_select", options: ["relaxed", "clenched", "loosened", "settled"], correctOptionIndex: 1,
    distractorRationale: { 0: "the opposite of tightened", 2: "the opposite of tightened", 3: "suggests calming, not tightening" },
    evidenceLocation: "paragraph 2", difficulty: "medium", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-16", passageId: PENGUIN_PASSAGE.passageId, blueprintId: SYN_BP_INTENSITY_GRADIENT.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "The passage says temperatures 'plunge'. Which word means a LESS extreme version of plunge than 'plummet'?",
    responseType: "single_select", options: ["dip", "crash", "collapse", "tumble"], correctOptionIndex: 0,
    distractorRationale: { 1: "as dramatic as or more dramatic than plummet", 2: "as dramatic as plummet", 3: "close to plummet in intensity, not clearly milder" },
    evidenceLocation: "paragraph 1", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  // SYN_BP_PART_OF_SPEECH_TRAP
  {
    candidateId: "eng-syn-17", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: SYN_BP_PART_OF_SPEECH_TRAP.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word is closest in meaning to 'warned' (the verb) as used in '\"Mind the thirteenth step,\" he warned'?",
    responseType: "single_select", options: ["cautioned", "a warning sign", "an alarm", "a siren"], correctOptionIndex: 0,
    distractorRationale: { 1: "a noun-sense trap -- a 'sign', not the act of warning", 2: "a related-topic noun, not the verb sense", 3: "a related-topic noun, not the verb sense" },
    evidenceLocation: "paragraph 1", difficulty: "medium", teachingUses: ["explicit_teaching", "scaffolded_practice"],
    misconceptionTargeted: "matching a word by its most common part of speech or a similar sound, rather than the specific sense used in this sentence",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-18", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: SYN_BP_PART_OF_SPEECH_TRAP.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word is closest in meaning to 'sorted' (the verb) as used in 'paper is sorted by hand'?",
    responseType: "single_select", options: ["organised", "assorted", "a sort of", "resorted"], correctOptionIndex: 0,
    distractorRationale: { 1: "a false-friend trap -- 'assorted' means MIXED, nearly the opposite of sorted", 2: "an unrelated everyday phrase using the same root word", 3: "an unrelated word (as in a holiday resort)" },
    evidenceLocation: "paragraph 2", difficulty: "hard", teachingUses: ["explicit_teaching", "scaffolded_practice"],
    misconceptionTargeted: "matching a word by its most common part of speech or a similar sound, rather than the specific sense used in this sentence",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-19", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: SYN_BP_PART_OF_SPEECH_TRAP.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word is closest in meaning to 'spool' (the verb) as used in 'let the string spool out further'?",
    responseType: "single_select", options: ["unwind", "a reel", "spoil", "a pool"], correctOptionIndex: 0,
    distractorRationale: { 1: "a noun-sense trap -- the object thread is wound around, not the action", 2: "a sound-alike false friend", 3: "a sound-alike false friend" },
    evidenceLocation: "paragraph 3", difficulty: "hard", teachingUses: ["explicit_teaching", "scaffolded_practice"],
    misconceptionTargeted: "matching a word by its most common part of speech or a similar sound, rather than the specific sense used in this sentence",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-syn-20", passageId: PENGUIN_PASSAGE.passageId, blueprintId: SYN_BP_PART_OF_SPEECH_TRAP.blueprintId, familyName: "Synonym Selection",
    competencyId: "RC-03", questionTypeId: "QT-RC-04",
    question: "Which word is closest in meaning to 'huddle' (the verb) as used in 'huddle together in enormous, tightly packed groups'?",
    responseType: "single_select", options: ["crowd together closely", "a team huddle", "hurdle", "cuddle"], correctOptionIndex: 0,
    distractorRationale: { 1: "a noun-sense trap (a sports-team formation)", 2: "a sound-alike false friend", 3: "a similar-sounding but different word" },
    evidenceLocation: "paragraph 4", difficulty: "medium", teachingUses: ["explicit_teaching", "scaffolded_practice"],
    misconceptionTargeted: "matching a word by its most common part of speech or a similar sound, rather than the specific sense used in this sentence",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
];
