import { COMPETENCIES } from "@/lib/learningEngine/assessmentBrainMap";
import type { CompetencyId } from "@/lib/learningEngine/types";
import type { MockOverallResult, MockStrengthOrPriorityEntry } from "./types";

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
