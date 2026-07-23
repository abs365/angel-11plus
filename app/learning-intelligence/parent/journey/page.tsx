"use client";

import Link from "next/link";
import {
  Route, PenLine, Trophy, Brain, Target, ClipboardList, CalendarClock, GraduationCap, ArrowRight,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";

/**
 * Educational Journey Narrative (Sprint 3, Increment 5). Closes Gap D named
 * by EDUCATIONAL_INTELLIGENCE_EXPERIENCE_BLUEPRINT_V1.md §11: "no single
 * surface narrates the real Practice→Mock→Insight→Admissions→Revision
 * sequence — each piece is honest and excellent in isolation, but a parent
 * must discover the sequence themselves." The sequence itself is not new —
 * it is the exact loop ADMISSIONS_INTELLIGENCE_V1_DESIGN.md §8 already named
 * in writing: "Practice/Mock → Results → Parent Insight → (optional:
 * Admissions Readiness) → Revision → Practice."
 *
 * This page computes nothing and fetches nothing — every fact below is a
 * description of an already-real, already-shipped capability, and every
 * link points at that capability's real, unchanged page. It is a map, not a
 * journey of its own: no practice-taking, no mock-taking, no evidence read,
 * no new persistence. Removing this page would remove an explanation, never
 * a capability.
 */

interface Stage {
  icon: typeof Route;
  name: string;
  whatHappened: string;
  whyItMatters: string;
  whatsNext: string;
  href: string;
  linkLabel: string;
  iconBg: string;
  iconText: string;
}

const STAGES: Stage[] = [
  {
    icon: PenLine,
    name: "Practice",
    whatHappened: "Short, focused sessions on one skill at a time, with feedback straight after each answer.",
    whyItMatters: "Every answer becomes real, recorded evidence — the same evidence every other stage below reads from.",
    whatsNext: "Educational Insights update automatically as soon as you finish a session.",
    href: "/learning-intelligence/practice",
    linkLabel: "Go to Practice",
    iconBg: "bg-violet-100 dark:bg-violet-900",
    iconText: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Trophy,
    name: "Mock Examination",
    whatHappened: "A timed, real exam-condition sitting — Standard (the full paper) or Adaptive (a shorter paper weighted to your recorded evidence). No feedback until you submit, just like exam day.",
    whyItMatters: "The exact same evidence pipeline as Practice, gathered under real conditions — not a separate, disconnected score.",
    whatsNext: "Results feed straight into Educational Insights and Readiness below, plus a Historical Context comparison against CSSE's own published admissions facts.",
    href: "/learning-intelligence/mock-exam",
    linkLabel: "Go to Mock Examination",
    iconBg: "bg-purple-100 dark:bg-purple-900",
    iconText: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: Brain,
    name: "Educational Insights",
    whatHappened: "Your child's real skills profile: which competencies have evidence, how much, and what it shows.",
    whyItMatters: "This is the one place every stage's evidence is shown together — nothing here is estimated or invented.",
    whatsNext: "Readiness turns this same evidence into an honest, area-by-area picture of exam preparedness.",
    href: "/learning-intelligence",
    linkLabel: "Go to Educational Insights",
    iconBg: "bg-sky-100 dark:bg-sky-900",
    iconText: "text-sky-600 dark:text-sky-400",
  },
  {
    icon: Target,
    name: "Readiness",
    whatHappened: "A four-band picture — Well Evidenced, Partially Evidenced, or Not Yet Evidenced — for each part of the real exam.",
    whyItMatters: "Never a single predicted score or a percentage chance — just an honest, evidence-only account of how well-covered each area is right now.",
    whatsNext: "Recommendations point at exactly which of these areas is most worth attention next.",
    href: "/learning-intelligence/parent",
    linkLabel: "See Readiness on the Parent Dashboard",
    iconBg: "bg-emerald-100 dark:bg-emerald-900",
    iconText: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: ClipboardList,
    name: "Recommendations",
    whatHappened: "A ranked, explained list of what's most worth focusing on next.",
    whyItMatters: "Every suggestion traces back to real evidence — never a guess, never a fixed script.",
    whatsNext: "Revision Planning turns this same ranked list into a concrete plan for the week.",
    href: "/learning-intelligence/recommendations",
    linkLabel: "Go to Recommendations",
    iconBg: "bg-amber-100 dark:bg-amber-900",
    iconText: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: CalendarClock,
    name: "Revision Planning",
    whatHappened: "This week's priorities, with a time estimate and the same evidence-based reasoning as Recommendations.",
    whyItMatters: "Turns \"what to focus on\" into \"what to actually do this week,\" without inventing anything new.",
    whatsNext: "Completing a plan item is Practice again — the loop closes here and starts over.",
    href: "/learning-intelligence/parent/revision-planner",
    linkLabel: "Go to Revision Planning",
    iconBg: "bg-rose-100 dark:bg-rose-900",
    iconText: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: GraduationCap,
    name: "Admissions Readiness",
    whatHappened: "The same Readiness and Evidence Coverage picture, placed beside the one real, published CSSE admissions fact this platform holds.",
    whyItMatters: "Context about the real exam, kept clearly separate from your child's own evidence — never blended into a prediction.",
    whatsNext: "Optional — worth checking in on occasionally, not a step you need every week.",
    href: "/learning-intelligence/parent/admissions-readiness",
    linkLabel: "Go to Admissions Readiness",
    iconBg: "bg-indigo-100 dark:bg-indigo-900",
    iconText: "text-indigo-600 dark:text-indigo-400",
  },
];

export default function EducationalJourneyPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Learning Report", href: "/learning-intelligence" },
        { label: "Parent Dashboard", href: "/learning-intelligence/parent" },
        { label: "Your Learning Journey" },
      ]}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-2xl">
            <Route size={22} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Your Learning Journey</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">How Practice, Mock Exams, Insights, Readiness and Revision all connect</p>
          </div>
        </div>

        <InfoCard className="mt-5">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Every part of Angel below reads from the same real evidence — nothing is calculated twice, and nothing
            shown to you is invented. The natural order is: <strong>Practice or a Mock Exam</strong>, which updates{" "}
            <strong>Educational Insights</strong> and <strong>Readiness</strong>, which drive{" "}
            <strong>Recommendations</strong> and a <strong>Revision Plan</strong> — with{" "}
            <strong>Admissions Readiness</strong> available whenever it&apos;s useful, never a required step.
          </p>
        </InfoCard>

        <div className="mt-6 space-y-3">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <InfoCard key={stage.name} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${stage.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={stage.iconText} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{i + 1}</span>
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{stage.name}</h2>
                  </div>
                  <dl className="space-y-1.5 text-sm">
                    <div>
                      <dt className="inline text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">What happens: </dt>
                      <dd className="inline text-gray-700 dark:text-gray-300">{stage.whatHappened}</dd>
                    </div>
                    <div>
                      <dt className="inline text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Why it matters: </dt>
                      <dd className="inline text-gray-700 dark:text-gray-300">{stage.whyItMatters}</dd>
                    </div>
                    <div>
                      <dt className="inline text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">What happens next: </dt>
                      <dd className="inline text-gray-700 dark:text-gray-300">{stage.whatsNext}</dd>
                    </div>
                  </dl>
                  <Link
                    href={stage.href}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2.5"
                  >
                    {stage.linkLabel} <ArrowRight size={12} />
                  </Link>
                </div>
              </InfoCard>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed mt-6 text-center px-4">
          This page only explains how the pieces fit together — every fact and every number lives on the real pages
          linked above, and nothing here is calculated separately from them.
        </p>
      </div>
    </PageLayout>
  );
}
