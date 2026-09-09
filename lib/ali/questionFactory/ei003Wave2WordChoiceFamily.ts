import type { Wave2Blueprint, Wave2Candidate } from "./ei003Wave2EnglishTypes";

/**
 * Educational Increment 003, Wave 2 -- wave3-fam-rc10-word-choice.
 * Real, existing production content: 12 rows, but confirmed via the
 * EI003 planning document's own live audit to represent only **1**
 * distinct blueprint -- every row is either "why X rather than Y" or
 * "what does this simile suggest," with no other reasoning demand
 * present despite the largest row count of any Wave 2 target family.
 * Per explicit instruction, this family needs STRUCTURAL expansion, not
 * volume: all four blueprints below are genuinely new demands, not
 * further instances of the existing shape (the existing shape is
 * preserved as one blueprint among four, not discarded).
 */

export const WAVE2_WORD_CHOICE_BLUEPRINTS: Wave2Blueprint[] = [
  {
    blueprintId: "ei003-w2-bp-wc-meaning-in-context",
    familyId: "wave3-fam-rc10-word-choice",
    reasoningRoute: "meaning_in_context",
    demand: "Determine what a single word means/suggests as used in its specific sentence -- no alternative word offered for comparison, no simile to interpret, just precise contextual meaning.",
    stage: "FOUNDATION",
  },
  {
    blueprintId: "ei003-w2-bp-wc-substitution",
    familyId: "wave3-fam-rc10-word-choice",
    reasoningRoute: "word_substitution_rationale",
    demand: "Explain why the author's actual word choice is more precise/effective than a plausible alternative -- the real, already-established production shape, formalised as one blueprint among four.",
    stage: "DEVELOPMENT",
  },
  {
    blueprintId: "ei003-w2-bp-wc-connotation",
    familyId: "wave3-fam-rc10-word-choice",
    reasoningRoute: "connotation_interpretation",
    demand: "Interpret what a figurative comparison (simile/personification) suggests -- the second real, already-established production shape, formalised explicitly as its own distinct blueprint.",
    stage: "INDEPENDENT",
  },
  {
    blueprintId: "ei003-w2-bp-wc-to-atmosphere",
    familyId: "wave3-fam-rc10-word-choice",
    reasoningRoute: "word_choice_to_atmosphere",
    demand: "Recognise a REPEATED pattern of related word choices across the whole passage and explain its cumulative effect on mood/characterisation -- requires synthesis across the passage, never answerable from one isolated word or line.",
    stage: "TRANSFER",
  },
];

