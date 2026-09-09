import type { Wave2Blueprint, Wave2Candidate } from "./ei003Wave2EnglishTypes";

/**
 * Educational Increment 003, Wave 2 -- wave3-fam-rc10-atmosphere-mood.
 * Real, existing production content: 6 rows, all "a single quoted
 * image/simile -- what does this suggest" (one-shot figurative-language
 * interpretation). Four new blueprints add genuine variation: a single
 * clear sensory image (formalising the real production shape),
 * MULTIPLE accumulated details requiring synthesis across a whole
 * passage (not one quotable line), a genuine atmosphere SHIFT across
 * the passage, and a contrast between the surrounding atmosphere and a
 * character's own response to it.
 */

export const WAVE2_ATMOSPHERE_BLUEPRINTS: Wave2Blueprint[] = [
  {
    blueprintId: "ei003-w2-bp-atm-single-sensory",
    familyId: "wave3-fam-rc10-atmosphere-mood",
    reasoningRoute: "single_sensory_atmosphere",
    demand: "Interpret what one clear sensory/descriptive image suggests about mood -- the real production shape, formalised as one blueprint among several.",
    stage: "FOUNDATION",
  },
  {
    blueprintId: "ei003-w2-bp-atm-accumulated",
    familyId: "wave3-fam-rc10-atmosphere-mood",
    reasoningRoute: "accumulated_atmosphere",
    demand: "Synthesise MULTIPLE separate details spread across a passage into one overall atmosphere -- cannot be answered from any single quoted line alone.",
    stage: "DEVELOPMENT",
  },
  {
    blueprintId: "ei003-w2-bp-atm-change",
    familyId: "wave3-fam-rc10-atmosphere-mood",
    reasoningRoute: "atmosphere_change",
    demand: "Identify a genuine shift in atmosphere between two points in the same passage, with evidence for both the earlier and later states.",
    stage: "INDEPENDENT",
  },
  {
    blueprintId: "ei003-w2-bp-atm-character-contrast",
    familyId: "wave3-fam-rc10-atmosphere-mood",
    reasoningRoute: "atmosphere_character_contrast",
    demand: "Identify a contrast between the surrounding atmosphere/occasion and a specific character's own private response to it -- requires holding two different pieces of evidence in mind at once.",
    stage: "TRANSFER",
  },
];

