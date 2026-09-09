import type { Wave2Blueprint, Wave2Candidate } from "./ei003Wave2EnglishTypes";

/**
 * Educational Increment 003, Wave 2 -- wave3-fam-rc07-comparative.
 * Real, existing production content: 2 rows, both "compare how X does A
 * with how X does B" (same character, two moments/tasks). Four new
 * blueprints add genuine variation: comparing two DIFFERENT characters'
 * reactions to the same event, comparing the same character across
 * time (formalising the real production shape), comparing two settings
 * at different moments, and an explicit similarity-AND-difference demand
 * requiring evidence for both halves.
 */

export const WAVE2_COMPARATIVE_BLUEPRINTS: Wave2Blueprint[] = [
  {
    blueprintId: "ei003-w2-bp-comp-reactions",
    familyId: "wave3-fam-rc07-comparative",
    reasoningRoute: "compare_reactions",
    demand: "Compare how two DIFFERENT characters respond to the same shared event -- a genuinely different demand from comparing one character's own before/after.",
    stage: "FOUNDATION",
  },
  {
    blueprintId: "ei003-w2-bp-comp-across-time",
    familyId: "wave3-fam-rc07-comparative",
    reasoningRoute: "compare_across_time",
    demand: "Compare the same character's own behaviour or state at two different points in the passage -- the real production shape, formalised as one blueprint among several.",
    stage: "DEVELOPMENT",
  },
  {
    blueprintId: "ei003-w2-bp-comp-settings",
    familyId: "wave3-fam-rc07-comparative",
    reasoningRoute: "compare_settings",
    demand: "Compare the same setting's own atmosphere or state at two different moments -- comparison applied to place/atmosphere rather than to a character.",
    stage: "INDEPENDENT",
  },
  {
    blueprintId: "ei003-w2-bp-comp-similarity-difference",
    familyId: "wave3-fam-rc07-comparative",
    reasoningRoute: "similarity_and_difference",
    demand: "State BOTH a genuine similarity AND a genuine difference between two characters, each independently supported by its own evidence -- a materially deeper demand than identifying difference alone.",
    stage: "TRANSFER",
  },
];

