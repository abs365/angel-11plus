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
  /**
   * Sprint 3 (ANGEL-CSSE-002A, Personalised Practice) — the target number of
   * activities generatePersonalisedSession() (lib/learningEngine/
   * sessionGenerator.ts) selects for this area. Not a guarantee: with today's
   * small real content set, selectQuestions()'s own fallback-shortfall
   * bucket may honestly return fewer.
   */
  sessionSize: number;
}

export const PRACTICE_AREAS: PracticeAreaConfig[] = [
  {
    id: "reading-comprehension",
    label: "Reading Comprehension",
    subject: "english",
    description: "Answer real comprehension questions and see which competencies they evidence.",
    sessionSize: 8,
  },
  {
    id: "mathematics",
    label: "Mathematics",
    subject: "maths",
    description: "Work through real Maths questions across arithmetic, algebra, geometry and more.",
    sessionSize: 8,
  },
  {
    id: "continuous-writing",
    label: "Continuous Writing",
    subject: "writing",
    description: "Write a full response to a real prompt and receive feedback.",
    sessionSize: 2,
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
 * That duplication means this fix (Educational Increment 007K) does NOT
 * reach those two pages — app/maths/page.tsx runs against a wholly
 * separate legacy content pool (data/maths.ts), not the ali_question_bank
 * families this fix concerns, and app/mocks/adaptive/maths/page.tsx is
 * Mock, out of scope for this increment by explicit instruction. Both are
 * disclosed as a known, pre-existing architectural duplication, not fixed
 * here.
 */
function normalizeNumeric(raw: string): number | null {
  // "°" added (Educational Increment 004 production closure fix) — a
  // learner typing the bare, correct number for a degree-answer item
  // (e.g. "95" for "95°") must not be marked wrong for omitting a symbol
  // with no natural keyboard equivalent. Same rationale as "£$," already
  // being stripped: a unit marker in the stored answer must not become a
  // precision requirement on the learner's typed response.
  const cleaned = raw.trim().replace(/[£$,°]/g, "").replace(/\s+/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) && cleaned !== "" ? num : null;
}

/**
 * Educational Increment 007K — the controlled unit vocabulary actually
 * present in the Mathematics bank (confirmed by direct query against
 * production, not invented): length (mm/cm/m/km), mass (mg/g/kg), volume
 * (ml/l). Sorted longest-first so the regex below matches "kg" as a whole
 * unit rather than stopping at "g". No currency/degree symbol here --
 * those are already handled by normalizeNumeric's existing £/$/° strip
 * above, a separate and unaffected path.
 */
const RECOGNISED_MEASUREMENT_UNITS = ["mm", "cm", "km", "mg", "kg", "ml", "m", "g", "l"];
const NUMBER_WITH_UNIT_PATTERN = new RegExp(`^(-?\\d+(?:\\.\\d+)?)(${RECOGNISED_MEASUREMENT_UNITS.join("|")})$`, "i");

/**
 * 007L post-closure fix (cubic-unit answer defect) — squared/cubed forms
 * are only meaningful for length units (area, volume-by-length); mass and
 * liquid-volume units never appear squared or cubed anywhere in this bank,
 * so they are deliberately excluded here rather than generalising the
 * whole RECOGNISED_MEASUREMENT_UNITS list. Confirmed by direct query
 * against the full production bank (264 rows, both subjects, every
 * eligibility status): exactly one live row uses a power unit today
 * (mth-009, "942 cm³"), and it is the only one — this is not a broad
 * pattern, just this fix's bounded target.
 *
 * A real Unicode superscript (²/³) and the plain ASCII digit (2/3) are
 * accepted as the same unit -- the same "no natural keyboard equivalent"
 * rationale already established for °: a learner typing "cm3" for a
 * stored "cm³" answer is not making a mathematical error, and must not be
 * marked wrong for lacking a superscript key. Both forms are normalised
 * to the canonical Unicode form so a correct-value submission is accepted
 * regardless of which form the learner typed, while the exact same wrong-
 * unit rejection this project's existing units already enforce (Decision
 * 55) applies unchanged: "942 cm²" for a "942 cm³" question is still
 * rejected, because that is a genuine unit-of-measure error, not a
 * formatting difference.
 */
const RECOGNISED_LENGTH_UNITS_FOR_POWERS = ["mm", "cm", "km", "m"];
const NUMBER_WITH_POWER_UNIT_PATTERN = new RegExp(
  `^(-?\\d+(?:\\.\\d+)?)(${RECOGNISED_LENGTH_UNITS_FOR_POWERS.join("|")})(²|2|³|3)$`,
  "i"
);
const CANONICAL_EXPONENT: Record<string, string> = { "2": "²", "²": "²", "3": "³", "³": "³" };

export interface ParsedMeasurement {
  value: number;
  /** null when the input was a bare number with no unit suffix at all. */
  unit: string | null;
}

/**
 * Educational Increment 007K — parses either a bare number ("4.25") or a
 * number immediately followed by one recognised unit ("4.25m", "4.25 m"
 * after whitespace is stripped). Returns null for anything else (a
 * categorical word answer like "Equilateral", a malformed value, or a
 * number followed by something that isn't a recognised unit at all) so
 * callers can safely fall through to the existing text-comparison path
 * for those cases.
 */
export function parseNumberWithUnit(raw: string): ParsedMeasurement | null {
  const cleaned = raw.trim().replace(/[£$,°]/g, "").replace(/\s+/g, "");
  if (cleaned === "") return null;
  const withPowerUnit = cleaned.match(NUMBER_WITH_POWER_UNIT_PATTERN);
  if (withPowerUnit) {
    return {
      value: Number(withPowerUnit[1]),
      unit: withPowerUnit[2].toLowerCase() + CANONICAL_EXPONENT[withPowerUnit[3]],
    };
  }
  const withUnit = cleaned.match(NUMBER_WITH_UNIT_PATTERN);
  if (withUnit) return { value: Number(withUnit[1]), unit: withUnit[2].toLowerCase() };
  const bare = Number(cleaned);
  return Number.isFinite(bare) ? { value: bare, unit: null } : null;
}

export function checkMathsAnswer(userAnswer: string, correctAnswer: string): boolean {
  const userTrimmed = userAnswer.trim();
  const correctTrimmed = correctAnswer.trim();
  if (!userTrimmed) return false;
  const correctFirstAlt = correctTrimmed.split(";")[0].trim();

  // Original path, unchanged: plain numeric answers, and answers using
  // only the symbols normalizeNumeric already strips (£, $, comma, °).
  // Untouched so percentages, currency, degree, and existing semicolon-
  // alternate behaviour cannot regress.
  const userNum = normalizeNumeric(userTrimmed);
  const correctNum = normalizeNumeric(correctFirstAlt);
  if (userNum !== null && correctNum !== null) {
    return Math.abs(userNum - correctNum) < 0.0001;
  }

  // Educational Increment 007K — unit-aware path. Only activates when the
  // canonical answer is genuinely NUMBER + RECOGNISED UNIT (the check
  // above already failed for it, since normalizeNumeric can't parse a
  // letter suffix) — a categorical answer like "Equilateral" or "A" never
  // matches NUMBER_WITH_UNIT_PATTERN and falls straight through to the
  // original text path below, unaffected.
  //
  // Educational rule: the unit is not itself the skill being assessed in
  // any family currently authored this way (the target unit is always
  // already stated in the question, e.g. "what is the total length in
  // m?") -- so a bare number is accepted as fully correct, matching the
  // correct number with the correct unit attached. A present-but-WRONG
  // unit (right number, mismatched unit, e.g. "4.25kg" for a length
  // question) is deliberately NOT accepted: that is a genuine learner
  // error (not reading which unit the question asked for), not an
  // incidental formatting difference, so it is rejected rather than
  // silently passed. No question in the bank currently makes unit choice
  // itself the assessed skill; if one ever does, it should carry its own
  // semicolon-delimited accepted-unit alternatives (the pre-existing
  // mechanism above), which this path does not override.
  const correctMeasurement = parseNumberWithUnit(correctFirstAlt);
  if (correctMeasurement && correctMeasurement.unit) {
    const userMeasurement = parseNumberWithUnit(userTrimmed);
    if (!userMeasurement) return false;
    if (Math.abs(userMeasurement.value - correctMeasurement.value) >= 0.0001) return false;
    return userMeasurement.unit === null || userMeasurement.unit === correctMeasurement.unit;
  }

  // Original path, unchanged: exact and semicolon-first-alternate text match.
  const userLower = userTrimmed.toLowerCase().replace(/\s+/g, "");
  const correctLower = correctTrimmed.toLowerCase().replace(/\s+/g, "");
  if (userLower === correctLower) return true;

  const correctFirstPart = correctFirstAlt.toLowerCase().replace(/\s+/g, "");
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
