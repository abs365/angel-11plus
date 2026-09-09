import type { Wave3Blueprint, Wave3Candidate } from "./ei003Wave3EnglishTypes";

/**
 * Educational Increment 003, Wave 3 -- wave1-fam-effect-of-language.
 * Real, existing production content: 4 rows, all "interpret one
 * figurative comparison (simile/personification) and its effect" --
 * a single reasoning skeleton, `medium`/`hard` difficulty. Four new
 * blueprints add genuine variation, matching the Founder's own explicit
 * progression (word/phrase -> meaning in context -> connotation/
 * precision -> effect -> connection to character/atmosphere/meaning):
 * a single figurative comparison's effect (the real production shape,
 * formalised) -> a single word's or phrase's precise meaning in
 * context, with no figurative language involved -> why the author's
 * actual word choice is more precise/effective than a plausible
 * alternative -> a repeated pattern of related word choices across the
 * whole passage and its cumulative effect. None of these reduce to the
 * formulaic "the author uses X to make it interesting" -- every
 * explanation names the specific effect and connects it to character,
 * atmosphere, or meaning.
 *
 * Marks: 2, matching this family's own existing, live convention.
 */

export const WAVE3_LANGUAGE_EFFECT_BLUEPRINTS: Wave3Blueprint[] = [
  {
    blueprintId: "ei003-w3-bp-lang-figurative",
    familyId: "wave1-fam-effect-of-language",
    reasoningRoute: "single_figurative_effect",
    demand: "Interpret what one clear figurative comparison (simile or personification) suggests -- the real production shape, formalised as one blueprint among several.",
    stage: "FOUNDATION",
  },
  {
    blueprintId: "ei003-w3-bp-lang-meaning",
    familyId: "wave1-fam-effect-of-language",
    reasoningRoute: "meaning_in_context",
    demand: "Determine what a single word or short phrase precisely means/suggests as used in its own sentence -- no figurative comparison involved, just precise contextual meaning.",
    stage: "DEVELOPMENT",
  },
  {
    blueprintId: "ei003-w3-bp-lang-substitution",
    familyId: "wave1-fam-effect-of-language",
    reasoningRoute: "word_substitution_rationale",
    demand: "Explain why the author's actual word choice is more precise or effective than a plausible alternative word.",
    stage: "INDEPENDENT",
  },
  {
    blueprintId: "ei003-w3-bp-lang-cumulative",
    familyId: "wave1-fam-effect-of-language",
    reasoningRoute: "cumulative_word_choice_pattern",
    demand: "Recognise a REPEATED pattern of related word choices across the whole passage and explain its cumulative effect -- requires synthesis across the passage, never answerable from one isolated word or line.",
    stage: "TRANSFER",
  },
];

