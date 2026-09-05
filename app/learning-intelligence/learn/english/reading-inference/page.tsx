"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, AlertTriangle, Target } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { withTimeout } from "@/lib/withTimeout";
import { getSelectedPathwayId, setSelectedPathway } from "@/lib/progress";
import { fetchQuestionBank } from "@/lib/ali/questionBank";
import { recordPresentation, recordOutcome } from "@/lib/ali/history";
import {
  getEducationalIntelligence,
  processEvidenceForCompetency,
  type EducationalIntelligenceSnapshot,
} from "@/lib/learningEngine/educationalIntelligenceService";
import { checkAcceptedAnswerSet, checkQuotationPresent } from "@/lib/learningEngine/englishAnswerValidation";
import { realEvidenceLabel } from "@/lib/learningEngine/progressionLabel";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { EnglishComprehensionPrompt } from "@/types/ali/questionBank";

/**
 * Programme Increment 024 — "What the Text Doesn't Quite Say" (RC-02,
 * Inference and Justified Interpretation — Assessment Brain V1 §3/§9,
 * QT-RC-02/05/10). Angel's second English Reading full lesson, extending
 * the twice-proven MODEL/GUIDED/INDEPENDENT/REFLECT pattern (Increments
 * 020, 022) to a genuinely different, higher-risk reasoning skill.
 *
 * RC-02 selected per Increment 023's own programme-completion review:
 * second-largest real Reading footprint (47 practice-eligible rows
 * across 22 passages, spanning three real families -- wave1-fam-motive-
 * inference, wave1-fam-quote-explain, and the QT-RC-10 word-choice/
 * atmosphere families), and the richest existing reactive-support base
 * of any untaught Reading competency. Requires zero new question-bank
 * content -- every real item below is already `practice_eligible`,
 * confirmed by direct production query before this lesson was written.
 *
 * DELIBERATELY NOT a keyword-matching or answer-pattern lesson (the
 * Founder's own explicit, elevated concern for inference specifically,
 * versus RC-01's literal retrieval): the taught method is
 * evidence -> reasoning -> justified conclusion, with an explicit,
 * modelled REJECTION of a tempting but unsupported guess, and an
 * explicit FACT / REASONABLE INFERENCE / UNSUPPORTED GUESS distinction
 * threaded through EXPLAIN, MODEL, and COMMON MISTAKES.
 *
 * GUIDED reuses TIER3_QUOTATION_PLUS_EXPLANATION's real, existing
 * self-assessment architecture (checkQuotationPresent + learner self-
 * comparison against a model answer) -- the SAME mechanism
 * app/learning-intelligence/practice/[area]/page.tsx already uses for
 * this exact validation tier, never a second scoring path invented for
 * this lesson. INDEPENDENT/fresh-retry/STRETCH deliberately use a
 * DIFFERENT real family (wave1-fam-motive-inference / QT-RC-10) than
 * GUIDED's (wave1-fam-quote-explain) -- a genuinely different surface
 * question shape testing the SAME underlying reasoning process, the
 * clearest available proof of transfer rather than memorised procedure,
 * and each is TIER2_ACCEPTED_SET (cleanly auto-gradable, matching RC-01's
 * own clean pass/fail pattern for those stages).
 *
 * Five real passages used across the whole lesson (Last Bus / New Girl /
 * Letter to Nana / Empty Classroom), zero overlap with each other and
 * zero overlap with RC-01's own three (New Trainers / Baker's Apprentice
 * / Storm at the Harbour) -- confirmed deliberately when selecting this
 * content, not incidental.
 *
 * No architecture terms (RC-02, QT-RC-02/05/10, TIER3, Assessment Brain)
 * are shown to the learner anywhere below -- only in code comments.
 */

const COMPETENCY_ID = "RC-02" as const;

type Mode = "intro" | "loading" | "error" | "lesson";
type CheckStage = "not-started" | "guided" | "independent" | "done";
type IndependentLadderStage = "attempt-1" | "attempt-2" | "remediation" | "resolved";

