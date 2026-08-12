import { englishLessons } from "@/data/lessons";
import { mathsQuestions, quickArithmetic } from "@/data/maths";
import type { UserProgress, SkillType } from "@/types";
import type {
  AnalyticsReport,
  InsightColor,
  LearningInsight,
  PerformanceStatus,
  SkillAnalytics,
  SubjectAnalytics,
} from "@/types/analytics";

// ─── helpers ────────────────────────────────────────────────────────────────

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function status(score: number, attempted: number): PerformanceStatus {
  if (attempted === 0) return "not-started";
  if (score >= 75) return "strong";
  if (score >= 55) return "developing";
  return "weak";
}

function skillStatus(correct: number, attempted: number): PerformanceStatus {
  if (attempted === 0) return "not-started";
  const pct = (correct / attempted) * 100;
  if (pct >= 75) return "strong";
  if (pct >= 50) return "developing";
  return "weak";
}

// ─── human-readable skill labels ────────────────────────────────────────────

const SKILL_LABELS: Record<SkillType, string> = {
  inference: "Inference",
  evidence: "Evidence retrieval",
  vocabulary: "Vocabulary in context",
  explanation: "Explanation",
  atmosphere: "Atmosphere",
  character: "Character",
  structure: "Structure",
  arithmetic: "Arithmetic",
  reasoning: "Reasoning",
  "word-problem": "Word problems",
  pattern: "Sequences & patterns",
  fractions: "Fractions",
  writing: "Writing",
  "verbal-reasoning": "Verbal Reasoning",
  "non-verbal-reasoning": "Non-Verbal Reasoning",
  "spatial-reasoning": "Spatial Reasoning",
  "numerical-reasoning": "Numerical Reasoning",
};

// ─── subject analytics ───────────────────────────────────────────────────────

function buildSubjectAnalytics(p: UserProgress): SubjectAnalytics[] {
  // English — three lessons
  const engIds = ["eng-001", "eng-002", "eng-003"];
  const engScores = engIds.filter((id) => id in p.scores).map((id) => p.scores[id]);
  const engAvg = mean(engScores);

  // Maths — two session types
  const mathIds = ["maths-reasoning", "maths-arithmetic"];
  const mathScores = mathIds.filter((id) => id in p.scores).map((id) => p.scores[id]);
  const mathAvg = mean(mathScores);

  // Vocabulary
  const vocabScore = p.scores["vocab-session"];
  const vocabScores = vocabScore !== undefined ? [vocabScore] : [];

  // Writing — four prompts
  const writingIds = ["writing-wrt-001", "writing-wrt-002", "writing-wrt-003", "writing-wrt-004"];
  const writingScores = writingIds
    .filter((id) => id in p.scores)
    .map((id) => p.scores[id]);
  const writingAvg = mean(writingScores);

  // Mock test
  const mockScore = p.scores["mock-test"];
  const mockScores = mockScore !== undefined ? [mockScore] : [];

  // Reasoning subjects — each is a single session ID
  const vrScore = p.scores["verbal-reasoning"];
  const vrScores = vrScore !== undefined ? [vrScore] : [];

  const nvrScore = p.scores["non-verbal-reasoning"];
  const nvrScores = nvrScore !== undefined ? [nvrScore] : [];

  const srScore = p.scores["spatial-reasoning"];
  const srScores = srScore !== undefined ? [srScore] : [];

  const nrScore = p.scores["numerical-reasoning"];
  const nrScores = nrScore !== undefined ? [nrScore] : [];

  return [
    {
      subject: "english",
      label: "English",
      color: "purple",
      attempts: engScores.length,
      avgScore: engAvg,
      bestScore: engScores.length ? Math.max(...engScores) : 0,
      status: status(engAvg, engScores.length),
    },
    {
      subject: "maths",
      label: "Maths",
      color: "blue",
      attempts: mathScores.length,
      avgScore: mathAvg,
      bestScore: mathScores.length ? Math.max(...mathScores) : 0,
      status: status(mathAvg, mathScores.length),
    },
    {
      subject: "vocabulary",
      label: "Vocabulary",
      color: "green",
      attempts: vocabScores.length,
      avgScore: mean(vocabScores),
      bestScore: vocabScores.length ? Math.max(...vocabScores) : 0,
      status: status(mean(vocabScores), vocabScores.length),
    },
    {
      subject: "writing",
      label: "Writing",
      color: "orange",
      attempts: writingScores.length,
      avgScore: writingAvg,
      bestScore: writingScores.length ? Math.max(...writingScores) : 0,
      status: status(writingAvg, writingScores.length),
    },
    {
      subject: "mock-test",
      label: "Mock Test",
      color: "pink",
      attempts: mockScores.length,
      avgScore: mean(mockScores),
      bestScore: mockScores.length ? Math.max(...mockScores) : 0,
      status: status(mean(mockScores), mockScores.length),
    },
    {
      subject: "verbal-reasoning",
      label: "Verbal Reasoning",
      color: "violet",
      attempts: vrScores.length,
      avgScore: mean(vrScores),
      bestScore: vrScores.length ? Math.max(...vrScores) : 0,
      status: status(mean(vrScores), vrScores.length),
    },
    {
      subject: "non-verbal-reasoning",
      label: "Non-Verbal Reasoning",
      color: "cyan",
      attempts: nvrScores.length,
      avgScore: mean(nvrScores),
      bestScore: nvrScores.length ? Math.max(...nvrScores) : 0,
      status: status(mean(nvrScores), nvrScores.length),
    },
    {
      subject: "spatial-reasoning",
      label: "Spatial Reasoning",
      color: "teal",
      attempts: srScores.length,
      avgScore: mean(srScores),
      bestScore: srScores.length ? Math.max(...srScores) : 0,
      status: status(mean(srScores), srScores.length),
    },
    {
      subject: "numerical-reasoning",
      label: "Numerical Reasoning",
      color: "rose",
      attempts: nrScores.length,
      avgScore: mean(nrScores),
      bestScore: nrScores.length ? Math.max(...nrScores) : 0,
      status: status(mean(nrScores), nrScores.length),
    },
  ];
}

