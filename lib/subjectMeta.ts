import type { SubjectKey } from "@/types/analytics";

/**
 * Sprint 4 (Learning Experience Transformation) — presentation-only
 * metadata for the Learning Hub and Study Session info strip. These are
 * the same real per-subject minute estimates already used elsewhere in
 * this product (lib/adaptiveEngine.ts's own SUBJECT_MINUTES uses
 * identical values for english/maths/vocabulary/writing) — duplicated
 * here rather than importing from lib/adaptiveEngine.ts specifically so
 * this sprint's work never touches that file at all, per its explicit
 * "Do NOT modify... adaptive engine" instruction. No calculation happens
 * here; this is display copy only.
 */
export const SUBJECT_ESTIMATED_MINUTES: Partial<Record<SubjectKey, number>> = {
  english: 20,
  maths: 20,
  vocabulary: 10,
  writing: 30,
  // Sprint 5 (Practice Experience) — identical to lib/adaptiveEngine.ts's
  // own SUBJECT_MINUTES for these four keys (15 each), duplicated here for
  // the same reason as above: this sprint never touches that file.
  "verbal-reasoning": 15,
  "non-verbal-reasoning": 15,
  "spatial-reasoning": 15,
  "numerical-reasoning": 15,
};

/**
 * AN-103 (Premium Learning Hub Experience) — Founder-approved subject
 * descriptions for the Learning Hub's own card list only. Deliberately a
 * separate export from SUBJECT_LEARNING_OBJECTIVE below, not a
 * replacement of it: SUBJECT_LEARNING_OBJECTIVE is also read by
 * SessionInfoBar on each subject's own landing page
 * (app/english/page.tsx etc.), and AN-103's Founder decision is explicit
 * that those four pages are not to be redesigned — changing the shared
 * constant would have changed their displayed copy too, even without
 * touching their files. Text reproduced verbatim from the Founder
 * decision, not paraphrased.
 */
export const SUBJECT_HUB_DESCRIPTION: Partial<Record<SubjectKey, string>> = {
  english: "Builds the reading, comprehension and communication skills needed to succeed across the entire 11+ examination.",
  maths: "Develops mathematical reasoning, accuracy and confidence required for selective school entrance assessments.",
  vocabulary: "Expands word knowledge to improve comprehension, verbal reasoning and confident written expression.",
  writing: "Strengthens organisation, creativity and written communication so ideas can be expressed clearly and effectively.",
};

export const SUBJECT_LEARNING_OBJECTIVE: Partial<Record<SubjectKey, string>> = {
  english: "Build inference and evidence-based comprehension skills through original exam-style passages.",
  maths: "Strengthen problem-solving, fractions, algebra and timed arithmetic accuracy.",
  vocabulary: "Grow Tier 2 & 3 word knowledge through definitions, synonyms and everyday use.",
  writing: "Develop narrative, descriptive and persuasive technique using structured checklists.",
  "verbal-reasoning": "Build technique for word analogies, letter codes, hidden words and sequences.",
  "non-verbal-reasoning": "Develop pattern recognition across rotation, reflection and symbol sequences.",
  "spatial-reasoning": "Strengthen 3D visualisation through paper folding, symmetry and compass directions.",
  "numerical-reasoning": "Sharpen number-pattern recognition, ratio and data-interpretation technique.",
};

/**
 * Sprint 5 (Practice Experience & Competency Journey) — Practice Sessions'
 * "Suggested preparation" and "Expected benefit" fields. Scoped to the four
 * reasoning subjects only (English/Maths/Vocabulary/Writing already got
 * their own Study Sessions treatment in Sprint 4). Presentation copy only,
 * same convention as SUBJECT_LEARNING_OBJECTIVE above — never a
 * calculation, and no adaptive-engine reason text is invented or
 * duplicated here.
 */
export const SUBJECT_SUGGESTED_PREPARATION: Partial<Record<SubjectKey, string>> = {
  "verbal-reasoning": "Keep a pen and rough paper nearby for working through letter and word patterns.",
  "non-verbal-reasoning": "Find a quiet space. Spotting the pattern rule needs a few uninterrupted minutes per question.",
  "spatial-reasoning": "Have scrap paper ready to sketch folds and rotations if it helps you visualise.",
  "numerical-reasoning": "Keep rough paper handy for working out number patterns and ratios step by step.",
};

export const SUBJECT_EXPECTED_BENEFIT: Partial<Record<SubjectKey, string>> = {
  "verbal-reasoning": "Tested by GL, CEM and ISEB. This is one of the highest-value sections to keep sharp.",
  "non-verbal-reasoning": "Tested by GL and ISEB. Strong pattern recognition transfers directly into exam speed.",
  "spatial-reasoning": "Builds 3D thinking used across several exam boards' reasoning papers.",
  "numerical-reasoning": "A core CEM skill that also reinforces the number-pattern work in Maths.",
  // AN-105 (Subject Learning Experience — Accessibility and Consistency) —
  // Founder-approved "why this session matters" copy for the four core
  // subjects, reproduced verbatim. Added to this existing map (not a new
  // constant) because SessionInfoBar's expectedBenefit prop already exists
  // for exactly this purpose — it was simply never populated for these
  // four keys. Purely additive: the four reasoning-subject entries above
  // are untouched.
  english: "This session strengthens the reading and comprehension skills used to understand passages, interpret meaning and answer accurately.",
  maths: "This session develops the reasoning, accuracy and problem-solving skills needed to handle increasingly challenging mathematical questions.",
  vocabulary: "This session builds the word knowledge needed to understand unfamiliar language, interpret questions and express ideas confidently.",
  writing: "This session develops the structure, clarity and expression needed to communicate ideas effectively in written responses.",
};
