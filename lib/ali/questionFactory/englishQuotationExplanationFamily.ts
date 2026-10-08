import type { EnglishStructuralBlueprint, EnglishQuestionCandidate } from "./englishTypes";
import { LIGHTHOUSE_PASSAGE, RECYCLED_PAPER_PASSAGE, KITE_FESTIVAL_PASSAGE, PENGUIN_PASSAGE } from "./englishPassages";

/**
 * Controlled Scale Increment 002 — English Factory, Quotation +
 * Explanation family.
 *
 * RC-02 ("Inference and Justified Interpretation"), QT-RC-02. The ONLY
 * family this increment selected with a genuine HUMAN_REQUIRED half --
 * matching `englishAnswerValidation.ts`'s own real TIER3/TIER5 design
 * exactly (the quotation is checkable, `explanationGuidance` is
 * reviewer guidance, never a graded answer key). Every candidate's
 * `requiredQuotation` is independently confirmed a genuine, verbatim
 * (tolerant) substring of its source passage by
 * `verifyQuotationEvidenced` -- reusing the SAME `checkQuotationPresent`
 * function the real live runtime grading path already uses, never a
 * second parallel implementation. Four genuinely distinct demands:
 * direct single-quotation support, choosing between two PLAUSIBLE
 * quotations where only one fully supports the claim, a quotation that
 * supports an INFERRED conclusion rather than a stated fact, and
 * evidence spanning two separate quotations.
 */

const NOW = new Date().toISOString();

export const QE_BP_DIRECT_SUPPORT: EnglishStructuralBlueprint = {
  blueprintId: "eng-qe-bp-direct-support",
  familyName: "Quotation + Explanation",
  competencyId: "RC-02",
  questionTypeId: "QT-RC-02",
  reasoningPattern: "evidence_quotation",
  validationTier: "TIER3_QUOTATION_PLUS_EXPLANATION",
  validationCategory: "evidence_anchored",
  responseType: "quotation_plus_explanation",
  educationalObjective: "Find a single quotation that directly supports a given claim, and explain how it does so.",
  difficultyDimensions: ["evidence_distance_from_the_claim_wording"],
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
  provenance: "angel_original",
};

export const QE_BP_CHOOSE_BEST_QUOTATION: EnglishStructuralBlueprint = {
  blueprintId: "eng-qe-bp-choose-best-quotation",
  familyName: "Quotation + Explanation",
  competencyId: "RC-02",
  questionTypeId: "QT-RC-02",
  reasoningPattern: "evidence_quotation",
  validationTier: "TIER3_QUOTATION_PLUS_EXPLANATION",
  validationCategory: "evidence_anchored",
  responseType: "quotation_plus_explanation",
  educationalObjective: "Choose the quotation that FULLY supports a claim from two plausible-looking options, rejecting one that is topically related but does not actually support the specific claim -- targets over-selection of partial/adjacent evidence.",
  difficultyDimensions: ["topical_similarity_of_the_wrong_quotation"],
  misconceptionTargeted: "selecting a quotation that is topically related to the claim but does not actually support the specific point being asked about",
  teachingUses: ["explicit_teaching", "mastery_check"],
  provenance: "angel_original",
};

/**
 * Increment 002 Revision, Section 7 -- this blueprint is where the
 * historical "Motive Inference" database family_id
 * (wave1-fam-motive-inference) now lives educationally, as a TOPIC/
 * SUBTYPE, not a separate blueprint or family: a "why did the character
 * act this way -- quote the evidence and explain" candidate is one more
 * instance of the same inference-quotation-explanation reasoning demand
 * this blueprint already covers (see the 4 built candidates below,
 * spanning understanding/thoroughness/memory/scientific-knowledge
 * inference topics). See lib/ali/familyTaxonomy.ts's
 * ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION "Quotation + Explanation"
 * entry for the consolidation record itself.
 */
export const QE_BP_QUOTATION_FOR_INFERENCE: EnglishStructuralBlueprint = {
  blueprintId: "eng-qe-bp-quotation-for-inference",
  familyName: "Quotation + Explanation",
  competencyId: "RC-02",
  questionTypeId: "QT-RC-02",
  reasoningPattern: "evidence_quotation",
  validationTier: "TIER3_QUOTATION_PLUS_EXPLANATION",
  validationCategory: "evidence_anchored",
  responseType: "quotation_plus_explanation",
  educationalObjective: "Find a quotation that supports an INFERRED conclusion (not a literally-stated fact) and explain the inferential link -- a genuinely deeper demand than direct support. Covers multiple inference topics including motive ('why did the character act this way'), which is a topic within this demand, not a separate one.",
  difficultyDimensions: ["inference_depth"],
  teachingUses: ["scaffolded_practice", "transfer"],
  provenance: "angel_original",
};

