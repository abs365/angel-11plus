import { scoreEnglishComprehensionAnswer, type EnglishPromptValidationFields, type ValidationTier } from "@/lib/learningEngine/englishAnswerValidation";
import { scoreEnglishAnswer } from "@/lib/learningEngine/practiceContent";

/**
 * Programme Completion Increment 016 — Authoritative Reading Comprehension
 * Scoring. Pure computation only, deliberately separated from the
 * server-only database connection (lib/server/mockScoringAuthority.ts) so
 * it gets the same real node:test coverage every other piece of real
 * logic in this codebase does — mirroring lib/mockAttempt/workspace.ts's
 * own established "pull logic out into pure functions" discipline. This
 * module has no `server-only` guard and imports nothing server-only,
 * because it needs none: scoreEnglishComprehensionAnswer() and
 * scoreEnglishAnswer() are the SAME, already-approved functions Practice
 * already imports client-side (app/learning-intelligence/practice/[area]/
 * page.tsx) — reused verbatim, not duplicated, per the Founder's own
 * explicit "do not create a new English scoring engine" directive.
 *
 * Deliberately does NOT decide what is "safe" to trust — every value this
 * module produces is treated as an unverified claim by
 * mock_persist_reading_scoring() (migration 219), which independently
 * re-derives/bounds/overrides marksAwarded and status against canonical
 * database content regardless of what this module computes. This module
 * only needs to be a faithful, correct CALLER of the existing engine —
 * the authoritative invariants live in the database, by design.
 */

export interface ReadingScoringWorkItem {
  questionId: string;
  marks: number;
  validationTier: ValidationTier | null;
  modelAnswer: string | null;
  acceptedAnswers: string[] | null;
  quotationRequired: string[] | null;
  orderedAnswer: string[] | null;
  correctOptions: string[] | null;
  requiredSelectionCount: number | null;
  userAnswer: string;
}

export interface ReadingScoringOutcome {
  questionId: string;
  marksAwarded: number;
}

/**
 * Maps one claimed work item through the existing tiered engine. TIER3/
 * TIER5 (judgement-required) still get a real computed value here (the
 * engine's own `earnedMarks: 0`) purely for shape-completeness — the
 * database independently, unconditionally overrides these to
 * `requires_manual_marking` regardless of what is submitted, so this
 * function does not need special-case branching for them at all.
 */
export function computeReadingScoringOutcome(item: ReadingScoringWorkItem): ReadingScoringOutcome {
  const promptFields: EnglishPromptValidationFields = {
    modelAnswer: item.modelAnswer ?? undefined,
    marks: item.marks,
    acceptedAnswers: item.acceptedAnswers,
    quotationRequired: item.quotationRequired,
    orderedAnswer: item.orderedAnswer,
    correctOptions: item.correctOptions,
    requiredSelectionCount: item.requiredSelectionCount,
    validationTier: item.validationTier,
  };
  const result = scoreEnglishComprehensionAnswer(item.userAnswer, promptFields, scoreEnglishAnswer);
  return { questionId: item.questionId, marksAwarded: result.earnedMarks };
}

/** Every assigned question, in the same order the claim returned them — mock_persist_reading_scoring() requires exactly one outcome per assigned question, no more, no less. */
export function computeReadingScoringOutcomes(items: readonly ReadingScoringWorkItem[]): ReadingScoringOutcome[] {
  return items.map(computeReadingScoringOutcome);
}
