"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Clock, BookOpen, Trophy, Play, Sparkles } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { StatusIndicator } from "@/components/ui/Progress";
import { ButtonLink } from "@/components/ui/Button";
import { getMockResults, bestScoreForPathway } from "@/lib/mockProgress";
import { MOCK_SUGGESTED_PREPARATION } from "@/lib/mockMeta";
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
    // ARC-001A — solid bg-{colour}-600 + white text (the same "obsolete
    // dominant... bright blue" treatment flagged app-wide) softened to the
    // tinted-badge pattern already established elsewhere (e.g. the
    // "Recommended" badge on the English/Maths subject pages) — the hue
    // itself (one per exam board: GL/CEM/CSSE/ISEB) is preserved, since it's
    // genuine assessment-identity differentiation, not dominant chrome.
    badgeBg: "bg-blue-100 dark:bg-blue-900",
    badgeText: "text-blue-700 dark:text-blue-300",
  },
  {
    pathway: "cem",
    name: "CEM",
    badge: "CEM",
    description: "Practice covering the two core CEM sections: Verbal Reasoning and Numerical Reasoning, styled to reflect the CEM exam format.",
    totalMinutes: 30,
    sections: ["Verbal Reasoning", "Numerical Reasoning"],
    bg: "bg-indigo-50 dark:bg-indigo-950",
    border: "border-indigo-100 dark:border-indigo-900",
    badgeBg: "bg-indigo-100 dark:bg-indigo-900",
    badgeText: "text-indigo-700 dark:text-indigo-300",
  },
  {
    // Sprint 3, Increment 4 (EI-001 consolidation) — this card now points at
    // the real Educational Intelligence Mock (app/learning-intelligence/
    // mock-exam), not the legacy app/mocks/[pathway] CSSE entry — see the
    // href override and the description/sections/prep-copy below, all
    // updated to describe the destination this card actually reaches.
    pathway: "csse",
    name: "CSSE",
    badge: "CSSE",
    description: "Timed CSSE-style mock exam covering Reading Comprehension, Mathematics and Continuous Writing — real, evidence-generating content, in a Standard full sitting or a shorter Adaptive paper weighted to your recorded evidence.",
    totalMinutes: 0,
    sections: ["English Comprehension", "Mathematics", "Continuous Writing"],
    bg: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-100 dark:border-purple-900",
    badgeBg: "bg-purple-100 dark:bg-purple-900",
    badgeText: "text-purple-700 dark:text-purple-300",
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
    badgeBg: "bg-emerald-100 dark:bg-emerald-900",
    badgeText: "text-emerald-700 dark:text-emerald-300",
  },
];

