import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import StudyIllustration from "@/components/public/StudyIllustration";
import { ButtonLink } from "@/components/ui/Button";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Increment 1A (Public Homepage Visual Refinement + Brand Foundation v1.0)
 * established the structure, section order and Brand Foundation tokens
 * (--angel-navy/-blue/-ivory/-paper/-gold/-sky/-ink/-muted/-border,
 * app/globals.css) — all now Founder-accepted and deliberately unchanged
 * here.
 *
 * Increment 1B (Final Public Homepage Visual Finish) is a narrower pass on
 * top of that structure: larger, more confident scale for the hero and the
 * preparation journey (moved from 6 narrow columns to 3-wide/2-row so each
 * step reads at a glance), a bigger photography-ready hero image slot, a
 * two-column pairing of the parent illustrative example with the real
 * benefit list (was stacked, leaving the desktop canvas under-filled), and
 * a stronger editorial intro for the subjects section. No section was
 * added, removed or reordered; no card/icon system was reintroduced; no
 * educational sequence changed.
 */
export const metadata: Metadata = {
  title: { absolute: "Angel 11+ | 11+ Preparation Shaped Around Your Child" },
  description:
    "Angel 11+ helps your child learn, practise and prepare for selective-school entrance exams with a clear plan that responds to their progress. Independent, original preparation content for English, Mathematics, Vocabulary, Writing and Mock Tests.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Angel 11+",
    title: "Angel 11+ | 11+ Preparation Shaped Around Your Child",
    description:
      "A clear plan that responds to your child's progress. Structured, evidence-led preparation for English, Mathematics, Vocabulary, Writing and Mock Tests.",
    url: SITE_URL,
  },
};

const JOURNEY = [
  { title: "Learn", body: "Understand the method, with a clear example first." },
  { title: "Practise", body: "Build confidence with varied questions." },
  { title: "Check", body: "Try it independently, not just copy it." },
  { title: "Review", body: "Strengthen what still needs work." },
  { title: "Mock", body: "Measure independent performance." },
  { title: "Improve", body: "Use the evidence to plan what's next." },
];

const TODAYS_PLAN = [
  { title: "Fractions of amounts", detail: "Learn the method", time: "About 8 min" },
  { title: "Recommended practice", detail: "10 questions", time: "About 12 min" },
  { title: "Quick review", detail: "Vocabulary", time: "About 5 min" },
];

const SUBJECTS = [
  { title: "English", body: "Reading comprehension, vocabulary and writing, built on real passages, not isolated trick questions." },
  { title: "Mathematics", body: "Core skills, reasoning and multi-step problems, covering the topics that come up in selective-school papers." },
  { title: "Vocabulary", body: "Word knowledge built in meaningful context, supporting both reading and writing." },
  { title: "Writing", body: "Guided practice that develops towards independent writing, with clear, rubric-based feedback." },
  { title: "Mock Tests", body: "Full timed papers, kept separate from everyday practice, for an honest measure of readiness." },
];

const GOING_WELL = ["Fractions", "Vocabulary in context"];
const NEEDS_ATTENTION = ["Inference", "Multi-step problems"];

const FOR_PARENTS = [
  "What your child has done, this week and over time",
  "What Angel 11+ recommends they do next",
  "How their latest Mock Test went",
  "Progress for each of your children, where more than one is preparing",
];

const APPROACH = [
  { title: "Original content", body: "Every lesson, passage and question is written for Angel 11+, not copied from another source." },
  { title: "Evidence, not guesswork", body: "Progress shown to you is based on your child's actual work, never invented or estimated." },
  { title: "A parent-led account", body: "You create and control the account. Your child's information is never shared between families." },
  { title: "Privacy-conscious by design", body: "We collect only what preparation genuinely needs. Read our full approach in our Privacy Policy." },
];

