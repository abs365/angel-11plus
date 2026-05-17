import type { SkillType } from "./index";

export type PerformanceStatus = "strong" | "developing" | "weak" | "not-started";

export interface SubjectAnalytics {
  subject: "english" | "maths" | "vocabulary" | "writing" | "mock-test";
  label: string;
  color: "purple" | "blue" | "green" | "orange" | "pink";
  attempts: number;
  avgScore: number;
  bestScore: number;
  status: PerformanceStatus;
}

export interface SkillAnalytics {
  skill: SkillType;
  label: string;
  group: "english" | "maths";
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
