export type Difficulty = "year4-foundation" | "advanced-year4" | "year5-core" | "year5-advanced" | "year6-exam";

export type SkillType =
  | "inference"
  | "evidence"
  | "vocabulary"
  | "explanation"
  | "atmosphere"
  | "character"
  | "structure"
  | "arithmetic"
  | "reasoning"
  | "word-problem"
  | "pattern"
  | "fractions"
  | "writing"
  | "verbal-reasoning"
  | "non-verbal-reasoning"
  | "spatial-reasoning"
  | "numerical-reasoning";

export interface Question {
  id: string;
  question: string;
  skill: SkillType;
  marks: number;
  hint?: string;
  modelAnswer?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: "english" | "maths" | "vocabulary" | "writing";
  difficulty: Difficulty;
  estimatedMinutes: number;
  passage?: string;
  questions: Question[];
}

export interface VocabWord {
  id: string;
  word: string;
  definition: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  difficulty: Difficulty;
  category: "tier2" | "tier3" | "literary";
}

export interface WritingPrompt {
  id: string;
  title: string;
  prompt: string;
  type: "narrative" | "descriptive" | "persuasive";
  difficulty: Difficulty;
  checklist: string[];
  timeMinutes: number;
}

export interface MathsQuestion {
  id: string;
  question: string;
  answer: number | string;
  skill: SkillType;
  difficulty: Difficulty;
  workingSteps?: string[];
  marks: number;
}

export interface SkillRecord {
  correct: number;
  attempted: number;
}

export interface UserProgress {
  xp: number;
  streak: number;
  completedLessons: string[];
  scores: Record<string, number>;
  lastActivity: string;
  skillScores?: Partial<Record<SkillType, SkillRecord>>;
  earnedBadgeIds?: string[];
  weeklyStats?: { weekStart: string; sessions: number };
  selectedPathwayId?: string;
  /**
   * Work Package WP-09 — target exam date (EAW-004 §2.1, Defect Correction
   * EAW-D001). Parent/guardian-supplied, optional, never asked of the
   * child. Powers Recommendation Orchestration's Tier 3 exam-proximity
   * reweighting (lib/ali/recommendationOrchestration.ts) — absent by
   * default, and Tier 3 simply does not activate when it's absent, per
   * EAW-004 §2.1's explicit "behaviour when absent" specification.
   */
  targetExamDate?: string;
  mockResults?: import("./mock").MockResult[];
  // ALI competency bridge (Phase ALI 1.3) — additive only, does not touch
  // `scores`/the Math.max ratchet. Keyed by ALI subject.
  aliCompetencySignal?: Partial<Record<string, import("./ali/missionSignal").AliCompetencySignal>>;
  // ALI Learning Gain (Phase ALI 1.4) — internal only, not read by any UI
  // in this phase. Keyed by ALI subject.
  aliLearningGain?: Partial<Record<string, import("./ali/learningGain").LearningGainSnapshot>>;
  // ALI Learning Profile (Foundation Completion, Part 3) — derived
  // interpretation of the two signals above, not a new source of truth.
  // Internal only, not read by any UI yet. Not subject-keyed (it's a
  // cross-subject summary of the whole student, unlike the two above).
  aliLearningProfile?: import("./ali/learningProfile").LearningProfile;
}
