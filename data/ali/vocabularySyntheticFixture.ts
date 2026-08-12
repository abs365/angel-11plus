import type { BankQuestion, VocabularyPrompt } from "@/types/ali/questionBank";

/**
 * SYNTHETIC / DEV-ONLY FIXTURE — NOT REAL PRODUCTION CONTENT.
 *
 * Fabricated Vocabulary question metadata, mirroring data/ali/{vr,maths,
 * english}SyntheticFixture.ts's shape and purpose exactly — used to develop
 * and test lib/ali/learningUnit.ts and the adaptive Vocabulary route before
 * ali_question_bank has the real 12 hand-tagged `data/vocabulary.ts` words
 * (VOCABULARY_COMPETENCY_FRAMEWORK.md §7 — hand-tagging remains a separate
 * human task, "do not automate metadata generation").
 *
 * Words are deliberately NOT the real 12 (trepidation, melancholy, etc.) —
 * fabricated illustrative words, same precedent as every prior fixture,
 * so there is never any ambiguity between fixture and real content. IDs
 * prefixed "synthetic-vocab-" so they can never collide with real
 * `voc-0xx` IDs.
 *
 * 5 Learning Units (words), 2-3 items each = 12 items — each item's
 * `learningUnitId` is the word's own id, per VOCABULARY_COMPETENCY_
 * FRAMEWORK.md §6 ("Learning Unit = Word Set" interpreted as one word +
 * every item generated from it). Only the 3 approved competencies are used
 * (Decision — do not invent competencies without evidence, same as English).
 */

function item(
  wordId: string,
  itemSuffix: string,
  competency: "vocabulary.synonyms" | "vocabulary.antonyms" | "vocabulary.in-context",
  contentDifficulty: BankQuestion["contentDifficulty"],
  question: string,
  options: string[],
  correctAnswer: string,
  explanation: string
): BankQuestion {
  const id = `synthetic-vocab-${wordId}-${itemSuffix}`;
  const prompt: VocabularyPrompt = {
    id,
    word: wordId,
    question,
    options,
    correctAnswer,
    skill: "vocabulary",
    marks: 1,
  };
  return {
    id,
    subject: "vocabulary",
    skill: competency,
    pathway: ["gl"],
    contentDifficulty,
    learningUnitId: `synthetic-vocab-${wordId}`, // Learning Unit = word (Decision 36/§6)
    questionType: "multiple-choice",
    estimatedTimeSeconds: 25,
    prompt,
    explanation,
    confidenceWeight: 1.0,
    revisionPriority: 3,
    masteryThreshold: contentDifficulty === "easy" || contentDifficulty === "medium" ? 2 : 3,
    usageCount: 0,
    avgSuccessRate: null,
  };
}

export const vocabularySyntheticFixture: BankQuestion[] = [
  // Word: audacious (easy) — synonyms + antonyms
  item("audacious", "syn", "vocabulary.synonyms", "easy",
    "Which word is closest in meaning to 'audacious'?",
    ["bold", "timid", "quiet", "careful"], "bold",
    "'Audacious' means willing to take bold risks: 'bold' is the closest match."),
  item("audacious", "ant", "vocabulary.antonyms", "easy",
    "Which word means the opposite of 'audacious'?",
    ["daring", "timid", "reckless", "confident"], "timid",
    "'Audacious' means boldly daring: 'timid' (fearful, hesitant) is its opposite."),

  // Word: candid (medium) — synonyms + antonyms + in-context
  item("candid", "syn", "vocabulary.synonyms", "medium",
    "Which word is closest in meaning to 'candid'?",
    ["honest", "secretive", "formal", "elaborate"], "honest",
    "'Candid' means truthful and straightforward: 'honest' is the closest match."),
  item("candid", "ant", "vocabulary.antonyms", "medium",
    "Which word means the opposite of 'candid'?",
    ["frank", "evasive", "blunt", "direct"], "evasive",
    "'Candid' means openly truthful: 'evasive' (avoiding giving a direct answer) is its opposite."),
  item("candid", "ctx", "vocabulary.in-context", "medium",
    "Which sentence uses 'candid' correctly?",
    [
      "Her candid answer left no doubt about how she really felt.",
      "The candid staircase led up to the attic.",
      "He candid the ball across the field.",
      "The soup was candid and warm.",
    ],
    "Her candid answer left no doubt about how she really felt.",
    "'Candid' describes honest, direct communication: only the first sentence uses it as this kind of adjective correctly."),

  // Word: diligent (medium) — synonyms + antonyms
  item("diligent", "syn", "vocabulary.synonyms", "medium",
    "Which word is closest in meaning to 'diligent'?",
    ["hardworking", "lazy", "careless", "distracted"], "hardworking",
    "'Diligent' means showing careful, persistent effort: 'hardworking' is the closest match."),
  item("diligent", "ant", "vocabulary.antonyms", "medium",
    "Which word means the opposite of 'diligent'?",
    ["industrious", "negligent", "thorough", "attentive"], "negligent",
    "'Diligent' means careful and persistent: 'negligent' (careless, failing to take proper care) is its opposite."),

  // Word: frugal (hard) — synonyms + in-context
  item("frugal", "syn", "vocabulary.synonyms", "hard",
    "Which word is closest in meaning to 'frugal'?",
    ["thrifty", "wasteful", "generous", "extravagant"], "thrifty",
    "'Frugal' means economical and careful with money or resources: 'thrifty' is the closest match."),
  item("frugal", "ctx", "vocabulary.in-context", "hard",
    "Which sentence uses 'frugal' correctly?",
    [
      "Her frugal habits meant she saved a little from every pay cheque.",
      "The frugal mountain rose sharply above the valley.",
      "He frugal the door shut behind him.",
      "The frugal music echoed through the hall.",
    ],
    "Her frugal habits meant she saved a little from every pay cheque.",
    "'Frugal' describes careful, economical use of money or resources: only the first sentence uses it correctly."),

  // Word: gregarious (challenge) — synonyms + antonyms + in-context
  item("gregarious", "syn", "vocabulary.synonyms", "challenge",
    "Which word is closest in meaning to 'gregarious'?",
    ["sociable", "withdrawn", "hostile", "indifferent"], "sociable",
    "'Gregarious' means fond of company and enjoying being with others: 'sociable' is the closest match."),
  item("gregarious", "ant", "vocabulary.antonyms", "challenge",
    "Which word means the opposite of 'gregarious'?",
    ["outgoing", "reserved", "friendly", "talkative"], "reserved",
    "'Gregarious' means sociable and outgoing: 'reserved' (reluctant to socialise or share) is its opposite."),
  item("gregarious", "ctx", "vocabulary.in-context", "challenge",
    "Which sentence uses 'gregarious' correctly?",
    [
      "His gregarious nature meant he made friends within minutes of arriving anywhere.",
      "The gregarious river wound through the countryside.",
      "She gregarious the letter into the envelope.",
      "The gregarious painting hung above the fireplace.",
    ],
    "His gregarious nature meant he made friends within minutes of arriving anywhere.",
    "'Gregarious' describes an outgoing, sociable personality: only the first sentence uses it correctly."),
];
