import type { UserProgress } from "@/types";
import type { AnalyticsReport, SubjectAnalytics } from "@/types/analytics";
import type { GamificationState } from "@/types/gamification";
import type { ExamReadiness, FocusArea, ParentInsight, ParentReport } from "@/types/parent";
import { XP_MILESTONES, BADGE_DEFINITIONS } from "./gamification";
import { computeAdaptiveProfile } from "./adaptiveDifficulty";

// ─── Exam readiness ───────────────────────────────────────────────────────────

export const READINESS_CONFIG: Record<
  ExamReadiness,
  { label: string; description: string; barColor: string; bgColor: string; textColor: string; pct: number }
> = {
  "not-ready": {
    label: "Getting Started",
    description: "Your child is in the early stages. More practice sessions will build a fuller picture.",
    barColor: "bg-gray-400",
    bgColor: "bg-gray-50",
    textColor: "text-gray-600",
    pct: 15,
  },
  building: {
    label: "Building Confidence",
    description: "Good progress across subjects. Regular daily sessions will accelerate readiness.",
    barColor: "bg-amber-400",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    pct: 40,
  },
  "nearly-ready": {
    label: "Nearly Ready",
    description: "Strong foundations in place. Focus on weaker areas and complete a mock test.",
    barColor: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    pct: 70,
  },
  "exam-ready": {
    label: "Exam Ready",
    description: "Excellent preparation. Maintain consistency and review any remaining weak spots.",
    barColor: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    pct: 100,
  },
};

function getExamReadiness(
  p: UserProgress,
  report: AnalyticsReport,
  overallConfidence: number
): ExamReadiness {
  const sessions = report.totalSessions;
  const score = report.overallScore;
  const attempted = report.subjects.filter((s) => s.attempts > 0 && s.subject !== "mock-test").length;
  const hasMock = p.completedLessons.includes("mock-test");

  if (sessions < 3) return "not-ready";
  // Confidence >= 70 confirms consistency + accuracy together
  if (score >= 70 && sessions >= 8 && hasMock && attempted >= 3 && overallConfidence >= 70) return "exam-ready";
  if (score >= 55 && sessions >= 5 && attempted >= 2 && overallConfidence >= 45) return "nearly-ready";
  return "building";
}

// ─── Weekly XP ────────────────────────────────────────────────────────────────

function getWeeklyXP(p: UserProgress): number {
  const sessions = p.weeklyStats?.sessions ?? 0;
  // Approximate: average ~25 XP per session
  return sessions * 25;
}

// ─── Estimated time ───────────────────────────────────────────────────────────

function getEstimatedMinutes(p: UserProgress): number {
  return p.completedLessons.length * 15;
}

// ─── Rank label ───────────────────────────────────────────────────────────────

function getRank(xp: number): string {
  let label = XP_MILESTONES[0].label;
  for (const m of XP_MILESTONES) {
    if (xp >= m.threshold) label = m.label;
  }
  return label;
}

// ─── Parent insights ─────────────────────────────────────────────────────────

function buildParentInsights(
  p: UserProgress,
  report: AnalyticsReport,
  readiness: ExamReadiness
): ParentInsight[] {
  const insights: ParentInsight[] = [];
  const sessions = report.totalSessions;
  const score = report.overallScore;

  if (sessions === 0) {
    insights.push({
      id: "no-data",
      text: "Your child hasn't completed any practice sessions yet. Encourage them to start with English or Maths to begin building their profile.",
      type: "action",
    });
    return insights;
  }

  // Positive: streak
  if (p.streak >= 7) {
    insights.push({
      id: "streak-great",
      text: `Your child has maintained a ${p.streak}-day practice streak — this level of consistency is one of the strongest predictors of exam performance.`,
      type: "positive",
    });
  } else if (p.streak >= 3) {
    insights.push({
      id: "streak-good",
      text: `Your child has kept a ${p.streak}-day streak. Encouraging daily short sessions (even 10–15 minutes) is more effective than occasional long ones.`,
      type: "positive",
    });
  }

  // Positive: strong subjects
  if (report.strongSubjects.length > 0) {
    const s = report.strongSubjects.slice(0, 2).join(" and ");
    insights.push({
      id: "strong-subject",
      text: `Your child is performing above the 75% target in ${s}. This is solid exam-level territory — encourage them to maintain this standard.`,
      type: "positive",
    });
  }

  // Positive: good overall
  if (score >= 70 && sessions >= 5) {
    insights.push({
      id: "overall-strong",
      text: `Overall, your child is averaging ${score}% across all subjects they have attempted — ahead of the typical preparatory benchmark at this stage.`,
      type: "positive",
    });
  }

  // Attention: weak subjects
  if (report.weakSubjects.length > 0) {
    const w = report.weakSubjects[0];
    insights.push({
      id: "weak-subject",
      text: `${w} is currently below the 55% threshold. This is the single highest-impact area to focus on. Short, regular sessions in this subject will improve the score most quickly.`,
      type: "attention",
    });
  }

  // Attention: no mock test after enough sessions
  const mockDone = p.completedLessons.includes("mock-test");
  if (!mockDone && sessions >= 6) {
    insights.push({
      id: "no-mock",
      text: `Your child hasn't attempted a timed mock test yet. A full mock exam reveals timing and pressure weaknesses that topic practice alone doesn't show — it's an important next step.`,
      type: "attention",
    });
  }

  // Action: untried subjects
  const notStartedCore = report.notStartedSubjects.filter((s) => s !== "Mock Test");
  if (notStartedCore.length > 0 && sessions >= 2) {
    const ns = notStartedCore[0];
    insights.push({
      id: "not-started",
      text: `Your child hasn't tried ${ns} yet. The 11+ tests all subject areas, so broadening coverage now will prevent any gaps appearing under exam conditions.`,
      type: "action",
    });
  }

  // Action: readiness-specific advice
  if (readiness === "nearly-ready") {
    insights.push({
      id: "nearly-ready-action",
      text: `Your child is in the 'nearly ready' zone. The gap to exam-ready closes fastest by: doing a timed mock test, reviewing any weak skills, and keeping up daily practice for the next two weeks.`,
      type: "action",
    });
  }

  // Action: low score with sessions
  if (score < 50 && sessions >= 4) {
    insights.push({
      id: "score-low",
      text: `Your child's average score is ${score}% — aim to get this above 60% before the exam. Encourage them to use the step-by-step worked answers to understand where marks are being lost.`,
      type: "action",
    });
  }

  return insights.slice(0, 5);
}

