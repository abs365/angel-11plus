"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Target, CheckCircle } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PathwayCard, { PATHWAY_COLOR_MAP } from "@/components/PathwayCard";
import PathwaySwitchConfirmDialog from "@/components/PathwaySwitchConfirmDialog";
import { ReadinessIndicator } from "@/components/ui/Progress";
import { PATHWAYS, getPathwayById } from "@/lib/pathways";
import { getEligibleSubjectKeys } from "@/lib/ali/pathwayEligibility";
import { isRealPathway, switchActivePathway, type RealPathwayId } from "@/lib/activePathway";
import type { SubjectKey } from "@/types/analytics";
import type { Pathway } from "@/types/pathway";
import {
  getSelectedPathwayId,
  setSelectedPathway,
  getTargetExamDate,
  setTargetExamDate,
  getTargetExamDateProvenance,
  getSchoolYear,
  setSchoolYear,
  getProgress,
} from "@/lib/progress";
import { computeAnalytics } from "@/lib/analytics";
import { computeGamification } from "@/lib/gamification";
import { computeParentReport, READINESS_CONFIG } from "@/lib/parentInsights";
import type { ParentReport } from "@/types/parent";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { computeSubjectPreparationSummary } from "@/lib/learningEngine/preparationState";
import { derivePreparationStage, stagePrinciple, type SchoolYear } from "@/lib/learningEngine/preparationStage";
import { resolvePreparationClock } from "@/lib/learningEngine/preparationClock";
import { CSSE_EXAM_AUTHORITY_NAME, getCurrentCsseFacts, CSSE_EVIDENCE_LAST_VERIFIED } from "@/lib/examIntelligence/csseEvidence";

/**
 * Angel V2.0 Sprint 7 (School Intelligence Experience) — this is the
 * existing "School Intelligence" nav entry (components/Navigation.tsx
 * already points here; renamed from "Target Schools" in EEP-001). No
 * separate "school" entity exists anywhere in this
 * codebase — only a Pathway (exam board format: GL/CEM/CSSE/ISEB/
 * Independent/Core Foundation/Not Sure), per lib/pathways.ts's own data
 * model. The Target School Overview below is built entirely from that
 * real pathway data plus real, already-computed learner reports
 * (computeParentReport, getEligibleSubjectKeys) — never a fabricated
 * school name or invented readiness metric. This sprint enriches the
 * existing selector page in place (same precedent as Sprints 5/6) rather
 * than creating a second, competing route; the selector itself (cards,
 * exam-date form) is functionally unchanged.
 */
