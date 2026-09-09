import type { Wave3Blueprint, Wave3Candidate } from "./ei003Wave3EnglishTypes";

/**
 * Educational Increment 003, Wave 3 -- wave1-fam-comparative-extraction.
 * Real, existing production content: 4 rows, all "compare how [one
 * character] feels/behaves at the start of the passage with how they
 * feel/behave at the end" -- a single reasoning skeleton (same-
 * character before/after), all `medium` difficulty. Four new blueprints
 * add genuine variation, matching this wave's own progression: same-
 * character before/after (the real production shape, formalised) ->
 * comparing two DIFFERENT characters' reactions/approach to the same
 * situation -> comparing two settings/descriptions at different points
 * (not a character) -> an explicit similarity-AND-difference demand
 * requiring evidence for both halves. This is the same taxonomy
 * demand already deepened for the separate `wave3-fam-rc07-comparative`
 * family_id in Wave 2 (see `familyTaxonomy.ts`'s own consolidation
 * table), but this is a genuinely separate `family_id` with its own
 * real learner-selection pool -- new content here is real, additional
 * depth, not a duplicate of Wave 2's own work.
 *
 * Marks: 2, matching this family's own existing, live convention
 * (never Wave 2's 1-mark convention, which belongs to a different
 * family_id).
 */

export const WAVE3_COMPARATIVE_BLUEPRINTS: Wave3Blueprint[] = [
  {
    blueprintId: "ei003-w3-bp-comp-before-after",
    familyId: "wave1-fam-comparative-extraction",
    reasoningRoute: "single_character_before_after",
    demand: "Compare one character's own state at the start of the passage with their state at the end -- the real production shape, formalised as one blueprint among several.",
    stage: "FOUNDATION",
  },
  {
    blueprintId: "ei003-w3-bp-comp-two-characters",
    familyId: "wave1-fam-comparative-extraction",
    reasoningRoute: "compare_two_characters_reaction",
    demand: "Compare how two DIFFERENT characters approach or react to the same situation -- a genuinely different demand from one character's own before/after.",
    stage: "DEVELOPMENT",
  },
  {
    blueprintId: "ei003-w3-bp-comp-settings",
    familyId: "wave1-fam-comparative-extraction",
    reasoningRoute: "compare_settings_or_descriptions",
    demand: "Compare a setting's or description's own state at two different points -- comparison applied to place/description rather than to a character.",
    stage: "INDEPENDENT",
  },
  {
    blueprintId: "ei003-w3-bp-comp-simdiff",
    familyId: "wave1-fam-comparative-extraction",
    reasoningRoute: "similarity_and_difference",
    demand: "State BOTH a genuine similarity AND a genuine difference between two characters, each independently supported by its own evidence -- a materially deeper demand than identifying difference alone.",
    stage: "TRANSFER",
  },
];

