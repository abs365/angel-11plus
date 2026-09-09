import type { Wave3Blueprint, Wave3Candidate } from "./ei003Wave3EnglishTypes";

/**
 * Educational Increment 003, Wave 3 -- wave3-fam-rc01-retrieval.
 * Real, existing production content: 5 rows, all "locate one clearly-
 * stated detail" (a single explicit fact, always easy difficulty, no
 * distractor or combination demand). Four new blueprints add genuine
 * progression, per the Founder's own explicit ladder: locate explicit
 * information (the real production shape, formalised) -> distinguish
 * relevant from nearby distractor information -> combine two explicitly
 * stated details -> retrieve accurately across evidence separated by
 * intervening text. None of these reduce retrieval to keyword
 * matching -- each requires genuinely reading and locating real
 * sentence-level content in a real, already-live passage.
 *
 * Passages: reuses the existing rc01-retrieval passage pool (5 wave3-
 * eng-* passages) plus, for genuine diversity per the Wave 2 lesson
 * against over-concentration, the 6 wave1-eng-* passages already shared
 * by the other three Wave 3 target families -- all already live,
 * already-registered `ali_passage_bank` content; no new passage is
 * authored by this wave.
 */

export const WAVE3_RETRIEVAL_BLUEPRINTS: Wave3Blueprint[] = [
  {
    blueprintId: "ei003-w3-bp-ret-explicit-detail",
    familyId: "wave3-fam-rc01-retrieval",
    reasoningRoute: "explicit_single_detail",
    demand: "Locate one clearly-stated, unambiguous detail -- the real production shape, formalised as one blueprint among several.",
    stage: "FOUNDATION",
  },
  {
    blueprintId: "ei003-w3-bp-ret-distractor",
    familyId: "wave3-fam-rc01-retrieval",
    reasoningRoute: "distinguish_from_distractor",
    demand: "Two similar candidate details exist nearby in the passage (e.g. two characters, two moments) -- the learner must identify which one actually answers the question, not merely recognise a plausible-looking match.",
    stage: "DEVELOPMENT",
  },
  {
    blueprintId: "ei003-w3-bp-ret-combine",
    familyId: "wave3-fam-rc01-retrieval",
    reasoningRoute: "combine_two_details",
    demand: "The question requires citing TWO separate, explicitly-stated details together -- neither alone is a complete answer.",
    stage: "INDEPENDENT",
  },
  {
    blueprintId: "ei003-w3-bp-ret-distance",
    familyId: "wave3-fam-rc01-retrieval",
    reasoningRoute: "retrieve_across_distance",
    demand: "The answer is still explicitly stated (not inferred), but is separated from the question's own cue by real intervening passage content, requiring a genuine search rather than a first-line match.",
    stage: "TRANSFER",
  },
];

