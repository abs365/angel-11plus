import type { UserProgress } from "@/types";
import type { AnalyticsReport, SubjectAnalytics } from "@/types/analytics";
import type { AdaptiveTier } from "@/types/adaptive";
import type { AdaptiveProfile, SubjectConfidence } from "@/types/adaptiveDifficulty";
import { buildReplayQueue } from "./replayEngine";

// ─── Tier config ──────────────────────────────────────────────────────────────

export const TIER_CONFIG: Record<
  AdaptiveTier,
  { label: string; description: string; bgClass: string; textClass: string }
> = {
  foundation: {
    label: "Foundation",
    description: "Building core familiarity with question types and exam technique.",
    bgClass: "bg-gray-100",
    textClass: "text-gray-500",
  },
  developing: {
    label: "Developing",
    description: "Good progress — working towards exam-ready standard.",
    bgClass: "bg-blue-100",
    textClass: "text-blue-600",
  },
  advanced: {
    label: "Advanced",
    description: "Above exam standard — focus on precision and consistency.",
    bgClass: "bg-purple-100",
    textClass: "text-purple-700",
  },
  challenge: {
    label: "Challenge",
    description: "Scholarship-level performance — push for near-perfection.",
    bgClass: "bg-rose-100",
    textClass: "text-rose-600",
  },
};

// ─── Tier from score ──────────────────────────────────────────────────────────

function tierFromScore(avgScore: number, attempts: number): AdaptiveTier {
  if (attempts === 0) return "foundation";
  if (avgScore < 55) return "foundation";
  if (avgScore < 75) return "developing";
  if (avgScore < 90) return "advanced";
  return "challenge";
}

// ─── Confidence computation ───────────────────────────────────────────────────

export function computeSubjectConfidence(
  subject: SubjectAnalytics,
  p: UserProgress
): SubjectConfidence {
  if (subject.attempts === 0) {
    return { subject: subject.subject, score: 0, accuracy: 0, consistency: 0, tier: "foundation" };
  }

  const accuracy = subject.avgScore;
  // Attempts contribute most to consistency; streak adds a bonus for recent regularity
  const consistency = Math.min(100, subject.attempts * 18 + p.streak * 4);
  const score = Math.round(accuracy * 0.65 + consistency * 0.35);

  return {
    subject: subject.subject,
    score,
    accuracy,
    consistency,
    tier: tierFromScore(subject.avgScore, subject.attempts),
  };
}

// ─── Full adaptive profile ────────────────────────────────────────────────────

export function computeAdaptiveProfile(
  p: UserProgress,
  report: AnalyticsReport
): AdaptiveProfile {
  const subjectConfidence = report.subjects.map((s) =>
    computeSubjectConfidence(s, p)
  );

  const attempted = subjectConfidence.filter((c) => c.score > 0);
  const overallConfidence =
    attempted.length > 0
      ? Math.round(attempted.reduce((sum, c) => sum + c.score, 0) / attempted.length)
      : 0;

  return {
    subjectConfidence,
    overallConfidence,
    replayQueue: buildReplayQueue(p, report),
  };
}
