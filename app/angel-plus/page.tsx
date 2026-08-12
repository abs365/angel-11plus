"use client";

import { useEffect, useState } from "react";
import { Crown, BookOpen, Puzzle, Trophy, Users, MapPin, CheckCircle, MessageSquare } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { PremiumCard, InfoCard, SchoolCard } from "@/components/ui/Card";
import { getSelectedPathwayId } from "@/lib/progress";
import { StatusIndicator } from "@/components/ui/Progress";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Angel V2.0 Sprint 9 (Angel Plus Value Experience) — no premium tier,
 * billing, or gated feature set exists anywhere in this codebase, and this
 * sprint does not introduce one (its own "Do NOT introduce new business
 * logic" instruction, restated from Sprint 2). Rather than inventing a
 * feature list to satisfy the brief's Value Overview / Trust sections,
 * this page is built on the one thing that IS real and reusable: the full,
 * free preparation journey this app already offers. "Available Today" is a
 * literal, accurate list of shipped features (Learn/Practice/Mocks/Parent
 * Hub/School Intelligence, all built in Sprints 1-8; Smart Writing
 * Feedback, app/writing/page.tsx, ungated). "Available with Angel Plus" is
 * stated honestly as not yet defined — this satisfies the brief's own
 * "Do not imply unavailable functionality" instruction by explicitly
 * reassuring nothing above is hidden behind it, rather than implying a
 * paywall that does not exist.
 */

/**
 * Active Pathway Context: these two cards previously hardcoded the legacy
 * /learn and /reasoning hubs unconditionally, the same defect class found
 * in lib/adaptiveEngine.ts and lib/parentInsights.ts. Deferred-effect read
 * (not a direct getSelectedPathwayId() call during render), matching
 * components/Navigation.tsx's useCssePathway() — this page is rendered
 * unconditionally, so a synchronous localStorage read here would disagree
 * with the server-rendered first paint.
 */
function useCssePathway(): boolean {
  const [isCsse, setIsCsse] = useState(false);
  useEffect(() => {
    Promise.resolve().then(() => setIsCsse(getSelectedPathwayId() === "csse"));
  }, []);
  return isCsse;
}

function journeyLinksFor(isCsse: boolean) {
  return [
  {
    href: isCsse ? "/learning-intelligence/learn" : "/learn",
    name: "Learning Hub",
    description: "Guided practice across English, Maths, Vocabulary and Writing, with real progress tracked as you go.",
    badge: "Free",
    icon: BookOpen,
    color: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300",
  },
  {
    href: isCsse ? "/learning-intelligence/practice" : "/reasoning",
    name: "Practice",
    description: "Verbal, Non-Verbal, Spatial and Numerical Reasoning, each connected to the competency it strengthens.",
    badge: "Free",
    icon: Puzzle,
    color: "bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-300",
  },
  {
    href: "/mocks",
    name: "Mock Centre",
    description: "Full timed mock exams for GL, CEM, CSSE and ISEB, simulating real exam conditions.",
    badge: "Free",
    icon: Trophy,
    color: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300",
  },
  {
    href: "/learning-intelligence/parent",
    name: "Parent Dashboard",
    description: "Readiness, weekly guidance and a clear progress story, written for parents rather than raw data.",
    badge: "Free",
    icon: Users,
    color: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300",
  },
  {
    href: "/pathways",
    name: "School Intelligence",
    description: "Your target exam pathway's assessment format, relevant competencies and preparation priorities.",
    badge: "Free",
    icon: MapPin,
    color: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300",
  },
  ];
}

const AVAILABLE_TODAY = [
  "Personalised, adaptive practice across every core subject",
  "Full timed mock exams for GL, CEM, CSSE and ISEB",
  "Real, evidence-based competency and readiness tracking",
  "A dedicated Parent Dashboard with weekly guidance and a progress story",
  "School Intelligence for your chosen exam pathway",
  "Smart Writing Feedback on every submitted piece",
];

export default function AngelPlusPage() {
  const isCsse = useCssePathway();
  const journeyLinks = journeyLinksFor(isCsse);
  return (
    <PageLayout breadcrumbs={[{ label: "My Admission Journey", href: "/dashboard" }, { label: "Angel Plus" }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">

        {/* Hero */}
        <PremiumCard className="mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Crown size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold mb-1.5">Angel Plus</h1>
              <p className="text-purple-100 text-sm leading-relaxed">
                An honest look at what your family already has access to today, and what we mean when we talk about &ldquo;more&rdquo; in future.
              </p>
            </div>
          </div>
        </PremiumCard>

        {/* Journey Integration — real destinations, not a second feature set */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Your Preparation Journey Today
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4 leading-relaxed">
            Angel Plus builds on this journey. It never replaces or hides any part of it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {journeyLinks.map((item) => (
              <SchoolCard key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* Trust — clearly distinguish available today vs Angel Plus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <InfoCard>
            <div className="flex items-center gap-2 mb-3">
              <StatusIndicator tone="success" label="Available Today" />
            </div>
            <ul className="space-y-2.5">
              {AVAILABLE_TODAY.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </InfoCard>

          <InfoCard>
            <div className="flex items-center gap-2 mb-3">
              <StatusIndicator tone="neutral" label="Available with Angel Plus" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              Angel Plus hasn&apos;t been built or priced yet. There is nothing to describe honestly beyond this. When it does arrive, it will only ever add to the journey above; nothing you already use will move behind it.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              If there&apos;s something that would genuinely help your family&apos;s preparation, we&apos;d like to know before we build anything.
            </p>
            <ButtonLink href="/feedback" variant="outline" size="sm" leftIcon={<MessageSquare size={13} />}>
              Share what would help
            </ButtonLink>
          </InfoCard>
        </div>

      </div>
    </PageLayout>
  );
}
