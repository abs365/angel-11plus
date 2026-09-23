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
 * AUTHENTICATED EXPERIENCE & DESIGN SYSTEM MIGRATION, Increment 1B (Founder
 * visual correction) — Increment 1's own content fix (all 5 real lessons
 * shown, the "being rebuilt" development-process copy removed) is
 * unchanged and preserved exactly; what changed here is composition only,
 * per the Founder's own production finding that the page still read as "a
 * narrow list of bordered rows," not a real Angel 11+ learning surface.
 *
 * The subject itself is now the organising principle, matching the
 * homepage's own "Five subjects. One connected plan." treatment
 * (app/page.tsx): a real subject identity (icon, name, one-line intro) at
 * homepage type scale, then that subject's lessons as a single flowing
 * divided list inside one sky-tinted panel — the exact same
 * bg-[var(--angel-sky)] + divide-y divide-[var(--angel-border)] pattern
 * the homepage's own "A clear plan for today" example section already
 * uses, reused here for the real thing rather than duplicated as a new
 * treatment. No per-lesson bordered box, no card grid, no catalogue.
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
  return (
    <Link href={entry.href} className="flex items-center gap-4 py-5 group">
      <div className="min-w-0 flex-1">
        <p className="text-[var(--angel-navy)] text-lg font-semibold leading-snug group-hover:underline">{entry.title}</p>
        <p className="text-[var(--angel-ink)] text-sm mt-1 leading-relaxed opacity-90">{entry.blurb}</p>
        {loaded && (
          <p className="text-[var(--angel-blue)] text-xs mt-1.5 font-semibold uppercase tracking-wide">{progression.label}</p>
        )}
      </div>
      <ArrowRight size={18} className="text-[var(--angel-muted)] group-hover:text-[var(--angel-blue)] transition-colors motion-reduce:transition-none shrink-0" />
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
          <p className="text-[var(--angel-muted)] text-sm mt-0.5">{intro}</p>
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

function MoreLink({ href, icon: Icon, title, body }: { href: string; icon: LucideIcon; title: string; body: string }) {
  return (
    <Link href={href} className="flex items-start gap-3.5 py-5 group">
      <div className="w-10 h-10 rounded-lg bg-[var(--angel-sky)] flex items-center justify-center shrink-0">
        <Icon size={18} className="text-[var(--angel-blue)]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[var(--angel-navy)] text-base font-semibold group-hover:underline">{title}</p>
        <p className="text-[var(--angel-muted)] text-sm mt-0.5 leading-relaxed">{body}</p>
      </div>
      <ArrowRight size={16} className="text-[var(--angel-muted)] group-hover:text-[var(--angel-blue)] transition-colors motion-reduce:transition-none shrink-0 mt-2" />
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
      <div className="max-w-3xl mx-auto px-4 py-8 md:px-8 md:py-12">
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
            intro="Core skills and methods for CSSE Mathematics."
            icon={Calculator}
            lessons={MATHEMATICS_LESSONS}
            states={states}
            loaded={loaded}
          />
          <SubjectSection
            title="English: Reading"
            intro="Working with real passages, not isolated trick questions."
            icon={BookOpen}
            lessons={ENGLISH_LESSONS}
            states={states}
            loaded={loaded}
          />
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--angel-border)] divide-y divide-[var(--angel-border)]">
          <MoreLink
            href="/learning-intelligence/practice"
            icon={BookOpen}
            title="Practise instead"
            body="Real, evidence-driven CSSE practice across Reading Comprehension, Mathematics and Continuous Writing."
          />
          <MoreLink
            href="/learning-intelligence"
            icon={Brain}
            title="See your Learning Report"
            body="Real competency and evidence data from everything you've practised so far."
          />
        </div>
      </div>
    </PageLayout>
  );
}