/** Purely decorative — never the sole carrier of meaning, a heading always sits beside it. See app/globals.css's Brand Foundation note on --angel-gold. */
function GoldRule() {
  return <span aria-hidden="true" className="block w-10 h-0.5 bg-[var(--angel-gold)] mb-4" />;
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--angel-paper)]">
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-14 md:pt-24 pb-16 md:pb-28 grid md:grid-cols-12 gap-10 md:gap-16 items-center">
          <div className="md:col-span-7">
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.03] tracking-tight text-[var(--angel-navy)] max-w-2xl">
              11+ preparation shaped around your child.
            </h1>
            <p className="mt-7 text-xl text-[var(--angel-muted)] leading-relaxed max-w-xl">
              Angel 11+ helps your child learn, practise and prepare with a clear plan that responds to their
              progress.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <ButtonLink href="/login" size="lg">
                Start preparing
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="outline" size="lg">
                See how Angel 11+ works
              </ButtonLink>
            </div>
          </div>
          <div className="md:col-span-5">
            <StudyIllustration />
          </div>
        </section>

        {/* Preparation journey */}
        <section id="how-it-works" className="scroll-mt-20 border-t border-[var(--angel-border)] bg-[var(--angel-ivory)]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
            <GoldRule />
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--angel-navy)]">How Angel 11+ works</h2>
            <p className="mt-3 text-lg text-[var(--angel-muted)] max-w-xl leading-relaxed">
              Preparation follows one steady, connected rhythm, the same one a good tutor would use.
            </p>

            {/*
              Increment 1B — moved from 6 narrow single-row columns (too
              small to read at a glance at real desktop width) to 3 wide
              columns over 2 rows: each step gets roughly double the width,
              letting the numeral/title/body sit at a scale a parent can
              scan in a few seconds, per the governing instruction's own
              "understandable within a few seconds" test. The connecting
              top rule uses --angel-gold, not the neutral --angel-border —
              a deliberate, restrained "journey connector" use of gold
              (purely decorative: the real sequence is carried by the <ol>
              itself and the visible 01-06 numerals, never by this line
              alone, so it stays outside anything screen readers or
              keyboard users depend on).
            */}
            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-x-12 md:gap-y-14">
              {JOURNEY.map((step, i) => (
                <li
                  key={step.title}
                  className="pl-6 border-l-2 md:pl-0 md:border-l-0 md:border-t-2 border-[var(--angel-gold)] md:pt-7"
                >
                  <span className="block text-2xl font-bold tracking-tight text-[var(--angel-blue)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-[var(--angel-navy)]">{step.title}</h3>
                  <p className="mt-1.5 text-[var(--angel-muted)] leading-relaxed">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Product story: a clear plan for today (illustrative example, not real data) */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
            <div className="md:col-span-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--angel-blue)]">Example</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-[var(--angel-navy)]">A clear plan for today</h2>
              <p className="mt-4 text-lg text-[var(--angel-ink)] leading-relaxed max-w-md">
                Rather than choosing at random from a large bank of questions, your child opens Angel 11+ to a clear
                starting point, chosen from what they have already shown they can do.
              </p>
            </div>
            <div className="md:col-span-7 rounded-lg bg-[var(--angel-sky)] p-8 md:p-12">
              <ol className="divide-y divide-[var(--angel-border)]">
                {TODAYS_PLAN.map((item) => (
                  <li key={item.title} className="py-5 first:pt-0 last:pb-0 flex items-baseline justify-between gap-6">
                    <div>
                      <p className="text-lg font-semibold text-[var(--angel-navy)]">{item.title}</p>
                      <p className="text-[var(--angel-muted)]">{item.detail}</p>
                    </div>
                    <span className="text-[var(--angel-muted)] whitespace-nowrap">{item.time}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-7 text-[var(--angel-muted)] leading-relaxed">
                Chosen from what your child has already shown they can do. This is an example plan, not a real
                child&rsquo;s data.
              </p>
              <div className="mt-6">
                <ButtonLink href="/login" size="md">
                  Start today&rsquo;s plan
                </ButtonLink>
              </div>
            </div>
          </div>

          {/* Personalisation */}
          <div className="mt-24 md:mt-32 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--angel-navy)]">
              Preparation that responds to your child
            </h2>
            <p className="mt-5 text-lg text-[var(--angel-ink)] leading-relaxed">
              As your child works through lessons and practice, Angel 11+ builds up a picture of what they have
              understood and what still needs more time. That picture helps decide what should be strengthened,
              revisited, introduced next, or checked independently.
            </p>
            <p className="mt-7 text-xl font-bold text-[var(--angel-navy)]">Angel recommends. Family chooses.</p>
            <p className="mt-2 text-[var(--angel-muted)] leading-relaxed">
              Angel 11+ suggests what to do next. It never decides alone, and a recommendation is never the only
              path your child can take.
            </p>
          </div>
        </section>

        {/* What children practise */}
        <section id="what-you-practise" className="scroll-mt-20 border-t border-[var(--angel-border)] bg-[var(--angel-ivory)]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--angel-navy)] max-w-2xl">
              Five subjects. One connected plan.
            </h2>
            <p className="mt-4 text-lg text-[var(--angel-muted)] max-w-xl leading-relaxed">
              Angel 11+&rsquo;s CSSE preparation is currently our most deeply developed pathway. Preparation for
              other selective-school pathways continues to grow.
            </p>
            <dl className="mt-12 divide-y divide-[var(--angel-border)] max-w-3xl">
              {SUBJECTS.map((s) => (
                <div key={s.title} className="py-8 grid md:grid-cols-[12rem_1fr] gap-1.5 md:gap-10">
                  <dt className="text-xl font-bold text-[var(--angel-navy)]">{s.title}</dt>
                  <dd className="text-lg text-[var(--angel-ink)] leading-relaxed">{s.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* For parents */}
        <section id="for-parents" className="scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--angel-navy)]">For parents</h2>
            <p className="mt-4 text-lg text-[var(--angel-muted)] max-w-xl leading-relaxed">
              One account, kept up to date as your child works, so you always know where things stand.
            </p>

            {/*
              Increment 1B — the illustrative example and the real benefit
              list were previously stacked (example, then a narrow list
              below it), leaving most of the desktop canvas empty. Paired
              side by side instead, at a scale that fills the width
              intentionally: the example gets a distinct tinted panel (the
              same "self-contained illustrative unit" language as "A clear
              plan for today"), the real list sits beside it at equal
              visual weight, making the relationship between the two direct
              rather than sequential.
            */}
            <div className="mt-14 grid md:grid-cols-12 gap-10 md:gap-14 items-start">
              <div className="md:col-span-7 rounded-lg bg-[var(--angel-ivory)] p-8 md:p-12">
                <div className="grid sm:grid-cols-3 gap-8 md:gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--angel-blue)]">Going well</p>
                    <ul className="mt-3 space-y-1.5 text-lg text-[var(--angel-ink)]">
                      {GOING_WELL.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--angel-blue)]">Needs attention</p>
                    <ul className="mt-3 space-y-1.5 text-lg text-[var(--angel-ink)]">
                      {NEEDS_ATTENTION.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--angel-blue)]">Coming next</p>
                    <p className="mt-3 text-lg text-[var(--angel-ink)] leading-relaxed">
                      Focused inference practice, followed by a mixed comprehension check.
                    </p>
                  </div>
                </div>
                <p className="mt-7 text-xs text-[var(--angel-muted)]">
                  Illustrative example. Not a real child&rsquo;s data.
                </p>
              </div>

              <ul className="md:col-span-5 space-y-5 md:pt-2">
                {FOR_PARENTS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-[var(--angel-blue)] mt-0.5 shrink-0" aria-hidden="true" />
                    <span className="text-lg text-[var(--angel-ink)] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Mock Tests */}
        <section id="mock-tests" className="scroll-mt-20 border-t border-[var(--angel-border)] bg-[var(--angel-ivory)]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
            <GoldRule />
            <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-[var(--angel-navy)] max-w-2xl">
              Practice teaches. Mock Tests measure.
            </h2>
            <div className="mt-8 max-w-2xl">
              <p className="text-lg text-[var(--angel-ink)] leading-relaxed">
                Everyday practice is where your child learns, with support and explanation along the way. Mock
                Tests are kept separate: timed, exam-style papers that measure what your child can do
                independently, without hints, so results give an honest picture of readiness. What a Mock Test
                shows then helps decide what practice should focus on next.
              </p>
              <p className="mt-5 text-sm text-[var(--angel-muted)] leading-relaxed">
                Angel 11+&rsquo;s Mock Tests are original preparation papers. They are not official papers from
                CSSE, GL Assessment, CEM, ISEB or any school, and are not affiliated with or endorsed by any of
                them.
              </p>
            </div>
          </div>
        </section>

        {/* Our approach */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--angel-navy)]">Our approach</h2>
          <dl className="mt-12 grid sm:grid-cols-2 gap-x-16 gap-y-12 max-w-3xl">
            {APPROACH.map((p) => (
              <div key={p.title}>
                <dt className="text-lg font-bold text-[var(--angel-navy)]">{p.title}</dt>
                <dd className="mt-1.5 text-[var(--angel-ink)] leading-relaxed">{p.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Final CTA */}
        <section className="border-t border-[var(--angel-border)] bg-[var(--angel-ivory)]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--angel-navy)] max-w-2xl mx-auto">
              Start your child&rsquo;s preparation
            </h2>
            <p className="mt-4 text-[var(--angel-muted)] max-w-xl mx-auto leading-relaxed">
              Create a free parent account and set up your child&rsquo;s preparation in a few minutes.
            </p>
            <div className="mt-9">
              <ButtonLink href="/login" size="lg">
                Start preparing
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
