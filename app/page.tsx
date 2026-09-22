import type { Metadata } from "next";
import {
  BookOpen,
  PenLine,
  Calculator,
  Library,
  Trophy,
  CheckCircle2,
  RotateCcw,
  TrendingUp,
  Compass,
  Users,
  BarChart2,
  ShieldCheck,
  FileCheck2,
  Lock,
} from "lucide-react";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import StudyIllustration from "@/components/public/StudyIllustration";
import { ButtonLink } from "@/components/ui/Button";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Increment 1 (Public Experience Foundation) — the public homepage. Until
 * now, "/" unconditionally redirected to /dashboard (see git history), so an
 * anonymous visitor never saw a real first impression of Angel 11+ at all:
 * they landed straight in the registered-account gate's generic "Create your
 * free parent account" panel. "" is already listed as a public route in
 * lib/registeredAccess.ts (PUBLIC_TOP_LEVEL_ROUTES) and already covered by
 * its own test, so no access-control change was needed here, only real
 * content.
 *
 * Page-level metadata deliberately overrides the root layout's defaults:
 * this is the one route that should be indexable (the layout's own default
 * is `robots: { index: false }`, correct for the private learner app, wrong
 * for the page whose whole job is to be found).
 */
export const metadata: Metadata = {
  title: { absolute: "Angel 11+ | 11+ Preparation Built Around Your Child" },
  description:
    "Angel 11+ helps children learn, practise and prepare for selective-school entrance exams through structured preparation that responds to their progress. Independent, original preparation content for English, Mathematics, Vocabulary, Reasoning, Writing and Mock Tests.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Angel 11+",
    title: "Angel 11+ | 11+ Preparation Built Around Your Child",
    description:
      "11+ preparation that knows what your child needs next. Structured, evidence-led preparation for English, Mathematics, Vocabulary, Reasoning, Writing and Mock Tests.",
    url: SITE_URL,
  },
};

const HOW_IT_WORKS = [
  { icon: BookOpen, title: "Learn", body: "A concept is introduced clearly, with a worked example, before your child is asked to try it alone." },
  { icon: PenLine, title: "Practise", body: "Questions build confidence with the right amount of support, then step up to independent practice." },
  { icon: CheckCircle2, title: "Check", body: "Every answer is checked, with a clear explanation when something needs another look." },
  { icon: RotateCcw, title: "Review", body: "Angel 11+ brings back what needs reinforcing, at the right time, so it stays remembered." },
  { icon: Trophy, title: "Mock", body: "Timed Mock Tests measure what your child can do independently, under real exam conditions." },
  { icon: TrendingUp, title: "Improve", body: "Mock results feed straight back into what your child learns and practises next." },
];

const WHAT_CHILDREN_PRACTISE = [
  { icon: BookOpen, title: "English", body: "Reading comprehension built on real passages, not isolated trick questions." },
  { icon: Calculator, title: "Mathematics", body: "Structured lessons and practice across the topics that come up in selective-school papers." },
  { icon: Library, title: "Vocabulary", body: "Focused word-level practice that supports both reading and writing." },
  { icon: PenLine, title: "Writing", body: "Guided writing practice with clear, rubric-based feedback on each piece." },
  { icon: Trophy, title: "Mock Tests", body: "Full timed papers, kept separate from everyday practice, for an honest measure of readiness." },
];

const FOR_PARENTS = [
  "What your child has done, this week and over time",
  "What they are doing well",
  "Where they need more support",
  "What Angel 11+ recommends they do next",
  "How their latest Mock Test went",
  "Progress for each of your children, where more than one is preparing",
];