export const WAVE3_COMPARATIVE_CANDIDATES: Wave3Candidate[] = [
  {
    candidateId: "ei003-w3-comp-beforeafter-01",
    blueprintId: "ei003-w3-bp-comp-before-after",
    familyId: "wave1-fam-comparative-extraction",
    passageId: "wave1-eng-kitemaker",
    difficulty: "medium",
    question: "Compare how Femi feels about kite-making at the start of the passage with how he feels by the end. What has changed?",
    acceptedAnswers: [
      "at the start he feels clumsy and unsure handling the bamboo, but by the end he feels a quiet sense of achievement",
      "he begins unfamiliar and awkward with the materials, and ends feeling that the small nod from grandad was enough of a celebration",
      "his early clumsiness gives way to quiet satisfaction and pride by the end",
    ],
    evidenceQuotes: ["Femi's hands, usually so quick at video games, felt suddenly clumsy around the thin wood", "Femi realised, watching Grandad's face, that this was the closest thing to a celebration he was going to get, and that somehow it was enough"],
    explanationGuidance: "At the start, Femi's hands feel clumsy and unfamiliar with the bamboo -- a real contrast to how quick they usually are at video games. By the end, after successfully completing the frame, he feels a quiet, real sense of achievement, even though Grandad's own response is understated -- a clear emotional shift across the passage.",
  },
  {
    candidateId: "ei003-w3-comp-beforeafter-02",
    blueprintId: "ei003-w3-bp-comp-before-after",
    familyId: "wave1-fam-comparative-extraction",
    passageId: "wave3-eng-newtrainers",
    difficulty: "medium",
    question: "Compare how Jayden behaves with his new trainers at the start of the school day with how he behaves by the end. What has changed?",
    acceptedAnswers: [
      "at the start he proudly takes the longest route to show them off, but by the end he hides them and takes the shortest route home in his old shoes",
      "he begins deliberately showing the trainers off, and ends deliberately hiding them away",
      "his early pride and display give way to disappointment and concealment by the end of the day",
    ],
    evidenceQuotes: ["he spent the whole morning walking very deliberately past groups of people, taking the longest possible route between lessons", "the trainers were tucked at the very back of his locker, and Jayden walked home in his old, scuffed pair instead, taking the shortest route he knew"],
    explanationGuidance: "At the start of the day, Jayden deliberately takes the longest route between lessons to show his new trainers off. By the end, after nobody reacts the way he'd hoped, he hides them at the back of his locker and takes the shortest route home in his old pair -- a clear reversal in both his behaviour and his choice of route.",
  },
  {
    candidateId: "ei003-w3-comp-twochar-01",
    blueprintId: "ei003-w3-bp-comp-two-characters",
    familyId: "wave1-fam-comparative-extraction",
    passageId: "wave1-eng-newgirl",
    difficulty: "medium",
    question: "Compare how the girl with the long plait and the boy from Priya's form group each interact with her. What is the difference in how they approach her?",
    acceptedAnswers: [
      "the girl offers a fleeting, friendly moment that is interrupted before it can develop, while the boy makes a direct, casual invitation that actually includes her",
      "the girl's kindness is brief and cut short, but the boy's is a genuine, followed-through invitation",
      "one is a passing smile that goes nowhere, the other is a real invitation she accepts",
    ],
    evidenceQuotes: ["A girl with a long plait had smiled at her in the corridor that morning, a genuine smile, and said \"you're the new one, right?\" before being swept away by a wave of friends before Priya could answer", "\"You can sit with us, if you want.\""],
    explanationGuidance: "Both the girl and the boy show a moment of kindness towards Priya, but their approaches differ in outcome: the girl's genuine smile and question are interrupted before Priya can even respond, going nowhere, while the boy's casual invitation is direct and leads to Priya actually sitting with him and his friends.",
  },
  {
    candidateId: "ei003-w3-comp-twochar-02",
    blueprintId: "ei003-w3-bp-comp-two-characters",
    familyId: "wave1-fam-comparative-extraction",
    passageId: "wave3-eng-bakersapprentice",
    difficulty: "medium",
    question: "Compare how easily Mr Fenwick carries a flour sack with how Priya manages hers. What is the difference?",
    acceptedAnswers: [
      "mr fenwick lifts and carries his sack with no visible effort, while priya struggles and has to drag hers across the floor",
      "he handles the sack effortlessly, but she finds it much harder and slower",
      "his experience makes it look easy, while her inexperience makes it a real struggle",
    ],
    evidenceQuotes: ["Mr Fenwick picked up a single sack, hoisted it onto his shoulder without any visible effort, and carried it through to the ovens as though it weighed nothing more than a folded newspaper", "Priya hurried to lift a sack of her own. It did not move nearly so easily. By the time she had dragged it halfway across the floor, Mr Fenwick was already three sacks ahead of her"],
    explanationGuidance: "Mr Fenwick's forty years of experience are shown through how effortlessly he lifts and carries his sack, as though it weighs nothing. Priya's inexperience is shown by direct contrast: her own sack does not move nearly so easily, and she is still dragging it across the floor while he is already three sacks ahead.",
  },
  {
    candidateId: "ei003-w3-comp-settings-01",
    blueprintId: "ei003-w3-bp-comp-settings",
    familyId: "wave1-fam-comparative-extraction",
    passageId: "wave3-eng-emptyclassroom",
    difficulty: "hard",
    question: "Compare the classroom Maya usually experiences with the classroom she finds this particular morning. What has changed?",
    acceptedAnswers: [
      "usually the classroom just belongs quietly to her before anyone arrives, but this morning it is unusually tidy, clean and still in a way that feels different and unsettling",
      "normally it is simply empty and hers, but this morning small details -- the clean whiteboard, the shut window, the stillness -- suggest something is different",
      "the ordinary emptiness she enjoys is replaced this morning by an unusual, careful tidiness and an unsettling quiet",
    ],
    evidenceQuotes: ["She liked the ten minutes before anyone else came, when the classroom belonged only to her", "The whiteboard, normally smudged with yesterday's lesson, had been wiped completely clean", "the room held a stillness that made her steps sound too loud"],
    explanationGuidance: "Ordinarily, Maya simply enjoys having the empty classroom to herself. This particular morning is compared directly against that normal state: the whiteboard is unusually clean, the window unusually shut, and the room holds a stillness noticeable enough that her own footsteps sound too loud -- the same room, but changed in several small, specific ways.",
  },
  {
    candidateId: "ei003-w3-comp-settings-02",
    blueprintId: "ei003-w3-bp-comp-settings",
    familyId: "wave1-fam-comparative-extraction",
    passageId: "wave1-eng-atticdoor",
    difficulty: "hard",
    question: "Compare the attic door as Marcus first finds it with what he discovers once he is inside the attic. What is the difference between the two?",
    acceptedAnswers: [
      "the door itself is sealed, painted shut and untouched for years, but inside the attic is full of old, dust-covered objects and a specific trunk waiting to be found",
      "outside is a blank, sealed door nobody has opened in years; inside is a whole hidden space of old furniture and dust",
      "the sealed, ordinary-looking door hides a dim, cluttered space full of forgotten objects",
    ],
    evidenceQuotes: ["The attic door had been painted shut for as long as Marcus could remember", "Nobody in the house had opened it in years", "The attic beyond was dim, lit only by a single grimy window at the far end", "Shapes crouched under grey dust sheets, furniture from decades Marcus couldn't guess at, their outlines softened and strange"],
    explanationGuidance: "The door itself is described as sealed and untouched, giving no hint of what lies beyond. Once Marcus is inside, the passage reveals a very different scene: a dim, dusty attic full of old, shape-shifted furniture -- a clear contrast between the plain, blank exterior and the cluttered, atmospheric interior.",
  },
  {
    candidateId: "ei003-w3-comp-simdiff-01",
    blueprintId: "ei003-w3-bp-comp-simdiff",
    familyId: "wave1-fam-comparative-extraction",
    passageId: "wave1-eng-newgirl",
    difficulty: "challenge",
    question: "Compare the girl with the long plait and the boy from Priya's form group. What is one thing they have in common, and what is one way they are different?",
    acceptedAnswers: [
      "similarity: both show Priya a moment of genuine, casual kindness; difference: the girl's moment is cut short before it can go anywhere, while the boy's leads to Priya actually staying with him and his friends",
      "they are similar because both are kind to her without being asked; they differ because only the boy's kindness actually includes her in something",
      "both are warm towards her, but only one of them follows through into a real connection",
    ],
    evidenceQuotes: ["a genuine smile", "an easy, unbothered laugh", "swept away by a wave of friends before Priya could answer", "She sat down at the edge of the group, said very little for the rest of lunch, and found, to her own surprise, that she didn't mind"],
    explanationGuidance: "The similarity: both the girl and the boy show Priya real, unforced warmth -- a genuine smile from one, an easy laugh from the other. The difference lies in what happens next: the girl's moment is interrupted and goes nowhere, while the boy's casual invitation leads to Priya genuinely staying and, to her own surprise, not minding it. Both halves need their own evidence -- the similarity is not enough on its own.",
  },
  {
    candidateId: "ei003-w3-comp-simdiff-02",
    blueprintId: "ei003-w3-bp-comp-simdiff",
    familyId: "wave1-fam-comparative-extraction",
    passageId: "wave1-eng-raceday",
    difficulty: "challenge",
    question: "Compare Ade and Cass's performances in the relay race itself. What do they have in common, and what is different about how each of them approaches it?",
    acceptedAnswers: [
      "similarity: both run their leg successfully and well; difference: ade is anxious and methodical about it, while cass is relaxed and seems almost uninterested in the outcome",
      "they are similar because both perform their leg competently; they differ because his approach is nervous and prepared, while hers is careless and easy",
      "both succeed in their leg of the race, but his success comes from anxious preparation and hers from apparent indifference",
    ],
    evidenceQuotes: ["Ade ran his leg exactly as planned, matching his practised splits almost to the second, and handed off cleanly", "Cass ran the anchor leg the way she seemed to do everything: as though the outcome had already been decided somewhere she wasn't especially interested in checking", "the familiar tightening in his chest", "without moving the cap"],
    explanationGuidance: "The similarity: both Ade and Cass perform their own leg of the relay successfully -- his handover is clean, and she crosses the line first. The difference is in HOW they get there: Ade's success comes from anxious, methodical preparation (the tightening in his chest, his laminated split times), while Cass's comes with an almost uninterested calm (not even moving her cap to reply). Both halves -- the shared success and the contrasting manner -- need their own evidence.",
  },
];
