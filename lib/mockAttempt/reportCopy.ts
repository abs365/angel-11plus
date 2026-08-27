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

/**
 * Decision 224 (Mock Report Experience Refinement) — an even plainer,
 * child-facing rename of the real Assessment Brain competency names
 * (`COMPETENCIES`, unmodified — those names stay the internal/parent-
 * facing vocabulary, e.g. "Multi-Step Word-Problem Interpretation"). Only
 * the 6 Mathematics competencies are named here (the only ones a
 * Mathematics Mock can ever surface) — anything else falls back to the
 * real, existing `competencyLabel()`, never blank, never a raw id.
 */
const CHILD_FRIENDLY_COMPETENCY_LABELS: Partial<Record<CompetencyId, string>> = {
  "MR-01": "Number calculations",
  "MR-02": "Algebra and problem-solving",
  "MR-03": "Shapes and angles",
  "MR-04": "Multi-step word problems",
  "MR-05": "Number properties",
  "MR-06": "Careful, exact answers",
};

export function childFriendlySkillLabel(competencyId: string | null, fallbackId: string): string {
  if (!competencyId) return fallbackId;
  return CHILD_FRIENDLY_COMPETENCY_LABELS[competencyId as CompetencyId] ?? competencyLabel(competencyId);
}

/** Section 2 ("Your performance today") — frames the Mock as one piece of evidence, never a comparison, prediction, or readiness claim. */
export const PERFORMANCE_CONTEXT_NOTE =
  "This Mock is one piece of evidence. Angel mainly uses it to work out what to practise next, not to compare you with anyone else.";

/**
 * Section 3 ("What you showed") empty-state — refined wording matching
 * this refinement's own suggested phrasing exactly: some skills may be
 * developing, but Angel needs stronger evidence before calling any of
 * them a secure strength. Never a manufactured compliment.
 */
export const NO_SECURE_STRENGTHS_NOTE =
  "Some skills may be developing, but Angel needs stronger evidence from more questions before calling any of them a secure strength yet.";

/**
 * Section 4 ("Your 3 priorities") card status — one short, honest line
 * per card, never a percentage from insufficient evidence (priorities are
 * only ever drawn from developing/not_yet_demonstrated skills, which
 * always have 2+ observed subparts by construction — see migration 151's
 * own Decision-223 threshold — so a plain mark count is always fair here).
 */
export function priorityStatusSentence(entry: MockSkillEvidenceEntry): string {
  if (entry.evidenceLevel === "not_yet_demonstrated") {
    return "Not yet shown correctly in this Mock.";
  }
  return `Got ${entry.correctCount} of ${entry.subpartCount} right in this Mock, still building confidence here.`;
}

/**
 * Section 4/6 — "one short explanation" per priority card. Reuses the
 * SAME safe, question-designed framing `developmentAreaSentence()`
 * already established (never a claim the learner made a specific
 * mistake) when a real misconception note exists; an honest, generic
 * fallback otherwise. Deliberately only ever called for the top 3
 * priority cards, never for every skill — the exact "repeated
 * misconception paragraphs" complaint this refinement exists to fix.
 */
export function priorityExplanationSentence(entry: MockSkillEvidenceEntry): string {
  const note = entry.misconceptionNotes[0];
  return note ? `This question type often involves: ${note}` : "A little more practice here will help build confidence.";
}

/**
 * Section 5 ("Other skills to keep developing") — short chip text, never
 * the longer skillEvidenceLevelLabel() sentence form. "not_yet_
 * demonstrated" is deliberately labelled the same neutral "Developing"
 * as a mixed result at chip level (the fuller, honest distinction stays
 * available in priorityStatusSentence() for the 3 skills that actually
 * get a dedicated card) -- a compact scan of many chips is not the right
 * place for a nuanced sentence, and collapsing the two here is never a
 * false claim, only a coarser one.
 */
export function skillEvidenceChipLabel(level: MockSkillEvidenceLevel): string {
  switch (level) {
    case "demonstrated_securely":
      return "Secure";
    case "developing":
    case "not_yet_demonstrated":
      return "Developing";
    case "insufficient_evidence":
      return "Limited evidence";
  }
}

/** Same chip grouping as skillEvidenceChipLabel() -- "warning" (amber), never "error" (red), for a not-yet-secure skill: anti-shame, never alarming. */
export function skillEvidenceChipTone(level: MockSkillEvidenceLevel): "success" | "warning" | "neutral" {
  switch (level) {
    case "demonstrated_securely":
      return "success";
    case "developing":
    case "not_yet_demonstrated":
      return "warning";
    case "insufficient_evidence":
      return "neutral";
  }
}

/**
 * Section 4/7 — the one, existing, safe Mathematics practice route.
 * Subject-level, not skill-specific: `generatePersonalisedSession()`
 * (lib/learningEngine/sessionGenerator.ts) already accepts an optional
 * `familyFocusCompetencyId` for exactly this kind of targeting, but its
 * only real caller today is the Founder-validation family-choice pilot,
 * not this learner-facing practice route — wiring that through was
 * judged out of this refinement's own bounded scope (see
 * ALI_DECISION_LOG.md Decision 224), named as a real, safe, ready-made
 * next step rather than invented here.
 */
export const MATHEMATICS_PRACTICE_ROUTE = "/learning-intelligence/practice/mathematics";
export const PRACTICE_ACTION_LABEL = "Practise Mathematics";