const TRUST_POINTS = [
  { icon: FileCheck2, title: "Original content", body: "Every lesson, passage and question is written for Angel 11+, not copied from another source." },
  { icon: BarChart2, title: "Evidence, not guesswork", body: "Progress shown to you is based on your child's actual work, never invented or estimated." },
  { icon: Users, title: "A parent-led account", body: "You create and control the account. Your child's information is never shared between families." },
  { icon: Lock, title: "Privacy-conscious by design", body: "We collect only what preparation genuinely needs. Read our full approach in our Privacy Policy." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <PublicHeader />

      <main>
        {/* B. Hero */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 pt-12 md:pt-20 pb-16 md:pb-24 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-[var(--text-primary)]">
              11+ preparation that knows what your child needs next.
            </h1>
            <p className="mt-5 text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
              Angel 11+ helps your child learn, practise and prepare for selective-school entrance exams, with
              preparation that responds to how they are actually getting on, not a fixed list of questions.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/login" size="lg">
                Start preparing
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="outline" size="lg">
                See how Angel 11+ works
              </ButtonLink>
            </div>
          </div>
          <StudyIllustration />
        </section>

        {/* C. How Angel 11+ works */}
        <section id="how-it-works" className="scroll-mt-20 border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">How Angel 11+ works</h2>
            <p className="mt-3 text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Preparation follows a steady, familiar rhythm, the same one a good tutor would use.
            </p>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {HOW_IT_WORKS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                    <Icon size={19} className="text-blue-700 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-bold text-[var(--text-primary)]">{title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>

            {/* D. Personalised preparation */}
            <div className="mt-14 md:mt-20 grid md:grid-cols-2 gap-8 items-start">
              <div>
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <Compass size={19} className="text-blue-700 dark:text-blue-400" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[var(--text-primary)]">Preparation that responds to your child</h3>
                <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
                  As your child works through lessons and practice, Angel 11+ builds up a picture of what they have
                  understood and what still needs more time. That picture shapes what comes next, so preparation time
                  goes where it is genuinely needed, rather than repeating what your child has already mastered or
                  skipping past a real gap.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <BarChart2 size={19} className="text-blue-700 dark:text-blue-400" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[var(--text-primary)]">A clear plan, not a question bank</h3>
                <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
                  Rather than choosing at random from a large bank of questions, your child opens Angel 11+ to a
                  clear starting point for today, chosen from what they have already shown they can do.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* E. What children practise */}
        <section id="what-you-practise" className="scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">What children practise</h2>
            <p className="mt-3 text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Angel 11+&rsquo;s CSSE preparation is currently our most deeply developed pathway. Preparation for other
              selective-school pathways continues to grow.
            </p>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHAT_CHILDREN_PRACTISE.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                    <Icon size={19} className="text-blue-700 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-bold text-[var(--text-primary)]">{title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* G. For parents */}
        <section id="for-parents" className="scroll-mt-20 border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">For parents</h2>
              <p className="mt-3 text-[var(--text-secondary)] leading-relaxed max-w-md">
                One account, kept up to date as your child works, so you always know where things stand without
                having to ask.
              </p>
            </div>
            <ul className="space-y-3">
              {FOR_PARENTS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-blue-700 dark:text-blue-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-[var(--text-primary)] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* H. Mock Tests */}
        <section id="mock-tests" className="scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-start">
            <div>
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <Trophy size={19} className="text-blue-700 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Practice teaches. Mock Tests measure.</h2>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Everyday practice is where your child learns, with support and explanation along the way. Mock Tests
                are kept separate: timed, exam-style papers that measure what your child can do independently,
                without hints, so results give an honest picture of readiness.
              </p>
              <p className="mt-4 text-sm text-[var(--text-tertiary)] leading-relaxed">
                Angel 11+&rsquo;s Mock Tests are original preparation papers. They are not official papers from CSSE,
                GL Assessment, CEM, ISEB or any school, and are not affiliated with or endorsed by any of them.
              </p>
            </div>
          </div>
        </section>

        {/* I. Trust / educational approach */}
        <section className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
            <div className="flex items-center gap-3">
              <ShieldCheck size={22} className="text-blue-700 dark:text-blue-400" aria-hidden="true" />
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Our approach</h2>
            </div>
            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              {TRUST_POINTS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <Icon size={20} className="text-blue-700 dark:text-blue-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
                    <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* J. Final CTA */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-[var(--text-primary)] max-w-2xl mx-auto">
            Start your child&rsquo;s preparation
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Create a free parent account and set up your child&rsquo;s preparation in a few minutes.
          </p>
          <div className="mt-8">
            <ButtonLink href="/login" size="lg">
              Start preparing
            </ButtonLink>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