export const WAVE3_RETRIEVAL_CANDIDATES: Wave3Candidate[] = [
  {
    candidateId: "ei003-w3-ret-explicit-01",
    blueprintId: "ei003-w3-bp-ret-explicit-detail",
    familyId: "wave3-fam-rc01-retrieval",
    passageId: "wave1-eng-kitemaker",
    difficulty: "easy",
    question: "What did Grandad keep his old newspapers in?",
    acceptedAnswers: ["a box marked, in faded pen, kites only", "a box labelled kites only", "an old box marked kites only"],
    evidenceQuotes: ["a box marked, in faded pen, KITES ONLY"],
    explanationGuidance: "The passage states directly that Grandad kept a stack of old newspapers in a box marked, in faded pen, KITES ONLY -- a single, clearly-stated detail requiring no inference.",
  },
  {
    candidateId: "ei003-w3-ret-explicit-02",
    blueprintId: "ei003-w3-bp-ret-explicit-detail",
    familyId: "wave3-fam-rc01-retrieval",
    passageId: "wave3-eng-bakersapprentice",
    difficulty: "easy",
    question: "How long had Mr Fenwick run the bakery on Corn Street?",
    acceptedAnswers: ["forty years", "40 years"],
    evidenceQuotes: ["Old Mr Fenwick had run the bakery on Corn Street for forty years"],
    explanationGuidance: "The passage states this explicitly in its opening sentence -- forty years, a single clearly-stated fact.",
  },
  {
    candidateId: "ei003-w3-ret-distractor-01",
    blueprintId: "ei003-w3-bp-ret-distractor",
    familyId: "wave3-fam-rc01-retrieval",
    passageId: "wave1-eng-newgirl",
    difficulty: "medium",
    question: "Two different people speak to Priya near the start of her lunchtime. Which one actually invites her to sit with them: the girl with the long plait, or the boy from her form group?",
    acceptedAnswers: ["the boy from her form group", "the boy", "the boy, not the girl with the plait"],
    evidenceQuotes: ["\"You can sit with us, if you want.\"", "It was a boy from her form group", "A girl with a long plait had smiled at her in the corridor that morning"],
    explanationGuidance: "Both people speak to Priya, which makes this a genuine distinguishing task, not a single-detail lookup. The girl with the plait only asks \"you're the new one, right?\" before being swept away -- she never invites Priya anywhere. It is the boy from her form group who actually says \"You can sit with us, if you want.\" A learner who answers 'the girl' has confused a friendly moment with an actual invitation.",
    distractorRationale: "The girl with the long plait is the more prominent, earlier-mentioned social approach, making her a plausible but incorrect answer for a learner skimming rather than reading closely.",
  },
  {
    candidateId: "ei003-w3-ret-distractor-02",
    blueprintId: "ei003-w3-bp-ret-distractor",
    familyId: "wave3-fam-rc01-retrieval",
    passageId: "wave1-eng-raceday",
    difficulty: "medium",
    question: "Which runner, Ade or Cass, is described reading their split times again on the morning of the race?",
    acceptedAnswers: ["ade", "ade, not cass"],
    evidenceQuotes: ["he had read it twice already that morning, as if the numbers might have changed overnight", "Cass arrived forty minutes before the race, ate half a banana, and lay down on the grass with her cap over her eyes"],
    explanationGuidance: "Both runners are described preparing for the race, so this requires distinguishing between them precisely. It is Ade who has read his split times twice that morning. Cass's own preparation (arriving late, eating a banana, lying down) is described immediately nearby and could be mistaken for the same behaviour by a learner not reading carefully.",
    distractorRationale: "Cass is introduced in the very next sentence after Ade's own detail, making her a plausible but incorrect answer if the two characters' actions are conflated.",
  },
  {
    candidateId: "ei003-w3-ret-combine-01",
    blueprintId: "ei003-w3-bp-ret-combine",
    familyId: "wave3-fam-rc01-retrieval",
    passageId: "wave3-eng-stormharbour",
    difficulty: "medium",
    question: "Name two separate things people do at the harbour that show they sense a storm is coming.",
    acceptedAnswers: [
      "sam's father keeps checking his watch and the water, and mrs okafor closes the harbour café shutters two hours early",
      "the father repeatedly checks his watch, and mrs okafor shuts the café early",
      "checking the watch/water repeatedly and closing the shutters early",
    ],
    evidenceQuotes: ["his father checked his watch, then looked back out at the water, then checked his watch again", "Mrs Okafor was pulling the shutters closed on the harbour café two hours before she normally would"],
    explanationGuidance: "Neither detail alone fully answers 'two separate things' -- the question explicitly requires citing both: Sam's father's repeated watch-checking, and Mrs Okafor closing the café shutters two hours earlier than usual. Combining them is what the question asks for.",
  },
  {
    candidateId: "ei003-w3-ret-combine-02",
    blueprintId: "ei003-w3-bp-ret-combine",
    familyId: "wave3-fam-rc01-retrieval",
    passageId: "wave1-eng-atticdoor",
    difficulty: "medium",
    question: "Name two separate things Marcus does to get into the attic before he reaches the trunk.",
    acceptedAnswers: [
      "he works a knife into the door's seam, and he tests each floorboard before trusting his weight",
      "prising the door open with a knife and carefully testing the boards",
      "opening the painted-shut door with a knife, then picking his way carefully across the floor",
    ],
    evidenceQuotes: ["He worked a flat-bladed knife into the seam where the door met the frame", "He picked his way across the boards, testing each one before he trusted it with his full weight"],
    explanationGuidance: "The question asks for two separate actions, so citing only one is incomplete. Marcus first works a knife into the door's seam to open it, and separately, once inside, tests each floorboard before trusting his weight on it -- two distinct, explicitly-described actions.",
  },
  {
    candidateId: "ei003-w3-ret-distance-01",
    blueprintId: "ei003-w3-bp-ret-distance",
    familyId: "wave3-fam-rc01-retrieval",
    passageId: "wave3-eng-newtrainers",
    difficulty: "hard",
    question: "By the end of the school day, what has Jayden done with his new trainers, and what does he wear home instead?",
    acceptedAnswers: [
      "he tucks the trainers at the back of his locker and wears his old, scuffed pair home",
      "hides the new trainers in his locker and walks home in his old pair",
      "puts the trainers at the back of his locker and wears his scuffed old shoes instead",
    ],
    evidenceQuotes: ["the trainers were tucked at the very back of his locker", "Jayden walked home in his old, scuffed pair instead"],
    explanationGuidance: "The answer is explicitly stated, but only in the passage's final sentence, after several unrelated details about the school day (Connor's reaction, Jayden telling himself it didn't matter). A learner must read past that intervening content to find the actual outcome, not stop at the first plausible-sounding detail.",
  },
  {
    candidateId: "ei003-w3-ret-distance-02",
    blueprintId: "ei003-w3-bp-ret-distance",
    familyId: "wave3-fam-rc01-retrieval",
    passageId: "wave1-eng-lettertonana",
    difficulty: "hard",
    question: "What specific earlier embarrassing moment does Dara compare her first day getting lost to?",
    acceptedAnswers: ["falling off the stage in year 4", "the time she fell off the stage in year 4", "when she fell off stage in year 4"],
    evidenceQuotes: ["the most embarrassing thing that has ever happened to me, and I am including the time I fell off the stage in Year 4"],
    explanationGuidance: "The specific comparison is buried inside a longer sentence about her first day getting lost, not stated as its own separate fact -- a learner must read the full sentence carefully to find the embedded detail (falling off the stage in Year 4) rather than stopping at the general claim that it was embarrassing.",
  },
];
