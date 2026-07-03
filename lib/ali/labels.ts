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

  // Mathematics (Phase ALI 2.0) — QUESTION_AUTHORING_STANDARD.md §11.2
  "maths.addition-subtraction": "Addition & Subtraction",
  "maths.multiplication": "Multiplication",
  "maths.division": "Division",
  "maths.fractions": "Fractions",
  "maths.decimals": "Decimals",
  "maths.percentages": "Percentages",
  "maths.ratio-proportion": "Ratio & Proportion",
  "maths.algebra": "Algebra",
  "maths.geometry": "Geometry",
  "maths.measurement": "Measurement",
  "maths.time": "Time",
  "maths.money": "Money",
  "maths.statistics": "Statistics",
  "maths.problem-solving": "Problem Solving",
  "maths.powers-roots": "Powers, Roots & Order of Operations",
  "maths.factors-multiples": "Factors, Multiples & Primes",

  // Reading Comprehension (Phase ALI 2.1) — ENGLISH_COMPETENCY_FRAMEWORK.md §3.1.
  // Only the two approved competencies — the other 8 stay on the roadmap
  // until real content exists, so they have no label here yet either.
  "english.inference": "Inference",
  "english.vocabulary-in-context": "Vocabulary in Context",

  // Vocabulary (Phase ALI 2.2) — VOCABULARY_COMPETENCY_FRAMEWORK.md §3.
  // Only the 3 approved competencies — the other 7 stay on the roadmap
  // until both real content AND a schema change exist for them.
  "vocabulary.synonyms": "Synonyms",
  "vocabulary.antonyms": "Antonyms",
  "vocabulary.in-context": "Vocabulary in Context",
};

export function competencyLabel(code: string): string {
  return COMPETENCY_LABELS[code] ?? code;
}
