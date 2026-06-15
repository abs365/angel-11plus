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
  mockResults?: import("./mock").MockResult[];
}