export const WAVE2_WORD_CHOICE_CANDIDATES: Wave2Candidate[] = [
  {
    candidateId: "ei003-w2-wc-meaning-01",
    blueprintId: "ei003-w2-bp-wc-meaning-in-context",
    familyId: "wave3-fam-rc10-word-choice",
    passageId: "ei003-w2-eng-crossing-the-fen",
    difficulty: "easy",
    question: "In \"a weathered man named Onyema,\" what does the word \"weathered\" suggest about him?",
    acceptedAnswers: ["experienced, aged or toughened by years outdoors", "worn/aged from long experience in the outdoors", "someone shaped by years of exposure to the elements"],
    evidenceQuotes: ["a weathered man named Onyema"],
    explanationGuidance: "\"Weathered\" specifically suggests a person shaped and toughened by long exposure to outdoor conditions over time -- it tells the reader about his experience and age without stating either directly.",
  },
  {
    candidateId: "ei003-w2-wc-meaning-02",
    blueprintId: "ei003-w2-bp-wc-meaning-in-context",
    familyId: "wave3-fam-rc10-word-choice",
    passageId: "ei003-w2-eng-the-attic-workshop",
    difficulty: "easy",
    question: "In \"a dressmaker's mannequin draped in a sheet that had slipped to reveal one shoulder, oddly human in the low light,\" what does the word \"oddly\" suggest?",
    acceptedAnswers: ["that the mannequin's human-like appearance is unsettling or unexpected", "something strange or unsettling about how lifelike it looks", "it creates an uneasy, unexpected sense of it looking real"],
    evidenceQuotes: ["oddly human in the low light"],
    explanationGuidance: "\"Oddly\" signals that the mannequin's human appearance is unexpected and slightly unsettling, not simply neutral or ordinary -- it shapes how the reader is meant to react to this detail.",
  },
  {
    candidateId: "ei003-w2-wc-subst-01",
    blueprintId: "ei003-w2-bp-wc-substitution",
    familyId: "wave3-fam-rc10-word-choice",
    passageId: "ei003-w2-eng-the-clock-that-stopped",
    difficulty: "medium",
    question: "Why might the writer have chosen \"pressed\" rather than \"put\" in \"listening to the mechanism with her ear pressed close to the case\"?",
    acceptedAnswers: [
      "'pressed' suggests firm, deliberate, close contact, more focused and intense than the plain word 'put'",
      "'pressed' shows real concentration and effort, whereas 'put' would sound casual",
      "it suggests a determined, careful action rather than a casual one",
    ],
    evidenceQuotes: ["her ear pressed close to the case as though it might tell her something the rest of us couldn't hear"],
    explanationGuidance: "\"Pressed\" suggests firm, deliberate, sustained contact, showing real concentration and effort. \"Put\" would describe the same basic action but with none of that intensity or care.",
  },
  {
    candidateId: "ei003-w2-wc-subst-02",
    blueprintId: "ei003-w2-bp-wc-substitution",
    familyId: "wave3-fam-rc10-word-choice",
    passageId: "ei003-w2-eng-the-last-delivery",
    difficulty: "medium",
    question: "Why might the writer have chosen \"waiting\" rather than \"standing\" in \"an elderly man in a dressing gown was already waiting by the gate\"?",
    acceptedAnswers: [
      "'waiting' suggests he was there on purpose, anticipating something, unlike the neutral word 'standing'",
      "'waiting' implies deliberate anticipation, whereas 'standing' would just describe his position without meaning",
      "it shows purpose and expectation, not just his physical position",
    ],
    evidenceQuotes: ["an elderly man in a dressing gown was already waiting by the gate"],
    explanationGuidance: "\"Waiting\" implies the man was there on purpose, anticipating the milk float's arrival -- a small but important detail that hints he already knew something significant was happening. \"Standing\" would describe the same physical position but without that sense of purpose.",
  },
  {
    candidateId: "ei003-w2-wc-conn-01",
    blueprintId: "ei003-w2-bp-wc-connotation",
    familyId: "wave3-fam-rc10-word-choice",
    passageId: "ei003-w2-eng-the-attic-workshop",
    difficulty: "hard",
    question: "The half-finished birdhouse is described as \"leaning against the others like something caught mid-sentence.\" What does this comparison suggest?",
    acceptedAnswers: [
      "it suggests the work was interrupted suddenly and never finished or resumed",
      "it suggests something was abandoned abruptly, frozen at the exact moment it stopped",
      "the comparison implies an unfinished task left suddenly, like a thought cut off",
    ],
    evidenceQuotes: ["a half-finished birdhouse sat exactly where it had been abandoned, one wall still unattached, leaning against the others like something caught mid-sentence"],
    explanationGuidance: "Comparing the birdhouse to something \"caught mid-sentence\" suggests an abrupt, unplanned interruption -- work that stopped suddenly, mid-task, and was simply never picked up again, much like a sentence broken off before it finishes.",
  },
  {
    candidateId: "ei003-w2-wc-conn-02",
    blueprintId: "ei003-w2-bp-wc-connotation",
    familyId: "wave3-fam-rc10-word-choice",
    passageId: "ei003-w2-eng-crossing-the-fen",
    difficulty: "hard",
    question: "The passage says the mud \"pulled at our boots with a strength that seemed almost deliberate.\" What does this comparison suggest?",
    acceptedAnswers: [
      "it suggests the mud seems to be acting on purpose, almost like it has its own intention, emphasising how difficult it is",
      "it personifies the mud, making the ground feel actively hostile rather than just difficult",
      "it makes the mud seem like it is intentionally resisting them, not just naturally sticky",
    ],
    evidenceQuotes: ["the mud pulled at our boots with a strength that seemed almost deliberate"],
    explanationGuidance: "Describing the mud's pull as \"almost deliberate\" gives it a sense of intention, as though the ground itself is resisting them on purpose -- a stronger, more vivid image than simply saying the mud was thick or sticky.",
  },
  {
    candidateId: "ei003-w2-wc-toatmosphere-01",
    blueprintId: "ei003-w2-bp-wc-to-atmosphere",
    familyId: "wave3-fam-rc10-word-choice",
    passageId: "ei003-w2-eng-the-attic-workshop",
    difficulty: "challenge",
    question: "The passage repeatedly describes objects as \"scarred,\" \"cracked,\" \"faded,\" and \"pale.\" What effect does this repeated pattern of word choice have on the overall description of the attic?",
    acceptedAnswers: [
      "the repeated words of wear and decay build a consistent, cumulative atmosphere of age and neglect across the whole room, not just one object",
      "using similar 'worn-out' words for many different objects reinforces the sense that everything has aged together, undisturbed",
      "it creates one unified impression of decay and abandonment spread across the whole space",
    ],
    evidenceQuotes: ["its surface scarred with decades of small cuts", "their leather straps cracked and pale", "so old the print had faded to a uniform grey"],
    explanationGuidance: "No single word choice does this alone -- it is the REPETITION of similar wear-and-decay language across the workbench, the trunks, and the newspapers that builds one consistent, cumulative atmosphere of long neglect spanning the whole room, rather than describing one object in isolation.",
  },
  {
    candidateId: "ei003-w2-wc-toatmosphere-02",
    blueprintId: "ei003-w2-bp-wc-to-atmosphere",
    familyId: "wave3-fam-rc10-word-choice",
    passageId: "ei003-w2-eng-the-last-delivery",
    difficulty: "challenge",
    question: "Near the end of the passage, the writer repeatedly uses words and phrases suggesting stillness and quiet: \"didn't say anything,\" \"didn't start the engine straight away,\" \"sat there.\" What effect does this pattern of word choice have on how Grandad Kofi is presented?",
    acceptedAnswers: [
      "the repeated stillness/quietness in these word choices builds a reflective, subdued impression of him at the end, contrasting with his earlier brisk manner",
      "the pattern of quiet, unhurried language presents him as thoughtful and affected, rather than simply finishing a routine task",
      "it builds a consistent sense of quiet reflection through repeated stillness in his actions",
    ],
    evidenceQuotes: ["didn't say anything to that", "he didn't start the engine straight away", "He sat with both hands resting on the wheel"],
    explanationGuidance: "Each phrase alone is a small, ordinary action, but their repetition -- not saying anything, not starting the engine, simply sitting -- builds a consistent pattern of stillness that presents Grandad Kofi as quietly reflective at the end of the round, a cumulative effect no single phrase could create on its own.",
  },
];
