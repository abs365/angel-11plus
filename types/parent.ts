import type { SubjectAnalytics, SkillAnalytics } from "./analytics";
import type { BadgeDefinition } from "./gamification";
import type { SubjectConfidence } from "./adaptiveDifficulty";
import type { CompetencyParentSummary } from "./ali/parentSummary";

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
  // Competency-first summaries (Phase ALI 1.4) — one entry per subject with
  // real ALI data. Empty array when no subject has any (fallback: existing
  // parentInsights/focusAreas below are the only Parent Insights content,
  // exactly as before this phase).
  competencySummaries: CompetencyParentSummary[];
}