interface KnownWrongPattern {
  matches: (answer: string) => boolean;
  explanation: string;
}

/**
 * Hand-verified wrong-answer classification, same bounded discipline as
 * every prior lesson's own classifyWrongAnswer() -- real, plausible
 * inference errors from the actual passage text, never a generic
 * heuristic.
 */
const NEWGIRL_WRONG_PATTERNS: KnownWrongPattern[] = [
  {
    matches: (a) => /shy|quiet|scared|nervous(?!.*belong)/i.test(a) && !/belong|ordinary|singled out|accept/i.test(a),
    explanation:
      "That describes how Priya might generally feel, but the question asks specifically why THIS particular moment -- nobody asking where she was from -- felt like enough. Look again at what not being asked actually let her avoid.",
  },
];

const LETTER_WRONG_PATTERNS: KnownWrongPattern[] = [
  {
    matches: (a) => /kind|nice|helpful(?!.*mean)/i.test(a) && !/mean|realis|understat/i.test(a),
    explanation:
      "That's true of the woman's action itself, but the question asks why she 'appreciated more than she probably realised' -- what does that specific phrase suggest about the GAP between how big the kindness felt to Dara and how big the woman herself thought it was?",
  },
];

const EMPTYCLASSROOM_WRONG_PATTERNS: KnownWrongPattern[] = [
  {
    matches: (a) => /quiet|silent(?!.*suspense|.*tension|.*build)/i.test(a) && !/suspense|tension|build|delay|hesitat|reveal/i.test(a),
    explanation:
      "Just naming that it's quiet restates the detail rather than explaining its EFFECT. Think about what ending on silence, right before she turns the envelope over, does to how a reader feels in that moment.",
  },
];

function classifyWrongAnswer(userAnswer: string, patterns: KnownWrongPattern[]): string | null {
  return patterns.find((p) => p.matches(userAnswer))?.explanation ?? null;
}

function progressionLabel(
  checkStage: CheckStage,
  educationalState: EducationalIntelligenceSnapshot["educationalState"] | undefined
): { label: string; description: string } {
  if (checkStage === "not-started" && (educationalState === undefined || educationalState === "exploring")) {
    return { label: "Learning", description: "Working through the lesson." };
  }
  if (checkStage === "guided") {
    return { label: "Ready to practise", description: "The guided step is done. Next is trying one alone." };
  }
  return realEvidenceLabel(educationalState);
}

