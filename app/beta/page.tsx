"use client";

import Link from "next/link";
import {
  BookOpen,
  Calculator,
  Brain,
  Target,
  BarChart2,
  Users,
  CheckCircle,
  ChevronRight,
  Sparkles,
  MapPin,
  ArrowRight,
  Star,
} from "lucide-react";
import SupportLayout from "@/components/SupportLayout";

const PATHWAYS = [
  {
    id: "gl",
    name: "GL Assessment",
    shortName: "GL",
    badge: "Most Popular",
    desc: "Grammar schools across Hertfordshire, Bucks, Kent, Lincolnshire and others.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-100 dark:border-blue-900",
  },
  {
    id: "cem",
    name: "CEM (Durham University)",
    shortName: "CEM",
    badge: "Grammar Schools",
    desc: "Used by selective schools in Birmingham, Kent, Buckinghamshire and others.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950",
    border: "border-indigo-100 dark:border-indigo-900",
  },
  {
    id: "csse",
    name: "CSSE (Essex)",
    shortName: "CSSE",
    badge: "Essex",
    desc: "Essex grammar schools — extended written responses and maths.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-100 dark:border-purple-900",
  },
  {
    id: "iseb",
    name: "ISEB Pre-Test",
    shortName: "ISEB",
    badge: "Independent Schools",
    desc: "Common Pre-Test for independent senior schools including Eton, Harrow and others.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-100 dark:border-emerald-900",
  },
  {
    id: "core-foundation",
    name: "Core Foundation",
    shortName: "Core",
    badge: "Start Here",
    desc: "The best starting point for Year 4–5 children building all-round 11+ skills.",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950",
    border: "border-teal-100 dark:border-teal-900",
  },
  {
    id: "independent",
    name: "Independent / Bespoke",
    shortName: "Bespoke",
    badge: "Custom",
    desc: "For schools with their own entrance papers — flexible preparation.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-100 dark:border-amber-900",
  },
];

const FEATURES = [
  { icon: BookOpen, label: "English & Comprehension", desc: "Passage-based questions with model answers" },
  { icon: Calculator, label: "Maths Practice", desc: "Step-by-step working with adaptive difficulty" },
  { icon: Brain, label: "Reasoning Training", desc: "Verbal, non-verbal, spatial and numerical" },
  { icon: Target, label: "Timed Mock Exams", desc: "Full practice papers for GL, CEM, CSSE and ISEB" },
  { icon: BarChart2, label: "Progress Tracking", desc: "See improvement across every subject" },
  { icon: Users, label: "Parent Dashboard", desc: "Readiness scores, insights and mock results" },
];

export default function BetaPage() {
  return (
    <SupportLayout backHref="/dashboard" backLabel="Student App">
      {/* Hero */}
      <section className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <Sparkles size={12} />
          Beta — First 50 Families
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 mb-4 leading-tight">
          The smarter way to prepare<br className="hidden sm:block" /> for the 11+
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed mb-8">
          Angel 11+ is a UK 11+ preparation platform built for Year 4–6 children.
          Daily practice, timed mocks, adaptive difficulty and a parent dashboard — in one place.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-colors"
          >
            Start Learning
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/pathways"
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-2xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <MapPin size={15} />
            Choose Pathway
          </Link>
          <Link
            href="/beta-family"
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-semibold px-6 py-3 rounded-2xl text-sm hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
          >
            <Star size={15} />
            Join as Beta Family
          </Link>
        </div>
      </section>

      {/* What Angel 11+ is */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">What&apos;s included</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center shrink-0">
                <Icon size={17} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="mb-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">Who is Angel 11+ for?</h2>
          <ul className="space-y-2.5">
            {[
              "Children in Year 4, 5 or 6 preparing for selective school entry",
              "Families targeting grammar schools — GL, CEM, CSSE or ISEB format",
              "Parents who want to see weekly progress without spreadsheets",
              "Students who want to practise at their own pace, on any device",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pathways */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Available Pathways</h2>
        <div className="space-y-2">
          {PATHWAYS.map((p) => (
            <div key={p.id} className={`rounded-xl border p-4 flex items-center gap-3 ${p.bg} ${p.border}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-bold ${p.color}`}>{p.name}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-black/20 ${p.color}`}>
                    {p.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
              <ChevronRight size={15} className="text-gray-300 dark:text-gray-600 shrink-0" />
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <Link
            href="/pathways"
            className="text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline"
          >
            Compare all pathways →
          </Link>
        </div>
      </section>

      {/* Beta status */}
      <section className="mb-12">
        <div className="bg-purple-50 dark:bg-purple-950 rounded-2xl border border-purple-100 dark:border-purple-900 p-6">
          <div className="flex items-start gap-3 mb-3">
            <Sparkles size={18} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <h2 className="text-base font-bold text-purple-900 dark:text-purple-100">Beta status</h2>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed mb-3">
            Angel 11+ is currently in beta with our first families. The platform is fully functional and safe to use — but we are still improving it based on real family feedback.
          </p>
          <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed mb-4">
            As a beta family you get: early access, free beta period, and your feedback shapes what we build next.
          </p>
          <Link
            href="/beta-family"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Register as a Beta Family
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* How to get started */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">How to get started</h2>
        <div className="space-y-3">
          {[
            { step: "1", title: "Choose a pathway", desc: "Select the exam format that matches your target school.", href: "/pathways", cta: "Choose Pathway" },
            { step: "2", title: "Start practising", desc: "Work through English, Maths, Vocabulary, Writing and Reasoning sessions.", href: "/dashboard", cta: "Open Dashboard" },
            { step: "3", title: "Track your progress", desc: "Parents can view the progress dashboard and mock exam results at any time.", href: "/parent", cta: "Parent Dashboard" },
          ].map((item) => (
            <div key={item.step} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">{item.desc}</p>
                <Link
                  href={item.href}
                  className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                >
                  {item.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
        Angel 11+ provides original exam-style practice content and is not affiliated with or endorsed by GL Assessment, CEM, CSSE, ISEB or any school or exam board.
      </p>
    </SupportLayout>
  );
}
