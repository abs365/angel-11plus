"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Clock, Play, Target, TrendingUp } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { StatusIndicator, type StatusTone } from "@/components/ui/Progress";
import { ButtonLink } from "@/components/ui/Button";
import { getSupabaseClient } from "@/lib/supabase";
import { getSelectedPathwayId } from "@/lib/progress";
import { getMockResults, bestScoreForPathway } from "@/lib/mockProgress";
import { computeCsseMockReadiness, type CsseMockReadiness } from "@/lib/learningEngine/mockReadiness";
import { getActiveMockForm, isMockFormAvailable } from "@/lib/mockAttempt/client";
import { MOCK_SUGGESTED_PREPARATION } from "@/lib/mockMeta";
import type { MockResult, MockPathwayId } from "@/types/mock";

/**
 * Mock Centre Experience Transformation. Card metadata is unchanged from
 * the prior page (same pathways, same real timing/sections for GL/CEM/ISEB)
 * — only the presentation, hierarchy and CSSE description are new. Every
 * card still routes to its existing, unmodified runner
 * (MOCK_CENTRE_PATHWAY_PROTECTION_PLAN.md).
 */
const MOCK_CARDS: {
  pathway: MockPathwayId;
  name: string;
  badge: string;
  totalMinutes: number;
  bg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    pathway: "gl",
    name: "GL Assessment",
    badge: "GL",
    totalMinutes: 35,
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-100 dark:border-blue-900",
    badgeBg: "bg-blue-100 dark:bg-blue-900",
    badgeText: "text-blue-700 dark:text-blue-300",
  },
  {
    pathway: "cem",
    name: "CEM",
    badge: "CEM",
    totalMinutes: 30,
    bg: "bg-slate-50 dark:bg-slate-950",
    border: "border-slate-100 dark:border-slate-900",
    badgeBg: "bg-slate-100 dark:bg-slate-900",
    badgeText: "text-slate-700 dark:text-slate-300",
  },
  {
    pathway: "iseb",
    name: "ISEB Pre-Test",
    badge: "ISEB",
    totalMinutes: 40,
    bg: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-100 dark:border-emerald-900",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900",
    badgeText: "text-emerald-700 dark:text-emerald-300",
  },
];

/** Named, honest categories that don't exist as separate experiences yet — MOCK_CENTRE_EXPERIENCE_BLUEPRINT.md §"Your Exam". Not clickable. */
const COMING_LATER = ["Mathematics Mock", "English Mock", "Continuous Writing", "Focused Assessment"];

function readinessDisplay(readiness: CsseMockReadiness): { label: string; tone: StatusTone } {
  if (readiness.assessment.verdict === "practice-first") {
    return readiness.hasAnyEvidence
      ? { label: "Keep practising", tone: "warning" }
      : { label: "Building foundations", tone: "neutral" };
  }
  return { label: "Ready for a mock", tone: "success" };
}

function LegacyMockCard({ card, best }: { card: (typeof MOCK_CARDS)[number]; best: number | undefined }) {
  return (
    <SimpleMockCard
      badge={card.badge}
      name={card.name}
      bg={card.bg}
      border={card.border}
      badgeBg={card.badgeBg}
      badgeText={card.badgeText}
      minutesLabel={`${card.totalMinutes} min`}
      description={MOCK_SUGGESTED_PREPARATION[card.pathway]}
      href={`/mocks/${card.pathway}`}
      best={best}
    />
  );
}

/**
 * Generalised card, shared by the legacy GL/CEM/ISEB cards and the one
 * no-pathway-selected CSSE entry below — same visual weight as the other
 * three in that specific view (mandate §16: "preserve all pathway
 * capabilities" applies even when Angel doesn't yet know which pathway to
 * prioritise). The pathway-prioritised "Full CSSE Mock" card (used when
 * CSSE is the learner's own selected pathway) is deliberately its own,
 * richer treatment — not this component — since it is the primary card in
 * that case, not one of several equal options.
 */
