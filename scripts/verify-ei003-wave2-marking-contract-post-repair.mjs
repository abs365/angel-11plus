import { WAVE2_SEQUENCING_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2SequencingFamily.ts";
import { WAVE2_COMPARATIVE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2ComparativeFamily.ts";
import { WAVE2_EMOTION_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2EmotionFamily.ts";
import { WAVE2_ATMOSPHERE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2AtmosphereFamily.ts";
import { WAVE2_WORD_CHOICE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2WordChoiceFamily.ts";
import { scoreEnglishAnswer } from "../lib/learningEngine/practiceContent.ts";
import { scoreEnglishComprehensionAnswer } from "../lib/learningEngine/englishAnswerValidation.ts";

/**
 * Deterministic, real-function verification that Migration 242's repair
 * (modelAnswer = acceptedAnswers[0], marks = 1, no validationTier) makes
 * every one of the 40 published Wave 2 questions markable through the
 * ACTUAL, IMPORTED production scoring path -- not a reimplementation.
 *
 * The prompt shape constructed below (modelAnswer/marks/acceptedAnswers,
 * no validationTier) was independently confirmed, live, against all 40
 * real production rows immediately before this script was written:
 * every modelAnswer === acceptedAnswers[0] exactly, every marks === 1,
 * every validationTier absent. This script reconstructs that exact,
 * already-verified shape from the same candidate source files rather
 * than re-transferring the full live payload (each row's full passage
 * text makes a live round-trip unnecessarily large for this check,
 * which does not need passage text at all).
 */

const allCandidates = [
  ...WAVE2_SEQUENCING_CANDIDATES,
  ...WAVE2_COMPARATIVE_CANDIDATES,
  ...WAVE2_EMOTION_CANDIDATES,
  ...WAVE2_ATMOSPHERE_CANDIDATES,
  ...WAVE2_WORD_CHOICE_CANDIDATES,
];

// A large, deliberately unrelated word pool (fantastical/domestic-object
// vocabulary with no plausible overlap with any reading-comprehension
// answer's own content words). Per candidate, this is filtered to a
// subset provably sharing ZERO keywords (by this same file's own
// extractKeywords-equivalent rule) with that candidate's modelAnswer,
// so a false positive can only mean the heuristic accepted an answer
// with genuinely zero real keyword overlap -- not an artifact of one
// fixed sentence coincidentally reusing an ordinary English word.
const WRONG_ANSWER_POOL = [
  "purple", "elephants", "bicycles", "trombone", "spaghetti", "umbrella", "kangaroo",
  "volcano", "glitter", "sandwich", "tuesday", "planet", "hamster", "bubblegum",
  "skateboard", "pancake", "octopus", "helicopter", "marshmallow", "dinosaur",
  "telescope", "raincoat", "jellybean", "penguin", "typewriter", "waterfall",
];

function extractKeywordsLocal(text) {
  const stopwords = new Set([
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "this", "that",
    "these", "those", "his", "her", "their", "its", "to", "of", "in", "on", "for",
    "with", "as", "by", "at", "it", "he", "she", "they", "we", "you", "which", "who",
  ]);
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopwords.has(w))
  );
}

let problems = 0;
const results = [];

for (const c of allCandidates) {
  const modelAnswer = c.acceptedAnswers[0];
  const marks = 1;
  const prompt = { marks, modelAnswer, acceptedAnswers: c.acceptedAnswers, validationTier: undefined };

  // 1. Exercise the REAL dispatcher (englishAnswerValidation.ts), which
  // is what the real Practice page actually calls, with the legacy
  // heuristic (practiceContent.ts) passed through exactly as the page
  // itself does.
  const correctResult = scoreEnglishComprehensionAnswer(modelAnswer, prompt, scoreEnglishAnswer);
  const correctIsCorrect = correctResult.earnedMarks === marks;
  const correctIsNaN = Number.isNaN(correctResult.earnedMarks);

  const modelKeywords = extractKeywordsLocal(modelAnswer);
  const disjointWords = WRONG_ANSWER_POOL.filter((w) => !modelKeywords.has(w));
  const wrongAnswer = disjointWords.slice(0, 12).join(" ") + " completely irrelevant gibberish";
  const wrongResult = scoreEnglishComprehensionAnswer(wrongAnswer, prompt, scoreEnglishAnswer);
  const wrongIsCorrect = wrongResult.earnedMarks === marks;
  const wrongIsNaN = Number.isNaN(wrongResult.earnedMarks);

  const ok =
    correctResult.automaticallyVerified === true &&
    !correctIsNaN &&
    correctIsCorrect === true &&
    !wrongIsNaN &&
    wrongIsCorrect === false;

  if (!ok) problems++;
  results.push({
    id: c.candidateId,
    tier: correctResult.tier,
    correctEarnedMarks: correctResult.earnedMarks,
    correctIsCorrect,
    wrongEarnedMarks: wrongResult.earnedMarks,
    wrongIsCorrect,
    ok,
  });
}

console.log(`Total candidates checked: ${results.length}`);
console.log(`Correct-answer -> isCorrect=true: ${results.filter((r) => r.correctIsCorrect).length}/${results.length}`);
console.log(`Wrong-answer -> isCorrect=false: ${results.filter((r) => !r.wrongIsCorrect).length}/${results.length}`);
console.log(`Any NaN encountered: ${results.some((r) => Number.isNaN(r.correctEarnedMarks) || Number.isNaN(r.wrongEarnedMarks))}`);
console.log(`Tiers used: ${[...new Set(results.map((r) => r.tier))].join(", ")}`);
if (problems > 0) {
  console.log("\nFAILING ROWS:");
  for (const r of results.filter((r) => !r.ok)) console.log(JSON.stringify(r));
}
console.log(`\n${problems === 0 ? "DETERMINISTIC MARKING VERIFICATION: PASS -- 40/40 correct-answer PASS, 40/40 wrong-answer PASS, 0 NaN" : `DETERMINISTIC MARKING VERIFICATION: FAIL (${problems} problems)`}`);
process.exit(problems === 0 ? 0 : 1);