export const QE_BP_TWO_PART_QUOTATION: EnglishStructuralBlueprint = {
  blueprintId: "eng-qe-bp-two-part-quotation",
  familyName: "Quotation + Explanation",
  competencyId: "RC-02",
  questionTypeId: "QT-RC-02",
  reasoningPattern: "evidence_quotation",
  validationTier: "TIER3_QUOTATION_PLUS_EXPLANATION",
  validationCategory: "evidence_anchored",
  responseType: "quotation_plus_explanation",
  educationalObjective: "Support a claim using evidence that genuinely spans TWO separate quotations, not one single spot -- a more complex evidence-location demand than any single-quotation blueprint here.",
  difficultyDimensions: ["distance_between_the_two_required_quotations"],
  teachingUses: ["independent_practice", "transfer"],
  provenance: "angel_original",
};

export const ENGLISH_QUOTATION_EXPLANATION_BLUEPRINTS: EnglishStructuralBlueprint[] = [
  QE_BP_DIRECT_SUPPORT,
  QE_BP_CHOOSE_BEST_QUOTATION,
  QE_BP_QUOTATION_FOR_INFERENCE,
  QE_BP_TWO_PART_QUOTATION,
];

export const ENGLISH_QUOTATION_EXPLANATION_CANDIDATES: EnglishQuestionCandidate[] = [
  // QE_BP_DIRECT_SUPPORT
  {
    candidateId: "eng-qe-01", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: QE_BP_DIRECT_SUPPORT.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "Find a quotation that shows the lighthouse keeper's job is still important even though a computer now lights the lamp. Explain how it shows this.",
    responseType: "quotation_plus_explanation", requiredQuotation: "somebody still has to check that computer is telling the truth",
    explanationGuidance: "Should explain that human checking is still needed because the computer could be wrong, and mistakes could cause ships to be lost -- reviewer should check the explanation links the quotation to the ongoing risk, not just restate it.",
    evidenceLocation: "paragraph 4", difficulty: "medium", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-qe-02", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: QE_BP_DIRECT_SUPPORT.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "Find a quotation that shows recycled paper cannot be reused forever. Explain how it shows this.",
    responseType: "quotation_plus_explanation", requiredQuotation: "fibres become too short and weak to hold together",
    explanationGuidance: "Should explain that after repeated recycling (4-6 times) the fibres degrade and eventually cannot be recycled again without fresh pulp being added.",
    evidenceLocation: "paragraph 5", difficulty: "medium", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-qe-03", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: QE_BP_DIRECT_SUPPORT.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "Find a quotation that shows Ravi was nervous before flying his kite. Explain how it shows this.",
    responseType: "quotation_plus_explanation", requiredQuotation: "Ravi's stomach tightened",
    explanationGuidance: "Should link the physical sensation (a tightening stomach) to nervousness, ideally noting it happens as he compares his kite to the more elaborate ones.",
    evidenceLocation: "paragraph 2", difficulty: "easy", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-qe-04", passageId: PENGUIN_PASSAGE.passageId, blueprintId: QE_BP_DIRECT_SUPPORT.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "Find a quotation that shows the male penguin sacrifices a great deal to protect the egg. Explain how it shows this.",
    responseType: "quotation_plus_explanation", requiredQuotation: "losing nearly half his body weight in the process",
    explanationGuidance: "Should explain that losing half his body weight demonstrates the physical cost of incubating alone for two months without eating.",
    evidenceLocation: "paragraph 3", difficulty: "medium", teachingUses: ["worked_example", "guided_practice", "independent_practice"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  // QE_BP_CHOOSE_BEST_QUOTATION
  {
    candidateId: "eng-qe-05", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: QE_BP_CHOOSE_BEST_QUOTATION.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "A student wants to show that the lens is very large. They could quote either 'An enormous lens, taller than Maya herself' or 'the curved glass walls streaked with salt'. Which quotation actually supports the claim, and why doesn't the other one?",
    responseType: "quotation_plus_explanation", requiredQuotation: "An enormous lens, taller than Maya herself",
    explanationGuidance: "Should explain the chosen quotation is directly about the lens's size, while the other describes the ROOM's walls and their appearance, not the lens's size -- a wrong-focus trap.",
    evidenceLocation: "paragraph 3", difficulty: "medium", teachingUses: ["explicit_teaching", "mastery_check"],
    misconceptionTargeted: "selecting a quotation that is topically related to the claim but does not actually support the specific point being asked about",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-qe-06", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: QE_BP_CHOOSE_BEST_QUOTATION.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "A student wants to show that de-inking is a difficult stage. They could quote either 'One of the trickiest stages is de-inking' or 'the pulp travels through a cleaning process that spins it at high speed'. Which quotation supports the claim?",
    responseType: "quotation_plus_explanation", requiredQuotation: "One of the trickiest stages is de-inking",
    explanationGuidance: "Should explain the chosen quotation directly states de-inking's difficulty, while the other describes a DIFFERENT stage (the spinning/cleaning stage), not de-inking.",
    evidenceLocation: "paragraph 4", difficulty: "medium", teachingUses: ["explicit_teaching", "mastery_check"],
    misconceptionTargeted: "selecting a quotation that is topically related to the claim but does not actually support the specific point being asked about",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-qe-07", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: QE_BP_CHOOSE_BEST_QUOTATION.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "A student wants to show that Ravi felt proud by the end of the day. They could quote either 'he felt entirely, quietly proud' or 'his arms ached pleasantly from holding the string'. Which quotation supports the claim?",
    responseType: "quotation_plus_explanation", requiredQuotation: "he felt entirely, quietly proud",
    explanationGuidance: "Should explain the chosen quotation directly names the feeling of pride, while the other describes physical tiredness, not pride, even though both appear close together.",
    evidenceLocation: "paragraph 5", difficulty: "medium", teachingUses: ["explicit_teaching", "mastery_check"],
    misconceptionTargeted: "selecting a quotation that is topically related to the claim but does not actually support the specific point being asked about",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-qe-08", passageId: PENGUIN_PASSAGE.passageId, blueprintId: QE_BP_CHOOSE_BEST_QUOTATION.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "A student wants to show that huddling shares out the cold fairly among penguins. They could quote either 'huddle together in enormous, tightly packed groups' or 'every penguin shares roughly the same amount of exposure to the biting wind'. Which quotation supports the claim?",
    responseType: "quotation_plus_explanation", requiredQuotation: "every penguin shares roughly the same amount of exposure to the biting wind",
    explanationGuidance: "Should explain the chosen quotation is directly about fairness/sharing, while the other just describes the huddling happening, not that it is shared fairly.",
    evidenceLocation: "paragraph 4", difficulty: "hard", teachingUses: ["explicit_teaching", "mastery_check"],
    misconceptionTargeted: "selecting a quotation that is topically related to the claim but does not actually support the specific point being asked about",
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  // QE_BP_QUOTATION_FOR_INFERENCE
  {
    candidateId: "eng-qe-09", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: QE_BP_QUOTATION_FOR_INFERENCE.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "Find a quotation that suggests Maya did not fully understand the importance of the lighthouse keeper's job until that moment. Explain how it supports this.",
    responseType: "quotation_plus_explanation", requiredQuotation: "Maya understood, properly for the first time, why he still climbed those stairs",
    explanationGuidance: "Should recognise that 'for the first time' implies she hadn't grasped this before, even though she had visited the lighthouse many times.",
    evidenceLocation: "paragraph 4", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-qe-10", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: QE_BP_QUOTATION_FOR_INFERENCE.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "Find a quotation that suggests the cleaning process may not remove every single impurity perfectly. Explain how it supports this.",
    responseType: "quotation_plus_explanation", requiredQuotation: "flinging out heavier impurities",
    explanationGuidance: "Should recognise that the word 'heavier' implies lighter impurities might not be removed by this step, suggesting the process isn't perfectly thorough at every stage.",
    evidenceLocation: "paragraph 3", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-qe-11", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: QE_BP_QUOTATION_FOR_INFERENCE.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "Find a quotation that suggests Ravi will remember the elderly man's words for a long time. Explain how it supports this.",
    responseType: "quotation_plus_explanation", requiredQuotation: "storing them away like a small, valuable coin",
    explanationGuidance: "Should recognise that comparing the words to a treasured 'valuable coin' being 'stored away' suggests he intends to keep and remember them long-term, not just hear and forget them.",
    evidenceLocation: "paragraph 4", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-qe-12", passageId: PENGUIN_PASSAGE.passageId, blueprintId: QE_BP_QUOTATION_FOR_INFERENCE.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "Find a quotation that suggests scientists do not yet fully understand how female penguins recognise their own chicks. Explain how it supports this.",
    responseType: "quotation_plus_explanation", requiredQuotation: "continues to intrigue researchers studying animal communication today",
    explanationGuidance: "Should recognise that 'continues to intrigue researchers' implies this is still an active area of study, suggesting it isn't fully understood yet.",
    evidenceLocation: "paragraph 5", difficulty: "hard", teachingUses: ["scaffolded_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  // QE_BP_TWO_PART_QUOTATION
  {
    candidateId: "eng-qe-13", passageId: LIGHTHOUSE_PASSAGE.passageId, blueprintId: QE_BP_TWO_PART_QUOTATION.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "Find TWO quotations that together show the lighthouse light works only because of teamwork between technology and a person checking it. Explain how they work together.",
    responseType: "quotation_plus_explanation", requiredQuotation: "somebody still has to check that computer is telling the truth", secondRequiredQuotation: "a computer does it",
    explanationGuidance: "Should cite BOTH that 'a computer does it' (the automatic lamp) AND that 'somebody still has to check that computer is telling the truth' (the human check), explaining that both parts are needed together.",
    evidenceLocation: "paragraph 4 (two separate sentences)", difficulty: "hard", teachingUses: ["independent_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-qe-14", passageId: RECYCLED_PAPER_PASSAGE.passageId, blueprintId: QE_BP_TWO_PART_QUOTATION.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "Find TWO quotations that together explain the full de-inking process. Explain how they work together.",
    responseType: "quotation_plus_explanation", requiredQuotation: "chemicals and air bubbles are used to separate ink particles from the paper fibres", secondRequiredQuotation: "The ink rises to the surface as a foam and is skimmed away",
    explanationGuidance: "Should cite BOTH that chemicals/air bubbles separate the ink AND that 'the ink rises to the surface as a foam and is skimmed away', explaining these are two necessary steps of the same process.",
    evidenceLocation: "paragraph 4 (two separate sentences)", difficulty: "hard", teachingUses: ["independent_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-qe-15", passageId: KITE_FESTIVAL_PASSAGE.passageId, blueprintId: QE_BP_TWO_PART_QUOTATION.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "Find TWO quotations that together show Ravi's feelings changed from doubt to relief. Explain how they work together.",
    responseType: "quotation_plus_explanation", requiredQuotation: "Ravi's stomach tightened", secondRequiredQuotation: "Ravi laughed with relief",
    explanationGuidance: "Should cite BOTH 'Ravi's stomach tightened' (doubt/nervousness) AND 'Ravi laughed with relief' (relief), explaining that together they show his feelings shifting over the course of the passage.",
    evidenceLocation: "paragraphs 2 and 4", difficulty: "hard", teachingUses: ["independent_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
  {
    candidateId: "eng-qe-16", passageId: PENGUIN_PASSAGE.passageId, blueprintId: QE_BP_TWO_PART_QUOTATION.blueprintId, familyName: "Quotation + Explanation",
    competencyId: "RC-02", questionTypeId: "QT-RC-02",
    question: "Find TWO quotations that together show the huddle shares the burden of the cold fairly. Explain how they work together.",
    responseType: "quotation_plus_explanation", requiredQuotation: "Individuals continuously rotate from the freezing outer edge of the huddle toward the sheltered centre", secondRequiredQuotation: "every penguin shares roughly the same amount of exposure to the biting wind",
    explanationGuidance: "Should cite BOTH the rotation from edge to centre AND 'every penguin shares roughly the same amount of exposure to the biting wind', explaining the rotation is HOW the fair sharing happens.",
    evidenceLocation: "paragraph 4 (two separate sentences)", difficulty: "hard", teachingUses: ["independent_practice", "transfer"],
    validationCategory: "evidence_anchored", provenance: "angel_original", generatedAt: NOW,
  },
];