// ─── skill analytics ─────────────────────────────────────────────────────────

function buildSkillAnalytics(p: UserProgress): SkillAnalytics[] {
  const skills: Map<SkillType, { correct: number; attempted: number; group: "english" | "maths" | "reasoning" }> =
    new Map();

  // 1. Explicit per-question results from maths (recorded by recordSkillResult)
  if (p.skillScores) {
    const mathsSkills: SkillType[] = ["arithmetic", "reasoning", "word-problem", "pattern", "fractions"];
    for (const skill of mathsSkills) {
      const rec = p.skillScores[skill];
      if (rec && rec.attempted > 0) {
        skills.set(skill, { ...rec, group: "maths" });
      }
    }

    // Reasoning skills (verbal, non-verbal, spatial, numerical)
    const reasoningSkills: SkillType[] = ["verbal-reasoning", "non-verbal-reasoning", "spatial-reasoning", "numerical-reasoning"];
    for (const skill of reasoningSkills) {
      const rec = p.skillScores[skill];
      if (rec && rec.attempted > 0) {
        skills.set(skill, { ...rec, group: "reasoning" });
      }
    }
  }

  // 2. English skill estimates — distribute each lesson's score across its question skills
  //    weighted by marks. This is approximate: if a lesson scored 80%, each skill in that
  //    lesson is estimated at 80%.
  for (const lesson of englishLessons) {
    const lessonScore = p.scores[lesson.id];
    if (lessonScore === undefined) continue;

    for (const q of lesson.questions) {
      const existing = skills.get(q.skill);
      if (existing) {
        // Weight new estimate by marks to average it in
        existing.correct += (lessonScore / 100) * q.marks;
        existing.attempted += q.marks;
      } else {
        skills.set(q.skill, {
          correct: (lessonScore / 100) * q.marks,
          attempted: q.marks,
          group: "english",
        });
      }
    }
  }

  return Array.from(skills.entries())
    .filter(([, v]) => v.attempted > 0)
    .map(([skill, v]) => ({
      skill,
      label: SKILL_LABELS[skill],
      group: v.group,
      questionsAttempted: Math.round(v.attempted),
      estimatedAccuracy: Math.round((v.correct / v.attempted) * 100),
      status: skillStatus(v.correct, v.attempted),
    }))
    .sort((a, b) => a.estimatedAccuracy - b.estimatedAccuracy); // weakest first
}

