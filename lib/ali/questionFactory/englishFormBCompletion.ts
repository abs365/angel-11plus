/**
 * CSSE English Form B completion (preparation only; nothing here is applied, promoted, or activated).
 *
 * Source of truth for what the Founder-applied template migration 271 contains:
 *   1. MARKING_CONTRACT_REPAIRS: the free-text explanation items that were registered as TIER2 accepted-answer sets
 *      (Anning Q3-Q6, Group Project Q3-Q6) move to TIER5 (named component + explanation). The database already forces
 *      TIER3/TIER5 items to `requires_manual_marking`, so a human marks them against the model answer; the listed
 *      accepted answers become marker support only. No new engine, no change to any tier's behaviour.
 *   2. COMPASS_ROSE_FIXES: wording and accepted-set corrections found in the independent review of the reserve passage.
 *   3. TOP_UP_ITEMS: the six items (8 marks) Form B needs to match Form A's reading shape: 2 x RC-03 (2 marks each, manually
 *      marked) and 4 x RC-04 synonyms (1 mark each, deterministic accepted set) on The Compass Rose Challenge / Salmon.
 *
 * UPDATE 2026-10-08: the Salmon passage was REJECTED AND REPLACED (see englishFormBReplacement.ts and rejectedMockContent.ts). The Salmon top-up item
 * `eng-fb-salmonnavigation-q08` below is part of the APPLIED migration 271 record and is now rejected/replaced evidence only; the five Compass Rose items stand.
 *
 * Every new item is `authentic_assessment_candidate`, `angel_original`, no external rights holder, and stays sealed from
 * Practice. No official CSSE mark allocation is assumed. Items 1 and 3 still need the governed human review.
 */

export const REPAIR_TIER = "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION";

export const MARKING_CONTRACT_REPAIRS = [
  "eng-pc001-anning-q03",
  "eng-pc001-anning-q04",
  "eng-pc001-anning-q05",
  "eng-pc001-anning-q06",
  "eng-pc003-groupproject-q03",
  "eng-pc003-groupproject-q04",
  "eng-pc003-groupproject-q05",
  "eng-pc003-groupproject-q06",
] as const;

export const MARKER_NOTE =
  "Free-text explanation. Marked by a trained human marker against the model answer. The listed accepted answers are named-component prompts for the marker only and never award marks automatically.";

export interface CompassRoseFix {
  id: string;
  /** Replace the question text (the passage and answer are unchanged). */
  question?: string;
  /** Additional accepted answers (existing ones are kept). */
  addAccepted?: string[];
  reason: string;
}

export const COMPASS_ROSE_FIXES: CompassRoseFix[] = [
  {
    id: "eng-inc003-compassrosechallenge-q05",
    question: "Put these four characters in the order the passage describes what each of them did on their own.",
    reason:
      "The original asked who was FIRST to investigate, but the passage says all four worked at the same time (\"meanwhile\"), so the first investigator is not established by the text. The re-worded question asks for the order of description, which the text does fix.",
  },
  {
    id: "eng-inc003-compassrosechallenge-q02a",
    addAccepted: ["the church tower", "the bell tower", "church bell tower", "the bell tower of the church", "the tower of the church"],
    reason: "Correct answers such as \"the church tower\" or \"the bell tower\" were rejected by the accepted set.",
  },
  {
    id: "eng-inc003-compassrosechallenge-q02b",
    addAccepted: ["the bell-shaped weathervane", "a bell-shaped weathervane", "the weathervane", "a weathervane above the sundial", "the weathervane on the sundial", "the sundial's weathervane", "bell-shaped weathervane above the sundial"],
    reason: "Correct answers such as \"the weathervane\" or \"a bell-shaped weathervane\" were rejected by the accepted set.",
  },
];

export interface TopUpItem {
  id: string;
  passageId: string;
  skill: "QT-RC-03" | "QT-RC-04";
  difficulty: "medium" | "hard";
  marks: 1 | 2;
  tier: "TIER2_ACCEPTED_SET" | typeof REPAIR_TIER;
  question: string;
  modelAnswer: string;
  acceptedAnswers: string[];
  /** For TIER2 items: plausible wrong answers that must score zero. For manual items: marker guidance. */
  plausibleWrongAnswers?: string[];
  markingGuidance?: string;
  /** For synonym items: the exact word or phrase that must appear in the passage text. */
  targetInPassage: string;
  estimatedTimeSeconds: number;
  misconception: string;
  transferClass: "NEAR_TRANSFER" | "MIXED_TRANSFER";
}

const compass = "eng-inc003-compassrosechallenge";
const salmon = "eng-inc003-salmonnavigation";

