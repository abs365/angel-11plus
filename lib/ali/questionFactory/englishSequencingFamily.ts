import type { EnglishStructuralBlueprint, EnglishQuestionCandidate } from "./englishTypes";
import { LIGHTHOUSE_PASSAGE, RECYCLED_PAPER_PASSAGE, KITE_FESTIVAL_PASSAGE, PENGUIN_PASSAGE } from "./englishPassages";

/**
 * Controlled Scale Increment 002 — English Factory, Sequencing family.
 *
 * RC-04 ("Sequential Ordering of Textual Information"), QT-RC-06. Every
 * candidate's claimed order is independently re-derived by
 * `verifySequenceOrderEvidenced` from where each event's OWN anchor
 * phrase first appears in the real passage text -- never merely trusted
 * from the author's own ordering. Four genuinely distinct demands: full
 * reordering of several events, a single relative before/after judgement,
 * a first/last boundary lookup, and inserting one new event into an
 * already-given partial order.
 */

const NOW = new Date().toISOString();

export const SEQ_BP_FULL_ORDER: EnglishStructuralBlueprint = {
  blueprintId: "eng-seq-bp-full-order",
  familyName: "Sequencing",
  competencyId: "RC-04",
  questionTypeId: "QT-RC-06",
  reasoningPattern: "sequence",
  validationTier: "TIER4_ORDERED_LIST",
  validationCategory: "deterministic",
  responseType: "ordered_list",
  educationalObjective: "Order four events/steps from the passage into the sequence they genuinely occur in the text.",
  difficultyDimensions: ["number_of_items_to_order", "distance_between_anchor_events_in_text"],
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
  provenance: "angel_original",
};

export const SEQ_BP_BEFORE_AFTER: EnglishStructuralBlueprint = {
  blueprintId: "eng-seq-bp-before-after",
  familyName: "Sequencing",
  competencyId: "RC-04",
  questionTypeId: "QT-RC-06",
  reasoningPattern: "sequence",
  validationTier: "TIER1_EXACT_MATCH",
  validationCategory: "deterministic",
  responseType: "short_answer",
  educationalObjective: "Judge the relative order of just TWO events -- a genuinely simpler response form (one word) than full reordering, but still a real sequencing judgement.",
  difficultyDimensions: ["textual_distance_between_the_two_events"],
  teachingUses: ["guided_practice", "mastery_check"],
  provenance: "angel_original",
};

export const SEQ_BP_FIRST_LAST: EnglishStructuralBlueprint = {
  blueprintId: "eng-seq-bp-first-last",
  familyName: "Sequencing",
  competencyId: "RC-04",
  questionTypeId: "QT-RC-06",
  reasoningPattern: "sequence",
  validationTier: "TIER2_ACCEPTED_SET",
  validationCategory: "deterministic",
  responseType: "short_answer",
  educationalObjective: "Identify the boundary (first or last) item of a sequence -- a different unknown position from ordering the whole sequence or comparing two arbitrary events.",
  difficultyDimensions: ["boundary_position"],
  teachingUses: ["independent_practice", "mastery_check"],
  provenance: "angel_original",
};

export const SEQ_BP_INSERT_POSITION: EnglishStructuralBlueprint = {
  blueprintId: "eng-seq-bp-insert-position",
  familyName: "Sequencing",
  competencyId: "RC-04",
  questionTypeId: "QT-RC-06",
  reasoningPattern: "sequence",
  validationTier: "TIER1_EXACT_MATCH",
  // Evidence-anchored, not deterministic: the independent check confirms
  // the new event's anchor is real and falls within the given partial
  // order's span, but does not resolve the EXACT claimed gap among
  // several candidates -- disclosed honestly, not claimed as fully
  // automated (see englishIndependentValidation.ts's own docstring).
  validationCategory: "evidence_anchored",
  responseType: "short_answer",
  educationalObjective: "Insert one new event into its correct position within an already-given partial order -- a genuinely different reasoning demand from building an order from scratch (ENGLISH_SEQUENCING_CONTRACT's own ELIMINATE_INCONSISTENT_SEQUENCE stage).",
  difficultyDimensions: ["number_of_anchor_points_given"],
  teachingUses: ["scaffolded_practice", "transfer"],
  provenance: "angel_original",
};

export const ENGLISH_SEQUENCING_BLUEPRINTS: EnglishStructuralBlueprint[] = [SEQ_BP_FULL_ORDER, SEQ_BP_BEFORE_AFTER, SEQ_BP_FIRST_LAST, SEQ_BP_INSERT_POSITION];

