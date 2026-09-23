"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Clock, Play, Target, TrendingUp } from "lucide-react";
import PageLayout from "@/components/PageLayout";
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
  /** A calm accent-stripe colour distinguishing exam boards at a glance -- deliberately not a filled card background. */
  badgeBg: string;
}[] = [
  {
    pathway: "gl",
    name: "GL Assessment",
    badge: "GL",
    totalMinutes: 35,
    badgeBg: "bg-blue-300",
  },
  {
    pathway: "cem",
    name: "CEM",
    badge: "CEM",
    totalMinutes: 30,
    badgeBg: "bg-slate-300",
  },
  {
    pathway: "iseb",
    name: "ISEB Pre-Test",
    badge: "ISEB",
    totalMinutes: 40,
    badgeBg: "bg-emerald-300",
  },
];

/**
 * Named, honest categories that don't exist as separate experiences yet —
 * MOCK_CENTRE_EXPERIENCE_BLUEPRINT.md §"Your Exam". Not clickable.
 *
 * Gate 6 presentation correction (Founder decision, Mathematics Mock 1
 * provenance investigation) — "Mathematics Mock" removed from this list:
 * as of migration 150 (Decision 219), Mathematics Mock 1 is genuinely
 * active and shown above as available, so listing it here as "coming
 * later" directly contradicted the card above it. "Full CSSE Mock
 * (English + Mathematics together)" added so a learner/parent can see,
 * explicitly, that today's available Mathematics Mock is not yet that
 * complete experience — the exact distinction the Founder required.
 *
 * Programme Completion Increment 016 — "English Mock" removed for the
 * identical reason: Reading Comprehension Mock 1 is now genuinely active
 * and shown above as its own card, so listing "English Mock" here would
 * repeat the exact contradiction already corrected for Mathematics.
 *
 * CSSE Two-Paper Mock, pre-activation completion pass (governing brief
 * §8) — "Full CSSE Mock (English + Mathematics together)" REMOVED from
 * this list. A real Complete CSSE Mock entry point now exists (the
 * CsseCompleteMockCard below, linking to /learning-intelligence/
 * mock-exam/sitting) rather than a bare promise — but it stays honestly
 * "Not ready yet" for as long as the English full paper form remains
 * active=false (unaffected by this pass, still the Founder's own
 * separate, later activation decision), so nothing here claims a
 * capability Angel cannot yet deliver.
 */
const COMING_LATER = ["Focused Assessment"];

/**
 * Programme Completion Increment 016 — per-attempt-type card metadata for
 * the two CSSE Mock forms this page can now discover and launch. `href`
 * carries the attempt_type the learner is choosing forward via the ?type=
 * query param (app/learning-intelligence/mock-exam/page.tsx's own
 * fail-safe validation) — Mathematics keeps its exact pre-existing bare
 * URL (no param at all), so every existing bookmark/link is unaffected.
 * `fallbackName`/`summary`/`description`/`minutesLabel` are static,
 * descriptive copy the active-form RPC does not itself return (it only
 * returns form_id/attempt_type/displayName) — not the source of truth for
 * NAME, which always comes from the backend's own displayName once
 * loaded, exactly like every other card on this page.
 */
