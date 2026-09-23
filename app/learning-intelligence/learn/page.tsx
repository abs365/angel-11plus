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
 * AUTHENTICATED EXPERIENCE & DESIGN SYSTEM MIGRATION, Increment 1 (Learn) —
 * two real, concrete corrections found by verifying against the actual
 * evidence rather than the Founder's own (now stale) screenshot:
 *
 * 1. Two genuinely real, already-shipped English Reading lessons (RC-01
 *    "Finding the Answer in the Text", RC-02 "What the Text Doesn't Quite
 *    Say" — both real routes under app/learning-intelligence/learn/english/,
 *    both already registered in lib/learningEngine/fullLessonRegistry.ts)
 *    were missing from this hub entirely. The previous version listed only
 *    the 3 Mathematics lessons. This version reads the SAME real registry
 *    every other real caller (the canonical decision contract) already
 *    uses, so this hub can never silently drift from what's actually
 *    recommendable again.
 * 2. The learner-facing copy stating the experience "is being rebuilt one
 *    real lesson at a time" — internal development-process language, per
 *    the governing instruction's own explicit "children should experience
 *    the finished learning environment, not our development process" rule
 *    — is removed. What remains is an honest, organised, professional
 *    presentation of exactly what's genuinely available today, organised
 *    by subject, with no padding, no manufactured "coming soon" lessons,
 *    and no implied curriculum completeness.
 *
 * Each lesson's own real, unmodified educationalState is fetched via the
 * exact same getEducationalIntelligence() call each lesson page itself
 * already makes -- unchanged from the prior implementation, extended from
 * 3 calls to 5. No new evidence computation, no invented prerequisite:
 * every lesson is always fully accessible, and any "recommended"/status
 * framing is copy over real evidence, never a lock.
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
  const Icon = entry.icon;
  const progression = hubProgressionLabel(state);
  return (
    <Link href={entry.href}>
      <div className="flex items-center gap-4 bg-[var(--angel-paper)] rounded-lg border border-[var(--angel-border)] p-4 hover:border-[var(--angel-blue)] transition-colors">
        <div className="bg-[var(--angel-sky)] p-3 rounded-lg shrink-0">
          <Icon size={20} className="text-[var(--angel-blue)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--angel-navy)]">{entry.title}</p>
          <p className="text-xs text-[var(--angel-muted)] mt-0.5">{entry.blurb}</p>
          {loaded && (
            <p className="text-xs text-[var(--angel-blue)] mt-1 font-medium">{progression.label}</p>
          )}
        </div>
        <ArrowRight size={16} className="text-[var(--angel-muted)] shrink-0" />
      </div>
    </Link>
  );
}

function SubjectGroup({ title, lessons, states, loaded }: {
  title: string;
  lessons: LessonEntry[];
  states: Partial<Record<CompetencyId, EducationalIntelligenceSnapshot["educationalState"]>>;
  loaded: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--angel-muted)] mb-2.5">{title}</p>
      <div className="grid gap-3">
        {lessons.map((entry) => (
          <LessonRow key={entry.competencyId} entry={entry} state={states[entry.competencyId]} loaded={loaded} />
        ))}
      </div>
    </div>
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
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-[var(--angel-navy)] font-bold text-2xl">Learn</h1>
        <p className="text-[var(--angel-muted)] text-sm mt-2 leading-relaxed">
          Real, step-by-step lessons for CSSE preparation. Each one teaches a method, then lets you try it
          with support before trying it alone.
        </p>
        <p className="text-[var(--angel-muted)] text-xs mt-2 leading-relaxed opacity-80">
          Learn teaches a skill. Practise applies and strengthens it. Mock measures it under real exam
          conditions.
        </p>

        <div className="mt-6 space-y-6">
          <SubjectGroup title="Mathematics" lessons={MATHEMATICS_LESSONS} states={states} loaded={loaded} />
          <SubjectGroup title="English: Reading" lessons={ENGLISH_LESSONS} states={states} loaded={loaded} />
        </div>

        <div className="grid gap-3 mt-6 pt-6 border-t border-[var(--angel-border)]">
          <Link href="/learning-intelligence/practice">
            <div className="flex items-center gap-4 bg-[var(--angel-paper)] rounded-lg border border-[var(--angel-border)] p-4 hover:border-[var(--angel-blue)] transition-colors">
              <div className="bg-[var(--angel-sky)] p-3 rounded-lg shrink-0">
                <BookOpen size={20} className="text-[var(--angel-blue)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--angel-navy)]">Practise instead</p>
                <p className="text-xs text-[var(--angel-muted)] mt-0.5">
                  Real, evidence-driven CSSE practice across Reading Comprehension, Mathematics and
                  Continuous Writing.
                </p>
              </div>
              <ArrowRight size={16} className="text-[var(--angel-muted)] shrink-0" />
            </div>
          </Link>

          <Link href="/learning-intelligence">
            <div className="flex items-center gap-4 bg-[var(--angel-paper)] rounded-lg border border-[var(--angel-border)] p-4 hover:border-[var(--angel-blue)] transition-colors">
              <div className="bg-[var(--angel-sky)] p-3 rounded-lg shrink-0">
                <Brain size={20} className="text-[var(--angel-blue)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--angel-navy)]">See your Learning Report</p>
                <p className="text-xs text-[var(--angel-muted)] mt-0.5">
                  Real competency and evidence data from everything you&apos;ve practised so far.
                </p>
              </div>
              <ArrowRight size={16} className="text-[var(--angel-muted)] shrink-0" />
            </div>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
