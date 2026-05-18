import type { UserProgress } from "@/types";
import type { AnalyticsReport, SubjectAnalytics } from "@/types/analytics";
import type { AdaptiveState, AdaptiveTier, DailyMission, MissionItem } from "@/types/adaptive";
import { getTopReplayItem } from "./replayEngine";

// ─── Tier determination ───────────────────────────────────────────────────────

function tierFromSubject(subject: SubjectAnalytics): AdaptiveTier {
  if (subject.attempts === 0) return "foundation";
  if (subject.avgScore < 55) return "foundation";
  if (subject.avgScore < 75) return "developing";
  if (subject.avgScore < 90) return "advanced";
  return "challenge";
}

// ─── English lesson recommendation ───────────────────────────────────────────

function pickEnglishLesson(tier: AdaptiveTier, completedLessons: string[]): string {
  const done = (id: string) => completedLessons.includes(id);

  switch (tier) {
    case "foundation":
      if (!done("eng-001")) return "eng-001";
      if (!done("eng-002")) return "eng-002";
      return "eng-001"; // revisit easiest

    case "developing":
      if (!done("eng-001")) return "eng-001";
      if (!done("eng-002")) return "eng-002";
      if (!done("eng-003")) return "eng-003";
      return "eng-002"; // revisit core level

    case "advanced":
      if (!done("eng-002")) return "eng-002";
      if (!done("eng-003")) return "eng-003";
      return "eng-003"; // revisit hardest

    case "challenge":
      if (!done("eng-003")) return "eng-003";
      return "eng-003"; // push for perfection
  }
}

// ─── Maths mode recommendation ────────────────────────────────────────────────

function pickMathsMode(
  report: AnalyticsReport,
  completedLessons: string[]
): "reasoning" | "arithmetic" {
  const reasoningDone = completedLessons.includes("maths-reasoning");
  const arithmeticDone = completedLessons.includes("maths-arithmetic");

  if (!reasoningDone) return "reasoning";
  if (!arithmeticDone) return "arithmetic";

  // Both done — recommend whichever is weaker
  const arithmeticSkill = report.skills.find((s) => s.skill === "arithmetic");
  if (arithmeticSkill && arithmeticSkill.status === "weak") return "arithmetic";

  const reasoningSkills = report.skills.filter((s) =>
    ["reasoning", "word-problem", "fractions", "pattern"].includes(s.skill)
  );
  const weakReasoning = reasoningSkills.some((s) => s.status === "weak");
  if (weakReasoning) return "reasoning";

  // Default: reasoning is more comprehensive
  return "reasoning";
}

// ─── Mission item builders ────────────────────────────────────────────────────

const SUBJECT_LABELS: Record<string, string> = {
  english: "English Comprehension",
  maths: "Maths Reasoning",
  vocabulary: "Vocabulary Builder",
  writing: "Creative Writing",
  "mock-test": "Mock Test",
};

const SUBJECT_MINUTES: Record<string, number> = {
  english: 20,
  maths: 20,
  vocabulary: 10,
  writing: 30,
  "mock-test": 45,
};

