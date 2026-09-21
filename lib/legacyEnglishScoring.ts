/**
 * Legacy English lesson answer scoring, moved verbatim out of
 * app/english/[id]/page.tsx. A Next.js page file may only export the page
 * (and route config): exporting scoreAnswer() from it fails Next's route
 * type validation under `next build --webpack`. No logic changed.
 */
const STOP_WORDS = new Set([
  "the","a","an","is","are","was","were","in","on","at","to","of","and","or",
  "but","that","this","with","as","it","its","he","she","they","his","her",
  "their","we","be","been","being","have","has","had","do","does","did","for",
  "from","by","not","which","who","what","how","when","there","more","so",
  "than","if","up","into","over","after","before","about","would","could",
  "should","make","use","also","very","just","even","like","some","all",
  "one","two","no","can","will","may","might","much","then","these","those",
  "my","your","our","him","them","us","me","you","said","says",
]);

function extractKeywords(text: string): string[] {
  return [...new Set(
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
  )];
}

/**
 * Stage 2 Educational Integrity Correction (Learn-path investigation) —
 * this is a third, independently-diverged copy of the exact defect fixed
 * in lib/learningEngine/practiceContent.ts's scoreEnglishAnswer()
 * (Decision 106, Correction 3) and never fixed here: the final fallback
 * unconditionally returned `Math.max(1, round(maxMarks / 2))` regardless
 * of real keyword overlap. Not currently exploitable against the 5
 * legacy English rows presently tagged into ali_question_bank (migration
 * 013 — none carries exactly 1 mark, the only value at which this
 * fallback coincides with full marks and could flip `isCorrect` to
 * true), but the defect is architecturally identical and would become
 * exploitable the moment any 1-mark legacy English row is tagged, with
 * zero code change required to trigger it. Fixed for the same reason and
 * with the same minimal change as Correction 3: partial credit is now
 * conditional on genuine keyword overlap (`ratio > 0`), never awarded
 * unconditionally by length alone.
 */
export function scoreAnswer(userAnswer: string, modelAnswer: string | undefined, maxMarks: number): number {
  const trimmed = userAnswer.trim();
  if (!trimmed || trimmed.length < 8) return 0;

  if (!modelAnswer) {
    return trimmed.length >= 40 ? maxMarks : Math.max(1, Math.round(maxMarks / 2));
  }

  const keywords = extractKeywords(modelAnswer);
  const userLower = trimmed.toLowerCase();
  const hits = keywords.filter((kw) => userLower.includes(kw)).length;
  const ratio = keywords.length > 0 ? hits / keywords.length : 0;
  const lengthOk = trimmed.length >= 40 + maxMarks * 8;

  if (trimmed.length < 15 && hits === 0) return 0;
  if (hits === 0 && trimmed.length < 60) return 0;
  if (lengthOk && ratio >= 0.18) return maxMarks;
  if (ratio > 0) return Math.max(1, Math.round(maxMarks / 2));
  return 0;
}