export default function PathwaysPage() {
  const [selected, setSelected] = useState<string | undefined>();
  const [examDate, setExamDate] = useState("");
  const [examDateError, setExamDateError] = useState<string | undefined>();
  const [examDateSaved, setExamDateSaved] = useState(false);
  const [examDateProvenance, setExamDateProvenance] = useState<"official" | "parent_supplied" | "estimated" | "unknown">("unknown");
  const [schoolYear, setSchoolYearState] = useState<SchoolYear | "">("");
  const [schoolYearSaved, setSchoolYearSaved] = useState(false);
  const [parentReport, setParentReport] = useState<ParentReport | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Pathway | null>(null);
  // Programme Increment 008B — Exam Information card. undefined = not yet
  // computed/no real evidence reachable; a real value only ever comes from
  // resolvePreparationClock()/derivePreparationStage(), never invented.
  const [preparationClock, setPreparationClock] = useState<ReturnType<typeof resolvePreparationClock> | null>(null);
  const [preparationStagePrinciple, setPreparationStagePrinciple] = useState<string | null>(null);

  useEffect(() => {
    setSelected(getSelectedPathwayId());
    setExamDate(getTargetExamDate() ?? "");
    setExamDateProvenance(getTargetExamDateProvenance());
    setSchoolYearState(getSchoolYear() ?? "");

    const p = getProgress();
    const r = computeAnalytics(p);
    const gamification = computeGamification(p);
    setParentReport(computeParentReport(p, r, gamification));

    setPreparationClock(resolvePreparationClock(new Date()));

    // Programme Increment 008B, Part 7 — the Exam Information card's stage
    // principle. Reuses the exact same real-evidence composition dashboard
    // page.tsx's own CSSE-only effect already uses (Decision 78/79) — no
    // new engine, no new mastery/confidence logic. Bounded to CSSE, since
    // that is the only pathway with real evidence today (008A/008B's own
    // explicit scope).
    if (p.selectedPathwayId === "csse") {
      const supabase = getSupabaseClient();
      if (supabase) {
        (async () => {
          const profileId = await ensureProfile();
          if (!profileId) return;
          const [writingSummary, mathsSummary, englishSummary] = await Promise.all([
            computeSubjectPreparationSummary(supabase, profileId, "Continuous Writing"),
            computeSubjectPreparationSummary(supabase, profileId, "Mathematics"),
            computeSubjectPreparationSummary(supabase, profileId, "English Comprehension"),
          ]);
          const stage = derivePreparationStage(
            [writingSummary, mathsSummary, englishSummary],
            resolvePreparationClock(new Date()),
            p.schoolYear
          );
          setPreparationStagePrinciple(stagePrinciple(stage));
        })().catch(() => {
          // Real evidence unreachable (offline, RLS, etc.) -- fail open,
          // the card simply omits the stage-principle line below.
        });
      }
    }
  }, []);

  /**
   * Active Pathway Context (Section 6): a switch away from an existing
   * real pathway to a different real pathway must be deliberate, not a
   * single click. Picking Core Foundation/Not Sure, or a first choice with
   * no real pathway active yet, applies immediately — there is nothing to
   * lose either way.
   */
  function handleSelect(id: string) {
    const isRealSwitch = isRealPathway(selected) && isRealPathway(id) && id !== selected;
    if (isRealSwitch) {
      const target = getPathwayById(id);
      if (target) {
        setConfirmTarget(target);
        return;
      }
    }
    applySelection(id);
  }

  async function applySelection(id: string) {
    setSelected(id);
    if (isRealPathway(id)) {
      // Awaited (capped at 1.5s inside switchActivePathway): a fire-and-
      // forget write here raced the reload below and always lost, confirmed
      // directly against the database (see PathwaySwitcher.tsx).
      await switchActivePathway(id as RealPathwayId);
    } else {
      setSelectedPathway(id);
    }
    // Full reload, not router.push: Navigation.tsx's useCssePathway() reads
    // the pathway once on mount only, since it is a persistent layout
    // component that never remounts on a client-side route change. A soft
    // push leaves Learn/Practise nav links stale until the next full
    // reload (confirmed by direct testing, same fix as PathwaySwitcher).
    window.location.href = "/dashboard";
  }

  function handleExamDateSave() {
    if (!examDate) return;
    const result = setTargetExamDate(examDate);
    if (!result.success) {
      setExamDateError(result.error);
      setExamDateSaved(false);
      return;
    }
    setExamDateError(undefined);
    setExamDateSaved(true);
    setExamDateProvenance(getTargetExamDateProvenance());
  }

  function handleSchoolYearSave(year: SchoolYear) {
    const result = setSchoolYear(year);
    if (result.success) {
      setSchoolYearState(year);
      setSchoolYearSaved(true);
    }
  }

  const targetPathway = selected ? getPathwayById(selected) : undefined;
  const colors = targetPathway ? PATHWAY_COLOR_MAP[targetPathway.accentColor] ?? PATHWAY_COLOR_MAP.gray : undefined;

  // Preparation Priorities — reuses computeParentReport()'s existing
  // focusAreas exactly as built (no new prioritisation), filtered to the
  // competencies this pathway actually assesses via the real Stage-0
  // eligibility filter the recommendation engine itself uses
  // (lib/ali/pathwayEligibility.ts, unmodified).
  const eligibleKeys = targetPathway ? getEligibleSubjectKeys(targetPathway.id) : undefined;
  const pathwayFocusAreas = parentReport && eligibleKeys
    ? parentReport.focusAreas.filter((area) => eligibleKeys.has(area.href.replace("/", "") as SubjectKey))
    : [];

  return (
    <PageLayout breadcrumbs={[{ label: "My Admission Journey", href: "/dashboard" }, { label: "School Intelligence" }]}>
      <main className="max-w-2xl mx-auto px-4 pb-16 pt-6 md:pt-8">
        {/* Intro */}
        <div className="mb-6">
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-1">School Intelligence</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
            Your target exam pathway, what it assesses, and how today&apos;s preparation connects to it.
          </p>
        </div>

        {/* Target School Overview (Sprint 7) */}
        {targetPathway && colors ? (
          <div className={`rounded-2xl border-2 ${colors.border} bg-white dark:bg-gray-900 p-5 mb-8 space-y-5`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{targetPathway.name}</h2>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                    {targetPathway.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Your current target pathway</p>
              </div>
              <CheckCircle size={20} className={`shrink-0 mt-0.5 ${colors.check}`} />
            </div>

            {/* Assessment pathway */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
                Assessment Pathway
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{targetPathway.examFormatNotes}</p>
            </div>

            {/* Relevant competencies */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
                Relevant Competencies
              </p>
              <div className="flex flex-wrap gap-1.5">
                {targetPathway.subjects.map((s) => (
                  <span
                    key={s}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} text-gray-700 dark:text-gray-300`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Current readiness — reuses the exact same ReadinessIndicator
                and computeParentReport().examReadiness as the Dashboard;
                never a second readiness calculation. */}
            {parentReport && parentReport.hasEnoughData ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
                  Current Readiness
                </p>
                <ReadinessIndicator readiness={parentReport.examReadiness} />
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
                  Current Readiness
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Not enough practice sessions yet to show a readiness signal. This will appear once you&apos;ve completed a few sessions.
                </p>
              </div>
            )}

            {/* Preparation priorities */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
                Preparation Priorities
              </p>
              {pathwayFocusAreas.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {pathwayFocusAreas.map((area) => (
                    <Link
                      key={area.label}
                      href={area.href}
                      className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-3.5 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{area.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{area.detail}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 shrink-0">{area.frequency}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No pathway-specific priority areas right now. Keep up your regular practice.
                </p>
              )}
            </div>

            {/* Admission guidance — reuses this pathway's own real
                description plus the real readiness-band description
                (READINESS_CONFIG, unmodified); never a generated
                recommendation. */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
                Admission Guidance
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {targetPathway.description}
                {parentReport?.hasEnoughData && (
                  <> {READINESS_CONFIG[parentReport.examReadiness].description}</>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 mb-8 text-center">
            <Target size={22} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">No target pathway selected yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto leading-relaxed">
              Choose the exam pathway that matches your target school below to see its School Intelligence overview.
            </p>
          </div>
        )}

        {/* Pathway selector — unchanged functionality */}
        <div className="mb-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-900 flex items-center justify-center shrink-0">
            <MapPin size={18} className="text-sky-700 dark:text-sky-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Choose Your Pathway</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              Select the exam pathway that matches your target school. This helps us tailor your practice sessions. You can change it at any time.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {PATHWAYS.map((pathway) => (
            <PathwayCard
              key={pathway.id}
              pathway={pathway}
              selected={selected === pathway.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Target exam date — optional, WP-09 (EAW-004 §2.1) */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Know your exam date? (optional)
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
            If you already know the date, adding it helps us fine-tune practice as it gets closer. Not sure yet? Skip this: you can add it any time.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={examDate}
              onChange={(e) => {
                setExamDate(e.target.value);
                setExamDateSaved(false);
              }}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={handleExamDateSave}
              disabled={!examDate}
              className="text-sm font-semibold text-sky-700 dark:text-sky-400 px-3 py-2 rounded-lg border border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
            {examDateSaved && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved</span>
            )}
          </div>
          {examDateError && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">{examDateError}</p>
          )}
          {examDate && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
              {examDateProvenance === "official"
                ? "According to current official guidance."
                : "This is the date you told us, not yet confirmed by an official source."}
            </p>
          )}
        </div>

        {/* School year — optional, Programme Increment 008B */}
        <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            What school year are they in now? (optional)
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
            This helps us pace preparation appropriately. It never changes what your child has demonstrably learned. Not sure yet? Skip this too.
          </p>
          <div className="flex flex-wrap gap-2">
            {(["Year 4", "Year 5", "Year 6"] as const).map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => handleSchoolYearSave(year)}
                className={`text-sm font-semibold px-3 py-2 rounded-lg border transition-colors ${
                  schoolYear === year
                    ? "border-sky-400 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
          {schoolYearSaved && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium mt-2 inline-block">Saved</span>
          )}
        </div>

        {/* Exam Information — Programme Increment 008B */}
        {targetPathway?.id === "csse" && (
          <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Exam Information</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                What we currently know about the {CSSE_EXAM_AUTHORITY_NAME} exam, and what that means for preparation right now.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
                Time remaining
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {preparationClock?.daysRemaining != null
                  ? `Approximately ${preparationClock.weeksRemaining} weeks (${preparationClock.daysRemaining} days) until your exam date.`
                  : "Add your exam date above to see time remaining."}
              </p>
            </div>

            {preparationStagePrinciple && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
                  Current focus
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{preparationStagePrinciple}</p>
              </div>
            )}

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
                According to current CSSE guidance
              </p>
              <ul className="space-y-1.5">
                {getCurrentCsseFacts().map((fact) => (
                  <li key={fact.id} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {fact.detail}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                Last verified {CSSE_EVIDENCE_LAST_VERIFIED}. This is official exam information, not Angel 11+ preparation guidance.
              </p>
            </div>
          </div>
        )}

        {/* Legal disclaimer */}
        <p className="mt-8 text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed px-4">
          Angel 11+ provides original exam-style practice content and is not affiliated with or endorsed by GL Assessment, CEM, CSSE, ISEB, or any school or exam board.
        </p>
      </main>

      {confirmTarget && targetPathway && (
        <PathwaySwitchConfirmDialog
          from={targetPathway}
          to={confirmTarget}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={() => {
            applySelection(confirmTarget.id);
            setConfirmTarget(null);
          }}
        />
      )}
    </PageLayout>
  );
}