function reasonText(
  subject: SubjectAnalytics,
  priority: "primary" | "secondary" | "review",
  weakSkillLabel?: string
): string {
  if (priority === "review") {
    return `You're strong here — a quick session keeps your ${subject.label.toLowerCase()} score exam-ready.`;
  }

  if (subject.status === "not-started") {
    const copy: Record<string, string> = {
      english: "Essex CSSE tests comprehension heavily — start building your reading technique.",
      maths: "Maths reasoning accounts for half your 11+ marks — don't leave it untouched.",
      vocabulary: "Strong vocabulary lifts both your English and Writing scores at once.",
      writing: "Creative writing is a scored 11+ component — start with a structured prompt.",
      "mock-test": "Timed practice reveals timing gaps that topic work alone cannot show.",
    };
    return copy[subject.subject] ?? "You haven't tried this section yet — now is a good time.";
  }

  if (subject.status === "weak") {
    const copy: Record<string, string> = {
      english: `Your English average is ${subject.avgScore}% — quote evidence more precisely and answer each mark point directly.`,
      maths: `Your Maths average is ${subject.avgScore}% — write out your working step-by-step to find where marks are lost.`,
      vocabulary: `Your vocabulary score is ${subject.avgScore}% — revisit the words you marked as uncertain each session.`,
      writing: `Your writing average is ${subject.avgScore}% — use the checklist actively as you write, not afterwards.`,
      "mock-test": `Your mock average is ${subject.avgScore}% — identify which section cost you most marks and focus there.`,
    };
    const base = copy[subject.subject] ?? `Your ${subject.label.toLowerCase()} score (${subject.avgScore}%) has room to grow — focused practice here pays off.`;
    return weakSkillLabel
      ? `${base} Weakest skill: ${weakSkillLabel.toLowerCase()}.`
      : base;
  }

  // developing
  const copy: Record<string, string> = {
    english: `You're averaging ${subject.avgScore}% in English — more precise evidence and technique will push this above 75%.`,
    maths: `You're averaging ${subject.avgScore}% in Maths — stronger method-writing will push you into exam-ready territory.`,
    vocabulary: `Your vocabulary score is ${subject.avgScore}% — consistent daily review closes this gap quickly.`,
    writing: `Your writing is at ${subject.avgScore}% — vary your sentence openers and technique use to improve further.`,
    "mock-test": `You scored ${subject.avgScore}% on your mock — identify the weaker section and focus there next sitting.`,
  };
  return copy[subject.subject] ?? `You're at ${subject.avgScore}% — consistency will bring this above 75%.`;
}

function buildItem(
  subject: SubjectAnalytics,
  tier: AdaptiveTier,
  priority: "primary" | "secondary" | "review",
  index: number,
  weakSkillLabel?: string
): MissionItem {
  const minutes = Math.round(
    SUBJECT_MINUTES[subject.subject] * (priority === "review" ? 0.5 : 1)
  );
  return {
    id: `mission-${index}`,
    subject: subject.subject,
    label:
      priority === "review"
        ? `Review ${SUBJECT_LABELS[subject.subject]}`
        : SUBJECT_LABELS[subject.subject],
    href: `/${subject.subject}`,
    reason: reasonText(subject, priority, weakSkillLabel),
    tier,
    priority,
    estimatedMinutes: Math.max(10, minutes),
  };
}

// ─── Urgency ordering ─────────────────────────────────────────────────────────

function urgency(s: SubjectAnalytics): number {
  if (s.subject === "mock-test") return -1;
  if (s.status === "weak") return 100 + (100 - s.avgScore);
  if (s.status === "not-started") return 80;
  if (s.status === "developing") return 50 + (75 - s.avgScore);
  return 0;
}

// ─── Daily mission builder ────────────────────────────────────────────────────