export default function EnglishReadingInferenceLessonPage() {
  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [guidedItem, setGuidedItem] = useState<BankQuestion | null>(null);
  const [independentItem, setIndependentItem] = useState<BankQuestion | null>(null);
  const [independentRetryItem, setIndependentRetryItem] = useState<BankQuestion | null>(null);
  const [stretchItem, setStretchItem] = useState<BankQuestion | null>(null);
  const [educationalState, setEducationalState] = useState<EducationalIntelligenceSnapshot["educationalState"] | undefined>(undefined);

  const [checkStage, setCheckStage] = useState<CheckStage>("not-started");
  const [hintsShown, setHintsShown] = useState(0);

  // GUIDED (TIER3 quotation + self-assessment -- the real, existing
  // architecture for this validation tier, not a new mechanism).
  const [guidedAnswer, setGuidedAnswer] = useState("");
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [guidedQuotationsFound, setGuidedQuotationsFound] = useState<boolean | null>(null);
  const [guidedSelfAssessed, setGuidedSelfAssessed] = useState<boolean | null>(null);

  const [independentAnswer, setIndependentAnswer] = useState("");
  const [independentLadderStage, setIndependentLadderStage] = useState<IndependentLadderStage>("attempt-1");
  const [independentAttempt1, setIndependentAttempt1] = useState<{ answer: string; correct: boolean } | null>(null);
  const [independentAttempt2, setIndependentAttempt2] = useState<{ answer: string; correct: boolean } | null>(null);
  const [independentFreshAnswer, setIndependentFreshAnswer] = useState("");
  const [independentFreshAttempt, setIndependentFreshAttempt] = useState<{ answer: string; correct: boolean } | null>(null);

  const [stretchStarted, setStretchStarted] = useState(false);
  const [stretchAnswer, setStretchAnswer] = useState("");
  const [stretchAttempt, setStretchAttempt] = useState<{ answer: string; correct: boolean } | null>(null);

  const profileIdRef = useRef<string>("");
  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient>>(null);
  const sessionIdRef = useRef<string>("");
  const preAttemptSnapshotRef = useRef<EducationalIntelligenceSnapshot | null>(null);

  async function loadLesson() {
    setMode("loading");
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("no client");
      supabaseRef.current = supabase;

      const profileId = await withTimeout(ensureProfile(), 10000, "your profile");
      if (!profileId) throw new Error("no profile");
      profileIdRef.current = profileId;
      sessionIdRef.current = `learn-eng-reading-inference-${Date.now()}`;

      if (getSelectedPathwayId() !== "csse") setSelectedPathway("csse");

      const english = await withTimeout(fetchQuestionBank(supabase, "english", "csse"), 10000, "this lesson's questions");
      const guided = english.find((q) => q.id === "w1-lastbus-05") ?? null;
      const independent = english.find((q) => q.id === "w1-newgirl-09") ?? null;
      const independentRetry = english.find((q) => q.id === "w1-letter-09") ?? null;
      const stretch = english.find((q) => q.id === "w3-rc10-am-02") ?? null;

      if (!guided || !independent) {
        throw new Error(
          "This lesson's practice questions aren't available yet. They should already be live, reviewed " +
          "Practice content -- if this keeps happening, the passages may have been renamed or retired."
        );
      }
      setGuidedItem(guided);
      setIndependentItem(independent);
      setIndependentRetryItem(independentRetry);
      setStretchItem(stretch);

      const snapshot = await getEducationalIntelligence(supabase, profileId, COMPETENCY_ID);
      setEducationalState(snapshot.educationalState);
      preAttemptSnapshotRef.current = snapshot;

      setMode("lesson");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setMode("error");
    }
  }

  /**
   * GUIDED submission: check both required quotations were found (real,
   * immediate feedback on evidence-finding), then hold for the learner's
   * own self-comparison against the modelled reasoning -- exactly the
   * real TIER3 flow, never a fabricated auto-grade of the explanation.
   */
  async function submitGuidedAnswer() {
    if (!guidedItem) return;
    const q = guidedItem.prompt as EnglishComprehensionPrompt;
    const required = q.quotationRequired ?? [];
    const found = required.length > 0 && required.every((quote) => checkQuotationPresent(guidedAnswer, quote).quotationFound);
    setGuidedQuotationsFound(found);
    setGuidedSubmitted(true);

    const supabase = supabaseRef.current;
    if (supabase && profileIdRef.current) {
      await withTimeout(
        recordPresentation(supabase, profileIdRef.current, [guidedItem.id], "learning_guided"),
        10000,
        "saving your progress"
      ).catch(() => {});
    }
  }

  async function submitGuidedSelfAssessment(explainedWell: boolean) {
    if (!guidedItem) return;
    setGuidedSelfAssessed(explainedWell);
    const supabase = supabaseRef.current;
    if (!supabase || !profileIdRef.current) return;
    await recordOutcome(
      supabase,
      profileIdRef.current,
      guidedItem.id,
      explainedWell,
      sessionIdRef.current,
      guidedItem.masteryThreshold,
      undefined,
      "supported",
      // Founder Amendment (Increment 024) -- this is the learner's own
      // self-assessment of an explanation Angel cannot automatically
      // grade (the real TIER3 architecture's own limitation), exactly
      // the same situation the real Practice page's own
      // submitSelfAssessment() already handles via recordAndAdvance()'s
      // explicit `verified: false` (Stage 2 Educational Integrity
      // Correction). Omitting this defaults to `true` and would let a
      // self-assessed GUIDED outcome alone clear
      // computeCompetencyConfidence()'s `anyEvidence` floor
      // (lib/ali/confidence.ts) and move confidenceTier/educationalState
      // off "insufficient" -- supportTier: "supported" alone protects
      // MASTERY (lib/ali/mastery.ts), but does not protect the separate
      // confidence/evidence-state layer, which reads `verified`
      // independently.
      false
    ).catch(() => {});
    if (preAttemptSnapshotRef.current) {
      await processEvidenceForCompetency(
        supabase,
        profileIdRef.current,
        COMPETENCY_ID,
        preAttemptSnapshotRef.current,
        explainedWell
      ).catch(() => {});
    }
    setCheckStage("guided");
  }

  function checkInference(answer: string, item: BankQuestion): boolean {
    const q = item.prompt as EnglishComprehensionPrompt;
    return checkAcceptedAnswerSet(answer, q.acceptedAnswers ?? []).correct;
  }

  async function recordIndependentAttempt(item: BankQuestion, isCorrect: boolean, presentedNow: boolean) {
    const supabase = supabaseRef.current;
    if (!supabase || !profileIdRef.current) return;

    if (presentedNow) {
      await withTimeout(
        recordPresentation(supabase, profileIdRef.current, [item.id], "learning_independent"),
        10000,
        "saving your progress"
      ).catch(() => {});
    }
    const preAttempt = await getEducationalIntelligence(supabase, profileIdRef.current, COMPETENCY_ID).catch(() => null);
    await recordOutcome(
      supabase,
      profileIdRef.current,
      item.id,
      isCorrect,
      sessionIdRef.current,
      item.masteryThreshold
    ).catch(() => {});
    if (preAttempt) {
      const updated = await processEvidenceForCompetency(
        supabase,
        profileIdRef.current,
        COMPETENCY_ID,
        preAttempt,
        isCorrect
      ).catch(() => null);
      if (updated) setEducationalState(updated.educationalState);
    }
  }

  async function submitIndependentAttempt1() {
    if (!independentItem) return;
    const isCorrect = checkInference(independentAnswer, independentItem);
    setIndependentAttempt1({ answer: independentAnswer, correct: isCorrect });
    await recordIndependentAttempt(independentItem, isCorrect, true);
    if (isCorrect) {
      setIndependentLadderStage("resolved");
      setCheckStage("independent");
    } else {
      setIndependentLadderStage("attempt-2");
    }
    setIndependentAnswer("");
  }

  async function submitIndependentAttempt2() {
    if (!independentItem) return;
    const isCorrect = checkInference(independentAnswer, independentItem);
    setIndependentAttempt2({ answer: independentAnswer, correct: isCorrect });
    await recordIndependentAttempt(independentItem, isCorrect, false);
    if (isCorrect) {
      setIndependentLadderStage("resolved");
      setCheckStage("independent");
    } else {
      setIndependentLadderStage("remediation");
    }
    setIndependentAnswer("");
  }

  async function submitIndependentFresh() {
    if (!independentRetryItem) return;
    const isCorrect = checkInference(independentFreshAnswer, independentRetryItem);
    setIndependentFreshAttempt({ answer: independentFreshAnswer, correct: isCorrect });
    await recordIndependentAttempt(independentRetryItem, isCorrect, true);
    setIndependentLadderStage("resolved");
    setCheckStage("independent");
    setIndependentFreshAnswer("");
  }

  async function submitStretch() {
    if (!stretchItem) return;
    const isCorrect = checkInference(stretchAnswer, stretchItem);
    setStretchAttempt({ answer: stretchAnswer, correct: isCorrect });
    await recordIndependentAttempt(stretchItem, isCorrect, true);
    setStretchAnswer("");
  }

  const progression = progressionLabel(checkStage, educationalState);
  const independentResolved = independentLadderStage === "resolved";
  const independentUltimatelyCorrect =
    independentAttempt1?.correct || independentAttempt2?.correct || independentFreshAttempt?.correct || false;
  const secureIndependentSuccess = independentAttempt1?.correct === true;

  const guidedPrompt = guidedItem?.prompt as EnglishComprehensionPrompt | undefined;
  const independentPrompt = independentItem?.prompt as EnglishComprehensionPrompt | undefined;
  const independentRetryPrompt = independentRetryItem?.prompt as EnglishComprehensionPrompt | undefined;
  const stretchPrompt = stretchItem?.prompt as EnglishComprehensionPrompt | undefined;

  return (
    <PageLayout breadcrumbs={[{ label: "Learn", href: "/learning-intelligence/learn" }, { label: "What the Text Doesn't Quite Say" }]}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {mode === "intro" && (
          <InfoCard>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">What the Text Doesn&apos;t Quite Say</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              A real lesson: understand the method, try it with support, then try it alone.
            </p>
            <button
              onClick={() => void loadLesson()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Start the lesson
            </button>
          </InfoCard>
        )}

        {mode === "loading" && <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Loading…</p>}

        {mode === "error" && (
          <InfoCard className="text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">We couldn&apos;t load this lesson</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{errorMessage}</p>
            <button onClick={() => void loadLesson()} className="mt-4 text-xs font-semibold text-sky-700 dark:text-sky-400">
              Try again
            </button>
          </InfoCard>
        )}

        {mode === "lesson" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">What the Text Doesn&apos;t Quite Say</h1>
            </div>
            <InfoCard className="flex items-center gap-3">
              <Target size={16} className="text-sky-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{progression.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{progression.description}</p>
              </div>
            </InfoCard>

            {/* EXPLAIN */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">What&apos;s going on?</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Some questions ask you to work something out that the passage never states directly. That&apos;s
                called an inference. It isn&apos;t a guess, and it isn&apos;t something you already knew before
                you read the passage. It has to come from the text itself.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                Every good inference sits between two things you must avoid. On one side is simply repeating a
                fact from the passage without working anything out. On the other side is an unsupported guess:
                an idea that might be true in real life, but that this particular passage doesn&apos;t actually
                back up.
              </p>
            </section>

            {/* METHOD */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">The method</h2>
              <InfoCard>
                <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1">
                  <li>What does the text actually say, directly?</li>
                  <li>What can I reasonably work out from that, even though it isn&apos;t stated outright?</li>
                  <li>What exact words or details in the passage support my idea?</li>
                  <li>Am I claiming more than the passage actually allows me to claim?</li>
                </ol>
              </InfoCard>
            </section>

            {/* MODEL — purpose-built teaching passage, never a live question */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Watching Angel do it</h2>
              <InfoCard>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">The Late Homework</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                  Priya&apos;s teacher, Mr Adeyemi, always collected homework books first thing on Monday morning,
                  stacking them neatly on the corner of his desk before registration even began. This particular
                  Monday, Priya&apos;s book was not among them. She had finished the work on Saturday, checked it
                  twice, and left it in the front pocket of her school bag exactly where it always went. At break
                  time, she searched her bag three times, then asked her best friend Dele if he&apos;d seen it fall
                  out on the bus. He hadn&apos;t. By lunchtime, she had retraced her whole morning route twice,
                  checking every bench and doorway she&apos;d passed. When she finally admitted to Mr Adeyemi that
                  she couldn&apos;t find it, he simply nodded and said, &ldquo;Bring it in tomorrow, no note
                  needed,&rdquo; before turning back to the register without another word.
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3">
                  What can we reasonably infer about how Mr Adeyemi feels about Priya not handing in her homework?
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>What the text actually says:</strong> he says &ldquo;bring it in tomorrow, no note
                    needed,&rdquo; then goes straight back to the register.
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>What I can reasonably work out:</strong> he isn&apos;t worried about it. Not asking
                    for a note, not questioning her, and moving straight on all suggest he doesn&apos;t think
                    this is a big deal.
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Checking the evidence supports this:</strong> the passage also shows Priya searching
                    three times and retracing her route twice. That establishes she is genuinely careful and
                    reliable, which fits with a teacher trusting her word without needing proof.
                  </p>
                  <p className="text-sm font-bold text-emerald-600 mt-1.5">
                    Justified conclusion: Mr Adeyemi seems unconcerned, most likely because he trusts that this
                    is a genuine one-off for a normally reliable pupil.
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-start gap-1.5">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>A tempting but unsupported guess: &ldquo;Mr Adeyemi doesn&apos;t care about
                    homework.&rdquo;</strong> This claims more than the text allows. The passage opens by telling
                    us he &ldquo;always collected homework books first thing,&rdquo; a deliberate routine that
                    shows he does care about homework generally. The evidence only supports him being calm about
                    this one specific, genuine case, not that he is indifferent to homework as a whole.
                  </p>
                </div>
              </InfoCard>
            </section>

            {/* GUIDED — real TIER3 quotation + self-assessment architecture */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Try one with help</h2>
              <InfoCard>
                {guidedPrompt && (
                  <>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{guidedPrompt.passageTitle}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                      {guidedPrompt.passageText}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3">{guidedPrompt.question}</p>
                  </>
                )}

                {hintsShown > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {hintsShown >= 1 && (
                      <p className="text-xs text-sky-700 dark:text-sky-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> Look for moments where her body reacts
                        physically, not just how she describes her thoughts.
                      </p>
                    )}
                    {hintsShown >= 2 && (
                      <p className="text-xs text-sky-700 dark:text-sky-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> You need two separate quotations, each
                        one a real sign of anxiety, not the same idea repeated in different words.
                      </p>
                    )}
                  </div>
                )}
                {!guidedSubmitted && hintsShown < 2 && (
                  <button
                    onClick={() => setHintsShown((h) => h + 1)}
                    className="mt-2 text-xs font-semibold text-sky-700 dark:text-sky-400"
                  >
                    Need a hint?
                  </button>
                )}

                {!guidedSubmitted && (
                  <>
                    <textarea
                      value={guidedAnswer}
                      onChange={(e) => setGuidedAnswer(e.target.value)}
                      className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                      placeholder="Write your two quotations and explain what each one shows…"
                      rows={4}
                      aria-label="Your answer"
                    />
                    <button
                      onClick={() => void submitGuidedAnswer()}
                      disabled={!guidedAnswer.trim()}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Submit
                    </button>
                  </>
                )}

                {guidedSubmitted && guidedSelfAssessed === null && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold inline-flex items-center gap-1.5">
                      {guidedQuotationsFound ? (
                        <><CheckCircle2 size={16} className="text-emerald-500" /> You found both quotations.</>
                      ) : (
                        <><XCircle size={16} className="text-amber-500" /> Not quite both quotations yet. That&apos;s alright, here&apos;s the full reasoning.</>
                      )}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">Angel&apos;s own reasoning for this one:</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 mt-1 space-y-1 italic">
                      <li>&ldquo;something urgent and uneven in my chest&rdquo;: a physical sign of panic, not just being tired.</li>
                      <li>&ldquo;could not speak at all&rdquo;: her anxiety is so strong it stops her talking entirely.</li>
                    </ul>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Compare that to your own answer. Did you explain what each quotation actually shows, not
                      just find the words?
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => void submitGuidedSelfAssessment(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                      >
                        Yes, I explained it well
                      </button>
                      <button
                        onClick={() => void submitGuidedSelfAssessment(false)}
                        className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-4 py-2"
                      >
                        Not quite
                      </button>
                    </div>
                  </div>
                )}

                {guidedSelfAssessed !== null && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                    {guidedSelfAssessed ? (
                      <><CheckCircle2 size={16} className="text-emerald-500" /> Good, that&apos;s the method.</>
                    ) : (
                      <><XCircle size={16} className="text-amber-500" /> That&apos;s alright. You&apos;ve seen the full reasoning now.</>
                    )}
                  </p>
                )}
              </InfoCard>
            </section>

            {/* COMMON MISTAKES */}
            {checkStage === "guided" && (
              <section>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Watch out for</h2>
                <InfoCard className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li><strong>Choosing something plausible in real life, but not actually in the passage.</strong> An idea can be sensible and still be wrong for this question, if the text doesn&apos;t support it.</li>
                    <li><strong>Focusing on one word and ignoring everything around it.</strong> A single word rarely carries the whole answer. Check the sentence and the moment it happens in.</li>
                    <li><strong>Mixing up what happened with why it happened.</strong> Retelling the event is not the same as explaining the reason behind it.</li>
                    <li><strong>Turning a possible idea into a certain one.</strong> Some evidence only supports &ldquo;probably,&rdquo; not &ldquo;definitely.&rdquo; Don&apos;t claim more certainty than the text gives you.</li>
                    <li><strong>Picking an answer because it sounds clever.</strong> A sophisticated-sounding idea with no real evidence behind it is still wrong.</li>
                    <li><strong>Bringing in outside knowledge the text never gave you.</strong> Your answer has to come from this passage, not from what you already know or assume about people in general.</li>
                  </ul>
                </InfoCard>
              </section>
            )}

            {/* INDEPENDENT — different family/shape, same reasoning skill, auto-gradable */}
            {checkStage === "guided" && (
              <section>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Now try one alone</h2>
                <InfoCard>
                  {independentPrompt && (
                    <>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{independentPrompt.passageTitle}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                        {independentPrompt.passageText}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3">{independentPrompt.question}</p>
                    </>
                  )}

                  {independentLadderStage === "attempt-1" && (
                    <>
                      <input
                        value={independentAnswer}
                        onChange={(e) => setIndependentAnswer(e.target.value)}
                        className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                        placeholder="Your answer…"
                        aria-label="Your answer"
                      />
                      <button
                        onClick={() => void submitIndependentAttempt1()}
                        disabled={!independentAnswer.trim()}
                        className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                      >
                        Submit
                      </button>
                    </>
                  )}

                  {independentAttempt1 && !independentAttempt1.correct && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 inline-flex items-center gap-1.5">
                        <XCircle size={16} /> Not quite yet. Have another look.
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0 text-sky-600" />
                        {classifyWrongAnswer(independentAttempt1.answer, NEWGIRL_WRONG_PATTERNS) ??
                          "Go back to the exact sentence about not being asked where she was from, before answering again."}
                      </p>
                    </div>
                  )}

                  {independentLadderStage === "attempt-2" && (
                    <>
                      <input
                        value={independentAnswer}
                        onChange={(e) => setIndependentAnswer(e.target.value)}
                        className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                        placeholder="Try again…"
                        aria-label="Try again"
                      />
                      <button
                        onClick={() => void submitIndependentAttempt2()}
                        disabled={!independentAnswer.trim()}
                        className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                      >
                        Submit
                      </button>
                    </>
                  )}

                  {independentAttempt2 && !independentAttempt2.correct && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 inline-flex items-center gap-1.5">
                        <XCircle size={16} /> Let&apos;s work through this one together.
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                        {classifyWrongAnswer(independentAttempt2.answer, NEWGIRL_WRONG_PATTERNS) ??
                          "Here's the reasoning:"}
                      </p>
                      <p className="text-sm font-bold text-emerald-600 mt-1.5">
                        Not being asked meant she could feel accepted as ordinary, rather than singled out as the new girl.
                      </p>
                    </div>
                  )}

                  {independentLadderStage === "remediation" && !independentRetryItem && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        The next practice question for this isn&apos;t available yet. Head to Practice when you&apos;re ready to try more like this.
                      </p>
                      <button
                        onClick={() => {
                          setIndependentLadderStage("resolved");
                          setCheckStage("independent");
                        }}
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  )}
                  {(independentRetryItem && independentLadderStage === "remediation") || independentFreshAttempt ? (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                        Now try a different one on your own
                      </p>
                      {independentRetryPrompt && (
                        <>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{independentRetryPrompt.passageTitle}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                            {independentRetryPrompt.passageText}
                          </p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3">{independentRetryPrompt.question}</p>
                        </>
                      )}
                      {independentLadderStage === "remediation" && (
                        <>
                          <input
                            value={independentFreshAnswer}
                            onChange={(e) => setIndependentFreshAnswer(e.target.value)}
                            className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                            placeholder="Your answer…"
                            aria-label="Your answer"
                          />
                          <button
                            onClick={() => void submitIndependentFresh()}
                            disabled={!independentFreshAnswer.trim()}
                            className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                          >
                            Submit
                          </button>
                        </>
                      )}
                      {independentFreshAttempt && (
                        <div className="mt-3">
                          {independentFreshAttempt.correct ? (
                            <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                              <CheckCircle2 size={16} className="text-emerald-500" /> Correct. That&apos;s genuine evidence you&apos;ve got it.
                            </p>
                          ) : (
                            <>
                              <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                                <XCircle size={16} className="text-amber-500" /> Not quite. That&apos;s alright, this is real evidence either way.
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                                {classifyWrongAnswer(independentFreshAttempt.answer, LETTER_WRONG_PATTERNS) ??
                                  "The passage's answer: a small kindness meant more to Dara than the woman herself would have realised."}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {independentLadderStage === "resolved" && (independentAttempt1?.correct || independentAttempt2?.correct) && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                      <CheckCircle2 size={16} className="text-emerald-500" /> Correct.
                    </p>
                  )}
                </InfoCard>
              </section>
            )}

            {/* STRETCH — evidence-triggered, single ungated attempt */}
            {independentResolved && secureIndependentSuccess && stretchItem && stretchPrompt && (
              <section>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Fancy a trickier one?</h2>
                {!stretchStarted && (
                  <InfoCard>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      You found that one straight away. Want a trickier one? This one asks you to work out more
                      from less. You don&apos;t have to try it to finish the lesson.
                    </p>
                    <button
                      onClick={() => setStretchStarted(true)}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Yes, try one
                    </button>
                  </InfoCard>
                )}
                {stretchStarted && (
                  <InfoCard>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{stretchPrompt.passageTitle}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                      {stretchPrompt.passageText}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3">{stretchPrompt.question}</p>

                    {!stretchAttempt && (
                      <>
                        <input
                          value={stretchAnswer}
                          onChange={(e) => setStretchAnswer(e.target.value)}
                          className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                          placeholder="Your answer…"
                          aria-label="Your answer"
                        />
                        <button
                          onClick={() => void submitStretch()}
                          disabled={!stretchAnswer.trim()}
                          className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                        >
                          Submit
                        </button>
                      </>
                    )}

                    {stretchAttempt && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        {stretchAttempt.correct ? (
                          <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                            <CheckCircle2 size={16} className="text-emerald-500" /> Correct. You worked that out
                            from very little. Well reasoned.
                          </p>
                        ) : (
                          <>
                            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-500">
                              <XCircle size={16} /> Not quite this time.
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 flex items-start gap-1.5">
                              <Lightbulb size={13} className="mt-0.5 shrink-0 text-sky-600" />
                              {classifyWrongAnswer(stretchAttempt.answer, EMPTYCLASSROOM_WRONG_PATTERNS) ??
                                "Think about the EFFECT this specific detail creates for the reader, not just what it describes -- that's still real practice either way."}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </InfoCard>
                )}
              </section>
            )}

            {/* REFLECT / NEXT STEP */}
            {independentResolved && (
              <>
                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Where this shows up in the exam</h2>
                  <InfoCard>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Good inference means using real clues, connecting them carefully, checking your idea against
                      the text, and never claiming more than the passage actually supports. That habit, evidence
                      first and conclusion second, is exactly what examiners are looking for, and it works on any
                      unfamiliar passage, not just the ones you&apos;ve already seen.
                    </p>
                  </InfoCard>
                </section>

                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">What&apos;s next?</h2>
                  {independentUltimatelyCorrect ? (
                    <Link
                      href="/learning-intelligence/practice/reading-comprehension?skipTeachingRedirect=1"
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      You&apos;re ready to practise this properly <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <Link
                      href="/learning-intelligence/practice/reading-comprehension?skipTeachingRedirect=1"
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Practise reasoning from the text again <ArrowRight size={14} />
                    </Link>
                  )}
                  <div className="mt-3">
                    <Link href="/learning-intelligence" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Full learning report →
                    </Link>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