const CSSE_MOCK_META: Record<"full_mock" | "timed_section", {
  fallbackName: string;
  summary: string;
  description: string;
  minutesLabel: string;
  href: string;
}> = {
  full_mock: {
    fallbackName: "Mathematics Mock 1",
    summary: "Mathematics · 21 questions · 56 marks · 60 minutes",
    description: "A real, timed Mathematics assessment, marked and reported just like the real exam. The complete CSSE Mock, with English and Mathematics together, is still being built.",
    minutesLabel: "60 min",
    // CSSE Two-Paper Mock, final production acceptance — a real, live P1
    // defect found during the final learner walkthrough: this href never
    // named its own subject, so once english-full-mock-v1 (a second
    // full_mock form) existed, /learning-intelligence/mock-exam's own
    // getActiveMockForm(supabase, "full_mock", undefined) call could
    // resolve to English instead of Mathematics -- the page's hardcoded
    // fallback title still read "Mathematics Mock 1" (English's own form
    // row has no displayName set), while its "previous attempt" lookup
    // correctly followed the REAL resolved (English) form_id, silently
    // surfacing the wrong subject's own attempt. Explicit subject removes
    // the ambiguity at its source, exactly like the dedicated English
    // discovery call below already does for its own subject.
    href: "/learning-intelligence/mock-exam?subject=mathematics",
  },
  timed_section: {
    fallbackName: "Reading Comprehension Mock 1",
    summary: "Reading Comprehension · 27 questions · 65 marks · 55 minutes",
    description: "A real, timed Reading Comprehension assessment across three passages, marked and reported just like a real sitting. The complete CSSE Mock, with Continuous Writing and Mathematics together, is still being built.",
    minutesLabel: "55 min",
    href: "/learning-intelligence/mock-exam?type=timed_section",
  },
};
const CSSE_ATTEMPT_TYPES = ["full_mock", "timed_section"] as const;

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
      accent={card.badgeBg}
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
 * prioritise). The pathway-prioritised "Mathematics Mock 1" card (used when
 * CSSE is the learner's own selected pathway) is deliberately its own,
 * richer treatment — not this component — since it is the primary card in
 * that case, not one of several equal options.
 */
function SimpleMockCard({
  badge, name, accent, minutesLabel, description, href, best, available = true,
}: {
  badge: string; name: string;
  /** A calm, minimal exam-board identifier — a thin left accent stripe, never a filled coloured card background (Mock is quiet assessment, not a gamified pathway picker). */
  accent: string;
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
    <div className="flex gap-4 rounded-lg border border-[var(--angel-border)] bg-[var(--angel-paper)] p-5">
      <div className={`w-1 rounded-full shrink-0 ${accent}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-bold text-[var(--angel-muted)] uppercase tracking-wide shrink-0">{badge}</span>
            <h3 className="text-base font-bold text-[var(--angel-navy)] truncate">{name}</h3>
          </div>
          <StatusIndicator
            tone={best !== undefined ? "success" : "neutral"}
            label={best !== undefined ? "Completed" : available ? "Available" : "Not ready yet"}
          />
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--angel-muted)] mb-2">
          <Clock size={13} />
          {minutesLabel}
        </div>
        <p className="text-xs text-[var(--angel-ink)] leading-relaxed mb-3 opacity-90">
          {available ? description : "A full mock is not available right now. Practice stays available in the meantime, and reflects the same real evidence."}
        </p>
        <div className="flex items-center justify-between">
          {best !== undefined ? (
            <span className="text-xs text-[var(--angel-muted)]">
              Best score: <span className="font-semibold text-[var(--angel-navy)]">{best}%</span>
            </span>
          ) : (
            <span className="text-xs text-[var(--angel-muted)]">Not attempted yet</span>
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
    </div>
  );
}

/**
 * Programme Completion Increment 016 — the rich, pathway-prioritised CSSE
 * card, factored out so it can be rendered once per discovered CSSE Mock
 * form (Mathematics full_mock, Reading timed_section) rather than
 * hardcoded to exactly one. Visual markup is byte-identical to the single
 * card this replaces — every className, every layout choice — only the
 * data driving it is now a parameter instead of module-scope state.
 */
function CsseRichMockCard({
  attemptType, displayName, available, best,
}: {
  attemptType: "full_mock" | "timed_section";
  displayName: string;
  available: boolean;
  best: number | undefined;
}) {
  const meta = CSSE_MOCK_META[attemptType];
  return (
    <div className="flex gap-4 rounded-lg border border-[var(--angel-border)] bg-[var(--angel-paper)] p-5">
      <div className="w-1 rounded-full shrink-0 bg-[var(--angel-blue)]" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-bold text-[var(--angel-blue)] uppercase tracking-wide shrink-0">CSSE</span>
            {/* Gate 6 presentation correction (Founder decision) — the
                active form is subject-pure, never a combined
                English+Mathematics paper. The heading must name what is
                actually being offered. Name comes from the real active
                form's own metadata (migration 214), not a hardcoded
                literal. */}
            <h3 className="text-base font-bold text-[var(--angel-navy)] truncate">{displayName}</h3>
          </div>
          <StatusIndicator tone={available ? "success" : "neutral"} label={available ? "Available" : "Not ready yet"} />
        </div>
        {available && <p className="text-xs text-[var(--angel-muted)] mb-2">{meta.summary}</p>}
        <p className="text-sm text-[var(--angel-ink)] leading-relaxed mb-3 opacity-90">
          {available
            ? meta.description
            : "A full mock is not available right now. Angel does not yet have a complete, reviewed set of exam questions to draw from. Practice stays available in the meantime, and reflects the same real evidence about how your child is progressing."}
        </p>
        <div className="flex items-center justify-between">
          {best !== undefined ? (
            <span className="text-xs text-[var(--angel-muted)]">
              Best score: <span className="font-semibold text-[var(--angel-navy)]">{best}%</span>
            </span>
          ) : (
            <span className="text-xs text-[var(--angel-muted)]">Not attempted yet</span>
          )}
          {available ? (
            <ButtonLink href={meta.href} variant="outline" size="sm" leftIcon={<Play size={14} />}>
              Start mock
            </ButtonLink>
          ) : (
            <ButtonLink href="/learning-intelligence/practice" variant="outline" size="sm">
              Go to Practice
            </ButtonLink>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * CSSE Two-Paper Mock, pre-activation completion pass (governing brief
 * §8) — the real, honestly-gated "Complete CSSE Mock" entry point.
 * Available only once BOTH the Mathematics full_mock form AND the
 * English full_mock form are active — computed live from the same
 * getActiveMockForm()/isMockFormAvailable() signal every other card on
 * this page already uses, never a hardcoded flag. Links to the new
 * two-paper sitting hub (app/learning-intelligence/mock-exam/sitting),
 * which does its own, independent per-paper availability check —
 * production activation is governed entirely by each form's own
 * `active` column, untouched by this card.
 */
function CsseCompleteMockCard({ available }: { available: boolean }) {
  return (
    <div className="flex gap-4 rounded-lg border border-[var(--angel-border)] bg-[var(--angel-paper)] p-5">
      <div className="w-1 rounded-full shrink-0 bg-[var(--angel-blue)]" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-bold text-[var(--angel-blue)] uppercase tracking-wide shrink-0">CSSE</span>
            <h3 className="text-base font-bold text-[var(--angel-navy)]">Complete CSSE Mock</h3>
          </div>
          <StatusIndicator tone={available ? "success" : "neutral"} label={available ? "Available" : "Not ready yet"} />
        </div>
        <p className="text-sm text-[var(--angel-ink)] leading-relaxed mb-3 opacity-90">
          {available
            ? "English and Mathematics, joined into one complete CSSE sitting. Each paper is its own separate, timed attempt."
            : "The Full English Paper is not available yet, so a complete two-paper CSSE sitting cannot be offered. The Reading Comprehension Mock and Mathematics Mock remain available on their own above."}
        </p>
        <div className="flex items-center justify-end">
          {available ? (
            <ButtonLink href="/learning-intelligence/mock-exam/sitting" variant="outline" size="sm" leftIcon={<Play size={14} />}>
              Go to your sitting
            </ButtonLink>
          ) : (
            <ButtonLink href="/learning-intelligence/practice" variant="outline" size="sm">
              Go to Practice
            </ButtonLink>
          )}
        </div>
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
  // Programme Completion Increment 016 — generalised from a single
  // full_mock-only boolean/name pair to one entry per discovered CSSE
  // Mock form, so this page can render Mathematics AND Reading as
  // distinct, correctly-named options instead of assuming exactly one.
  const [csseMocks, setCsseMocks] = useState<Record<"full_mock" | "timed_section", { available: boolean; displayName: string }>>({
    full_mock: { available: false, displayName: CSSE_MOCK_META.full_mock.fallbackName },
    timed_section: { available: false, displayName: CSSE_MOCK_META.timed_section.fallbackName },
  });
  // CSSE Two-Paper Mock, pre-activation completion pass — whether the
  // English full paper form is independently active. Starts false (the
  // real, current state as of this pass), becomes true automatically
  // once the Founder later activates english-full-mock-v1, with zero
  // further code change.
  const [englishFullMockAvailable, setEnglishFullMockAvailable] = useState(false);

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
      // Programme Completion Increment 016 — discover both CSSE Mock
      // forms in parallel, one getActiveMockForm() call per attempt_type
      // (the same authoritative RPC, unchanged, called twice instead of
      // once). A failure on one type never blocks the other — each
      // settles into its own, independent "not available" state.
      // CSSE Two-Paper Mock, final production acceptance — the full_mock
      // slot here has always been intended as this page's own Mathematics
      // discovery (see the dedicated, subject-scoped English call just
      // below), but never said so explicitly -- silently ambiguous once a
      // second full_mock form (English) existed. Naming it now closes the
      // same real defect fixed at this card's own href above.
      Promise.all(
        CSSE_ATTEMPT_TYPES.map((attemptType) =>
          getActiveMockForm(supabase, attemptType, attemptType === "full_mock" ? "mathematics" : undefined)
            .then((result) => ({
              attemptType,
              available: isMockFormAvailable(result),
              displayName: result.data?.displayName ?? undefined,
            }))
            .catch(() => ({ attemptType, available: false, displayName: undefined }))
        )
      ).then((entries) => {
        setCsseMocks((prev) => {
          const next = { ...prev };
          for (const entry of entries) {
            next[entry.attemptType] = {
              available: entry.available,
              displayName: entry.displayName ?? prev[entry.attemptType].displayName,
            };
          }
          return next;
        });
      });
      // CSSE Two-Paper Mock, pre-activation completion pass — a separate,
      // subject-scoped discovery call (english, full_mock), independent
      // of the Mathematics full_mock lookup above: today the two happen
      // to share one attempt_type, but they are two distinct forms
      // (migration 245's own subject-aware mock_get_active_form() fix),
      // so this must not be conflated with csseMocks.full_mock.
      getActiveMockForm(supabase, "full_mock", "english")
        .then((result) => setEnglishFullMockAvailable(isMockFormAvailable(result)))
        .catch(() => setEnglishFullMockAvailable(false));
    } else {
      setReadiness(null);
    }
  }, []);

  const isCsse = pathwayId === "csse";
  const otherCards = MOCK_CARDS.filter((c) => c.pathway !== pathwayId);
  const primaryLegacyCard = MOCK_CARDS.find((c) => c.pathway === pathwayId);
  // Programme Completion Increment 016 — "is there ANY mock Angel can
  // currently deliver," generalised from the old full_mock-only boolean.
  // Used only for the readiness banner's own honest fallback decision
  // (never repeat a "start a mock" CTA when nothing can be delivered).
  const anyCsseMockAvailable = csseMocks.full_mock.available || csseMocks.timed_section.available;
  // CSSE Two-Paper Mock, pre-activation completion pass — a Complete CSSE
  // Mock genuinely requires BOTH real papers to exist and be active, not
  // merely one of them.
  const completeCsseMockAvailable = englishFullMockAvailable && csseMocks.full_mock.available;

  return (
    <PageLayout breadcrumbs={[{ label: "Today", href: "/dashboard" }, { label: "Mock Centre" }]}>
      <div className="max-w-3xl mx-auto px-4 pb-16 pt-6 md:pt-8 space-y-8">
        <div>
          <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl leading-tight mb-2">Mock Centre</h1>
          <p className="text-[var(--angel-muted)] text-sm md:text-base max-w-xl">
            A quiet, formal check of your progress when you&apos;re ready. Angel uses your learning and practice
            evidence to help you decide when a mock will be useful.
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
          <div className="flex items-start gap-3 bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
            <Target size={18} className="text-[var(--angel-muted)] mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-[var(--angel-navy)]">{readinessDisplay(readiness).label}</p>
                <StatusIndicator tone={readinessDisplay(readiness).tone} label="Your mock readiness" />
              </div>
              <p className="text-xs text-[var(--angel-muted)] leading-relaxed mb-2">{readiness.assessment.explanation}</p>
              {readiness.assessment.nextAction.href === "/learning-intelligence/mock-exam" && !anyCsseMockAvailable ? (
                <Link href="/learning-intelligence/practice" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--angel-blue)] hover:underline">
                  <TrendingUp size={13} /> See practice areas →
                </Link>
              ) : (
                <Link href={readiness.assessment.nextAction.href} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--angel-blue)] hover:underline">
                  <TrendingUp size={13} /> {readiness.assessment.nextAction.label}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-lg px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            These are original practice papers created by Angel 11+. They are not affiliated with or endorsed by GL Assessment, CEM, CSSE, ISEB or any school.
          </p>
        </div>

        {/* YOUR EXAM — pathway-prioritised */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-[var(--angel-muted)] uppercase tracking-widest">Your Exam</h2>

          {isCsse ? (
            <>
              <CsseCompleteMockCard available={completeCsseMockAvailable} />
              {CSSE_ATTEMPT_TYPES.map((attemptType) => (
                <CsseRichMockCard
                  key={attemptType}
                  attemptType={attemptType}
                  displayName={csseMocks[attemptType].displayName}
                  available={csseMocks[attemptType].available}
                  // Both cards read bestScores.csse today — a known,
                  // disclosed limitation: MockResult/MockPathwayId has no
                  // slot distinguishing Mathematics from Reading within
                  // the single "csse" pathway bucket. Not fixed here
                  // (results/analytics data model, out of scope for
                  // discovery/launch wiring) — but for Reading
                  // specifically this is not misleading today: zero
                  // Reading attempts have ever existed before this
                  // increment, so "Not attempted yet" is genuinely
                  // correct, not merely a fallback.
                  best={attemptType === "full_mock" ? bestScores.csse : undefined}
                />
              ))}

              <div className="rounded-lg border border-[var(--angel-border)] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--angel-muted)] mb-1.5">Coming later</p>
                <ul className="text-xs text-[var(--angel-muted)] space-y-1">
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
              {/* Gate 6 presentation correction (Founder decision) — same
                  correction as the pathway-prioritised cards above: this
                  entry point must not claim a complete CSSE sitting.
                  Programme Completion Increment 016 — one SimpleMockCard
                  per discovered CSSE form, not just Mathematics. */}
              <CsseCompleteMockCard available={completeCsseMockAvailable} />
              {CSSE_ATTEMPT_TYPES.map((attemptType) => (
                <SimpleMockCard
                  key={attemptType}
                  badge="CSSE"
                  name={csseMocks[attemptType].displayName}
                  accent="bg-[var(--angel-blue)]"
                  minutesLabel={CSSE_MOCK_META[attemptType].minutesLabel}
                  description={CSSE_MOCK_META[attemptType].description}
                  href={CSSE_MOCK_META[attemptType].href}
                  best={attemptType === "full_mock" ? bestScores.csse : undefined}
                  available={csseMocks[attemptType].available}
                />
              ))}
              {MOCK_CARDS.map((card) => (
                <LegacyMockCard key={card.pathway} card={card} best={bestScores[card.pathway]} />
              ))}
            </div>
          )}

          {pathwayLoaded && pathwayId && (otherCards.length > 0 || isCsse) && (
            <div>
              <button
                onClick={() => setShowOtherPathways((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--angel-muted)] hover:text-[var(--angel-blue)]"
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
            <h2 className="text-xs font-bold text-[var(--angel-muted)] uppercase tracking-widest mb-3">Mock History</h2>
            <div className="bg-[var(--angel-paper)] rounded-lg border border-[var(--angel-border)] divide-y divide-[var(--angel-border)]">
              {recentResults.map((r) => {
                const resultDestination = r.pathway === "csse" ? "/learning-intelligence/parent" : `/mocks/${r.pathway}`;
                return (
                  <Link key={r.id} href={resultDestination} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--angel-navy)]">{r.pathwayName}</p>
                      <p className="text-xs text-[var(--angel-muted)]">
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
                    <ChevronRight size={14} className="text-[var(--angel-muted)] shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Info */}
        <section className="bg-[var(--angel-paper)] rounded-lg border border-[var(--angel-border)] p-5">
          <h3 className="text-sm font-semibold text-[var(--angel-navy)] mb-2">About these mocks</h3>
          <ul className="space-y-1.5 text-xs text-[var(--angel-muted)] leading-relaxed">
            <li>• All questions are original, created exclusively for Angel 11+ practice</li>
            <li>• Each mock is timed per section, just like the real exam</li>
            <li>• Your results are saved and shown in the Parent Dashboard</li>
          </ul>
        </section>
      </div>
    </PageLayout>
  );
}