// ─── learning insights ───────────────────────────────────────────────────────

function generateInsights(
  p: UserProgress,
  subjects: SubjectAnalytics[],
  skills: SkillAnalytics[]
): LearningInsight[] {
  const insights: LearningInsight[] = [];
  let idCounter = 0;
  const id = () => String(++idCounter);

  const strong = subjects.filter((s) => s.status === "strong");
  const weak = subjects.filter((s) => s.status === "weak");
  const notStarted = subjects.filter((s) => s.status === "not-started");
  const weakSkills = skills.filter((s) => s.status === "weak");
  const totalSessions = p.completedLessons.length;

  // Streak milestone
  if (p.streak >= 7) {
    insights.push({
      id: id(),
      type: "milestone",
      title: `${p.streak}-day streak`,
      body: "Outstanding consistency. Seven days of practice is how selective-school candidates build real confidence.",
      color: "orange",
      priority: 20,
    });
  } else if (p.streak >= 3) {
    insights.push({
      id: id(),
      type: "streak",
      title: `${p.streak}-day streak`,
      body: "Consistency beats intensity. Keep your daily practice going. It adds up faster than you think.",
      color: "orange",
      priority: 15,
    });
  }

  // No data yet — welcome message
  if (totalSessions === 0) {
    insights.push({
      id: id(),
      type: "info",
      title: "Ready to begin",
      body: "Start with English or Maths to generate your personal performance analysis. The system learns from every question you answer.",
      color: "purple",
      priority: 50,
    });
    return insights;
  }

  // Strong subject — positive reinforcement
  if (strong.length > 0) {
    const s = strong[0];
    insights.push({
      id: id(),
      type: "strength",
      title: `${s.label} is a strength`,
      body: `You're averaging ${s.avgScore}% in ${s.label.toLowerCase()}. This is exam-ready territory. Push for consistency, don't let this slip.`,
      color: "green",
      priority: 8,
    });
  }

  // Weak subject — targeted advice
  if (weak.length > 0) {
    const w = weak[0];
    const advice: Record<string, string> = {
      english:
        "Focus on quoting directly from the text in your answers. Every inference point needs a piece of evidence beside it.",
      maths:
        "Work through the Reasoning Problems mode carefully. Use the step-by-step working to understand where your method is breaking down.",
      vocabulary:
        "Do one vocabulary flashcard session daily. The key is reviewing the words you marked 'still learning' each time.",
      writing:
        "Use the checklist actively: tick each item as you write, not after. This builds structured thinking under time pressure.",
      "mock-test":
        "Focus on the section where you lost most marks. Timed practice is the best way to build exam speed.",
    };
    insights.push({
      id: id(),
      type: "weakness",
      title: `${w.label} needs attention`,
      body: advice[w.subject] ?? `Your ${w.label.toLowerCase()} score (${w.avgScore}%) is below target. Practise this section before your next mock test.`,
      color: "red",
      priority: 18,
    });
  }

  // Weak skill — specific inference/fractions/etc advice
  if (weakSkills.length > 0) {
    const ws = weakSkills[0];
    const skillAdvice: Partial<Record<SkillType, string>> = {
      inference: "Always explain WHY something is suggested, not just WHAT. Use the phrase 'This suggests...' to structure your thinking.",
      fractions: "Find a common denominator before doing anything else. Write it out; don't try to do it in your head.",
      "word-problem": "Read word problems twice. On the second read, underline the question, then decide the operation before you calculate.",
      atmosphere: "Use at least two language techniques in your atmosphere answers: a quote, the technique name, and its effect on the reader.",
      evidence: "Quotes must be exact, short (3–5 words is ideal), and directly relevant to the question. Don't quote whole sentences.",
      pattern: "Write out the first few terms of the sequence. Look at the gap between terms before trying the formula.",
      arithmetic: "For multi-step arithmetic, estimate first. If your answer looks wildly wrong, you've likely made a place-value error.",
    };
    const adviceText = skillAdvice[ws.skill];
    if (adviceText) {
      insights.push({
        id: id(),
        type: "suggestion",
        title: `Tip for ${ws.label.toLowerCase()}`,
        body: adviceText,
        color: "blue",
        priority: 12,
      });
    }
  }

  // Subject not started
  if (notStarted.length > 0 && totalSessions >= 2) {
    const ns = notStarted.find(
      (s) => s.subject !== "mock-test"
    );
    if (ns) {
      insights.push({
        id: id(),
        type: "suggestion",
        title: `Haven't tried ${ns.label} yet`,
        body: `11+ tests every subject. Opening ${ns.label.toLowerCase()} now means more data and a more complete picture of where you stand.`,
        color: "indigo",
        priority: 6,
      });
    }
  }

  // XP milestone
  if (p.xp >= 500) {
    insights.push({
      id: id(),
      type: "milestone",
      title: `${p.xp} XP earned`,
      body: "You've built significant practice hours. The gap between prepared and unprepared candidates is exactly this kind of consistent work.",
      color: "purple",
      priority: 4,
    });
  }

  // Mock test not done
  const mockSubject = subjects.find((s) => s.subject === "mock-test");
  if (mockSubject?.status === "not-started" && totalSessions >= 5) {
    insights.push({
      id: id(),
      type: "suggestion",
      title: "Try your first mock test",
      body: "You have enough practice now to attempt a timed exam. Mock tests reveal timing weaknesses that topic practice alone cannot show.",
      color: "pink" as InsightColor,
      priority: 10,
    });
  }

  return insights.sort((a, b) => b.priority - a.priority);
}

