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

  // CSSE / Assessment Brain V1 (ANGEL-CSSE-002A Sprint 2) — the 13
  // CompetencyIds from lib/learningEngine/assessmentBrainMap.ts's
  // COMPETENCIES map, names copied verbatim (not reworded) so this shared
  // label lookup and the CSSE dashboard/parent page never disagree on
  // wording. Without these, lib/ali/explainability.ts's parentText() would
  // leak a raw code (e.g. "RC-01") into parent-facing text for every CSSE
  // competency, via this function's raw-code fallback.
  "RC-01": "Literal Retrieval from Narrative Text",
  "RC-02": "Inference and Justified Interpretation",
  "RC-03": "Word/Phrase Meaning-in-Context Explanation",
  "RC-04": "Sequential Ordering of Textual Information",
  "AR-01": "Letter-Code Pattern Inference and Application",
  "MR-01": "Arithmetic Calculation",
  "MR-02": "Algebraic / Symbolic Problem-Solving",
  "MR-03": "Geometric and Spatial Reasoning",
  "MR-04": "Multi-Step Word-Problem Interpretation",
  "MR-05": "Number Properties and Number Theory",
  "MR-06": "Precision Under Exact-Match Conditions",
  "WC-01": "Sustained Original Composition",
  "WC-02": "Multi-Dimensional Writing Quality",
};

export function competencyLabel(code: string): string {
  return COMPETENCY_LABELS[code] ?? code;
}