function SimpleMockCard({
  badge, name, bg, border, badgeBg, badgeText, minutesLabel, description, href, best, available = true,
}: {
  badge: string; name: string; bg: string; border: string; badgeBg: string; badgeText: string;
  minutesLabel: string; description: string; href: string; best: number | undefined;
  /**
   * Completion Assurance Programme, Completion B — genuine content
   * availability, not merely "this card has a route." Defaults to true
   * for the GL/CEM/ISEB legacy cards, whose static, bundled content is
   * always deliverable and never depends on live server-side data. The
   * CSSE card is the one caller that ever passes false.
   */
  available?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${bg} ${border}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${badgeBg} ${badgeText}`}>{badge}</span>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{name}</h3>
        </div>
        <StatusIndicator
          tone={best !== undefined ? "success" : "neutral"}
          label={best !== undefined ? "Completed" : available ? "Available" : "Not ready yet"}
        />
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
        <Clock size={13} />
        {minutesLabel}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
        {available ? description : "A full mock is not available right now. Practice stays available in the meantime, and reflects the same real evidence."}
      </p>
      <div className="flex items-center justify-between">
        {best !== undefined ? (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Best score: <span className="font-semibold text-gray-800 dark:text-gray-200">{best}%</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">Not attempted yet</span>
        )}
        {available ? (
          <ButtonLink href={href} variant="outline" size="sm" leftIcon={<Play size={14} />}>
            Start mock
          </ButtonLink>
        ) : (
          <ButtonLink href="/learning-intelligence/practice" variant="outline" size="sm">
            Go to Practice
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

export default function MocksPage() {
  const [pathwayId, setPathwayId] = useState<string | undefined>(undefined);
  const [pathwayLoaded, setPathwayLoaded] = useState(false);
  const [recentResults, setRecentResults] = useState<MockResult[]>([]);
  const [bestScores, setBestScores] = useState<Partial<Record<MockPathwayId, number>>>({});
  const [readiness, setReadiness] = useState<CsseMockReadiness | null | undefined>(undefined);
  const [showOtherPathways, setShowOtherPathways] = useState(false);
  // Completion Assurance Programme, Completion B — starts false (never a
  // false "Available" flash) and only ever becomes true once
  // getActiveMockForm()/isMockFormAvailable() — the same authoritative
  // signal the mock-exam page itself uses to gate attempt creation —
  // genuinely confirms a mock can be delivered right now.
  const [csseMockAvailable, setCsseMockAvailable] = useState(false);

  useEffect(() => {
    const selected = getSelectedPathwayId() ?? undefined;
    setPathwayId(selected);
    setPathwayLoaded(true);

    getMockResults().then((results) => {
      setRecentResults(results.slice(-3).reverse());
      setBestScores({
        gl: bestScoreForPathway(results, "gl") ?? undefined,
        cem: bestScoreForPathway(results, "cem") ?? undefined,
        csse: bestScoreForPathway(results, "csse") ?? undefined,
        iseb: bestScoreForPathway(results, "iseb") ?? undefined,
      });
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      computeCsseMockReadiness(supabase, selected)
        .then(setReadiness)
        .catch(() => setReadiness(null));
      getActiveMockForm(supabase, "full_mock")
        .then((result) => setCsseMockAvailable(isMockFormAvailable(result)))
        .catch(() => setCsseMockAvailable(false));
    } else {
      setReadiness(null);
    }
  }, []);

  const isCsse = pathwayId === "csse";
  const otherCards = MOCK_CARDS.filter((c) => c.pathway !== pathwayId);
  const primaryLegacyCard = MOCK_CARDS.find((c) => c.pathway === pathwayId);

  return (
    <PageLayout breadcrumbs={[{ label: "Today", href: "/dashboard" }, { label: "Mock Centre" }]}>
      <div className="max-w-2xl mx-auto px-4 pb-16 pt-6 md:pt-8 space-y-6">
        <div className="mb-1">
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-1">Mock Centre</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Test your progress when you&apos;re ready. Angel uses your learning and practice evidence to help you decide when a mock will be useful.
          </p>
        </div>

        {/* YOUR MOCK READINESS — CSSE only, three real states, MOCK_READINESS_CAPABILITY_ASSESSMENT.md.
            Completion Assurance Programme, Completion B — assessMockReadiness()'s own verdict/
            explanation logic is untouched (a genuinely separate question: "should this learner
            attempt a mock," not "can Angel deliver one right now"). Only the rendered next-action
            link is corrected here: when that verdict happens to recommend starting a mock and none
            can currently be delivered, the link points to Practice instead — the same honest
            fallback used elsewhere on this page — rather than repeating a CTA that would otherwise
            imply a mock is available. */}
        {isCsse && readiness && (
          <InfoCard className="flex items-start gap-3">
            <Target size={18} className="text-slate-500 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{readinessDisplay(readiness).label}</p>
                <StatusIndicator tone={readinessDisplay(readiness).tone} label="Your mock readiness" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">{readiness.assessment.explanation}</p>
              {readiness.assessment.nextAction.href === "/learning-intelligence/mock-exam" && !csseMockAvailable ? (
                <Link href="/learning-intelligence/practice" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <TrendingUp size={13} /> See practice areas →
                </Link>
              ) : (
                <Link href={readiness.assessment.nextAction.href} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <TrendingUp size={13} /> {readiness.assessment.nextAction.label}
                </Link>
              )}
            </div>
          </InfoCard>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            These are original practice papers created by Angel 11+. They are not affiliated with or endorsed by GL Assessment, CEM, CSSE, ISEB or any school.
          </p>
        </div>

        {/* YOUR EXAM — pathway-prioritised */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Your Exam</h2>

          {isCsse ? (
            <>
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">CSSE</span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Full CSSE Mock</h3>
                  </div>
                  <StatusIndicator tone={csseMockAvailable ? "success" : "neutral"} label={csseMockAvailable ? "Available" : "Not ready yet"} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">English: 60 min, 60 marks · Mathematics: 60 min, 60 marks · ~10 min between papers</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  {csseMockAvailable
                    // Stage 5 pass (2026-08-31) — "Adaptive" was visible,
                    // user-facing copy, a direct ALI-invisible violation
                    // (ANGEL_DESIGN_LANGUAGE.md §7 names it explicitly).
                    // "Personalised" is the term this app already uses for
                    // the same underlying idea elsewhere (the adaptive mock
                    // pages' own "Personalised" badge), reused here rather
                    // than inventing a new word for the same concept.
                    ? "Choose a full Standard sitting or a shorter, personalised paper weighted to your recorded evidence. Today's content is still expanding toward this complete structure."
                    : "A full mock is not available right now. Angel does not yet have a complete, reviewed set of exam questions to draw from. Practice stays available in the meantime, and reflects the same real evidence about how your child is progressing."}
                </p>
                <div className="flex items-center justify-between">
                  {bestScores.csse !== undefined ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Best score: <span className="font-semibold text-gray-800 dark:text-gray-200">{bestScores.csse}%</span>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">Not attempted yet</span>
                  )}
                  {csseMockAvailable ? (
                    <ButtonLink href="/learning-intelligence/mock-exam" variant="outline" size="sm" leftIcon={<Play size={14} />}>
                      Start mock
                    </ButtonLink>
                  ) : (
                    <ButtonLink href="/learning-intelligence/practice" variant="outline" size="sm">
                      Go to Practice
                    </ButtonLink>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">Coming later</p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {COMING_LATER.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : primaryLegacyCard ? (
            <LegacyMockCard card={primaryLegacyCard} best={bestScores[primaryLegacyCard.pathway]} />
          ) : (
            // No pathway selected — every pathway shown with equal weight, honestly (MOCK_CENTRE_INFORMATION_ARCHITECTURE.md).
            <div className="space-y-3">
              <SimpleMockCard
                badge="CSSE"
                name="Full CSSE Mock"
                bg="bg-blue-50 dark:bg-blue-950"
                border="border-blue-100 dark:border-blue-900"
                badgeBg="bg-blue-100 dark:bg-blue-900"
                badgeText="text-blue-700 dark:text-blue-300"
                minutesLabel="Varies by mode"
                description="Choose Standard for the full sitting, or Personalised for a shorter paper weighted to your recorded evidence."
                href="/learning-intelligence/mock-exam"
                best={bestScores.csse}
                available={csseMockAvailable}
              />
              {MOCK_CARDS.map((card) => (
                <LegacyMockCard key={card.pathway} card={card} best={bestScores[card.pathway]} />
              ))}
            </div>
          )}

          {pathwayLoaded && pathwayId && (otherCards.length > 0 || isCsse) && (
            <div>
              <button
                onClick={() => setShowOtherPathways((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400"
              >
                Explore another pathway
                <ChevronDown size={13} className={showOtherPathways ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
              {showOtherPathways && (
                <div className="space-y-3 mt-3">
                  {isCsse
                    ? MOCK_CARDS.map((card) => <LegacyMockCard key={card.pathway} card={card} best={bestScores[card.pathway]} />)
                    : otherCards.map((card) => <LegacyMockCard key={card.pathway} card={card} best={bestScores[card.pathway]} />)}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Recent results — completes the loop, MOCK_CENTRE_EXPERIENCE_BLUEPRINT.md */}
        {recentResults.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Mock History</h2>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
              {recentResults.map((r) => {
                const resultDestination = r.pathway === "csse" ? "/learning-intelligence/parent" : `/mocks/${r.pathway}`;
                return (
                  <Link key={r.id} href={resultDestination} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{r.pathwayName}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        r.totalScore >= 75 ? "text-green-600" : r.totalScore >= 55 ? "text-amber-600" : "text-red-500"
                      }`}
                    >
                      {r.totalScore}%
                    </span>
                    <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Info */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">About these mocks</h3>
          <ul className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            <li>• All questions are original, created exclusively for Angel 11+ practice</li>
            <li>• Each mock is timed per section, just like the real exam</li>
            <li>• Your results are saved and shown in the Parent Dashboard</li>
          </ul>
        </section>
      </div>
    </PageLayout>
  );
}
