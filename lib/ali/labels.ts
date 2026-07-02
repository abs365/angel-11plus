/**
 * Human-readable, parent-friendly names for ALI competency codes
 * (QUESTION_AUTHORING_STANDARD.md §3). Shared between lib/adaptiveEngine.ts
 * (Daily Missions, Phase ALI 1.3) and lib/parentInsights.ts (Parent
 * Intelligence, Phase ALI 1.4) so both surfaces use identical wording —
 * extracted here rather than duplicated in each.
 */
export const COMPETENCY_LABELS: Record<string, string> = {
  "vr.analogies": "Word Analogies",
  "vr.odd-one-out": "Odd One Out",
  "vr.synonyms": "Synonyms",
  "vr.antonyms": "Antonyms",
  "vr.letter-codes": "Letter Codes",
  "vr.number-codes": "Number Codes",
  "vr.word-codes": "Word Codes",
  "vr.hidden-words": "Hidden Words",
  "vr.sequences": "Sequences",
  "vr.compound-words": "Compound Words",
};

export function competencyLabel(code: string): string {
  return COMPETENCY_LABELS[code] ?? code;
}