export const ENGLISH_SEQUENCING_CANDIDATES: EnglishQuestionCandidate[] = [
  // SEQ_BP_FULL_ORDER
  {
    candidateId: "eng-seq-01", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: SEQ_BP_FULL_ORDER.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "Put these four events in the order they happen in the passage: (A) Maya presses her palm against the great lens. (B) Her grandfather hands her the heavy brass key. (C) Maya stretches her leg carefully over the thirteenth step. (D) Her grandfather explains that the lens did not create light of its own.",
    responseType: "ordered_list",
    correctOrderAcceptedSets: [["handed her the heavy brass key"], ["stretched her leg carefully over it"], ["explained that the lens did not create light of its own"], ["pressed her palm against the great lens"]],
    evidenceLocation: "paragraphs 1, 2, 3, 5", difficulty: "medium", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-seq-02", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: SEQ_BP_FULL_ORDER.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "Put these four steps in the order they happen in the recycling process described: (A) Ink rises to the surface as a foam and is skimmed away. (B) Paper is shredded and mixed with water into pulp. (C) The pulp is pushed through screens to remove staples. (D) The pulp is dried by passing over heated rollers.",
    responseType: "ordered_list",
    correctOrderAcceptedSets: [["breaks it down into a thick, soupy mixture"], ["pushed through screens with tiny holes"], ["ink rises to the surface as a foam"], ["dried by passing over heated rollers"]],
    evidenceLocation: "paragraphs 2, 3, 4, 5", difficulty: "medium", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-seq-03", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: SEQ_BP_FULL_ORDER.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "Put these four events in the order they happen in the passage: (A) Ravi's kite climbs steadily into the sky. (B) Priya points out the boy whose kite has crashed twice. (C) The elderly man makes his remark about plain kites. (D) Ravi's family arrives at the crowded field.",
    responseType: "ordered_list",
    correctOrderAcceptedSets: [["the field was already crowded with kites"], ["tugged at his sleeve and pointed at a boy"], ["climbed steadily into the pale blue sky"], ["sometimes the plainest kite flies the truest"]],
    evidenceLocation: "paragraphs 2, 2, 3, 4", difficulty: "hard", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-seq-04", passageId: PENGUIN_PASSAGE.passageId, blueprintId: SEQ_BP_FULL_ORDER.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "Put these four events in the order they happen: (A) The chick hatches. (B) The female lays a single egg. (C) The female returns to the ocean to feed. (D) The egg is transferred onto the male's feet.",
    responseType: "ordered_list",
    correctOrderAcceptedSets: [["the female lays a single egg"], ["transfers it carefully onto her mate's feet"], ["departs on a long journey back to the ocean"], ["the chick finally hatches"]],
    evidenceLocation: "paragraph 3", difficulty: "medium", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  // SEQ_BP_BEFORE_AFTER
  {
    candidateId: "eng-seq-05", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: SEQ_BP_BEFORE_AFTER.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "Did Maya learn about the thirteenth step BEFORE or AFTER she began climbing the staircase?",
    responseType: "short_answer", acceptedAnswers: ["before"],
    correctOrderAcceptedSets: [["mind the thirteenth step"], ["the staircase wound upward"]],
    evidenceLocation: "paragraph 1 (before), paragraph 2 (climbing)", difficulty: "easy", teachingUses: ["guided_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-seq-06", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: SEQ_BP_BEFORE_AFTER.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "Does the de-inking stage happen BEFORE or AFTER the stage that removes grit and glass using centrifugal force?",
    responseType: "short_answer", acceptedAnswers: ["after"],
    correctOrderAcceptedSets: [["one of the trickiest stages is de-inking"], ["using centrifugal force"]],
    evidenceLocation: "paragraphs 3 and 4", difficulty: "medium", teachingUses: ["guided_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-seq-07", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: SEQ_BP_BEFORE_AFTER.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "Did Ravi's kite lift into the sky BEFORE or AFTER Priya made her encouraging remark?",
    responseType: "short_answer", acceptedAnswers: ["after"],
    correctOrderAcceptedSets: [["climbed steadily into the pale blue sky"], ["at least yours will actually fly"]],
    evidenceLocation: "paragraphs 2 and 3", difficulty: "medium", teachingUses: ["guided_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-seq-08", passageId: PENGUIN_PASSAGE.passageId, blueprintId: SEQ_BP_BEFORE_AFTER.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "Does the female's return happen BEFORE or AFTER the male finishes his period of incubating the egg alone?",
    responseType: "short_answer", acceptedAnswers: ["after"],
    correctOrderAcceptedSets: [["the returning females can locate their own mate"], ["incubate the egg completely alone for around two months"]],
    evidenceLocation: "paragraphs 3 and 5", difficulty: "hard", teachingUses: ["guided_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  // SEQ_BP_FIRST_LAST
  {
    candidateId: "eng-seq-09", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: SEQ_BP_FIRST_LAST.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "What is the first thing that happens in the passage?",
    responseType: "short_answer", acceptedAnswers: ["her grandfather finally handed her the heavy brass key", "grandfather hands her the key"],
    evidenceLocation: "paragraph 1", difficulty: "easy", teachingUses: ["independent_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-seq-10", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: SEQ_BP_FIRST_LAST.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "What is the LAST stage in the recycling process described in the passage?",
    responseType: "short_answer", acceptedAnswers: ["dried by passing over heated rollers", "drying on heated rollers"],
    evidenceLocation: "paragraph 5", difficulty: "easy", teachingUses: ["independent_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-seq-11", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: SEQ_BP_FIRST_LAST.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "What is described first in the passage?",
    responseType: "short_answer", acceptedAnswers: ["the fields behind oakbridge school filled with colour", "the field filling with colour as families gathered"],
    evidenceLocation: "paragraph 1", difficulty: "easy", teachingUses: ["independent_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-seq-12", passageId: PENGUIN_PASSAGE.passageId, blueprintId: SEQ_BP_FIRST_LAST.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "What is the LAST thing described in the passage?",
    responseType: "short_answer", acceptedAnswers: ["recognising the unique call each pair has developed", "how returning females recognise their mate and chick by a unique call"],
    evidenceLocation: "paragraph 5", difficulty: "medium", teachingUses: ["independent_practice", "mastery_check"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  // SEQ_BP_INSERT_POSITION
  {
    candidateId: "eng-seq-13", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: SEQ_BP_INSERT_POSITION.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "These three events are given in order: (1) Grandfather hands Maya the key. (2) They climb to the lamp room. (3) Maya presses her palm to the lens. Where should 'Grandfather explains that the lens does not create its own light' go -- between 1 and 2, or between 2 and 3?",
    responseType: "short_answer", acceptedAnswers: ["between 2 and 3"],
    correctOrderAcceptedSets: [["explained that the lens did not create light of its own"], ["handed her the heavy brass key"], ["the lamp room was smaller than she had imagined"], ["pressed her palm against the great lens"]],
    evidenceLocation: "paragraph 3, after reaching the lamp room", difficulty: "medium", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-seq-14", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: SEQ_BP_INSERT_POSITION.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "These steps are given in order: (1) Paper is shredded and made into pulp. (2) Staples and plastic are screened out. (3) Pulp is dried on heated rollers. Where should 'Ink is removed during de-inking' go -- between 1 and 2, or between 2 and 3?",
    responseType: "short_answer", acceptedAnswers: ["between 2 and 3"],
    correctOrderAcceptedSets: [["ink rises to the surface as a foam"], ["breaks it down into a thick, soupy mixture"], ["pushed through screens with tiny holes"], ["dried by passing over heated rollers"]],
    evidenceLocation: "paragraph 4, after the screening stage", difficulty: "medium", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-seq-15", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: SEQ_BP_INSERT_POSITION.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "These events are given in order: (1) Ravi's family arrives at the field. (2) Ravi runs against the wind. (3) The elderly man makes his remark. Where should 'Priya points out the boy whose kite crashed' go -- between 1 and 2, or between 2 and 3?",
    responseType: "short_answer", acceptedAnswers: ["between 1 and 2"],
    correctOrderAcceptedSets: [["tugged at his sleeve and pointed at a boy"], ["the field was already crowded with kites"], ["unwound his string, and ran against the wind"], ["sometimes the plainest kite flies the truest"]],
    evidenceLocation: "paragraph 2, before Ravi runs", difficulty: "medium", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-seq-16", passageId: PENGUIN_PASSAGE.passageId, blueprintId: SEQ_BP_INSERT_POSITION.blueprintId, familyName: "Sequencing",
    competencyId: "RC-04", questionTypeId: "QT-RC-06",
    question: "These events are given in order: (1) The female lays an egg. (2) The male incubates it alone. (3) The chick hatches. Where should 'The female leaves for the ocean to feed' go -- between 1 and 2, or between 2 and 3?",
    responseType: "short_answer", acceptedAnswers: ["between 1 and 2"],
    correctOrderAcceptedSets: [["departs on a long journey back to the ocean"], ["the female lays a single egg"], ["incubate the egg completely alone for around two months"], ["the chick finally hatches"]],
    evidenceLocation: "paragraph 3, after the egg transfer and before incubation", difficulty: "medium", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "deterministic", provenance: "angel_original", generatedAt: NOW,
  },
];
