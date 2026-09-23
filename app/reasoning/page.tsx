"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Puzzle, Shapes, Compass, Hash, Play, Clock, Calculator, BookOpen, ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { ButtonLink } from "@/components/ui/Button";
import { CompetencyIndicator } from "@/components/ui/Progress";
import { getProgress, getSelectedPathwayId } from "@/lib/progress";
import { computeAnalytics } from "@/lib/analytics";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";
import type { AnalyticsReport } from "@/types/analytics";
import type { DailyMission } from "@/types/adaptive";
import type { SkillType } from "@/types";
import type { LucideIcon } from "lucide-react";

/**
 * Increment 2 Final Visual Closure (Practise Hub Only) — Founder real
 * production evidence: this page (the actual destination the "Practise"
 * nav item reaches for any non-CSSE learner, and the destination any
 * learner reaches when their persisted pathway hasn't resolved to "csse"
 * at click time, since getSelectedPathwayId()/getProgress() are per-active-
 * learner localStorage reads — Private Learner Space, migration 260 — with
 * no server-side fallback) still carried the pre-Angel-Foundation bright
 * multi-colour identity and internal development-status language.
 *
 * PATHWAY-AWARE TRACE (before any visual change): components/Navigation.tsx
 * already branches "Practise" correctly (isCsse ? CSSE_PRACTISE_HREF :
 * "/reasoning") — the routing mechanism is intentional (Answer A for the
 * nav layer). This PAGE itself, however, was Answer C: a flat, single,
 * all-pathways catalogue with zero pathway-conditional content, so ANY
 * learner who reaches it — including a genuinely CSSE-pathway learner
 * whose local pathway value hasn't (yet, or ever, on this browser/device)
 * resolved to "csse" — saw identical, un-personalised, GL/CEM/ISEB-branded
 * content with no CSSE relevance at all. This pass makes the page itself
 * genuinely pathway-aware (reads the same getSelectedPathwayId() the nav
 * already trusts), closing the gap defensively at this one page without
 * touching Navigation.tsx or the underlying per-learner storage mechanism
 * (both out of this bounded correction's scope). No GL/CEM/ISEB capability
 * is removed — every existing route/card below is still reachable for
 * every pathway, only foregrounded differently.
 */

const reasoningSubjects: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  skillType: SkillType;
}[] = [
  {
    href: "/verbal-reasoning",
    title: "Verbal Reasoning",
    description: "Word analogies, letter codes, hidden words & sequences.",
    icon: Puzzle,
    skillType: "verbal-reasoning",
  },
  {
    href: "/non-verbal-reasoning",
    title: "Non-Verbal Reasoning",
    description: "Pattern grids, rotation, reflection & symbol sequences.",
    icon: Shapes,
    skillType: "non-verbal-reasoning",
  },
  {
    href: "/spatial-reasoning",
    title: "Spatial Reasoning",
    description: "Paper folding, 3D shapes, symmetry & compass directions.",
    icon: Compass,
    skillType: "spatial-reasoning",
  },
  {
    href: "/numerical-reasoning",
    title: "Numerical Reasoning",
    description: "Number patterns, ratio, averages & data interpretation.",
    icon: Hash,
    skillType: "numerical-reasoning",
  },
];

/**
 * CSSE's own real, evidence-recording practice areas — the exact same
 * routes app/learning-intelligence/practice/page.tsx already links to.
 * Reused directly, never duplicated or reimplemented.
 */
const csseSubjectCards: { href: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    href: "/learning-intelligence/practice/mathematics",
    title: "Mathematics",
    description: "Build your skills and methods for the real CSSE Mathematics paper.",
    icon: Calculator,
  },
  {
    href: "/learning-intelligence/practice/reading-comprehension",
    title: "Reading Comprehension",
    description: "Work with real passages, one at a time, with every question that belongs to it.",
    icon: BookOpen,
  },
];

