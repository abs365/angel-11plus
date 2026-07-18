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
};

export const SUBJECT_LEARNING_OBJECTIVE: Partial<Record<SubjectKey, string>> = {
  english: "Build inference and evidence-based comprehension skills through original exam-style passages.",
  maths: "Strengthen problem-solving, fractions, algebra and timed arithmetic accuracy.",
  vocabulary: "Grow Tier 2 & 3 word knowledge through definitions, synonyms and everyday use.",
  writing: "Develop narrative, descriptive and persuasive technique using structured checklists.",
};