export const WAVE2_COMPARATIVE_CANDIDATES: Wave2Candidate[] = [
  {
    candidateId: "ei003-w2-comp-reactions-01",
    blueprintId: "ei003-w2-bp-comp-reactions",
    familyId: "wave3-fam-rc07-comparative",
    passageId: "ei003-w2-eng-the-relay-baton",
    difficulty: "medium",
    question: "After the race, compare how Nadia and Marcus each react to their own part in the loss. What is the difference?",
    acceptedAnswers: [
      "nadia reflects and reaches out to talk to marcus, while marcus withdraws and avoids talking",
      "nadia is quietly thoughtful and tries to comfort marcus, but marcus stays withdrawn, kicking gravel and giving short answers",
      "she engages with what happened, he pulls away and goes quiet",
    ],
    evidenceQuotes: ["Marcus hanging slightly behind the rest of the group, kicking at loose gravel", "\"Nearly,\" he said eventually, and kept his eyes on the gravel", "She slowed her own pace until she was walking beside him"],
    explanationGuidance: "Nadia's reaction is shown through action: she deliberately slows down to walk beside Marcus and speaks to him. Marcus's reaction is shown through withdrawal: he lags behind, kicks at gravel, and gives a short, one-word answer without meeting anyone's eyes -- a clear contrast in how the two characters handle the same disappointing result.",
  },
  {
    candidateId: "ei003-w2-comp-reactions-02",
    blueprintId: "ei003-w2-bp-comp-reactions",
    familyId: "wave3-fam-rc07-comparative",
    passageId: "ei003-w2-eng-the-last-delivery",
    difficulty: "medium",
    question: "Compare how Mrs Aldridge and Mr Whitfield each treat the milk delivery on Grandad Kofi's last morning. What is the difference?",
    acceptedAnswers: [
      "mrs aldridge treats it as an ordinary delivery (just leaves a note about the milk), while mr whitfield treats it as significant, waiting at the gate and reflecting on the thirty-one years",
      "she treats it like any normal day, he clearly knows it's meaningful and marks the moment",
      "mrs aldridge is unaware or unbothered, mr whitfield is deliberately present and reflective",
    ],
    evidenceQuotes: ["Mrs Aldridge left a note under an empty bottle: TWO PINTS, NOT ONE, THANK YOU", "an elderly man in a dressing gown was already waiting by the gate", "You brought milk to my mother before you brought it to me"],
    explanationGuidance: "Mrs Aldridge's response (a routine note about quantity) shows no awareness anything is different about this round. Mr Whitfield, by contrast, is already waiting, references the full thirty-one years, and holds the bottles longer than necessary -- his behaviour shows he understands the moment's significance.",
  },
  {
    candidateId: "ei003-w2-comp-time-01",
    blueprintId: "ei003-w2-bp-comp-across-time",
    familyId: "wave3-fam-rc07-comparative",
    passageId: "ei003-w2-eng-the-last-delivery",
    difficulty: "medium",
    question: "Compare Grandad Kofi's manner at the very start of the round with his manner at the very last house. What has changed?",
    acceptedAnswers: [
      "at the start he is calm and businesslike, but at the final house he pauses and seems affected, sitting quietly before starting the engine",
      "he goes from routine and unbothered to visibly moved, shown by sitting still with both hands on the wheel",
      "his ordinary, practical manner shifts to a quieter, more reflective one at the end",
    ],
    evidenceQuotes: ["read it, smiled slightly, and swapped the empties without comment", "He sat with both hands resting on the wheel, looking out at the empty street ahead"],
    explanationGuidance: "Early in the round, Grandad Kofi handles the deliveries briskly and without visible emotion. By the final house, his behaviour changes noticeably: he pauses, sits without moving, and delays starting the engine -- evidence of a shift from routine to reflection as the round nears its true end.",
  },
  {
    candidateId: "ei003-w2-comp-time-02",
    blueprintId: "ei003-w2-bp-comp-across-time",
    familyId: "wave3-fam-rc07-comparative",
    passageId: "ei003-w2-eng-the-clock-that-stopped",
    difficulty: "hard",
    question: "Compare the narrator's expectations at the very start of the clock project with how the narrator felt by August. What has changed?",
    acceptedAnswers: [
      "at the start the narrator expected it to be quick and easy, but by august the narrator felt they had failed",
      "he goes from expecting an easy afternoon's work to feeling discouraged, believing the clock would never run",
      "his early confidence gives way to a sense of failure months later",
    ],
    evidenceQuotes: ["I expected this to take an afternoon. It took most of that summer.", "I remember feeling, by then, that we'd failed"],
    explanationGuidance: "At the very start, the narrator expects the repair to be quick, assuming it will take a single afternoon. By August, after months of work, that confidence has been replaced by a sense of failure -- a clear before/after contrast in the narrator's own state across the course of the project.",
  },
  {
    candidateId: "ei003-w2-comp-settings-01",
    blueprintId: "ei003-w2-bp-comp-settings",
    familyId: "wave3-fam-rc07-comparative",
    passageId: "ei003-w2-eng-crossing-the-fen",
    difficulty: "hard",
    question: "Compare the fen at the start of the crossing with the fen at midday. What has changed?",
    acceptedAnswers: [
      "at the start it is misty and the path looks safe, but by midday the mist has cleared and the true difficulty of the ground is revealed",
      "it goes from hidden/misty to fully visible and revealed",
      "the mist that hid the ground at dawn has burned away, showing the fen properly",
    ],
    evidenceQuotes: ["the mist still sat low over the reed beds", "By midday the mist had burned away entirely, and the fen revealed itself properly"],
    explanationGuidance: "The passage explicitly marks two states of the same place: misty and partly hidden at the start of the walk, then fully visible (\"revealed itself properly\") once the mist clears by midday -- a genuine change in the setting itself, not in a character.",
  },
  {
    candidateId: "ei003-w2-comp-settings-02",
    blueprintId: "ei003-w2-bp-comp-settings",
    familyId: "wave3-fam-rc07-comparative",
    passageId: "ei003-w2-eng-crossing-the-fen",
    difficulty: "hard",
    question: "Compare the two channels of water Onyema points out near the end of the crossing. What is the difference between them?",
    acceptedAnswers: [
      "one runs fresh from an underground spring, the other is brackish enough to kill any plant that roots there",
      "one is fresh water even in dry months, the other is salty/brackish and harmful to plants",
    ],
    evidenceQuotes: ["a channel where, he said, the water ran fresh from an underground spring even in the driest months", "another, barely twenty metres further on, where the water was brackish enough to kill any plant unlucky enough to root there"],
    explanationGuidance: "The passage directly contrasts two nearby channels: one is described as genuinely fresh water, the other as brackish (salty) enough to be harmful to plant life -- two very different conditions in a very small area.",
  },
  {
    candidateId: "ei003-w2-comp-simdiff-01",
    blueprintId: "ei003-w2-bp-comp-similarity-difference",
    familyId: "wave3-fam-rc07-comparative",
    passageId: "ei003-w2-eng-the-relay-baton",
    difficulty: "challenge",
    question: "Nadia and Priya both comment on the clumsy handover. What is one thing they have in common in how they respond, and one way their responses are different?",
    acceptedAnswers: [
      "similarity: both take some responsibility for the mistake; difference: priya says it was fully her fault, while nadia says it wasn't just priya's fault",
      "they are similar because they both acknowledge blame for the handover; they differ because priya accepts full responsibility while nadia shares it",
    ],
    evidenceQuotes: ["\"Bad handover,\" Priya said quietly, coming to stand beside Nadia. \"That was on me.\"", "\"It wasn't just you,\" Nadia said, though she wasn't sure that was true either"],
    explanationGuidance: "Both girls acknowledge the handover was a problem -- that is the similarity. But Priya takes full personal responsibility (\"that was on me\"), while Nadia pushes back against that, sharing the blame more widely (\"it wasn't just you\") -- a genuine, textually-supported difference in how each character assigns responsibility.",
  },
  {
    candidateId: "ei003-w2-comp-simdiff-02",
    blueprintId: "ei003-w2-bp-comp-similarity-difference",
    familyId: "wave3-fam-rc07-comparative",
    passageId: "ei003-w2-eng-the-clock-that-stopped",
    difficulty: "challenge",
    question: "Compare the narrator and the grandmother's patience during the summer spent mending the clock. What do they have in common, and what is different?",
    acceptedAnswers: [
      "similarity: both keep working on the clock steadily every sunday morning all summer; difference: by august the narrator feels they have failed, while the grandmother shows no sign of sharing that discouragement",
      "they are similar because they both stay committed to the weekly work; they differ because he becomes discouraged by august while she stays calm and keeps testing",
    ],
    evidenceQuotes: ["We worked on it most Sunday mornings", "I remember feeling, by then, that we'd failed", "My grandmother didn't seem to share this feeling. She kept adjusting, testing, listening to the mechanism with her ear pressed close to the case"],
    explanationGuidance: "Both the narrator and the grandmother show up and work on the clock together most Sunday mornings across the whole summer -- that is the similarity. But by August, their feelings diverge: the narrator believes they have failed, while the grandmother shows no sign of sharing that discouragement, calmly continuing to adjust and listen to the mechanism.",
  },
];