export const TOP_UP_ITEMS: TopUpItem[] = [
  {
    id: "eng-fb-compassrosechallenge-q08",
    passageId: compass,
    skill: "QT-RC-03",
    difficulty: "hard",
    marks: 2,
    tier: REPAIR_TIER,
    question: "In the first paragraph, the writer says that \"the rules were stricter than any of them expected.\" Explain what this tells you about the rules. Use the passage to support your answer.",
    modelAnswer: "The rules were much tougher than the four friends had thought they would be. In particular, they had to work out the clue completely alone for the first ten minutes, without discussing it with anyone.",
    acceptedAnswers: ["alone", "without discussing it", "no discussion", "on their own", "for the first ten minutes"],
    markingGuidance: "1 mark: the rules were stricter / tougher / more limiting than they expected. 1 mark: names the specific rule (each person works alone, no discussing, for the first ten minutes). Do not award the second mark for a vague 'strict' alone.",
    targetInPassage: "the rules were stricter than any of them expected",
    estimatedTimeSeconds: 120,
    misconception: "Taking 'stricter' to mean the organisers were unkind, or that the rules were about the time limit, rather than the alone-first rule.",
    transferClass: "MIXED_TRANSFER",
  },
  {
    id: "eng-fb-compassrosechallenge-q09",
    passageId: compass,
    skill: "QT-RC-04",
    difficulty: "medium",
    marks: 1,
    tier: "TIER2_ACCEPTED_SET",
    question: "Question 9. Using the passage, write a synonym for each of the following words. Item (a) has been done for you as an example. Item (a) 'interpret' -> understand (given). (b) Write a synonym for 'certain'.",
    modelAnswer: "sure",
    acceptedAnswers: ["sure", "convinced", "positive", "confident"],
    plausibleWrongAnswers: ["wrong", "unsure", "angry", "the church"],
    targetInPassage: "certain",
    estimatedTimeSeconds: 50,
    misconception: "Giving an opposite ('unsure') or a word from the same sentence ('church') instead of a word of the same meaning.",
    transferClass: "NEAR_TRANSFER",
  },
  {
    id: "eng-fb-compassrosechallenge-q10",
    passageId: compass,
    skill: "QT-RC-04",
    difficulty: "medium",
    marks: 1,
    tier: "TIER2_ACCEPTED_SET",
    question: "Question 10. Using the passage, write a synonym for each of the following words. Item (a) has been done for you as an example. Item (a) 'interpret' -> understand (given). (b) Write a synonym for 'methodically'.",
    modelAnswer: "systematically",
    acceptedAnswers: ["systematically", "carefully", "in an organised way", "in an orderly way", "step by step"],
    plausibleWrongAnswers: ["quickly", "randomly", "loudly", "slowly"],
    targetInPassage: "methodically",
    estimatedTimeSeconds: 50,
    misconception: "Taking 'slower approach' from the same sentence as the meaning (answering 'slowly'): the word means in an organised way, not simply slowly.",
    transferClass: "NEAR_TRANSFER",
  },
  {
    id: "eng-fb-compassrosechallenge-q11",
    passageId: compass,
    skill: "QT-RC-04",
    difficulty: "medium",
    marks: 1,
    tier: "TIER2_ACCEPTED_SET",
    question: "Question 11. Using the passage, write a synonym for each of the following words. Item (a) has been done for you as an example. Item (a) 'interpret' -> understand (given). (b) Write a synonym for 'admitted'.",
    modelAnswer: "confessed",
    acceptedAnswers: ["confessed", "conceded", "owned up", "acknowledged"],
    plausibleWrongAnswers: ["denied", "shouted", "forgot", "laughed"],
    targetInPassage: "admitted",
    estimatedTimeSeconds: 50,
    misconception: "Giving a word that fits the story ('shouted') rather than a word of the same meaning.",
    transferClass: "NEAR_TRANSFER",
  },
  {
    id: "eng-fb-compassrosechallenge-q12",
    passageId: compass,
    skill: "QT-RC-04",
    difficulty: "medium",
    marks: 1,
    tier: "TIER2_ACCEPTED_SET",
    question: "Question 12. Using the passage, write a synonym for each of the following words. Item (a) has been done for you as an example. Item (a) 'interpret' -> understand (given). (b) Write a synonym for 'faintly'.",
    modelAnswer: "slightly",
    acceptedAnswers: ["slightly", "a little", "mildly", "somewhat"],
    plausibleWrongAnswers: ["very", "extremely", "loudly", "greatly"],
    targetInPassage: "faintly",
    estimatedTimeSeconds: 50,
    misconception: "Reading 'faintly annoyed' as 'very annoyed', or answering with a sound word ('quietly').",
    transferClass: "NEAR_TRANSFER",
  },
  {
    id: "eng-fb-salmonnavigation-q08",
    passageId: salmon,
    skill: "QT-RC-03",
    difficulty: "hard",
    marks: 2,
    tier: REPAIR_TIER,
    question: "The passage says that young salmon \"imprint on the Earth's magnetic field.\" Explain what the word 'imprint' means here. Use the passage to support your answer.",
    modelAnswer: "To learn and remember something so firmly that it stays fixed. The young salmon remember the strength and angle of the magnetic field where they enter the sea, like remembering an address, and use it years later to steer back.",
    acceptedAnswers: ["remember", "learn", "fix in their memory", "memorise", "store"],
    markingGuidance: "1 mark: the idea of learning / remembering / fixing something firmly. 1 mark: links it to later use (remembered like an address, used years later as a map to steer home). Do not award the second mark for 'remember' alone with no link to use.",
    targetInPassage: "imprint",
    estimatedTimeSeconds: 120,
    misconception: "Taking 'imprint' in its everyday sense of a mark pressed into a surface, rather than learning and remembering.",
    transferClass: "MIXED_TRANSFER",
  },
];

export const TOP_UP_TOTAL_MARKS = TOP_UP_ITEMS.reduce((s, i) => s + i.marks, 0);