// ─── Focus areas ──────────────────────────────────────────────────────────────

const SUBJECT_ADVICE: Record<string, { detail: string; href: string }> = {
  English: {
    detail: "Read each question carefully and quote directly from the passage. Use the model answers to understand what examiners expect.",
    href: "/english",
  },
  Maths: {
    detail: "Work through Reasoning Problems first — use the step-by-step breakdowns to find where the method breaks down.",
    href: "/maths",
  },
  Vocabulary: {
    detail: "Daily 5-minute vocabulary sessions are more effective than longer weekly ones. Focus on words marked 'still learning'.",
    href: "/vocabulary",
  },
  Writing: {
    detail: "Use the writing checklist actively while writing, not after. Encourage your child to plan for 2 minutes before starting.",
    href: "/writing",
  },
  "Mock Test": {
    detail: "Complete a full timed mock to identify timing weaknesses. Review the section with the lowest score immediately after.",
    href: "/mock-test",
  },
};

function buildFocusAreas(report: AnalyticsReport): FocusArea[] {
  const areas: FocusArea[] = [];

  // 1. Weak subjects first
  const weakSubjects = report.subjects.filter(
    (s) => s.status === "weak" && s.subject !== "mock-test"
  );
  for (const s of weakSubjects.slice(0, 2)) {
    const advice = SUBJECT_ADVICE[s.label];
    if (advice) {
      areas.push({
        label: s.label,
        href: advice.href,
        detail: advice.detail,
        frequency: "Daily",
      });
    }
  }

  // 2. Not-started core subjects
  const notStarted = report.subjects.filter(
    (s) => s.status === "not-started" && s.subject !== "mock-test"
  );
  for (const s of notStarted.slice(0, 2)) {
    if (areas.length >= 3) break;
    const advice = SUBJECT_ADVICE[s.label];
    if (advice) {
      areas.push({
        label: s.label,
        href: advice.href,
        detail: advice.detail,
        frequency: "This week",
      });
    }
  }

  // 3. Mock test if not done and sessions >= 4
  const hasMock = report.subjects.find((s) => s.subject === "mock-test");
  if (hasMock?.status === "not-started" && report.totalSessions >= 4 && areas.length < 3) {
    const advice = SUBJECT_ADVICE["Mock Test"];
    areas.push({
      label: "Mock Test",
      href: advice.href,
      detail: advice.detail,
      frequency: "Once a fortnight",
    });
  }

  // 4. Developing subjects as filler
  if (areas.length < 2) {
    const developing = report.subjects.filter(
      (s) => s.status === "developing" && s.subject !== "mock-test"
    );
    for (const s of developing) {
      if (areas.length >= 3) break;
      const advice = SUBJECT_ADVICE[s.label];
      if (advice && !areas.find((a) => a.label === s.label)) {
        areas.push({
          label: s.label,
          href: advice.href,
          detail: advice.detail,
          frequency: "2–3× per week",
        });
      }
    }
  }

  return areas.slice(0, 3);
}

// ─── Weeks of data ────────────────────────────────────────────────────────────

function getWeeklySessions(p: UserProgress): number {
  return p.weeklyStats?.sessions ?? 0;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeParentReport(
  p: UserProgress,
  report: AnalyticsReport,
  gamification: GamificationState
): ParentReport {
  const profile = computeAdaptiveProfile(p, report);
  const readiness = getExamReadiness(p, report, profile.overallConfidence);
  const earnedBadges = BADGE_DEFINITIONS.filter((b) =>
    gamification.earnedIds.includes(b.id)
  );

  return {
    xp: p.xp,
    rank: getRank(p.xp),
    streak: p.streak,
    totalSessions: report.totalSessions,
    weeklySessions: getWeeklySessions(p),
    overallScore: report.overallScore,
    estimatedMinutes: getEstimatedMinutes(p),
    examReadiness: readiness,
    subjects: report.subjects,
    skills: report.skills,
    parentInsights: buildParentInsights(p, report, readiness),
    focusAreas: buildFocusAreas(report),
    earnedBadges,
    weeklyXP: getWeeklyXP(p),
    hasEnoughData: report.totalSessions >= 1,
    subjectConfidence: profile.subjectConfidence,
  };
}
