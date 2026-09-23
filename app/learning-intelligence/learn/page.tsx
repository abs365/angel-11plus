"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Brain, Calculator, Percent, Shapes, Search, Lightbulb } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { getEducationalIntelligence, type EducationalIntelligenceSnapshot } from "@/lib/learningEngine/educationalIntelligenceService";
import { hubProgressionLabel } from "@/lib/learningEngine/progressionLabel";
import type { CompetencyId } from "@/lib/learningEngine/types";
import type { LucideIcon } from "lucide-react";

/**
 * AUTHENTICATED EXPERIENCE & DESIGN SYSTEM MIGRATION, Increment 1C (Founder
 * final visual acceptance correction) — Increment 1B's composition
 * (subject-as-organising-principle, sky-tinted panel, homepage-derived
 * type scale) is preserved exactly. Three corrections only, from the
 * Founder's own real production screenshots: (1) the outer container was
 * max-w-3xl (768px) — at typical desktop zoom this read as a thin central
 * column with the rest of the canvas empty, so it now matches Today's own
 * container convention (max-w-4xl lg:max-w-6xl); lesson text itself stays
 * capped at a comfortable reading measure (max-w-2xl) inside that wider
 * panel rather than stretching edge-to-edge. (2) LessonRow's affordance
 * was a single small ArrowRight icon, too weak for an 8-11-year-old
 * learner to reliably read as "this starts something" — each row now
 * carries an explicit Start/Continue pill, genuine-state only (derived
 * from the same real educationalState already fetched, never invented).
 * (3) "Practise instead" / "See your Learning Report" previously used the
 * same row treatment as real lessons inside the same visual system; they
 * are not lessons, so they now sit outside any sky panel as small plain
 * text links under their own "More ways to work" label.
 */

interface LessonEntry {
  competencyId: CompetencyId;
  href: string;
  icon: LucideIcon;
  title: string;
  blurb: string;
}

const MATHEMATICS_LESSONS: LessonEntry[] = [
  {
    competencyId: "MR-01",
    href: "/learning-intelligence/learn/mathematics/arithmetic",
    icon: Calculator,
    title: "Adding and Subtracting Big Numbers",
    blurb: "Understand the method, try it with support, then try it alone.",
  },
  {
    competencyId: "MR-04",
    href: "/learning-intelligence/learn/mathematics/percentages",
    icon: Percent,
    title: "Finding a Percentage of a Number",
    blurb: "Understand the method, try it with support, then try it alone.",
  },
  {
    competencyId: "MR-03",
    href: "/learning-intelligence/learn/mathematics/compound-shapes",
    icon: Shapes,
    title: "Area of Compound Shapes",
    blurb: "Understand the method, try it with support, then try it alone.",
  },
];

const ENGLISH_LESSONS: LessonEntry[] = [
  {
    competencyId: "RC-01",
    href: "/learning-intelligence/learn/english/reading-retrieval",
    icon: Search,
    title: "Finding the Answer in the Text",
    blurb: "Learn to locate and use evidence the passage actually gives you.",
  },
  {
    competencyId: "RC-02",
    href: "/learning-intelligence/learn/english/reading-inference",
    icon: Lightbulb,
    title: "What the Text Doesn't Quite Say",
    blurb: "Learn to work out what a passage implies, not just what it states.",
  },
];

function LessonRow({ entry, state, loaded }: { entry: LessonEntry; state: EducationalIntelligenceSnapshot["educationalState"] | undefined; loaded: boolean }) {
  const progression = hubProgressionLabel(state);
  // Genuine state only: "not started" is exactly the same condition
  // hubProgressionLabel itself treats as not-started (undefined or
  // "exploring"). Before the real fetch resolves, default the pill to
  // "Start lesson" -- a safe, non-claiming default, never "Continue"
  // ahead of real evidence.
  const notStarted = state === undefined || state === "exploring";
  const continuing = loaded && !notStarted;
  return (
    <Link href={entry.href} className="flex items-center gap-4 py-5 group">
      <div className="min-w-0 flex-1 max-w-2xl">
        <p className="text-[var(--angel-navy)] text-lg font-semibold leading-snug group-hover:underline">{entry.title}</p>
        <p className="text-[var(--angel-ink)] text-sm mt-1 leading-relaxed opacity-90">{entry.blurb}</p>
        {loaded && (
          <p className="text-[var(--angel-blue)] text-xs mt-1.5 font-semibold uppercase tracking-wide">{progression.label}</p>
        )}
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 text-white text-sm font-semibold px-4 py-2 shrink-0 group-hover:opacity-90 transition-opacity motion-reduce:transition-none">
        {continuing ? "Continue" : "Start lesson"}
        <ArrowRight size={14} aria-hidden="true" />
      </span>
    </Link>
  );
}

