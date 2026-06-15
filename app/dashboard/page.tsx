"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calculator,
  BookMarked,
  Pencil,
  ClipboardList,
  BarChart2,
  Zap,
  Target,
  Clock,
  CheckCircle,
  MapPin,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SubjectCard from "@/components/SubjectCard";
import XPBar from "@/components/XPBar";
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

const subjects = [
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
    href: "/mock-test",
    title: "Mock Test",
    description: "Full timed 11+ practice exam. English + Maths combined.",
    icon: ClipboardList,
    color: "pink" as const,
    badge: "45 min",
  },
  {
    href: "/progress",
    title: "My Progress",
    description: "Track your scores, streaks, XP and completed lessons.",
    icon: BarChart2,
    color: "indigo" as const,
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

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* XP Bar */}
        {progress && (
          <XPBar xp={progress.xp} streak={progress.streak} name="Angel" />
        )}

        {/* Daily tip */}
        <div className="mt-4 bg-purple-600 rounded-2xl px-5 py-4 flex gap-3 items-start">
          <Zap size={18} className="text-purple-200 mt-0.5 shrink-0" />
          <div>
            <p className="text-purple-100 text-xs font-semibold uppercase tracking-wide mb-1">
              Daily Tip
            </p>
            <p className="text-white text-sm leading-relaxed">{tip}</p>
          </div>
        </div>

        {/* Quick stats */}
        {progress && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <Target size={16} className="text-purple-500 mx-auto mb-1" />
              <p className="text-gray-900 font-bold text-lg leading-none">
                {progress.completedLessons.length}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">Completed</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <Zap size={16} className="text-orange-500 mx-auto mb-1" />
              <p className="text-gray-900 font-bold text-lg leading-none">
                {progress.xp}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">Total XP</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <Clock size={16} className="text-blue-500 mx-auto mb-1" />
              <p className="text-gray-900 font-bold text-lg leading-none">
                {progress.streak}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">Day streak</p>
            </div>
          </div>
        )}

        {/* Weekly goal */}
        {weeklyGoal && (
          <div
            className={`mt-3 rounded-xl px-4 py-3 flex items-center gap-3 border ${
              weeklyGoal.isComplete
                ? "bg-emerald-50 border-emerald-100"
                : "bg-white border-gray-100"
            }`}
          >
            {weeklyGoal.isComplete ? (
              <CheckCircle size={15} className="text-emerald-500 shrink-0" />
            ) : (
              <div className="flex gap-1 shrink-0">
                {Array.from({ length: weeklyGoal.target }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < weeklyGoal.sessions ? "bg-indigo-400" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}
            <p
              className={`text-sm font-medium ${
                weeklyGoal.isComplete ? "text-emerald-700" : "text-gray-600"
              }`}
            >
              {weeklyGoal.isComplete
                ? "Weekly goal complete — excellent consistency."
                : `${weeklyGoal.sessions} of ${weeklyGoal.target} sessions this week`}
            </p>
          </div>
        )}

        {/* New badge banner */}
        {newBadgeIds.length > 0 && (
          <NewBadgeBanner
            newlyEarnedIds={newBadgeIds}
            onDismiss={handleDismissBanner}
          />
        )}

        {/* Daily mission */}
        {mission && <DailyMission mission={mission} />}

        {/* Pathway card */}
        <Link
          href="/pathways"
          className="mt-3 flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border border-gray-100 hover:shadow-sm transition-shadow"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <MapPin size={15} className="text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            {pathway ? (
              <>
                <p className="text-xs text-gray-400 font-medium">Current pathway</p>
                <p className="text-sm font-semibold text-gray-900">{pathway.name}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-900">Choose Your 11+ Pathway</p>
                <p className="text-xs text-gray-400 mt-0.5">GL · CEM · CSSE · ISEB · Independent</p>
              </>
            )}
          </div>
          <span className="text-xs text-purple-600 font-medium shrink-0">
            {pathway ? "Change" : "Choose →"}
          </span>
        </Link>

        {/* Intelligence panel — top 2 insights when there's data */}
        {report && report.hasEnoughData && report.insights.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-gray-700 text-sm font-semibold">Your learning analysis</p>
              <a href="/progress" className="text-purple-600 text-xs font-medium hover:underline">
                Full report →
              </a>
            </div>
            <div className="flex flex-col gap-2">
              {report.insights.slice(0, 2).map((insight) => (
                <InsightCard key={insight.id} insight={insight} compact />
              ))}
            </div>
          </div>
        )}

        {/* Section header */}
        <div className="mt-8 mb-4">
          <h2 className="text-gray-900 font-bold text-xl">Today&apos;s Training</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Choose a subject to begin your session
          </p>
        </div>

        {/* Subject cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <SubjectCard key={subject.href} {...subject} />
          ))}
        </div>

        {/* About + disclaimer */}
        <div className="mt-8 bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
            About Angel 11+
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            Original exam-style practice for UK 11+ preparation across English, Maths, Reasoning, Writing and Reading Fluency.
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            Angel 11+ provides original exam-style practice and is not affiliated with or endorsed by any exam board or school.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
