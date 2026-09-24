"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";

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
 *
 * Increment 3 (Progress + Results + Parent Dashboard) — the prior version
 * gave each of the 7 stages its own rainbow-coloured icon tile
 * (blue/teal/sky/emerald/amber/rose/slate) — exactly the pattern the
 * governing design standard rules out. The stage's own numbered position
 * already carries the sequence; a restrained divider now separates stages
 * instead of 7 separate bordered cards, and no icon was reintroduced.
 */

interface Stage {
  name: string;
  whatHappened: string;
  whyItMatters: string;
  whatsNext: string;
  href: string;
  linkLabel: string;
}

const STAGES: Stage[] = [
  {
    name: "Practice",
    whatHappened: "Short, focused sessions on one skill at a time, with feedback straight after each answer.",
    whyItMatters: "Every answer becomes real, recorded evidence. It's the same evidence every other stage below reads from.",
    whatsNext: "Educational Insights update automatically as soon as you finish a session.",
    href: "/learning-intelligence/practice",
    linkLabel: "Go to Practice",
  },
  {
    name: "Mock Examination",
    whatHappened: "A timed, real exam-condition sitting: Standard (the full paper) or Personalised (a shorter paper weighted to your recorded evidence). No feedback until you submit, just like exam day.",
    whyItMatters: "The exact same evidence pipeline as Practice, gathered under real conditions. It's not a separate, disconnected score.",
    whatsNext: "Results feed straight into Educational Insights and Readiness below, plus a Historical Context comparison against CSSE's own published admissions facts.",
    href: "/mocks",
    linkLabel: "Go to the Mock Centre",
  },
  {
    name: "Educational Insights",
    whatHappened: "Your child's real skills profile: which competencies have evidence, how much, and what it shows.",
    whyItMatters: "This is the one place every stage's evidence is shown together. Nothing here is estimated or invented.",
    whatsNext: "Readiness turns this same evidence into an honest, area-by-area picture of exam preparedness.",
    href: "/learning-intelligence",
    linkLabel: "Go to Educational Insights",
  },
  {
    name: "Readiness",
    whatHappened: "A four-band picture for each part of the real exam: Well Evidenced, Partially Evidenced, or Not Yet Evidenced.",
    whyItMatters: "Never a single predicted score or a percentage chance. Just an honest, evidence-only account of how well-covered each area is right now.",
    whatsNext: "Recommendations point at exactly which of these areas is most worth attention next.",
    href: "/learning-intelligence/parent",
    linkLabel: "See Readiness on the Parent Dashboard",
  },
  {
    name: "Recommendations",
    whatHappened: "A ranked, explained list of what's most worth focusing on next.",
    whyItMatters: "Every suggestion traces back to real evidence. Never a guess, never a fixed script.",
    whatsNext: "Revision Planning turns this same ranked list into a concrete plan for the week.",
    href: "/learning-intelligence/recommendations",
    linkLabel: "Go to Recommendations",
  },
  {
    name: "Revision Planning",
    whatHappened: "This week's priorities, with a time estimate and the same evidence-based reasoning as Recommendations.",
    whyItMatters: "Turns \"what to focus on\" into \"what to actually do this week,\" without inventing anything new.",
    whatsNext: "Completing a plan item is Practice again. The loop closes here and starts over.",
    href: "/learning-intelligence/parent/revision-planner",
    linkLabel: "Go to Revision Planning",
  },
  {
    name: "Admissions Readiness",
    whatHappened: "The same Readiness and Evidence Coverage picture, placed beside the one real, published CSSE admissions fact this platform holds.",
    whyItMatters: "Context about the real exam, kept clearly separate from your child's own evidence. Never blended into a prediction.",
    whatsNext: "Optional. Worth checking in on occasionally, not a step you need every week.",
    href: "/learning-intelligence/parent/admissions-readiness",
    linkLabel: "Go to Admissions Readiness",
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
        <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl leading-tight">Your Learning Journey</h1>
        <p className="text-[var(--angel-muted)] text-sm md:text-base mt-2 max-w-xl">
          How Practice, Mock Exams, Insights, Readiness and Revision all connect.
        </p>

        <div className="mt-6 bg-[var(--angel-sky)] rounded-lg p-5">
          <p className="text-sm text-[var(--angel-ink)] leading-relaxed">
            Every part of Angel below reads from the same real evidence. Nothing is calculated twice, and nothing
            shown to you is invented. The natural order is: <strong>Practice or a Mock Exam</strong>, which updates{" "}
            <strong>Educational Insights</strong> and <strong>Readiness</strong>, which drive{" "}
            <strong>Recommendations</strong> and a <strong>Revision Plan</strong>, with{" "}
            <strong>Admissions Readiness</strong> available whenever it&apos;s useful, never a required step.
          </p>
        </div>

        <div className="mt-8 bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg divide-y divide-[var(--angel-border)]">
          {STAGES.map((stage, i) => (
            <div key={stage.name} className="p-5">
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-xs font-bold text-[var(--angel-muted)]">{i + 1}</span>
                <h2 className="text-base font-bold text-[var(--angel-navy)]">{stage.name}</h2>
              </div>
              <dl className="space-y-1.5 text-sm">
                <div>
                  <dt className="inline text-xs font-semibold uppercase tracking-wide text-[var(--angel-muted)]">What happens: </dt>
                  <dd className="inline text-[var(--angel-ink)]">{stage.whatHappened}</dd>
                </div>
                <div>
                  <dt className="inline text-xs font-semibold uppercase tracking-wide text-[var(--angel-muted)]">Why it matters: </dt>
                  <dd className="inline text-[var(--angel-ink)]">{stage.whyItMatters}</dd>
                </div>
                <div>
                  <dt className="inline text-xs font-semibold uppercase tracking-wide text-[var(--angel-muted)]">What happens next: </dt>
                  <dd className="inline text-[var(--angel-ink)]">{stage.whatsNext}</dd>
                </div>
              </dl>
              <Link
                href={stage.href}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--angel-blue)] mt-2.5 hover:underline"
              >
                {stage.linkLabel} <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-xs text-[var(--angel-muted)] leading-relaxed mt-6 text-center px-4">
          This page only explains how the pieces fit together. Every fact and every number lives on the real pages
          linked above, and nothing here is calculated separately from them.
        </p>
      </div>
    </PageLayout>
  );
}
