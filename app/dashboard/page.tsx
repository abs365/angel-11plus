"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calculator,
  BookMarked,
  Pencil,
  Target,
  BarChart2,
  Flame,
  Star,
  Lightbulb,
  MapPin,
  Puzzle,
  Shapes,
  Compass,
  Hash,
  Play,
  CheckCircle,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SubjectCard from "@/components/SubjectCard";
import { getProgress, markBadgesSeen, getSelectedPathwayId } from "@/lib/progress";
import { migrateLocalProgressToSupabase } from "@/lib/migrateProgress";
import { computeAnalytics } from "@/lib/analytics";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";
import { computeGamification } from "@/lib/gamification";
import InsightCard from "@/components/InsightCard";
import DailyMission from "@/components/DailyMission";
import NewBadgeBanner from "@/components/NewBadgeBanner";
import { getPathwayById } from "@/lib/pathways";
import type { UserProgress } from "@/types";
import type { AnalyticsReport } from "@/types/analytics";
import type { DailyMission as DailyMissionData } from "@/types/adaptive";
import type { WeeklyGoal } from "@/types/gamification";
import type { Pathway } from "@/types/pathway";

const coreSubjects = [
  {
    href: "/english",
    title: "English Comprehension",
    description: "Inference, evidence & atmosphere. Original exam-style passages.",
    icon: BookOpen,
    color: "purple" as const,
    badge: "3 lessons",
  },
  {
    href: "/maths",
    title: "Maths Reasoning",
    description: "Problem-solving, fractions, algebra & timed arithmetic.",
    icon: Calculator,
    color: "blue" as const,
    badge: "10 questions",
  },
  {
    href: "/vocabulary",
    title: "Vocabulary Builder",
    description: "Tier 2 & 3 words with definitions, synonyms and challenges.",
    icon: BookMarked,
    color: "green" as const,
    badge: "Word of the day",
  },
  {
    href: "/writing",
    title: "Creative Writing",
    description: "Narrative, descriptive & persuasive prompts with checklists.",
    icon: Pencil,
    color: "orange" as const,
    badge: "4 prompts",
  },
  {
    href: "/mocks",
    title: "Practice Mocks",
    description: "Timed GL, CEM, CSSE & ISEB-style mock exams. Section by section.",
    icon: Target,
    color: "pink" as const,
    badge: "4 pathways",
  },
  {
    href: "/progress",
    title: "My Progress",
    description: "Track your scores, streaks, XP and completed lessons.",
    icon: BarChart2,
    color: "indigo" as const,
  },
];

const reasoningSubjects = [
  {
    href: "/verbal-reasoning",
    title: "Verbal Reasoning",
    description: "Word analogies, letter codes, hidden words & sequences.",
    icon: Puzzle,
    color: "violet" as const,
    badge: "GL · CEM · ISEB",
  },
  {
    href: "/non-verbal-reasoning",
    title: "Non-Verbal Reasoning",
    description: "Pattern grids, rotation, reflection & symbol sequences.",
    icon: Shapes,
    color: "cyan" as const,
    badge: "GL · ISEB",
  },
  {
    href: "/spatial-reasoning",
    title: "Spatial Reasoning",
    description: "Paper folding, 3D shapes, symmetry & compass directions.",
    icon: Compass,
    color: "teal" as const,
    badge: "Independent",
  },
  {
    href: "/numerical-reasoning",
    title: "Numerical Reasoning",
    description: "Number patterns, ratio, averages & data interpretation.",
    icon: Hash,
    color: "rose" as const,
    badge: "CEM · GL · ISEB",
  },
];

const tips = [
  "Read the passage twice before answering — once for story, once for detail.",
  "In inference questions, always quote from the text to support your answer.",
  "For maths problems, write your working clearly — even rough marks count.",
  "Vary your sentence openers in writing. Don't start every sentence with 'I' or 'The'.",
  "Learn the difference between synonyms — 'sad' and 'desolate' are NOT the same.",
  "Short sentences build tension. Long sentences create description. Use both.",
  "When describing atmosphere, use at least three different techniques.",
  "Timed practice is essential. 11+ is a race as much as a test of knowledge.",
];

