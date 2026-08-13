/**
 * Educational Increment 007B, Part 6 — surfaces ENGLISH_WAVE1_TEACHING_
 * CARDS_V1.md's "F. Efficient exam method" line for each question family
 * into the live learner journey, in plain, age-appropriate language with
 * no internal terminology (family_id itself is never shown to a learner —
 * only used as the lookup key). Condensed from the teaching cards, not a
 * new invention; keep both in sync if either changes.
 */
export const ENGLISH_FAMILY_EXAM_STRATEGY: Record<string, string> = {
  "wave1-fam-direct-retrieval":
    "Find the key word from the question in the passage, then check the sentence around it actually answers what was asked.",
  "wave1-fam-vocab-explain":
    "Cover the tricky word and read the sentence around it. Is it a feeling, an action, or a description? That's your clue.",
  "wave1-fam-synonym-battery":
    "Go straight to the line number given. Don't rely on memory of the whole passage.",
  "wave1-fam-tick-justify":
    "Decide your answer first from a quick overall impression, then go back and find evidence specifically for that side.",
  "wave1-fam-quote-explain":
    "Find the exact words first. Then ask yourself 'so what does this show?' before you write your explanation.",
  "wave1-fam-sequencing":
    "Re-read the passage once in order, ticking off each thing as you find it, rather than trying to remember the order.",
  "wave1-fam-two-character":
    "Treat it as two mini-answers in one: find evidence for the first person, then separate evidence for the second.",
  "wave1-fam-emotion-cause":
    "Find the exact moment in the question first, then look right around it for what caused the feeling.",
};

export function getExamStrategyHint(familyId?: string | null): string | undefined {
  if (!familyId) return undefined;
  return ENGLISH_FAMILY_EXAM_STRATEGY[familyId];
}
