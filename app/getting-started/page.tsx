"use client";

import Link from "next/link";
import {
  MapPin,
  Flame,
  BarChart2,
  Target,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Users,
  Clock,
  MessageSquare,
} from "lucide-react";
import SupportLayout from "@/components/SupportLayout";

const STEPS = [
  {
    step: "1",
    icon: MapPin,
    title: "Choose your pathway",
    color: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
    content: (
      <>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          Your first task is to select the exam pathway that matches your target school.
          Angel 11+ supports GL Assessment, CEM, CSSE (Essex), ISEB Pre-Test, Core Foundation and Independent Bespoke.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          If you&apos;re not sure which applies, check with the school directly or select <strong>Not Sure Yet</strong> — you can change it any time.
        </p>
        <Link
          href="/pathways"
          className="inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline"
        >
          Choose a pathway <ChevronRight size={14} />
        </Link>
      </>
    ),
  },
  {
    step: "2",
    icon: Flame,
    title: "Daily practice sessions",
    color: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
    content: (
      <>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          The dashboard shows your child daily missions — short, focused practice tasks across English, Maths, Vocabulary, Writing and Reasoning.
          Each session takes 5–15 minutes.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          The difficulty adapts over time — harder when your child is confident, gentler when they need consolidation.
        </p>
        <ul className="space-y-1.5 mb-3">
          {[
            "English: comprehension passages with model answers",
            "Maths: worked problems with step-by-step hints",
            "Vocabulary: flashcard and quiz modes",
            "Writing: structured prompts with AI feedback",
            "Reasoning: verbal, non-verbal, spatial and numerical",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline"
        >
          Open student dashboard <ChevronRight size={14} />
        </Link>
      </>
    ),
  },
  {
    step: "3",
    icon: BarChart2,
    title: "Track progress",
    color: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    content: (
      <>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          The Parent Dashboard shows an at-a-glance view of how your child is progressing across every subject.
          Check it at any time — no sign-in required for local data.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          You&apos;ll see: session count, streak, average scores per subject, exam readiness estimate, and insights flagging areas that need attention.
        </p>
        <Link
          href="/parent"
          className="inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline"
        >
          Open Parent Dashboard <ChevronRight size={14} />
        </Link>
      </>
    ),
  },
  {
    step: "4",
    icon: Target,
    title: "Practice mock exams",
    color: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
    content: (
      <>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          When your child is ready, timed mock exams are available for GL, CEM, CSSE and ISEB.
          Each mock is divided into timed sections, just like the real exam.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          Results are saved automatically and shown in the Parent Dashboard. Aim for at least one mock per fortnight in the final weeks of preparation.
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-3">
          <Clock size={13} />
          <span>GL: 35 min · CEM: 30 min · CSSE: 40 min · ISEB: 40 min</span>
        </div>
        <Link
          href="/mocks"
          className="inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline"
        >
          View mock exams <ChevronRight size={14} />
        </Link>
      </>
    ),
  },
  {
    step: "5",
    icon: BookOpen,
    title: "Reading practice",
    color: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    content: (
      <>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          Reading comprehension is one of the biggest differentiators in 11+ results.
          English lessons include rich passages, and vocabulary sessions build the breadth of language children need.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Outside the app: we recommend 20 minutes of free reading daily, alongside Angel 11+ practice. Fiction, non-fiction and poetry all help.
        </p>
      </>
    ),
  },
];

const TIPS = [
  "20–30 minutes daily is more effective than long infrequent sessions",
  "Celebrate streaks — the gamification system rewards consistency",
  "Review the Parent Dashboard weekly, not daily — look for trends",
  "Use mock exams to build time awareness, not just accuracy",
  "Vocabulary flashcards work well as a car or bedtime activity",
];

export default function GettingStartedPage() {
  return (
    <SupportLayout backHref="/parent" backLabel="Parent Dashboard">
      {/* Header */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
          <Users size={22} className="text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Getting Started
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
          A quick guide for parents. This takes about 5 minutes to read and covers everything you need to get your child started.
        </p>
      </div>

      {/* Steps */}
      <section className="mb-10">
        <div className="space-y-4">
          {STEPS.map(({ step, icon: Icon, title, color, content }) => (
            <div key={step} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={17} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-300 dark:text-gray-600">Step {step}</span>
                  <span className="text-xs text-gray-300 dark:text-gray-700">·</span>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</h2>
                </div>
              </div>
              {content}
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Parent tips</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <ul className="space-y-3">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5">
                <CheckCircle size={14} className="text-purple-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact / feedback */}
      <section className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-4">
        <div className="flex items-start gap-3">
          <MessageSquare size={18} className="text-purple-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Questions or feedback?</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              We&apos;re a small team and we read every message. If something isn&apos;t clear, or your child has hit an issue, let us know.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/feedback"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
              >
                Send feedback
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </section>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
        Angel 11+ provides original exam-style practice content. We are not affiliated with or endorsed by any exam board or school.
      </p>
    </SupportLayout>
  );
}