function WelcomeHero({ progress, tip }: { progress: UserProgress; tip: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const level = Math.floor(progress.xp / 100) + 1;
  const xpInLevel = progress.xp % 100;

  return (
    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-2xl px-6 py-5 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-purple-200 text-sm font-medium">{greeting}</p>
          <h1 className="text-white font-bold text-2xl mt-0.5 leading-tight">Angel</h1>
        </div>
        <div className="bg-white/15 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <Star size={13} className="text-yellow-300" />
          <span className="text-white text-sm font-bold">Level {level}</span>
        </div>
      </div>

      <div className="flex items-center gap-5 mb-4">
        <div>
          <p className="text-white font-bold text-xl leading-none">{progress.xp}</p>
          <p className="text-purple-300 text-xs mt-0.5">Total XP</p>
        </div>
        <div className="h-7 w-px bg-white/20" />
        <div className="flex items-center gap-1.5">
          <Flame size={15} className="text-orange-300" />
          <div>
            <p className="text-white font-bold text-xl leading-none">{progress.streak}</p>
            <p className="text-purple-300 text-xs mt-0.5">Day streak</p>
          </div>
        </div>
        <div className="h-7 w-px bg-white/20" />
        <div>
          <p className="text-white font-bold text-xl leading-none">
            {progress.completedLessons.length}
          </p>
          <p className="text-purple-300 text-xs mt-0.5">Sessions</p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-purple-300 mb-1.5">
          <span>Level {level} → {level + 1}</span>
          <span>{xpInLevel}/100 XP</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${xpInLevel}%` }}
          />
        </div>
      </div>

      {tip && (
        <div className="bg-white/10 rounded-xl px-4 py-2.5 flex gap-2 items-start">
          <Lightbulb size={14} className="text-yellow-300 shrink-0 mt-0.5" />
          <p className="text-purple-100 text-xs leading-relaxed">{tip}</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [mission, setMission] = useState<DailyMissionData | null>(null);
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal | null>(null);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const [tip, setTip] = useState("");
  const [pathway, setPathway] = useState<Pathway | undefined>();

  useEffect(() => {
    const p = getProgress();
    const r = computeAnalytics(p);
    const adaptive = computeAdaptiveState(p, r);
    const gamification = computeGamification(p);

    setProgress(p);
    setReport(r);
    setMission(adaptive.dailyMission);
    setWeeklyGoal(gamification.weeklyGoal);
    setNewBadgeIds(gamification.newlyEarnedIds);
    setTip(tips[Math.floor(Math.random() * tips.length)]);
    setPathway(getPathwayById(getSelectedPathwayId() ?? ""));
    migrateLocalProgressToSupabase().catch(() => {});
  }, []);

  function handleDismissBanner() {
    markBadgesSeen(newBadgeIds);
    setNewBadgeIds([]);
  }

  const remainingMissionItems = mission ? mission.items.slice(1) : [];

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">

        {/* 1. Welcome Hero */}
        {progress && <WelcomeHero progress={progress} tip={tip} />}

        {/* 2. New Badge Banner */}
        {newBadgeIds.length > 0 && (
          <NewBadgeBanner newlyEarnedIds={newBadgeIds} onDismiss={handleDismissBanner} />
        )}

        {/* 3. Today's Mission */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <Target size={15} className="text-purple-600" />
            </div>
            <h2 className="text-gray-900 font-bold text-xl">Today&apos;s Mission</h2>
          </div>

          {mission && mission.items.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Primary mission item — featured hero */}
              <Link
                href={mission.items[0].href}
                className="block bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-purple-100/60 px-5 py-5 hover:from-purple-100 hover:to-indigo-100 transition-colors group"
              >
                <p className="text-purple-500 text-xs font-semibold uppercase tracking-wide mb-1.5">
                  Start here · {mission.focusArea}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-bold text-lg leading-tight">
                      {mission.items[0].label}
                    </p>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">
                      {mission.items[0].reason}
                    </p>
                  </div>
                  <div className="bg-purple-600 group-hover:bg-purple-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shrink-0 flex items-center gap-1.5 transition-colors shadow-sm">
                    <Play size={13} />
                    Start
                  </div>
                </div>
              </Link>

              {/* Secondary items */}
              {remainingMissionItems.length > 0 && (
                <div className="px-5">
                  <DailyMission
                    mission={{ ...mission, items: remainingMissionItems }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <Target size={32} className="text-purple-200 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold text-sm mb-1">No mission yet</p>
              <p className="text-gray-400 text-xs">Complete a practice session to unlock your daily mission</p>
            </div>
          )}
        </section>

        {/* 4. Pathway + Weekly Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pathway */}
          <Link
            href="/pathways"
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border border-gray-100 hover:shadow-sm hover:border-purple-100 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              {pathway ? (
                <>
                  <p className="text-xs text-gray-400 font-medium">Current pathway</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{pathway.name}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-900">Choose Your Pathway</p>
                  <p className="text-xs text-gray-400 mt-0.5">GL · CEM · CSSE · ISEB</p>
                </>
              )}
            </div>
            <span className="text-xs text-purple-600 font-medium shrink-0">
              {pathway ? "Change" : "Choose →"}
            </span>
          </Link>

          {/* Weekly Goal */}
          {weeklyGoal && (
            <div
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 border ${
                weeklyGoal.isComplete
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-white border-gray-100"
              }`}
            >
              {weeklyGoal.isComplete ? (
                <CheckCircle size={20} className="text-emerald-500 shrink-0" />
              ) : (
                <div className="flex gap-1 shrink-0">
                  {Array.from({ length: weeklyGoal.target }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${
                        i < weeklyGoal.sessions ? "bg-indigo-400" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              )}
              <p
                className={`text-sm font-medium leading-snug ${
                  weeklyGoal.isComplete ? "text-emerald-700" : "text-gray-600"
                }`}
              >
                {weeklyGoal.isComplete
                  ? "Weekly goal complete!"
                  : `${weeklyGoal.sessions} of ${weeklyGoal.target} sessions this week`}
              </p>
            </div>
          )}
        </div>

        {/* 5. Core Subjects */}
        <section>
          <div className="mb-4">
            <h2 className="text-gray-900 font-bold text-xl">Core Subjects</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              English · Maths · Vocabulary · Writing · Mocks
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreSubjects.map((subject) => (
              <SubjectCard key={subject.href} {...subject} />
            ))}
          </div>
        </section>

        {/* 6. Reasoning Skills */}
        <section>
          <div className="mb-4">
            <h2 className="text-gray-900 font-bold text-xl">Reasoning Skills</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              Required for GL, CEM, ISEB and many independent school pathways
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasoningSubjects.map((subject) => (
              <SubjectCard key={subject.href} {...subject} />
            ))}
          </div>
        </section>

        {/* 7. Learning Insights */}
        {report && report.hasEnoughData && report.insights.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-900 font-bold text-xl">Learning Insights</h2>
              <Link href="/progress" className="text-purple-600 text-xs font-medium hover:underline">
                Full report →
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {report.insights.slice(0, 2).map((insight) => (
                <InsightCard key={insight.id} insight={insight} compact />
              ))}
            </div>
          </section>
        )}

        {/* 8. About + disclaimer */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
            About Angel 11+
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mb-2">
            Original exam-style practice for UK 11+ preparation across English, Maths, Reasoning, Writing and Vocabulary.
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            Angel 11+ provides original practice content and is not affiliated with or endorsed by any exam board or school.
          </p>
        </div>

      </div>
    </PageLayout>
  );
}
