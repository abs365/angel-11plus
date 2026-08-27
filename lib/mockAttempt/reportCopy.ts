import { COMPETENCIES } from "@/lib/learningEngine/assessmentBrainMap";
import type { CompetencyId } from "@/lib/learningEngine/types";
import type { MockNextPracticePriority, MockOverallResult, MockSkillEvidenceEntry, MockSkillEvidenceLevel, MockStrengthOrPriorityEntry } from "./types";

/**
 * Programme Increment 008F, Part 7/8/9 — plain-language report copy,
 * shared by the child and parent report pages. Pure functions, no
 * database access — kept separate from the page components so the
 * language rules this increment's own directive sets out are testable
 * directly, not buried in JSX.
 *
 * 008F Part 2's own CRITICAL RULE, restated: Angel must never present an
 * internally computed score as an official CSSE standardised score.
 * CSSE's own standardisation formula is cohort-relative and published
 * only after results are sent each year (verified directly from the
 * official CSSE Information Guide during 008V) — Angel cannot reproduce
 * it, so every function here works only in raw marks/percentage terms,
 * never a claimed CSSE-equivalent score.
 */

export function competencyLabel(competencyId: string): string {
  return COMPETENCIES[competencyId as CompetencyId]?.name ?? competencyId;
}

/** Part 7's own acceptable-language examples, applied directly — a plain fact, never a certainty claim. */
export function scoreSummarySentence(overall: MockOverallResult): string {
  if (overall.percentage === null) {
    return `You answered ${overall.answeredCount} of ${overall.answeredCount + overall.unansweredCount} questions. Some answers still need to be checked by hand before a full result is ready.`;
  }
  return `You scored ${overall.rawMarksAchieved} out of ${overall.rawMarksAvailable} marks (${overall.percentage}%).`;
}

/** Explicit, per Part 2's own CRITICAL RULE — never omitted from a released report. */
export const OFFICIAL_SCORE_DISCLAIMER =
  "This is Angel's own result for this Mock, not an official CSSE standardised score. CSSE's own scoring compares your child against everyone who sits the real test that year, so it can't be worked out in advance.";

export function strengthSentence(entries: MockStrengthOrPriorityEntry[]): string | null {
  if (entries.length === 0) return null;
  const labels = entries.map((e) => competencyLabel(e.competencyId));
  return `This Mock suggests a real strength in: ${labels.join(", ")}.`;
}

export function priorSentence(entries: MockStrengthOrPriorityEntry[]): string | null {
  if (entries.length === 0) return null;
  const labels = entries.map((e) => competencyLabel(e.competencyId));
  return `Your next preparation priority could be: ${labels.join(", ")}.`;
}

export const ANALYSIS_PENDING_NOTE =
  "A deeper look at strengths and next steps is still being prepared for this Mock.";

/**
 * Decision 223 (Mathematics Mock 1 Deterministic Mock Analysis Engine) —
 * age-appropriate labels for `MockSkillEvidenceLevel`. "insufficient_
 * evidence" is deliberately never phrased as a negative judgement — this
 * Mock simply didn't ask enough questions of that type to say anything
 * fair about it, which is a fact about the paper, not the child.
 */
export function skillEvidenceLevelLabel(level: MockSkillEvidenceLevel): string {
  switch (level) {
    case "demonstrated_securely":
      return "demonstrated securely";
    case "developing":
      return "still developing";
    case "not_yet_demonstrated":
      return "not yet demonstrated in this Mock";
    case "insufficient_evidence":
      return "not enough evidence yet";
  }
}

/**
 * Section 3's own "skill performance" row. Never states a percentage for
 * `insufficient_evidence` (a single one-mark observation cannot fairly
 * support one) — states the plain mark count instead, still honest, never
 * silently omitted.
 */
export function skillPerformanceSentence(entry: MockSkillEvidenceEntry): string {
  const label = entry.competencyId ? competencyLabel(entry.competencyId) : entry.questionTypeId;
  if (entry.evidenceLevel === "insufficient_evidence") {
    return `${label}: ${entry.marksAvailable} mark${entry.marksAvailable === 1 ? "" : "s"} available, ${skillEvidenceLevelLabel(entry.evidenceLevel)} to assess this skill on its own.`;
  }
  return `${label}: ${entry.marksAchieved} out of ${entry.marksAvailable} marks, ${skillEvidenceLevelLabel(entry.evidenceLevel)}.`;
}

export const NO_STRENGTHS_YET_NOTE =
  "This Mock didn't yet provide enough evidence to identify a secure strength. That's about the paper's own coverage, not a judgement of your work.";

/**
 * Section 5's own careful language ("needs more practice with" / "not yet
 * demonstrated securely"), never "cannot"/"doesn't understand"/"is weak
 * at" from one sitting. Appends at most one SAFE-framed misconception
 * note per skill — describing what the QUESTION was designed to test,
 * never a claim about the learner's own actual reasoning (Section 6).
 */
export function developmentAreaSentence(entry: MockSkillEvidenceEntry): string {
  const label = entry.competencyId ? competencyLabel(entry.competencyId) : entry.questionTypeId;
  const base =
    entry.evidenceLevel === "not_yet_demonstrated"
      ? `Not yet demonstrated securely in this Mock: ${label}.`
      : `Needs more practice with ${label}, still developing.`;
  const note = entry.misconceptionNotes[0];
  return note ? `${base} This question type often involves: ${note}` : base;
}

export const NO_DEVELOPMENT_AREAS_NOTE =
  "No development areas stood out from this Mock's own evidence.";

/**
 * Section 7's own "small, deterministic set" — deduplicated by
 * competency label (several question types can share one competency;
 * see lib/ali/mockAnalysisEngine.ts's own competency-rollup comment),
 * so the same label is never repeated in one sentence. Reuses the exact,
 * pre-existing MockStrengthOrPriorityEntry-style phrasing convention
 * (`priorSentence`) rather than inventing a second wording.
 */
export function nextPracticeSentence(priorities: MockNextPracticePriority[]): string | null {
  if (priorities.length === 0) return null;
  const labels = [...new Set(priorities.map((p) => (p.competencyId ? competencyLabel(p.competencyId) : p.questionTypeId)))];
  return `Next, it could help to practise: ${labels.join(", ")}.`;
}
