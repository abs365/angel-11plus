export type BadgeCategory = "streak" | "skill" | "subject" | "milestone";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  iconName: string;
  color: "orange" | "red" | "rose" | "purple" | "blue" | "green" | "amber" | "indigo" | "pink" | "gray";
}

export interface XPMilestone {
  threshold: number;
  label: string;
}

export interface WeeklyGoal {
  weekStart: string;
  sessions: number;
  target: number;
  isComplete: boolean;
}

export interface GamificationState {
  earnedIds: string[];
  newlyEarnedIds: string[];
  weeklyGoal: WeeklyGoal;
  currentMilestone: XPMilestone;
  nextMilestone: XPMilestone | null;
  milestoneProgress: number; // 0–100 within current span
}
