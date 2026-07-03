"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock, BookOpen, Trophy, Play, Sparkles } from "lucide-react";
import { getMockResults, getBestMockScoreForPathway } from "@/lib/mockProgress";
import type { MockResult, MockPathwayId } from "@/types/mock";

const MOCK_CARDS: {
  pathway: MockPathwayId;
  name: string;
  badge: string;
  description: string;
  totalMinutes: number;
  sections: string[];
  bg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  btnBg: string;
}[] = [
  {
    pathway: "gl",
    name: "GL Assessment",
    badge: "GL",
    description: "Practice paper covering the four GL Assessment question types: Verbal Reasoning, Non-Verbal Reasoning, Numerical Reasoning and Vocabulary.",
    totalMinutes: 35,
    sections: ["Verbal Reasoning", "Non-Verbal Reasoning", "Numerical Reasoning", "Vocabulary Challenge"],
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-100 dark:border-blue-900",
    badgeBg: "bg-blue-600",
    badgeText: "text-white",
    btnBg: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    pathway: "cem",
    name: "CEM",
    badge: "CEM",
    description: "Practice covering the two core CEM sections: Verbal Reasoning and Numerical Reasoning, styled to reflect the CEM adaptive format.",
    totalMinutes: 30,
    sections: ["Verbal Reasoning", "Numerical Reasoning"],
    bg: "bg-indigo-50 dark:bg-indigo-950",
    border: "border-indigo-100 dark:border-indigo-900",
    badgeBg: "bg-indigo-600",
    badgeText: "text-white",
    btnBg: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
  {
    pathway: "csse",
    name: "CSSE",
    badge: "CSSE",
    description: "CSSE-style practice with an English & Language section and a Mathematics section. This is original practice content, not an official CSSE paper.",
    totalMinutes: 40,
    sections: ["English & Language", "Mathematics"],
    bg: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-100 dark:border-purple-900",
    badgeBg: "bg-purple-600",
    badgeText: "text-white",
    btnBg: "bg-purple-600 hover:bg-purple-700 text-white",
  },
  {
    pathway: "iseb",
    name: "ISEB Pre-Test",
    badge: "ISEB",
    description: "Four-section practice covering all ISEB Pre-Test reasoning types: Verbal, Non-Verbal, Spatial and Numerical Reasoning.",
    totalMinutes: 40,
    sections: ["Verbal Reasoning", "Non-Verbal Reasoning", "Spatial Reasoning", "Numerical Reasoning"],
    bg: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-100 dark:border-emerald-900",
    badgeBg: "bg-emerald-600",
    badgeText: "text-white",
    btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
];

export default function MocksPage() {
  const [recentResults, setRecentResults] = useState<MockResult[]>([]);
  const [bestScores, setBestScores] = useState<Partial<Record<MockPathwayId, number>>>({});

  useEffect(() => {
    const results = getMockResults();
    setRecentResults(results.slice(-3).reverse());
    setBestScores({
      gl: getBestMockScoreForPathway("gl") ?? undefined,
      cem: getBestMockScoreForPathway("cem") ?? undefined,
      csse: getBestMockScoreForPathway("csse") ?? undefined,
      iseb: getBestMockScoreForPathway("iseb") ?? undefined,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100">Practice &amp; Mock Exams</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">Original exam-style practice · Not official papers</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16 pt-5 space-y-6">

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            These are original practice papers created by Angel 11+. They are not affiliated with or endorsed by GL Assessment, CEM, CSSE, ISEB or any school. All content is original exam-style practice.
          </p>
        </div>

        {/* Phase 5B.2 — Practice Experience Stabilisation (PRACTICE_EXPERIENCE_REVIEW.md
            Issue 4): a short, explicit explainer of the Personalised Practice /
            Mock Exams distinction, so a parent or child never has to guess what
            to click first. */}
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3.5">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <strong className="text-gray-900 dark:text-gray-100">New here? Start with Personalised Practice</strong> — a short session that adapts to your level, perfect for daily learning. When you&apos;re ready to simulate the real thing under timed conditions, try a <strong className="text-gray-900 dark:text-gray-100">Mock Exam</strong>.
          </p>
        </div>

        {/* Personalised Practice — Angel UX V3: ALI is invisible here (ANGEL_UX_V3_STRATEGY.md §3).
            Each card links to a practice route whose selection quietly adapts to the
            student; nothing on this page says "adaptive," "beta," or names the mechanism. */}
        <section id="practice" className="space-y-3 scroll-mt-20">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Personalised Practice</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Short, daily sessions. Questions adapt to you every time.</p>
          </div>
          <div className="rounded-2xl border border-violet-100 dark:border-violet-900 bg-violet-50 dark:bg-violet-950 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-violet-700 text-white flex items-center gap-1">
                  <Sparkles size={12} />
                  Personalised
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">GL Verbal Reasoning</h3>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={13} />
                35 min
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Your Verbal Reasoning questions are chosen for you every time — no two sessions are identical, and your weak spots come back around intelligently.
            </p>
            <Link
              href="/mocks/adaptive/gl"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white transition-colors"
            >
              <Play size={14} />
              Start Practice
            </Link>
          </div>

          <div className="rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-700 text-white flex items-center gap-1">
                  <Sparkles size={12} />
                  Personalised
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Maths Practice</h3>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={13} />
                12 min
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Your Maths questions are chosen for you every time — no two sessions are identical, and your weak spots come back around intelligently.
            </p>
            <Link
              href="/mocks/adaptive/maths"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white transition-colors"
            >
              <Play size={14} />
              Start Practice
            </Link>
          </div>

          <div className="rounded-2xl border border-purple-100 dark:border-purple-900 bg-purple-50 dark:bg-purple-950 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-700 text-white flex items-center gap-1">
                  <Sparkles size={12} />
                  Personalised
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Reading Practice</h3>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={13} />
                10-15 min
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              A passage is chosen for you every time — never split apart — with your weak spots in inference and vocabulary coming back around intelligently.
            </p>
            <Link
              href="/mocks/adaptive/english"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white transition-colors"
            >
              <Play size={14} />
              Start Practice
            </Link>
          </div>

          <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-700 text-white flex items-center gap-1">
                  <Sparkles size={12} />
                  Personalised
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Vocabulary Practice</h3>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={13} />
                5-10 min
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              A word is chosen for you every time — never split apart — with your weak spots in synonyms, antonyms and context coming back around intelligently.
            </p>
            <Link
              href="/mocks/adaptive/vocabulary"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
            >
              <Play size={14} />
              Start Practice
            </Link>
          </div>
        </section>

        {/* Mock cards */}
        <section id="mock-exams" className="space-y-4 scroll-mt-20">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mock Exams</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Full timed papers that simulate real exam conditions, section by section.</p>
          </div>
          {MOCK_CARDS.map((card) => {
            const best = bestScores[card.pathway];
            return (
              <div
                key={card.pathway}
                className={`rounded-2xl border p-5 ${card.bg} ${card.border}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${card.badgeBg} ${card.badgeText}`}>
                      {card.badge}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{card.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={13} />
                    {card.totalMinutes} min
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{card.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {card.sections.map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-white/70 dark:bg-gray-900/70 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full border border-white/80 dark:border-gray-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  {best !== undefined ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Trophy size={13} className="text-amber-500" />
                      Best score: <span className="font-semibold text-gray-800 dark:text-gray-200">{best}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">Not attempted yet</span>
                  )}
                  <Link
                    href={`/mocks/${card.pathway}`}
                    className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${card.btnBg}`}
                  >
                    <Play size={14} />
                    Start Mock
                  </Link>
                </div>
              </div>
            );
          })}
        </section>

        {/* Recent results */}
        {recentResults.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Recent Results</h2>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
              {recentResults.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <BookOpen size={14} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{r.pathwayName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      r.totalScore >= 75
                        ? "text-green-600"
                        : r.totalScore >= 55
                        ? "text-amber-600"
                        : "text-red-500"
                    }`}
                  >
                    {r.totalScore}%
                  </span>
                  <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Info */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">About these mocks</h3>
          <ul className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            <li>• All questions are original — created exclusively for Angel 11+ practice</li>
            <li>• Each mock is timed per section, just like the real exam</li>
            <li>• Your results are saved locally and shown in the Parent Dashboard</li>
            <li>• Aim to complete at least one mock per subject pathway before your exam</li>
          </ul>
        </section>

      </main>
    </div>
  );
}