// ─── next recommendation ─────────────────────────────────────────────────────

function buildNextRecommendation(
  subjects: SubjectAnalytics[]
): { label: string; href: string } | null {
  // Prioritise: weak > not-started > developing
  const weak = subjects.filter((s) => s.status === "weak" && s.subject !== "mock-test");
  if (weak.length > 0) {
    const w = weak[0];
    return { label: `Practice ${w.label}`, href: `/${w.subject}` };
  }
  const notStarted = subjects.filter(
    (s) => s.status === "not-started" && s.subject !== "mock-test"
  );
  if (notStarted.length > 0) {
    const ns = notStarted[0];
    return { label: `Start ${ns.label}`, href: `/${ns.subject}` };
  }
  const developing = subjects.filter(
    (s) => s.status === "developing" && s.subject !== "mock-test"
  );
  if (developing.length > 0) {
    const d = developing[0];
    return { label: `Improve ${d.label}`, href: `/${d.subject}` };
  }
  return null;
}

// ─── public API ──────────────────────────────────────────────────────────────

export function computeAnalytics(p: UserProgress): AnalyticsReport {
  const subjects = buildSubjectAnalytics(p);
  const skills = buildSkillAnalytics(p);
  const insights = generateInsights(p, subjects, skills);

  const attempted = subjects.filter((s) => s.attempts > 0);
  const overallScore = attempted.length ? mean(attempted.map((s) => s.avgScore)) : 0;

  const strong = subjects.filter((s) => s.status === "strong").map((s) => s.label);
  const weak = subjects.filter((s) => s.status === "weak").map((s) => s.label);
  const notStarted = subjects.filter((s) => s.status === "not-started").map((s) => s.label);

  return {
    subjects,
    skills,
    insights,
    overallScore,
    totalSessions: p.completedLessons.length,
    weakSubjects: weak,
    strongSubjects: strong,
    notStartedSubjects: notStarted,
    nextRecommendation: buildNextRecommendation(subjects),
    hasEnoughData: p.completedLessons.length >= 1,
  };
}

export { SKILL_LABELS };
