import type { AliSubject } from "@/types/ali/questionBank";

/**
 * Capability 3, Wave 2 — Practice Experience.
 *
 * Three practice areas only. "Vocabulary" is deliberately absent: Assessment
 * Brain V1 defines no Vocabulary competency (AEP-003 Principle 3 explicitly
 * declined to create one from a single supporting instance — see
 * ASSESSMENT_BRAIN_V1.md §3's note), so a Vocabulary practice area could not
 * "connect every completed activity to the Learning Engine" (the mission's
 * own requirement) without inventing a competency that doesn't exist in the
 * frozen Brain. Formally BLOCKED, not silently dropped — see
 * CAP3_WAVE2_ACCEPTANCE_PACK.md §4.
 */
export type PracticeAreaId = "reading-comprehension" | "mathematics" | "continuous-writing";

export interface PracticeAreaConfig {
  id: PracticeAreaId;
  label: string;
  subject: AliSubject;
  description: string;
}

export const PRACTICE_AREAS: PracticeAreaConfig[] = [
  {
    id: "reading-comprehension",
    label: "Reading Comprehension",
    subject: "english",
    description: "Answer real comprehension questions and see which competencies they evidence.",
  },
  {
    id: "mathematics",
    label: "Mathematics",
    subject: "maths",
    description: "Work through real Maths questions across arithmetic, algebra, geometry and more.",
  },
  {
    id: "continuous-writing",
    label: "Continuous Writing",
    subject: "writing",
    description: "Write a full response to a real prompt and receive feedback.",
  },
];

export function getPracticeArea(id: string): PracticeAreaConfig | undefined {
  return PRACTICE_AREAS.find((a) => a.id === id);
}

/**
 * Reused verbatim from app/maths/page.tsx's normalizeNumeric() + its
 * semicolon-compound-answer fallback (mth-006's answer, "45; 26th term
 * (101)", is handled by comparing only the text before the first
 * semicolon) — duplicated here rather than imported, matching this
 * project's established "isolation via separate route" convention already
 * used by app/mocks/adaptive/maths/page.tsx for the exact same function.
 */
function normalizeNumeric(raw: string): number | null {
  const cleaned = raw.trim().replace(/[£$,]/g, "").replace(/\s+/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) && cleaned !== "" ? num : null;
}

export function checkMathsAnswer(userAnswer: string, correctAnswer: string): boolean {
  const userTrimmed = userAnswer.trim();
  const correctTrimmed = correctAnswer.trim();
  if (!userTrimmed) return false;

  const userNum = normalizeNumeric(userTrimmed);
  const correctNum = normalizeNumeric(correctTrimmed.split(";")[0].trim());
  if (userNum !== null && correctNum !== null) {
    return Math.abs(userNum - correctNum) < 0.0001;
  }

  const userLower = userTrimmed.toLowerCase().replace(/\s+/g, "");
  const correctLower = correctTrimmed.toLowerCase().replace(/\s+/g, "");
  if (userLower === correctLower) return true;

  const correctFirstPart = correctTrimmed.split(";")[0].trim().toLowerCase().replace(/\s+/g, "");
  return userLower === correctFirstPart;
}

/**
 * Reused verbatim from app/english/[id]/page.tsx's scoreAnswer()
 * keyword-overlap heuristic — the only free-text grader in the codebase.
 * "Correct" for Learning Engine purposes = full marks only, the same
 * first-pass simplification already established and disclosed for
 * English in ALI Phase 2.1 (Decision 37) — not a new judgement call, reused
 * unchanged.
 */
function extractKeywords(text: string): string[] {
  const stopwords = new Set([
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "this", "that",
    "these", "those", "his", "her", "their", "its", "to", "of", "in", "on", "for",
    "with", "as", "by", "at", "it", "he", "she", "they", "we", "you", "which", "who",
  ]);
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !stopwords.has(w))
    )
  );
}

export function scoreEnglishAnswer(userAnswer: string, modelAnswer: string | undefined, maxMarks: number): number {
  const trimmed = userAnswer.trim();
  if (!trimmed || trimmed.length < 8) return 0;
  if (!modelAnswer) return Math.max(1, Math.round(maxMarks / 2));

  const userLower = trimmed.toLowerCase();
  const keywords = extractKeywords(modelAnswer);
  const hits = keywords.filter((kw) => userLower.includes(kw)).length;
  const ratio = keywords.length > 0 ? hits / keywords.length : 0;
  const lengthOk = trimmed.length >= 40 + maxMarks * 8;

  if (lengthOk && ratio >= 0.18) return maxMarks;
  return Math.max(1, Math.round(maxMarks / 2));
}

/**
 * Writing has no automated right/wrong answer anywhere in this codebase —
 * the only existing quality signal is /api/writing-feedback's LLM-derived
 * `overallScore` (0-100). This threshold converts that continuous score
 * into the boolean "correct" signal ali_student_question_history requires.
 *
 * 70 is not an arbitrary cut — it is the existing system prompt's own
 * documented band boundary (route.ts's SYSTEM_PROMPT: "70-84: Strong — a
 * few focused refinements will push this to excellent", vs "55-69:
 * Developing"), reused rather than invented. Still explicitly a
 * FIRST-PASS, PROVISIONAL calibration — same category of judgement call
 * as ALI Phase 2.1's Decision 37 (English's "full marks only = correct").
 * Flagged for Founder review in CAP3_WAVE2_ACCEPTANCE_PACK.md §4, not
 * silently treated as settled.
 */
export const WRITING_CORRECTNESS_THRESHOLD = 70;