/**
 * Mock Centre Experience Transformation — relocated from app/mocks/page.tsx.
 * Real, GL-pathway content (fetchQuestionBank(..., "gl") in each of the four
 * runners below, confirmed by direct source read) that was previously the
 * first thing every pathway's "Mock" nav click reached, including CSSE
 * families. This is its correct home: the existing, unchanged Practise hub
 * for the pathway it actually belongs to.
 *
 * Gate 3 Closure Wave, Defect D (2026-09-02) — the Mathematics and Reading
 * Practice cards now link directly to their CSSE-scoped, evidence-recording
 * successors instead of the retired /mocks/adaptive/{maths,english} routes.
 * GL Verbal Reasoning and Vocabulary Practice are unchanged — GL genuinely
 * is GL-only content by design, and Vocabulary has no CSSE-scoped successor
 * to redirect to, so it stays reachable for every pathway including CSSE
 * (never removed — see this file's own header note on not deleting
 * capabilities a learner still genuinely needs).
 */
const personalisedPracticeCards: {
  href: string;
  title: string;
  description: string;
  minutes: string;
}[] = [
  {
    href: "/mocks/adaptive/gl",
    title: "GL Verbal Reasoning",
    description: "Verbal Reasoning questions matched to your practice level.",
    minutes: "35 min",
  },
  {
    href: "/learning-intelligence/practice/mathematics",
    title: "Mathematics Practice",
    description: "Maths questions matched to your practice level.",
    minutes: "12 min",
  },
  {
    href: "/learning-intelligence/practice/reading-comprehension",
    title: "Reading Practice",
    description: "One passage at a time, with every question that belongs to it.",
    minutes: "10-15 min",
  },
  {
    href: "/mocks/adaptive/vocabulary",
    title: "Vocabulary Practice",
    description: "One word at a time: synonyms, antonyms and usage in context.",
    minutes: "5-10 min",
  },
];

function PersonalisedCard({ card }: { card: (typeof personalisedPracticeCards)[number] }) {
  return (
    <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--angel-blue)] mb-1">Personalised</p>
          <h3 className="text-base font-bold text-[var(--angel-navy)]">{card.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--angel-muted)] shrink-0">
          <Clock size={13} />
          {card.minutes}
        </div>
      </div>
      <p className="text-sm text-[var(--angel-ink)] leading-relaxed mb-4 opacity-90">{card.description}</p>
      <ButtonLink href={card.href} variant="outline" size="sm" leftIcon={<Play size={14} />}>
        Start practice
      </ButtonLink>
    </div>
  );
}

function ReasoningSubjectCard({
  subject,
  competency,
  progressNote,
}: {
  subject: { href: string; title: string; description: string; icon: LucideIcon };
  competency?: { label: string; percent: number };
  progressNote?: string;
}) {
  const Icon = subject.icon;
  return (
    <Link
      href={subject.href}
      className="block group bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-6 hover:border-[var(--angel-blue)] transition-colors motion-reduce:transition-none"
    >
      <div className="w-12 h-12 rounded-lg bg-[var(--angel-sky)] flex items-center justify-center shrink-0 mb-4">
        <Icon size={22} className="text-[var(--angel-blue)]" aria-hidden="true" />
      </div>
      <h3 className="text-[var(--angel-navy)] font-bold text-base leading-snug group-hover:underline">{subject.title}</h3>
      <p className="text-[var(--angel-muted)] text-sm mt-1 leading-relaxed">{subject.description}</p>
      {competency && (
        <div className="mt-4">
          <CompetencyIndicator competencyLabel={competency.label} percent={competency.percent} />
          {progressNote && <p className="text-[var(--angel-muted)] text-xs mt-1.5">{progressNote}</p>}
        </div>
      )}
      <div className="flex justify-end mt-4">
        <ChevronRight size={16} aria-hidden="true" className="text-[var(--angel-muted)] group-hover:text-[var(--angel-blue)] transition-colors motion-reduce:transition-none" />
      </div>
    </Link>
  );
}

