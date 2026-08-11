"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Target, Sparkles, ShieldAlert } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { withTimeout } from "@/lib/withTimeout";
import { getSelectedPathwayId, setSelectedPathway } from "@/lib/progress";
import { recordPresentation, recordOutcome } from "@/lib/ali/history";
import {
  getRecommendations,
  getEducationalIntelligence,
  processEvidenceForCompetency,
  type EducationalIntelligenceSnapshot,
} from "@/lib/learningEngine/educationalIntelligenceService";
import { generatePersonalisedSession, type FamilyFocusSessionInfo } from "@/lib/learningEngine/sessionGenerator";
import { generateExplanation } from "@/lib/ali/explainability";
import { competencyLabel } from "@/lib/ali/labels";
import { COMPETENCIES, QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";
import { checkMathsAnswer } from "@/lib/learningEngine/practiceContent";
import {
  fetchFamilyFocusSelection,
  saveFamilyFocusSelection,
  removeFamilyFocusSelection,
} from "@/lib/ali/persistence/familyFocusStore";
import type { FamilyFocusSelection } from "@/types/ali/familyFocus";
import type { CompetencyId, QuestionTypeId } from "@/lib/learningEngine/types";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { RecommendationCandidate } from "@/types/ali/recommendationOrchestration";
import type { MathsQuestion } from "@/types/index";

/**
 * Family Choice Pilot — controlled implementation increment
 * (FAMILY_CHOICE_PILOT_IMPLEMENTATION_REPORT.md). Proves the smallest real,
 * working version of "Angel Recommends + Family Chooses + Angel Adapts +
 * Mastery is Protected" for exactly one competency: MR-01 (Arithmetic
 * Calculation) — selected per this pilot's own evidence review as the
 * safest available (most content, no evidence gate, already live in the
 * Mathematics practice area).
 *
 * Isolated route, matching this project's established convention (mock-exam
 * / founder-validation/csse both kept separate from the live routes they
 * reuse infrastructure from) — the live Practice pages
 * (app/learning-intelligence/practice/[area]/page.tsx) are completely
 * untouched by this file; they call generatePersonalisedSession() without
 * the new familyFocusCompetencyId parameter and behave exactly as before.
 *
 * Every mechanism this page uses is real and already live: getRecommendations
 * (Tier 0-3 orchestration, unmodified), generateExplanation (unmodified),
 * generatePersonalisedSession's new choice-injection point (this pilot's
 * only new selection-affecting code), recordPresentation/recordOutcome/
 * processEvidenceForCompetency (the same Educational Intelligence evidence
 * pipeline every Practice session uses). Nothing here fabricates evidence,
 * bypasses wellbeing, or invents a recommendation.
 */

const PILOT_COMPETENCY: CompetencyId = "MR-01";
const PILOT_LABEL = competencyLabel(PILOT_COMPETENCY);
const MATHS_COMPETENCY_IDS = (Object.keys(COMPETENCIES) as CompetencyId[]).filter(
  (id) => COMPETENCIES[id].component === "Mathematics"
);

type Mode = "intro" | "loading" | "ready" | "session" | "results" | "error";

interface AngelView {
  ordered: RecommendationCandidate[];
  vetoedCompetencyCodes: string[];
  topExplanation: string | null;
  pilotCandidate: RecommendationCandidate | null;
  pilotExplanation: string | null;
}

export default function FamilyChoicePilotPage() {
  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [angelView, setAngelView] = useState<AngelView | null>(null);
  const [focusSelection, setFocusSelection] = useState<FamilyFocusSelection | null>(null);
  const [busy, setBusy] = useState(false);

  const [activities, setActivities] = useState<BankQuestion[]>([]);
  const [explanations, setExplanations] = useState<Map<string, string>>(new Map());
  const [familyFocusInfo, setFamilyFocusInfo] = useState<FamilyFocusSessionInfo | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [pilotCompetencyCount, setPilotCompetencyCount] = useState(0);

  const profileIdRef = useRef<string>("");
  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient>>(null);
  const sessionIdRef = useRef<string>("");
  const preSessionSnapshotsRef = useRef<Map<CompetencyId, EducationalIntelligenceSnapshot>>(new Map());

  async function loadPage() {
    setMode("loading");
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("no client");
      supabaseRef.current = supabase;

      const profileId = await withTimeout(ensureProfile(), 10000, "your profile");
      if (!profileId) throw new Error("no profile");
      profileIdRef.current = profileId;

      if (getSelectedPathwayId() !== "csse") setSelectedPathway("csse");

      const [result, selection] = await Promise.all([
        withTimeout(
          getRecommendations(supabase, profileId, MATHS_COMPETENCY_IDS, new Date()),
          10000,
          "Angel's current recommendation"
        ),
        withTimeout(fetchFamilyFocusSelection(supabase, profileId), 10000, "your saved focus"),
      ]);

      const topCandidate = result.ordered[0] ?? null;
      const pilotCandidate = result.ordered.find((c) => c.competencyCode === PILOT_COMPETENCY) ?? null;

      setAngelView({
        ordered: result.ordered,
        vetoedCompetencyCodes: result.vetoedCompetencyCodes,
        topExplanation: topCandidate ? generateExplanation(topCandidate, "parent").text : null,
        pilotCandidate,
        pilotExplanation: pilotCandidate ? generateExplanation(pilotCandidate, "parent").text : null,
      });
      setFocusSelection(selection);
      setMode("ready");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setMode("error");
    }
  }

  async function chooseFocus() {
    const supabase = supabaseRef.current;
    if (!supabase || !profileIdRef.current) return;
    setBusy(true);
    const ok = await saveFamilyFocusSelection(supabase, profileIdRef.current, PILOT_COMPETENCY);
    if (ok) {
      const fresh = await fetchFamilyFocusSelection(supabase, profileIdRef.current);
      setFocusSelection(fresh);
    }
    setBusy(false);
  }

  async function removeFocus() {
    const supabase = supabaseRef.current;
    if (!supabase || !profileIdRef.current) return;
    setBusy(true);
    const ok = await removeFamilyFocusSelection(supabase, profileIdRef.current);
    if (ok) {
      const fresh = await fetchFamilyFocusSelection(supabase, profileIdRef.current);
      setFocusSelection(fresh);
    }
    setBusy(false);
  }

  async function startSession() {
    const supabase = supabaseRef.current;
    if (!supabase || !profileIdRef.current) return;
    setMode("loading");
    sessionIdRef.current = `family-choice-pilot-${Date.now()}`;
    try {
      const activeFocus = focusSelection?.active ? (focusSelection.competencyCode as CompetencyId) : undefined;
      const session = await withTimeout(
        generatePersonalisedSession(supabase, profileIdRef.current, "mathematics", new Date(), activeFocus),
        10000,
        "today's focused session"
      );
      const tagged = session.activities.map((a) => a.question);
      if (tagged.length === 0) throw new Error(session.summary);

      setExplanations(new Map(session.activities.map((a) => [a.question.id, a.explanation])));
      setFamilyFocusInfo(session.familyFocus);
      setPilotCompetencyCount(
        tagged.filter((q) => QUESTION_TYPE_PRIMARY_COMPETENCY[q.skill as QuestionTypeId] === PILOT_COMPETENCY).length
      );

      const competencyIdsThisSession = new Set(
        tagged
          .map((q) => QUESTION_TYPE_PRIMARY_COMPETENCY[q.skill as QuestionTypeId])
          .filter((id): id is CompetencyId => Boolean(id))
      );
      preSessionSnapshotsRef.current = new Map(
        await Promise.all(
          Array.from(competencyIdsThisSession).map(
            async (id) => [id, await getEducationalIntelligence(supabase, profileIdRef.current, id)] as const
          )
        )
      );

      await withTimeout(
        recordPresentation(supabase, profileIdRef.current, tagged.map((q) => q.id), "family_choice_pilot"),
        10000,
        "starting your session"
      );

      setActivities(tagged);
      setIndex(0);
      setCorrectCount(0);
      setAnswer("");
      setSubmitted(false);
      setLastCorrect(null);
      setMode("session");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setMode("error");
    }
  }

  const current = activities[index];

  async function submit() {
    if (!current) return;
    const q = current.prompt as MathsQuestion;
    const isCorrect = checkMathsAnswer(answer, String(q.answer));
    setLastCorrect(isCorrect);
    setSubmitted(true);
    if (isCorrect) setCorrectCount((c) => c + 1);

    const supabase = supabaseRef.current;
    if (supabase && profileIdRef.current) {
      const competencyId = QUESTION_TYPE_PRIMARY_COMPETENCY[current.skill as QuestionTypeId];
      let preAttemptSnapshot: EducationalIntelligenceSnapshot | null = null;
      if (competencyId) {
        const cached = preSessionSnapshotsRef.current.get(competencyId);
        if (cached) {
          preAttemptSnapshot = cached;
          preSessionSnapshotsRef.current.delete(competencyId);
        } else {
          preAttemptSnapshot = await getEducationalIntelligence(supabase, profileIdRef.current, competencyId).catch(
            () => null
          );
        }
      }

      await recordOutcome(
        supabase,
        profileIdRef.current,
        current.id,
        isCorrect,
        sessionIdRef.current,
        current.masteryThreshold
      ).catch(() => {});

      if (competencyId && preAttemptSnapshot) {
        processEvidenceForCompetency(supabase, profileIdRef.current, competencyId, preAttemptSnapshot, isCorrect).catch(
          () => {}
        );
      }
    }
  }

  function next() {
    if (index + 1 < activities.length) {
      setIndex((i) => i + 1);
      setAnswer("");
      setSubmitted(false);
      setLastCorrect(null);
      return;
    }
    setMode("results");
  }

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Learning Report", href: "/learning-intelligence" },
        { label: "Family Choice Pilot" },
      ]}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Family Choice Pilot</h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          A controlled, single-competency pilot: Angel keeps recommending from real evidence — you can also choose{" "}
          {PILOT_LABEL} as an active focus, and see both, side by side.
        </p>

        {mode === "intro" && (
          <InfoCard className="mt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              This loads Angel&apos;s real, evidence-based recommendation for Mathematics, and your saved focus choice
              if you have one.
            </p>
            <button
              onClick={() => void loadPage()}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              View my recommendation & choose a focus
            </button>
          </InfoCard>
        )}

        {mode === "loading" && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">
            Loading…
          </p>
        )}

        {mode === "error" && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Something went wrong</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{errorMessage}</p>
            <button
              onClick={() => void loadPage()}
              className="mt-4 text-xs font-semibold text-purple-600 dark:text-purple-400"
            >
              Try again
            </button>
          </InfoCard>
        )}

        {mode === "ready" && angelView && (
          <div className="space-y-5 mt-6">
            <InfoCard>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-purple-500" />
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Angel Recommends</p>
              </div>
              {angelView.topExplanation ? (
                <p className="text-sm text-gray-700 dark:text-gray-300">{angelView.topExplanation}</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No specific priority right now — every Mathematics competency is either mastered or has no evidence
                  yet.
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                {angelView.pilotCandidate
                  ? `${PILOT_LABEL} specifically: ${angelView.pilotExplanation}`
                  : `${PILOT_LABEL} specifically: not currently flagged by Angel (already strong, or not yet attempted enough to say).`}
              </p>
              {angelView.vetoedCompetencyCodes.includes(PILOT_COMPETENCY) && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
                  <ShieldAlert size={13} /> Wellbeing pacing is currently active for {PILOT_LABEL} — extra push-practice
                  is paused regardless of any choice below.
                </p>
              )}
            </InfoCard>

            <InfoCard>
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-emerald-500" />
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">My Chosen Focus</p>
              </div>
              {focusSelection?.active ? (
                <>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You chose <strong>{PILOT_LABEL}</strong> as your focus on{" "}
                    {new Date(focusSelection.selectedAt).toLocaleDateString()}.
                  </p>
                  <button
                    onClick={removeFocus}
                    disabled={busy}
                    className="mt-3 text-xs font-semibold text-gray-500 dark:text-gray-400 disabled:opacity-40"
                  >
                    Remove focus
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No focus chosen — practice sessions follow Angel&apos;s recommendation only.
                  </p>
                  <button
                    onClick={chooseFocus}
                    disabled={busy}
                    className="mt-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    Focus on {PILOT_LABEL}
                  </button>
                </>
              )}
            </InfoCard>

            <button
              onClick={startSession}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Start Mathematics practice session
            </button>
          </div>
        )}

        {mode === "session" && current && (
          <div className="mt-6">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Question {index + 1} of {activities.length} · {current.skill}
            </p>
            {index === 0 && familyFocusInfo && (
              <InfoCard className="mt-2 mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {familyFocusInfo.applied
                    ? `Your chosen focus (${familyFocusInfo.label}) is active in this session, alongside Angel's own evidence-led selection.`
                    : familyFocusInfo.wellbeingPaused
                    ? `Your chosen focus (${familyFocusInfo.label}) is currently paused by wellbeing pacing — this session follows Angel's own selection only.`
                    : `Your chosen focus (${familyFocusInfo.label}) had no eligible questions to add this session — Angel's own selection is shown.`}
                </p>
              </InfoCard>
            )}
            {explanations.get(current.id) && (
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 mb-3">{explanations.get(current.id)}</p>
            )}
            <InfoCard className="mt-3">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {(current.prompt as MathsQuestion).question}
              </p>
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitted}
                className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                placeholder="Your answer…"
              />
              {!submitted ? (
                <button
                  onClick={submit}
                  disabled={!answer.trim()}
                  className="mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Submit
                </button>
              ) : (
                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                    {lastCorrect ? (
                      <>
                        <CheckCircle2 size={16} className="text-emerald-500" /> Correct
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-amber-500" /> Not quite
                      </>
                    )}
                  </span>
                  <button
                    onClick={next}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    {index + 1 === activities.length ? "See results" : "Next"} <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </InfoCard>
          </div>
        )}

        {mode === "results" && (
          <div className="mt-6 space-y-4">
            <InfoCard className="text-center">
              <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Session complete — {correctCount} of {activities.length} correct
              </p>
            </InfoCard>
            <InfoCard>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Session composition (evidence, not marketing)</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {pilotCompetencyCount} of {activities.length} questions this session were {PILOT_LABEL}.
              </p>
              {familyFocusInfo && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  familyFocus.applied = {String(familyFocusInfo.applied)}, wellbeingPaused ={" "}
                  {String(familyFocusInfo.wellbeingPaused)}
                </p>
              )}
            </InfoCard>
            <div className="flex items-center gap-4">
              <button
                onClick={() => void loadPage()}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Back to focus choice
              </button>
              <Link href="/learning-intelligence" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Full learning report →
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