export default function MocksPage() {
  const [recentResults, setRecentResults] = useState<MockResult[]>([]);
  const [bestScores, setBestScores] = useState<Partial<Record<MockPathwayId, number>>>({});

  useEffect(() => {
    getMockResults().then((results) => {
      setRecentResults(results.slice(-3).reverse());
      // Increment 4 — one read, four pure in-memory derivations, instead of
      // four separate getBestMockScoreForPathway() reads each re-fetching
      // and re-filtering the same underlying results.
      setBestScores({
        gl: bestScoreForPathway(results, "gl") ?? undefined,
        cem: bestScoreForPathway(results, "cem") ?? undefined,
        csse: bestScoreForPathway(results, "csse") ?? undefined,
        iseb: bestScoreForPathway(results, "iseb") ?? undefined,
      });
    });
  }, []);

  return (
    // ARC-001A — "My Admission Journey" predates AN-101's "Today" nav
    // relabel (the same stale label AN-107 already fixed on the Practice
    // hub's breadcrumb); every other primary destination reads "Today".
    <PageLayout breadcrumbs={[{ label: "Today", href: "/dashboard" }, { label: "Mock Centre" }]}>
      <div className="max-w-2xl mx-auto px-4 pb-16 pt-6 md:pt-8 space-y-6">
        <div className="mb-1">
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-1">Mock Centre</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Realistic, timed practice papers — the closest rehearsal for exam-day conditions.
          </p>
        </div>

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
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 flex items-center gap-1">
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
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1">
              Verbal Reasoning questions matched to your practice level.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed mb-4">
              Currently a small sample set while we build out the full question bank.
            </p>
            <ButtonLink href="/mocks/adaptive/gl" variant="outline" size="sm" leftIcon={<Play size={14} />}>
              Start practice
            </ButtonLink>
          </div>

          <div className="rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center gap-1">
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
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1">
              Maths questions matched to your practice level.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed mb-4">
              Currently a small sample set while we build out the full question bank.
            </p>
            <ButtonLink href="/mocks/adaptive/maths" variant="outline" size="sm" leftIcon={<Play size={14} />}>
              Start practice
            </ButtonLink>
          </div>

          <div className="rounded-2xl border border-purple-100 dark:border-purple-900 bg-purple-50 dark:bg-purple-950 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center gap-1">
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
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1">
              One passage at a time, with every question that belongs to it — never split apart.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed mb-4">
              Currently a small sample set while we build out the full question bank.
            </p>
            <ButtonLink href="/mocks/adaptive/english" variant="outline" size="sm" leftIcon={<Play size={14} />}>
              Start practice
            </ButtonLink>
          </div>

          <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
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
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1">
              One word at a time, with every question that belongs to it — synonyms, antonyms and usage in context.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed mb-4">
              Currently a small sample set while we build out the full question bank.
            </p>
            <ButtonLink href="/mocks/adaptive/vocabulary" variant="outline" size="sm" leftIcon={<Play size={14} />}>
              Start practice
            </ButtonLink>
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
                  <div className="flex items-center gap-2">
                    {/* Examination Status (Sprint 6) — this data model only
                        persists completed attempts (lib/mockProgress.ts),
                        so only "Available"/"Completed" can be shown
                        honestly; there is no persisted "In Progress" state
                        to derive from, and none is invented here. */}
                    <StatusIndicator tone={best !== undefined ? "success" : "neutral"} label={best !== undefined ? "Completed" : "Available"} />
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock size={13} />
                      {/* Sprint 3, Increment 4 — CSSE's real timing now
                          depends on Standard vs Adaptive mode and how much
                          real content is tagged, so a single fixed minute
                          count would no longer be honest (unlike GL/CEM/
                          ISEB's genuinely fixed papers, unchanged below). */}
                      {card.pathway === "csse" ? "Varies by mode" : `${card.totalMinutes} min`}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{card.description}</p>

                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">Skills Assessed</p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.sections.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-white/70 dark:bg-gray-900/70 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full border border-white/80 dark:border-gray-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preparation guidance (Sprint 6) — static copy, lib/mockMeta.ts.
                    CSSE is shown its own inline copy instead (Sprint 3,
                    Increment 4): MOCK_SUGGESTED_PREPARATION.csse still
                    describes the legacy app/mocks/[pathway] experience,
                    which app/mocks/[pathway]/page.tsx itself still reads
                    unchanged (preserved, not modified) — this card no longer
                    points there, so it must not read that same string. */}
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Before you start:</span>{" "}
                  {card.pathway === "csse"
                    ? "Choose Standard for the full sitting, or Adaptive for a shorter paper weighted to your recorded evidence. Either way, this updates your real skills profile and readiness."
                    : MOCK_SUGGESTED_PREPARATION[card.pathway]}
                </p>

                <div className="flex items-center justify-between">
                  {best !== undefined ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Trophy size={13} className="text-amber-500" />
                      Best score: <span className="font-semibold text-gray-800 dark:text-gray-200">{best}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">Not attempted yet</span>
                  )}
                  {/* Sprint 3, Increment 4 (EI-001 consolidation) — CSSE now
                      routes to the real Educational Intelligence Mock;
                      GL/CEM/ISEB are unchanged, still their own /mocks/{id}
                      route (no Educational-Intelligence-equivalent exists
                      for them yet). */}
                  <ButtonLink
                    href={card.pathway === "csse" ? "/learning-intelligence/mock-exam" : `/mocks/${card.pathway}`}
                    variant="outline"
                    size="sm"
                    leftIcon={<Play size={14} />}
                  >
                    Start mock
                  </ButtonLink>
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
      </div>
    </PageLayout>
  );
}