export const WAVE2_ATMOSPHERE_CANDIDATES: Wave2Candidate[] = [
  {
    candidateId: "ei003-w2-atm-single-01",
    blueprintId: "ei003-w2-bp-atm-single-sensory",
    familyId: "wave3-fam-rc10-atmosphere-mood",
    passageId: "ei003-w2-eng-the-attic-workshop",
    difficulty: "easy",
    question: "The light in the attic is described as \"thin and the colour of weak honey.\" What mood does this description create?",
    acceptedAnswers: ["a faded, quiet, gentle mood", "soft and faint, suggesting age or neglect", "a dim, nostalgic feeling"],
    evidenceQuotes: ["what light did get through arrived thin and the colour of weak honey"],
    explanationGuidance: "Describing the light as thin and weakly golden (rather than bright or warm) creates a soft, faded mood -- suggesting a space that has been quiet and undisturbed for a long time, rather than one full of life or activity.",
  },
  {
    candidateId: "ei003-w2-atm-single-02",
    blueprintId: "ei003-w2-bp-atm-single-sensory",
    familyId: "wave3-fam-rc10-atmosphere-mood",
    passageId: "ei003-w2-eng-the-last-delivery",
    difficulty: "easy",
    question: "By the ninth house, the sky is described as \"the colour of weak tea.\" What atmosphere does this create?",
    acceptedAnswers: ["a dull, muted, quiet morning atmosphere", "flat and unremarkable, low-key", "grey and ordinary, unexciting"],
    evidenceQuotes: ["the sky had gone the colour of weak tea"],
    explanationGuidance: "Comparing the sky to weak tea suggests a pale, muted, unremarkable colour -- creating a flat, quiet atmosphere that matches the ordinary, routine feeling of the morning, rather than anything dramatic.",
  },
  {
    candidateId: "ei003-w2-atm-accum-01",
    blueprintId: "ei003-w2-bp-atm-accumulated",
    familyId: "wave3-fam-rc10-atmosphere-mood",
    passageId: "ei003-w2-eng-the-attic-workshop",
    difficulty: "medium",
    question: "The passage mentions dust settled in soft grey drifts, cobwebs across an empty birdcage, a scarred workbench, and newspapers too faded to read. What overall atmosphere do these details, taken together, create?",
    acceptedAnswers: [
      "a sense of long abandonment -- a space frozen in time, untouched for years",
      "an atmosphere of neglect and stillness, as if time stopped there",
      "a feeling of something once active now completely still and forgotten",
    ],
    evidenceQuotes: ["dust had settled — not evenly, but in soft grey drifts", "cobwebs strung between the frame and an old birdcage that no bird had occupied", "its surface scarred with decades of small cuts", "a stack of newspapers so old the print had faded to a uniform grey"],
    explanationGuidance: "No single detail alone proves the room has been abandoned for years, but the dust, the empty birdcage, the worn workbench, and the illegible newspapers all point the same way when combined -- this is a demand for synthesising several scattered details into one overall impression, not reading off one image.",
  },
  {
    candidateId: "ei003-w2-atm-accum-02",
    blueprintId: "ei003-w2-bp-atm-accumulated",
    familyId: "wave3-fam-rc10-atmosphere-mood",
    passageId: "ei003-w2-eng-the-clock-that-stopped",
    difficulty: "medium",
    question: "Across the passage, the grandmother spreads newspaper on the table, names each tiny part \"as though introducing me to relatives,\" and works \"most Sunday mornings\" all summer. What overall atmosphere do these details create together?",
    acceptedAnswers: [
      "a patient, careful, unhurried atmosphere of shared, old-fashioned attention",
      "a calm, methodical mood built from steady routine and care",
      "an unrushed, affectionate atmosphere around a slow, shared task",
    ],
    evidenceQuotes: ["setting it on newspaper spread across the kitchen table", "as though introducing me to relatives", "We worked on it most Sunday mornings"],
    explanationGuidance: "No one detail alone establishes the unhurried, careful mood of the memory, but the newspaper laid out with care, the almost affectionate way parts are named, and the steady Sunday-morning routine all combine into a single overall atmosphere of patient, shared attention.",
  },
  {
    candidateId: "ei003-w2-atm-change-01",
    blueprintId: "ei003-w2-bp-atm-change",
    familyId: "wave3-fam-rc10-atmosphere-mood",
    passageId: "ei003-w2-eng-crossing-the-fen",
    difficulty: "hard",
    question: "How does the atmosphere of the fen change between the start of the crossing and midday?",
    acceptedAnswers: [
      "it goes from misty, uncertain and hidden to fully open, revealed and clear",
      "from an unclear, mysterious feeling to an exposed, open one",
      "the hidden, uncertain early atmosphere becomes fully visible and revealed by midday",
    ],
    evidenceQuotes: ["the mist still sat low over the reed beds", "By midday the mist had burned away entirely, and the fen revealed itself properly: an enormous flat expanse"],
    explanationGuidance: "At the start, low mist creates an uncertain, half-hidden atmosphere. By midday, that mist has completely cleared, and the passage explicitly says the fen \"revealed itself properly\" -- a genuine, evidenced shift from concealment to full exposure.",
  },
  {
    candidateId: "ei003-w2-atm-change-02",
    blueprintId: "ei003-w2-bp-atm-change",
    familyId: "wave3-fam-rc10-atmosphere-mood",
    passageId: "ei003-w2-eng-the-last-delivery",
    difficulty: "hard",
    question: "How does the atmosphere of the round change from the very ordinary early houses to the final house?",
    acceptedAnswers: [
      "it moves from routine and unremarkable to quiet and significant",
      "from ordinary and businesslike to still and meaningful",
      "the everyday, uneventful feel gives way to a quieter, more weighty mood at the end",
    ],
    evidenceQuotes: ["the round unfolded almost exactly like any other Tuesday", "He sat with both hands resting on the wheel, looking out at the empty street ahead"],
    explanationGuidance: "The passage opens by explicitly describing the round as unfolding like any ordinary day. By the final house, the mood has shifted into something quieter and heavier, marked by Grandad Kofi's pause and stillness -- a genuine atmospheric change across the whole passage, not just a single moment.",
  },
  {
    candidateId: "ei003-w2-atm-contrast-01",
    blueprintId: "ei003-w2-bp-atm-character-contrast",
    familyId: "wave3-fam-rc10-atmosphere-mood",
    passageId: "ei003-w2-eng-crossing-the-fen",
    difficulty: "challenge",
    question: "The fen is described as genuinely dangerous -- shifting stakes, sinking mud, a path that changes with the tide. How does Onyema's own manner contrast with this atmosphere of danger?",
    acceptedAnswers: [
      "despite the real danger, onyema remains calm and confident, reading the ground without needing a map or compass",
      "he moves through the risky landscape with calm expertise rather than visible worry",
      "his relaxed, practised manner contrasts with how genuinely hazardous the setting is",
    ],
    evidenceQuotes: ["a path safe at dawn could be treacherous by noon", "Onyema never once consulted a map or a compass; he read the ground itself"],
    explanationGuidance: "The setting itself is established as genuinely risky and unpredictable. Onyema's behaviour, though, shows no anxiety at all -- he moves without hesitation and without instruments, guided only by close reading of the ground -- a clear contrast between a dangerous atmosphere and one character's calm response to it.",
  },
  {
    candidateId: "ei003-w2-atm-contrast-02",
    blueprintId: "ei003-w2-bp-atm-character-contrast",
    familyId: "wave3-fam-rc10-atmosphere-mood",
    passageId: "ei003-w2-eng-the-relay-baton",
    difficulty: "challenge",
    question: "A relay race is usually a loud, public, competitive occasion. How does Nadia's private feeling that evening contrast with this atmosphere?",
    acceptedAnswers: [
      "the loud, public excitement of the race contrasts with her quiet, private unease at home later that evening",
      "instead of the public energy of the race, she is left with a small, quiet, personal reminder of what happened",
      "the public drama of the event gives way to a private, understated moment alone",
    ],
    evidenceQuotes: ["someone shouted", "It was only that evening, unlacing her trainers at home, that Nadia realised she still had a faint red mark"],
    explanationGuidance: "The race itself is a loud, shared, public occasion, full of shouting and competition. The passage ends, though, on a small, private, almost accidental moment -- Nadia alone at home, quietly noticing a mark on her hand -- a deliberate contrast between the public atmosphere of the event and her own quiet, unresolved feeling about it.",
  },
];