export default function ReasoningHubPage() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [isCsse, setIsCsse] = useState<boolean | null>(null);

  useEffect(() => {
    const p = getProgress();
    const r = computeAnalytics(p);
    const adaptive = computeAdaptiveState(p, r);
    setReport(r);
    setMission(adaptive.dailyMission);
    setIsCsse(getSelectedPathwayId() === "csse");
  }, []);

  // Quick Resume — reuses the same real Daily Mission output the Dashboard
  // and Learning Hub already render, filtered to this hub's four Reasoning
  // subjects; not a second recommendation.
  const practiceMissionItem = mission?.items.find((item) =>
    reasoningSubjects.some((s) => s.href === item.href)
  );

  return (
    <PageLayout breadcrumbs={[{ label: "Today", href: "/dashboard" }, { label: "Practise" }]}>
      <div className="max-w-4xl lg:max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl leading-tight">Practise</h1>
        <p className="text-[var(--angel-muted)] text-sm md:text-base mt-2 max-w-xl">
          Practise strengthens what you&apos;ve learned. Short, personalised sessions, with questions that adapt to
          you every time.
        </p>

        {practiceMissionItem && (
          <div className="mt-6 bg-[var(--angel-sky)] rounded-lg p-4 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-[var(--angel-ink)] min-w-0">
              Continue where you left off: <span className="font-semibold text-[var(--angel-navy)]">{practiceMissionItem.label}</span>
            </p>
            <ButtonLink href={practiceMissionItem.href} variant="primary" size="sm" leftIcon={<Play size={13} aria-hidden="true" />}>
              Continue Practice
            </ButtonLink>
          </div>
        )}

        {/* WHAT SHOULD I PRACTISE — CSSE: the real, evidence-recording CSSE
            subjects, foregrounded. Non-CSSE (or pathway not yet resolved):
            the existing four personalised, adaptive cards, unchanged in
            capability, only re-skinned. isCsse === null (not yet resolved
            client-side) renders nothing extra here rather than guessing. */}
        {isCsse === true && (
          <div className="mt-10">
            <h2 className="text-[var(--angel-navy)] font-bold text-2xl md:text-3xl leading-tight">What should I practise?</h2>
            <p className="text-[var(--angel-muted)] text-sm md:text-base mt-1 max-w-xl">
              Your CSSE preparation. Every session here updates your Skills Profile, Evidence Profile, Readiness and
              Recommendations on your learning report.
            </p>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {csseSubjectCards.map((subject) => (
                <ReasoningSubjectCard key={subject.href} subject={subject} />
              ))}
            </div>
          </div>
        )}

        {isCsse === false && (
          <div className="mt-10">
            <h2 className="text-[var(--angel-navy)] font-bold text-2xl md:text-3xl leading-tight">What should I practise?</h2>
            <p className="text-[var(--angel-muted)] text-sm md:text-base mt-1 max-w-xl">Short, personalised sessions matched to your level.</p>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {personalisedPracticeCards.map((card) => (
                <PersonalisedCard key={card.href} card={card} />
              ))}
            </div>
          </div>
        )}

        {/* WHAT ELSE CAN I CHOOSE — the four Reasoning subjects. Always
            present for every pathway (never deleted); demoted to secondary
            position and given an honest, pathway-appropriate "why" line
            rather than a repeated GL/CEM/ISEB badge on every card. */}
        <div className="mt-12">
          <h2 className="text-[var(--angel-navy)] font-bold text-2xl md:text-3xl leading-tight">What else can I choose?</h2>
          <p className="text-[var(--angel-muted)] text-sm md:text-base mt-1 max-w-xl">
            {isCsse === true
              ? "These four skills aren't part of the CSSE exam itself, but many other selective schools test them. Useful extra practice if that applies to you."
              : "Reasoning skills are tested across nearly every UK selective school entrance exam. Each one below strengthens a specific competency and adapts to your level as you practise."}
          </p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reasoningSubjects.map((subject) => {
              const skill = report?.skills.find((s) => s.skill === subject.skillType);
              const subjectRow = report?.subjects.find((s) => s.subject === subject.skillType);
              return (
                <ReasoningSubjectCard
                  key={subject.href}
                  subject={subject}
                  competency={skill ? { label: skill.label, percent: skill.estimatedAccuracy } : undefined}
                  progressNote={
                    subjectRow && subjectRow.attempts > 0
                      ? `${subjectRow.attempts} session${subjectRow.attempts === 1 ? "" : "s"} · ${subjectRow.avgScore}% average`
                      : subjectRow
                      ? "Not started yet"
                      : undefined
                  }
                />
              );
            })}
          </div>
          {/* CSSE: Vocabulary and GL Verbal Reasoning practice remain fully
              reachable here too (never removed), just not presented as
              CSSE's own primary subjects above. */}
          {isCsse === true && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {personalisedPracticeCards
                .filter((c) => c.title === "Vocabulary Practice" || c.title === "GL Verbal Reasoning")
                .map((card) => (
                  <PersonalisedCard key={card.href} card={card} />
                ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