export const WAVE3_LANGUAGE_EFFECT_CANDIDATES: Wave3Candidate[] = [
  {
    candidateId: "ei003-w3-lang-fig-01",
    blueprintId: "ei003-w3-bp-lang-figurative",
    familyId: "wave1-fam-effect-of-language",
    passageId: "wave3-eng-stormharbour",
    difficulty: "medium",
    question: "The sky is described as \"the colour of old bruises.\" What does this comparison suggest?",
    acceptedAnswers: [
      "it suggests something dark, ominous and slightly painful-looking, hinting at the danger of the coming storm",
      "it creates a threatening, unsettling impression of the sky, foreshadowing trouble",
      "the comparison makes the sky feel bruised and menacing, suggesting danger ahead",
    ],
    evidenceQuotes: ["a sky the colour of old bruises"],
    explanationGuidance: "Comparing the sky to old bruises suggests dark, mottled, faintly painful colours -- far more ominous and unsettling than simply saying the sky was grey or dark, and hinting at the danger the storm will bring.",
  },
  {
    candidateId: "ei003-w3-lang-fig-02",
    blueprintId: "ei003-w3-bp-lang-figurative",
    familyId: "wave1-fam-effect-of-language",
    passageId: "wave3-eng-bakersapprentice",
    difficulty: "medium",
    question: "Mr Fenwick carries the flour sack \"as though it weighed nothing more than a folded newspaper.\" What does this comparison suggest about him?",
    acceptedAnswers: [
      "it suggests he is extremely strong and experienced, making genuinely heavy work look effortless",
      "it emphasises how easy the physically demanding task is for him, showing his years of practice",
      "the comparison shows just how little effort the heavy sack costs someone with his experience",
    ],
    evidenceQuotes: ["as though it weighed nothing more than a folded newspaper"],
    explanationGuidance: "Comparing a heavy flour sack to something as light as a folded newspaper emphasises just how effortless the task is for Mr Fenwick -- a vivid way of showing his years of physical experience, far stronger than simply saying he carried it easily.",
  },
  {
    candidateId: "ei003-w3-lang-meaning-01",
    blueprintId: "ei003-w3-bp-lang-meaning",
    familyId: "wave1-fam-effect-of-language",
    passageId: "wave1-eng-newgirl",
    difficulty: "medium",
    question: "Priya notices her voice \"had come out smaller than she'd intended.\" What does the word \"smaller\" suggest here?",
    acceptedAnswers: [
      "it suggests her voice sounded weaker or less confident than she meant it to, revealing her nervousness",
      "it implies a lack of confidence, not literal volume, showing she felt more unsure than she wanted to appear",
      "it suggests she sounded timid or unsure, betraying nerves she was trying to hide",
    ],
    evidenceQuotes: ["her voice had come out smaller than she'd intended"],
    explanationGuidance: "\"Smaller\" here is not describing literal size or loudness -- it suggests her voice sounded weaker and less confident than she meant it to, revealing nervousness she was trying to hide.",
  },
  {
    candidateId: "ei003-w3-lang-meaning-02",
    blueprintId: "ei003-w3-bp-lang-meaning",
    familyId: "wave1-fam-effect-of-language",
    passageId: "wave3-eng-newtrainers",
    difficulty: "medium",
    question: "The passage says Jayden \"told himself\" it didn't matter what Connor thought. What does the phrase \"told himself\" suggest about whether he truly believed this?",
    acceptedAnswers: [
      "it suggests he was trying to convince himself of something he didn't fully believe, meaning it probably did matter to him",
      "'told himself' implies self-persuasion, hinting that he actually did care what connor thought",
      "it suggests he was talking himself into a feeling rather than genuinely feeling it, showing he was more affected than he admits",
    ],
    evidenceQuotes: ["Jayden told himself it didn't matter what Connor thought"],
    explanationGuidance: "\"Told himself\" is a precise choice -- it implies active self-persuasion, as though he needed convincing, which suggests the opposite of indifference: Jayden likely did care what Connor thought, even while trying to talk himself out of it.",
  },
  {
    candidateId: "ei003-w3-lang-subst-01",
    blueprintId: "ei003-w3-bp-lang-substitution",
    familyId: "wave1-fam-effect-of-language",
    passageId: "wave3-eng-bakersapprentice",
    difficulty: "hard",
    question: "Why might the writer have chosen \"hurried\" rather than \"went\" in \"Priya hurried to lift a sack of her own\"?",
    acceptedAnswers: [
      "'hurried' suggests urgency and eagerness to keep pace with mr fenwick, more than the plain word 'went' would",
      "'hurried' shows determination and a wish to match his speed, whereas 'went' would sound neutral and unhurried",
      "it suggests she felt pressure to keep up immediately, not simply moving over in her own time",
    ],
    evidenceQuotes: ["Priya hurried to lift a sack of her own"],
    explanationGuidance: "\"Hurried\" suggests urgency and a real eagerness to keep pace with Mr Fenwick's own effortless speed. \"Went\" would describe the same basic movement but without that sense of pressure or determination.",
  },
  {
    candidateId: "ei003-w3-lang-subst-02",
    blueprintId: "ei003-w3-bp-lang-substitution",
    familyId: "wave1-fam-effect-of-language",
    passageId: "wave3-eng-stormharbour",
    difficulty: "hard",
    question: "Why might the writer have chosen \"clang\" rather than \"knock\" in \"make the loose rigging on the moored boats clang against their masts\"?",
    acceptedAnswers: [
      "'clang' suggests a harsh, sharp, metallic sound, more unsettling and dramatic than the plainer word 'knock'",
      "'clang' creates a jarring, ominous noise that fits the tense atmosphere, whereas 'knock' would sound mild and ordinary",
      "it suggests a loud, unpleasant, alarming sound, adding to the sense that something is wrong",
    ],
    evidenceQuotes: ["make the loose rigging on the moored boats clang against their masts"],
    explanationGuidance: "\"Clang\" suggests a harsh, sharp, metallic sound -- far more jarring and ominous than the milder \"knock\", and fitting for a passage building tension before a storm.",
  },
  {
    candidateId: "ei003-w3-lang-cumulative-01",
    blueprintId: "ei003-w3-bp-lang-cumulative",
    familyId: "wave1-fam-effect-of-language",
    passageId: "wave1-eng-atticdoor",
    difficulty: "challenge",
    question: "The passage repeatedly describes dust and age: \"dust drifted down\", \"dust and damp wood\", \"grey dust sheets\", corners \"dulled almost black with age.\" What effect does this repeated pattern of word choice have on the description of the attic?",
    acceptedAnswers: [
      "the repeated references to dust and age build a consistent, cumulative sense of long neglect across the whole attic, not just one object",
      "using similar dust/decay language for many different things reinforces the impression that everything has been undisturbed for years",
      "it creates one unified atmosphere of age and abandonment spread across the whole space",
    ],
    evidenceQuotes: ["A fine white dust drifted down and settled on his sleeve", "thick with the particular smell of old houses: dust and damp wood", "Shapes crouched under grey dust sheets", "its brass corners dulled almost black with age"],
    explanationGuidance: "No single word choice creates this alone -- it is the REPETITION of dust-and-age language across the door, the air, the furniture, and the trunk itself that builds one consistent, cumulative sense of long neglect spanning the whole attic, rather than describing one object in isolation.",
  },
  {
    candidateId: "ei003-w3-lang-cumulative-02",
    blueprintId: "ei003-w3-bp-lang-cumulative",
    familyId: "wave1-fam-effect-of-language",
    passageId: "wave1-eng-raceday",
    difficulty: "challenge",
    question: "The passage repeatedly emphasises precision in Ade's preparation: \"deliberate laps\", \"exactly the right angle\", \"matching his practised splits almost to the second.\" What effect does this repeated pattern of word choice have on how Ade is presented?",
    acceptedAnswers: [
      "the repeated emphasis on exactness and precision builds an impression of controlled, almost anxious carefulness, contrasting with cass's relaxed manner",
      "using precise, exact language throughout suggests a character who needs everything to be exactly right, hinting at underlying nervousness",
      "it creates a consistent sense of controlled precision that later helps explain his anxiety",
    ],
    evidenceQuotes: ["jogging slow, deliberate laps to loosen muscles that did not need loosening", "running through the handover with an imaginary baton held out at exactly the right angle", "matching his practised splits almost to the second"],
    explanationGuidance: "No single phrase alone proves Ade is anxious, but the repeated emphasis on precision and exactness -- deliberate laps, an exact angle, splits matched almost to the second -- builds a consistent impression of someone who needs tight control, which the passage later confirms is linked to real nervousness, not simple thoroughness.",
  },
];
