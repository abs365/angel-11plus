import type { SubjectAnalytics, SkillAnalytics } from "./analytics";
import type { BadgeDefinition } from "./gamification";
import type { SubjectConfidence } from "./adaptiveDifficulty";

export type ExamReadiness = "not-ready" | "building" | "nearly-ready" | "exam-ready";

export interface ParentInsight {
  id: string;
  text: string;
  type: "positive" | "attention" | "action";
}

export interface FocusArea {
  label: string;
  href: string;
  detail: string;
  frequency: string;
}

export interface ParentReport {
  xp: number;
  rank: string;
  streak: number;
  totalSessions: number;
  weeklySessions: number;
  overallScore: number;
  estimatedMinutes: number;
  examReadiness: ExamReadiness;
  subjects: SubjectAnalytics[];
  skills: SkillAnalytics[];
  parentInsights: ParentInsight[];
  focusAreas: FocusArea[];
  earnedBadges: BadgeDefinition[];
  weeklyXP: number;
  hasEnoughData: boolean;
  subjectConfidence: SubjectConfidence[];
}
