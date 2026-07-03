"use client";

import Link from "next/link";
import { ArrowLeft, Puzzle, Shapes, Compass, Hash } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SubjectCard from "@/components/SubjectCard";

// Angel UX V3 — Reasoning Hub (ANGEL_NAVIGATION_ARCHITECTURE.md §2). Replaces
// four peer-weighted sidebar entries with one entry point; the four
// underlying routes are completely unchanged, this is a new front door, not
// a replacement for them.

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

export default function ReasoningHubPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm mb-5 transition-colors"
        >
          <ArrowLeft size={16} />
          Home
        </Link>

        <div className="mb-6">
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-2">Reasoning</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-lg">
            Reasoning skills are tested across nearly every UK selective school entrance exam. Pick a discipline below — each
            adapts to your level as you practise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reasoningSubjects.map((subject) => (
            <SubjectCard key={subject.href} {...subject} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