function buildDailyMission(
  report: AnalyticsReport,
  englishTier: AdaptiveTier,
  mathsTier: AdaptiveTier,
  p: UserProgress
): DailyMission {
  // Brand-new user — fixed starter mission
  if (report.totalSessions === 0) {
    return {
      items: [
        {
          id: "mission-0",
          subject: "english",
          label: "English Comprehension",
          href: "/english",
          reason:
            "Start here — inference and close reading are at the heart of 11+. Essex CSSE style passages.",
          tier: "foundation",
          priority: "primary",
          estimatedMinutes: 20,
        },
        {
          id: "mission-1",
          subject: "maths",
          label: "Maths Reasoning",
          href: "/maths",
          reason:
            "Maths reasoning is half the exam. Work through each problem with full step-by-step solutions.",
          tier: "foundation",
          priority: "secondary",
          estimatedMinutes: 20,
        },
      ],
      totalMinutes: 40,
      focusArea: "Getting started",
      tagline: "Complete two subjects to generate your personalised analysis.",
    };
  }

  // Find the weakest skill per subject for richer reason text
  const weakSkillBySubject = new Map<string, string>();
  for (const skill of report.skills) {
    if (skill.status === "weak" && !weakSkillBySubject.has(skill.group)) {
      weakSkillBySubject.set(skill.group, skill.label);
    }
  }

  const nonMock = report.subjects.filter((s) => s.subject !== "mock-test");
  const sorted = [...nonMock].sort((a, b) => urgency(b) - urgency(a));

  const items: MissionItem[] = [];

  // Primary — most urgent
  const primary = sorted[0];
  if (primary) {
    const tier =
      primary.subject === "english"
        ? englishTier
        : primary.subject === "maths"
        ? mathsTier
        : tierFromSubject(primary);
    items.push(buildItem(primary, tier, "primary", 0, weakSkillBySubject.get(primary.subject)));
  }

  // Secondary — second-most urgent (only if meaningfully urgent)
  const secondary = sorted.find((s, i) => i > 0 && urgency(s) > 20);
  if (secondary) {
    const tier =
      secondary.subject === "english"
        ? englishTier
        : secondary.subject === "maths"
        ? mathsTier
        : tierFromSubject(secondary);
    items.push(buildItem(secondary, tier, "secondary", 1, weakSkillBySubject.get(secondary.subject)));
  }

  // Review — a strong subject to maintain (different from primary + secondary)
  const reviewSubject = report.subjects.find(
    (s) =>
      s.status === "strong" &&
      s.subject !== "mock-test" &&
      s.subject !== primary?.subject &&
      s.subject !== secondary?.subject
  );
  if (reviewSubject) {
    const tier =
      reviewSubject.subject === "english"
        ? englishTier
        : reviewSubject.subject === "maths"
        ? mathsTier
        : tierFromSubject(reviewSubject);
    items.push(buildItem(reviewSubject, tier, "review", 2));
  }

  // Replay item — surface the most urgent weak skill if it targets a new subject
  const topReplay = getTopReplayItem(p, report);
  if (topReplay && items.length < 3) {
    const alreadyCovered = items.some((i) => i.subject === topReplay.subject);
    if (!alreadyCovered) {
      items.push({
        id: "mission-replay",
        subject: topReplay.subject,
        label: `Revise: ${topReplay.skillLabel}`,
        href: topReplay.href,
        reason: topReplay.reason,
        tier: "foundation",
        priority: "secondary",
        estimatedMinutes: 15,
      });
    }
  }

  // Mock test nudge — after 5+ sessions if not yet attempted
  const mockSubject = report.subjects.find((s) => s.subject === "mock-test");
  if (
    items.length < 4 &&
    report.totalSessions >= 5 &&
    mockSubject?.status === "not-started"
  ) {
    items.push({
      id: "mission-mock",
      subject: "mock-test",
      label: "Full Mock Test",
      href: "/mock-test",
      reason:
        "You have enough practice to attempt a timed 11+ mock — this reveals real timing gaps.",
      tier: "advanced",
      priority: "secondary",
      estimatedMinutes: 45,
    });
  }

  const totalMinutes = items.reduce((sum, item) => sum + item.estimatedMinutes, 0);

  // Focus area + tagline
  let focusArea = "Balanced practice";
  let tagline = "Work across subjects consistently to build full 11+ readiness.";

  if (primary) {
    if (primary.status === "weak") {
      focusArea = `Fix your ${primary.label.toLowerCase()}`;
      tagline =
        "Targeted work on your weakest area — this is where exam marks are won or lost.";
    } else if (primary.status === "not-started") {
      focusArea = `Explore ${primary.label.toLowerCase()}`;
      tagline =
        "Broaden your practice — 11+ tests every subject, and gaps cost marks on the day.";
    } else if (primary.status === "developing") {
      focusArea = `Lift your ${primary.label.toLowerCase()}`;
      tagline =
        "You're close to the target — focused practice now will push you into exam-ready territory.";
    } else {
      focusArea = "Maintain your standard";
      tagline = "Keep your strongest areas sharp while building the others.";
    }
  }

  return { items, totalMinutes, focusArea, tagline };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeAdaptiveState(
  progress: UserProgress,
  report: AnalyticsReport
): AdaptiveState {
  const engSubject = report.subjects.find((s) => s.subject === "english")!;
  const mathSubject = report.subjects.find((s) => s.subject === "maths")!;

  const englishTier = tierFromSubject(engSubject);
  const mathsTier = tierFromSubject(mathSubject);

  return {
    englishTier,
    mathsTier,
    recommendedEnglishLesson: pickEnglishLesson(englishTier, progress.completedLessons),
    recommendedMathsMode: pickMathsMode(report, progress.completedLessons),
    dailyMission: buildDailyMission(report, englishTier, mathsTier, progress),
  };
}
