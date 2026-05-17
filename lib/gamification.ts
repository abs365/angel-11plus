import type { UserProgress } from "@/types";
import type {
  BadgeDefinition,
  GamificationState,
  XPMilestone,
  WeeklyGoal,
} from "@/types/gamification";

// ─── Badge definitions ────────────────────────────────────────────────────────

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Streak
  {
    id: "streak-3",
    name: "3-Day Streak",
    description: "Three consecutive days of practice",
    category: "streak",
    iconName: "Flame",
    color: "orange",
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "Seven days without missing a session",
    category: "streak",
    iconName: "Flame",
    color: "red",
  },
  {
    id: "streak-14",
    name: "Fortnight Focus",
    description: "Fourteen days of consistent daily practice",
    category: "streak",
    iconName: "Flame",
    color: "rose",
  },

  // Skill
  {
    id: "first-80",
    name: "First Distinction",
    description: "Scored 80% or above in any session",
    category: "skill",
    iconName: "Star",
    color: "amber",
  },
  {
    id: "perfect-score",
    name: "Perfect Session",
    description: "Achieved 100% in any session",
    category: "skill",
    iconName: "Award",
    color: "amber",
  },
  {
    id: "english-distinction",
    name: "Inference Detective",
    description: "Scored 80%+ on an English comprehension passage",
    category: "skill",
    iconName: "Search",
    color: "purple",
  },
  {
    id: "maths-distinction",
    name: "Maths Speedster",
    description: "Scored 80%+ on a Maths session",
    category: "skill",
    iconName: "Zap",
    color: "blue",
  },

  // Subject
  {
    id: "vocab-started",
    name: "Vocabulary Explorer",
    description: "Completed your first vocabulary session",
    category: "subject",
    iconName: "BookMarked",
    color: "green",
  },
  {
    id: "writing-started",
    name: "Writing Champion",
    description: "Submitted your first creative writing prompt",
    category: "subject",
    iconName: "Pencil",
    color: "orange",
  },
  {
    id: "english-complete",
    name: "Story Master",
    description: "Completed all three English comprehension passages",
    category: "subject",
    iconName: "BookOpen",
    color: "purple",
  },
  {
    id: "maths-both",
    name: "Dual Mathematician",
    description: "Completed both Reasoning and Speed Arithmetic modes",
    category: "subject",
    iconName: "Calculator",
    color: "blue",
  },
  {
    id: "mock-test-done",
    name: "Exam Ready",
    description: "Completed a full timed 11+ mock test",
    category: "subject",
    iconName: "ClipboardList",
    color: "pink",
  },

  // Milestone
  {
    id: "xp-100",
    name: "First Steps",
    description: "Earned 100 XP",
    category: "milestone",
    iconName: "Zap",
    color: "indigo",
  },
  {
    id: "xp-500",
    name: "Dedicated Learner",
    description: "Earned 500 XP",
    category: "milestone",
    iconName: "Zap",
    color: "indigo",
  },
  {
    id: "xp-1000",
    name: "Excellence",
    description: "Earned 1,000 XP",
    category: "milestone",
    iconName: "Trophy",
    color: "indigo",
  },
  {
    id: "sessions-10",
    name: "In the Habit",
    description: "Completed 10 practice sessions",
    category: "milestone",
    iconName: "Target",
    color: "gray",
  },
];

// ─── XP milestones ────────────────────────────────────────────────────────────

export const XP_MILESTONES: XPMilestone[] = [
  { threshold: 0, label: "Beginner" },
  { threshold: 100, label: "Practitioner" },
  { threshold: 250, label: "Scholar" },
  { threshold: 500, label: "Contender" },
  { threshold: 1000, label: "Aspirant" },
  { threshold: 2500, label: "Champion" },
];

// ─── Badge computation ────────────────────────────────────────────────────────

function computeEarnedIds(p: UserProgress): string[] {
  const earned: string[] = [];

  // Streak
  if (p.streak >= 3) earned.push("streak-3");
  if (p.streak >= 7) earned.push("streak-7");
  if (p.streak >= 14) earned.push("streak-14");

  // Score achievements
  const allScores = Object.values(p.scores);
  if (allScores.some((s) => s >= 80)) earned.push("first-80");
  if (allScores.some((s) => s >= 100)) earned.push("perfect-score");

  const engScores = ["eng-001", "eng-002", "eng-003"]
    .filter((id) => id in p.scores)
    .map((id) => p.scores[id]);
  if (engScores.some((s) => s >= 80)) earned.push("english-distinction");

  const mathsScores = ["maths-reasoning", "maths-arithmetic"]
    .filter((id) => id in p.scores)
    .map((id) => p.scores[id]);
  if (mathsScores.some((s) => s >= 80)) earned.push("maths-distinction");

  // Subject completions
  const writingDone = ["writing-wrt-001", "writing-wrt-002", "writing-wrt-003", "writing-wrt-004"].some(
    (id) => p.completedLessons.includes(id)
  );
  if (writingDone) earned.push("writing-started");
  if (p.completedLessons.includes("vocab-session")) earned.push("vocab-started");

  if (["eng-001", "eng-002", "eng-003"].every((id) => p.completedLessons.includes(id))) {
    earned.push("english-complete");
  }
  if (["maths-reasoning", "maths-arithmetic"].every((id) => p.completedLessons.includes(id))) {
    earned.push("maths-both");
  }
  if (p.completedLessons.includes("mock-test")) earned.push("mock-test-done");

  // XP milestones
  if (p.xp >= 100) earned.push("xp-100");
  if (p.xp >= 500) earned.push("xp-500");
  if (p.xp >= 1000) earned.push("xp-1000");

  // Session count
  if (p.completedLessons.length >= 10) earned.push("sessions-10");

  return earned;
}

// ─── XP milestone state ───────────────────────────────────────────────────────

function getXPMilestoneState(xp: number): {
  current: XPMilestone;
  next: XPMilestone | null;
  progress: number;
} {
  let current = XP_MILESTONES[0];
  let next: XPMilestone | null = null;

  for (let i = XP_MILESTONES.length - 1; i >= 0; i--) {
    if (xp >= XP_MILESTONES[i].threshold) {
      current = XP_MILESTONES[i];
      next = XP_MILESTONES[i + 1] ?? null;
      break;
    }
  }

  const progress = next
    ? Math.min(100, Math.round(((xp - current.threshold) / (next.threshold - current.threshold)) * 100))
    : 100;

  return { current, next, progress };
}

// ─── Weekly goal ──────────────────────────────────────────────────────────────

const WEEKLY_TARGET = 5;

export function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function buildWeeklyGoal(p: UserProgress): WeeklyGoal {
  const weekStart = getMondayOfWeek(new Date());
  const sessions =
    p.weeklyStats?.weekStart === weekStart ? p.weeklyStats.sessions : 0;
  return {
    weekStart,
    sessions,
    target: WEEKLY_TARGET,
    isComplete: sessions >= WEEKLY_TARGET,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeGamification(p: UserProgress): GamificationState {
  const earnedIds = computeEarnedIds(p);
  const storedIds = p.earnedBadgeIds ?? [];
  const newlyEarnedIds = earnedIds.filter((id) => !storedIds.includes(id));
  const { current, next, progress } = getXPMilestoneState(p.xp);

  return {
    earnedIds,
    newlyEarnedIds,
    weeklyGoal: buildWeeklyGoal(p),
    currentMilestone: current,
    nextMilestone: next,
    milestoneProgress: progress,
  };
}
