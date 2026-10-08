/**
 * CSSE Completion, Workstream 4 -- post-answer feedback for English questions that carry no written
 * explanation or model answer. Live production check: 76 practice-eligible English questions
 * (QT-RC-01/03/04/06, Question Factory output) have an empty `explanation`, no `modelAnswer` and no
 * misconception text, so a wrong answer produced only "Not quite" -- the learner never saw what a correct
 * answer was. Those questions do carry the machine-checkable answer data used to mark them
 * (`acceptedAnswers`, `orderedAnswer`, `correctOptions`); this reveals it AFTER the answer is submitted.
 *
 * Practice teaches: the reveal is only ever shown after submission and never in Mock.
 */
export interface EnglishRevealFields {
  modelAnswer?: string | null;
  acceptedAnswers?: string[] | null;
  orderedAnswer?: string[] | null;
  correctOptions?: string[] | null;
}

const MAX_ACCEPTED_SHOWN = 2;

/**
 * The correct-answer text to show after a wrong answer, or null when there is nothing to add
 * (a written model answer already covers it, or no machine-checkable answer exists).
 */
export function englishCorrectAnswerReveal(p: EnglishRevealFields): string | null {
  if (p.modelAnswer && p.modelAnswer.trim()) return null;
  const clean = (xs?: string[] | null) => (xs ?? []).map((x) => x.trim()).filter(Boolean);
  const ordered = clean(p.orderedAnswer);
  if (ordered.length > 1) return `The correct order is: ${ordered.join(", then ")}.`;
  const options = clean(p.correctOptions);
  if (options.length > 0) return `The correct choice${options.length > 1 ? "s were" : " was"}: ${options.join("; ")}.`;
  const accepted = Array.from(new Set(clean(p.acceptedAnswers)));
  if (accepted.length === 0) return null;
  const shown = accepted.slice(0, MAX_ACCEPTED_SHOWN);
  return shown.length === 1 ? `A correct answer is: ${shown[0]}.` : `Correct answers include: ${shown.join(" or ")}.`;
}
