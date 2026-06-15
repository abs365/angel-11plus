import type { SkillType } from "./index";

export type PerformanceStatus = "strong" | "developing" | "weak" | "not-started";

export type SubjectKey =
  | "english"
  | "maths"
  | "vocabulary"
  | "writing"
  | "mock-test"
  | "verbal-reasoning"
  | "non-verbal-reasoning"
  | "spatial-reasoning"
  | "numerical-reasoning";

export interface SubjectAnalytics {
  subject: SubjectKey;
  label: string;
  color: "purple" | "blue" | "green" | "orange" | "pink" | "violet" | "cyan" | "teal" | "rose";
  attempts: number;
  avgScore: number;
  bestScore: number;
  status: PerformanceStatus;
}

export interface SkillAnalytics {
  skill: SkillType;
  label: string;
  group: "english" | "maths" | "reasoning";
  questionsAttempted: number;
  estimatedAccuracy: number;
  status: PerformanceStatus;
}

export type InsightColor = "purple" | "green" | "orange" | "red" | "blue" | "indigo";
export type InsightType = "strength" | "weakness" | "suggestion" | "milestone" | "streak" | "info";

export interface LearningInsight {
  id: string;
  type: InsightType;
  title: string;
  body: string;
  color: InsightColor;
  priority: number;
}

export interface AnalyticsReport {
  subjects: SubjectAnalytics[];
  skills: SkillAnalytics[];
  insights: LearningInsight[];
  overallScore: number;
  totalSessions: number;
  weakSubjects: string[];
  strongSubjects: string[];
  notStartedSubjects: string[];
  nextRecommendation: { label: string; href: string } | null;
  hasEnoughData: boolean;
}