function SubjectSection({ title, intro, icon: Icon, lessons, states, loaded }: {
  title: string;
  intro: string;
  icon: LucideIcon;
  lessons: LessonEntry[];
  states: Partial<Record<CompetencyId, EducationalIntelligenceSnapshot["educationalState"]>>;
  loaded: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-lg bg-[var(--angel-sky)] flex items-center justify-center shrink-0">
          <Icon size={22} className="text-[var(--angel-blue)]" />
        </div>
        <div>
          <h2 className="text-[var(--angel-navy)] font-bold text-2xl md:text-3xl leading-tight">{title}</h2>
          <p className="text-[var(--angel-muted)] text-sm mt-0.5 max-w-xl">{intro}</p>
        </div>
      </div>

      <div className="mt-5 bg-[var(--angel-sky)] rounded-lg px-6 md:px-8">
        <div className="divide-y divide-[var(--angel-border)]">
          {lessons.map((entry) => (
            <LessonRow key={entry.competencyId} entry={entry} state={states[entry.competencyId]} loaded={loaded} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Deliberately small, plain-text secondary navigation -- Practise and the
 * Learning Report are real destinations but are NOT lessons, so they must
 * not share LessonRow's visual weight (no sky panel, no title/blurb pair,
 * no Start pill). A child should read this strip as "other things I can
 * do", clearly after and beneath the real lesson catalogue above.
 */
function MoreLink({ href, icon: Icon, title }: { href: string; icon: LucideIcon; title: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-medium text-[var(--angel-blue)] hover:underline"
    >
      <Icon size={15} aria-hidden="true" />
      {title}
    </Link>
  );
}

export default function CsseLearnPage() {
  const [states, setStates] = useState<Partial<Record<CompetencyId, EducationalIntelligenceSnapshot["educationalState"]>>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        if (!cancelled) setLoaded(true);
        return;
      }
      const profileId = await ensureProfile().catch(() => null);
      if (!profileId) {
        if (!cancelled) setLoaded(true);
        return;
      }
      const allLessons = [...MATHEMATICS_LESSONS, ...ENGLISH_LESSONS];
      const results = await Promise.all(
        allLessons.map((l) => getEducationalIntelligence(supabase, profileId, l.competencyId).catch(() => null))
      );
      if (cancelled) return;
      const next: Partial<Record<CompetencyId, EducationalIntelligenceSnapshot["educationalState"]>> = {};
      allLessons.forEach((l, i) => {
        next[l.competencyId] = results[i]?.educationalState;
      });
      setStates(next);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageLayout breadcrumbs={[{ label: "Learn" }]}>
      <div className="max-w-4xl lg:max-w-6xl mx-auto px-4 py-8 md:px-8 md:py-12">
        <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl">Learn</h1>
        <p className="text-[var(--angel-ink)] text-base md:text-lg mt-3 leading-relaxed max-w-xl">
          Real, step-by-step lessons for CSSE preparation. Each one teaches a method, then lets you try
          it with support before trying it alone.
        </p>
        <p className="text-[var(--angel-muted)] text-sm mt-2 leading-relaxed max-w-xl">
          Learn teaches a skill. Practise applies and strengthens it. Mock measures it under real exam
          conditions.
        </p>

        <div className="mt-10 space-y-12">
          <SubjectSection
            title="Mathematics"
            intro="Build the mathematical skills and methods you need for selective-school preparation."
            icon={Calculator}
            lessons={MATHEMATICS_LESSONS}
            states={states}
            loaded={loaded}
          />
          <SubjectSection
            title="English: Reading"
            intro="Find evidence, understand meaning, and make inferences from what you read."
            icon={BookOpen}
            lessons={ENGLISH_LESSONS}
            states={states}
            loaded={loaded}
          />
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--angel-border)]">
          <p className="text-[var(--angel-muted)] text-xs font-semibold uppercase tracking-wide mb-3">
            More ways to work
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <MoreLink href="/learning-intelligence/practice" icon={BookOpen} title="Practise instead" />
            <MoreLink href="/learning-intelligence" icon={Brain} title="See your Learning Report" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
