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
import { checkAcceptedAnswerSet } from "@/lib/learningEngine/englishAnswerValidation";
import { realEvidenceLabel } from "@/lib/learningEngine/progressionLabel";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { EnglishComprehensionPrompt } from "@/types/ali/questionBank";

/**
 * Programme Increment 022 — "Finding the Answer in the Text" (RC-01,
 * Literal Retrieval from Narrative Text — Assessment Brain V1 §3/§9,
 * QT-RC-01/07/08/09). Angel's first genuine English Reading full lesson,
 * mirroring the Mathematics lesson pattern (arithmetic/percentages/
 * compound-shapes) but adapted for Reading's passage+evidence relationship,
 * per the Founder's explicit instruction not to mechanically copy
 * Mathematics pedagogy onto Reading.
 *
 * RC-01 was selected over RC-02 (Inference), RC-03 (Word/Phrase Meaning)
 * and RC-04 (Sequential Ordering) on real, live production evidence
 * (read-only, anon key, respecting RLS's practice_eligible gate):
 * RC-01 has the largest real footprint (53 practice-eligible rows across
 * 22 distinct passages, the most of any RC competency), the HIGH exam
 * relevance rating Assessment Brain V1 assigns it (RC-02/03/04 are
 * MEDIUM/LOW), and is the one Reading skill every other Reading skill
 * structurally depends on -- a learner cannot infer from evidence they
 * cannot locate, explain a word using a sentence they cannot find, or
 * sequence events they cannot retrieve. Teaching retrieval first, as a
 * genuine transferable method (find the key words in the question -> scan
 * for them in the text -> read the exact sentence around the real match,
 * not just any match -> check it actually answers what was asked), is
 * also the safest possible first Reading lesson against the Founder's
 * explicit "teach a method, not a memorisable trick" boundary --
 * retrieval has no answer-pattern shortcut to accidentally teach, unlike
 * inference.
 *
 * MODEL uses a purpose-built, original teaching passage ("The Football
 * Boots") -- never a live ali_question_bank row -- so the worked example
 * can expose Angel's own thinking process without ever showing the exact
 * wording of a question this or any future lesson might reuse for GUIDED/
 * INDEPENDENT. GUIDED and INDEPENDENT each draw one already-reviewed,
 * already practice_eligible RC-01 row (a genuinely different real
 * passage each, per the Founder's anti-memorisation instruction), plus a
 * third, again genuinely different, real RC-01 row for the independent
 * remediation ladder's fresh attempt -- zero new question-bank content
 * authored by this increment, exactly as instructed.
 *
 * No architecture terms (RC-01, QT-RC-01, EMC-3, Assessment Brain) are
 * shown to the learner anywhere below -- only in code comments, for
 * internal traceability, matching the Mathematics lessons' own convention.
 *
 * Founder Decision Record (additive -- original review above is preserved
 * unchanged). Original decision: APPROVED WITH AMENDMENT. Core lesson:
 * FOUNDER APPROVED (EXPLAIN/method/MODEL/GUIDED/INDEPENDENT/remediation/
 * reflection/Practice link all unchanged from the reviewed version).
 * Amendment reason: a strong learner who succeeds through the lesson
 * without needing the remediation path is never meaningfully stretched --
 * every real content item used is `easy` tier. Amendment: one OPTIONAL
 * stretch check, offered only after secure (first-attempt) independent
 * success, using one further real, already-reviewed, practice_eligible
 * RC-01 row -- "The Understudy" (id `w2-understudy-01`, `hard` tier),
 * selected over the review's own named candidates (Attic Door, Piano
 * Recital, Kite Maker) on evidence: Piano Recital's answer is a two-word
 * quotation with no real distractor; Attic Door's answer is easy to
 * locate via an exact phrase match ("eleven days") already present in the
 * question with no competing false lead; The Understudy uniquely pairs a
 * clearly text-supported answer with a genuine, hand-checked distractor
 * (Oliver's own extensively-narrated six weeks of preparation, which does
 * not answer "why did he suddenly need to perform" the way Daniel losing
 * his voice does) -- real retrieval demand under harder prose, never
 * inference (the cause is stated directly, not implied). A single
 * ungated attempt only, no teaching ladder, reusing the exact same
 * evidence-recording path as every other real attempt in this lesson.
 * Amendment implementation: YES. Amendment verification: AWAITING
 * FOUNDER.
 */

const COMPETENCY_ID = "RC-01" as const;

type Mode = "intro" | "loading" | "error" | "lesson";
type CheckStage = "not-started" | "guided" | "independent" | "done";
type GuidedLadderStage = "attempt-1" | "attempt-2" | "attempt-3" | "resolved";
type IndependentLadderStage = "attempt-1" | "attempt-2" | "remediation" | "resolved";

/**
 * Deterministic, hand-verified wrong-answer classification for these three
 * specific fixed passages only -- same bounded discipline as the
 * Mathematics lessons' own classifyWrongAnswer(). Reading answers are free
 * text, so this never attempts a generic heuristic (that would risk a
 * false-confidence "this is why you're wrong" for an answer Angel hasn't
 * actually understood) -- only these hand-checked, real patterns from the
 * real passage text, with an honest generic fallback otherwise.
 */
interface KnownWrongPattern {
  matches: (answer: string) => boolean;
  explanation: string;
}

const NEWTRAINERS_WRONG_PATTERNS: KnownWrongPattern[] = [
  {
    matches: (a) => /break/i.test(a),
    explanation:
      "That's what happened at break time, earlier in the passage. The question asks specifically about lunch, when Connor is the one who reacts.",
  },
  {
    matches: (a) => /locker|scuffed|old.*(pair|shoes|trainers)|walked home/i.test(a),
    explanation:
      "That's what Jayden does right at the end of the day, not what Connor does at lunch. Go back to the lunch moment specifically.",
  },
];

const BAKERSAPPRENTICE_WRONG_PATTERNS: KnownWrongPattern[] = [
  {
    matches: (a) => /pick(s|ed)?\s*up|carrie[ds]?|hoist(s|ed)?|shoulder|oven|whistl/i.test(a),
    explanation:
      "That's what Mr Fenwick does a little later, carrying a sack himself. The question asks what he does right when Priya first arrives, before any of that.",
  },
];

const STORMHARBOUR_WRONG_PATTERNS: KnownWrongPattern[] = [
  {
    matches: (a) => /watch|father/i.test(a),
    explanation:
      "That's Sam's father checking his watch, not Mrs Okafor. The question asks specifically about Mrs Okafor at the harbour café.",
  },
  {
    matches: (a) => /wind|rigging|clang|boat/i.test(a),
    explanation:
      "That's the wind and the boats, not Mrs Okafor. Look for the sentence that names her specifically.",
  },
];

/**
 * Founder Amendment (optional stretch check, Increment 022) -- the one
 * real, hand-checked distractor in "The Understudy": Oliver's own six
 * weeks of nervous preparation is mentioned repeatedly and at length,
 * making it the plausible wrong answer to reach for instead of the actual
 * triggering event (Daniel losing his voice), stated once, earlier and
 * more briefly than the surrounding narrative about Oliver himself.
 */
const UNDERSTUDY_WRONG_PATTERNS: KnownWrongPattern[] = [
  {
    matches: (a) => /(six weeks|practi[cs]|rehears|nervous|prepar|knew the part|learn(ed|t)? the (lines|part))/i.test(a),
    explanation:
      "That's how Oliver had been getting ready, not the reason he suddenly had to go on. Look for the sentence naming what happened to Daniel.",
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

export default function EnglishReadingRetrievalLessonPage() {
  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [guidedItem, setGuidedItem] = useState<BankQuestion | null>(null);
  const [independentItem, setIndependentItem] = useState<BankQuestion | null>(null);
  const [independentRetryItem, setIndependentRetryItem] = useState<BankQuestion | null>(null);
  const [educationalState, setEducationalState] = useState<EducationalIntelligenceSnapshot["educationalState"] | undefined>(undefined);

  const [checkStage, setCheckStage] = useState<CheckStage>("not-started");
  const [hintsShown, setHintsShown] = useState(0);
  const [guidedAnswer, setGuidedAnswer] = useState("");
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [guidedLadderStage, setGuidedLadderStage] = useState<GuidedLadderStage>("attempt-1");
  const [guidedAttempt1, setGuidedAttempt1] = useState<{ answer: string; correct: boolean } | null>(null);
  const [guidedAttempt2, setGuidedAttempt2] = useState<{ answer: string; correct: boolean } | null>(null);
  const [guidedAttempt3, setGuidedAttempt3] = useState<{ answer: string; correct: boolean } | null>(null);
  const [independentAnswer, setIndependentAnswer] = useState("");
  const [independentLadderStage, setIndependentLadderStage] = useState<IndependentLadderStage>("attempt-1");
  const [independentAttempt1, setIndependentAttempt1] = useState<{ answer: string; correct: boolean } | null>(null);
  const [independentAttempt2, setIndependentAttempt2] = useState<{ answer: string; correct: boolean } | null>(null);
  const [independentFreshAnswer, setIndependentFreshAnswer] = useState("");
  const [independentFreshAttempt, setIndependentFreshAttempt] = useState<{ answer: string; correct: boolean } | null>(null);

  // Founder Amendment -- optional stretch check. `stretchStarted` is the
  // learner's own explicit choice to attempt it (never auto-started);
  // `stretchAttempt` is the one, ungated attempt (no ladder). `stretchItem`
  // is nullable and never blocks the core lesson if this optional row is
  // ever unavailable -- see loadLesson()'s own comment below.
  const [stretchItem, setStretchItem] = useState<BankQuestion | null>(null);
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
      sessionIdRef.current = `learn-eng-reading-retrieval-${Date.now()}`;

      if (getSelectedPathwayId() !== "csse") setSelectedPathway("csse");

      const english = await withTimeout(fetchQuestionBank(supabase, "english", "csse"), 10000, "this lesson's questions");
      const guided = english.find((q) => q.id === "w3-rc01-newtrainers-01") ?? null;
      const independent = english.find((q) => q.id === "w3-rc01-bakersapprentice-01") ?? null;
      const independentRetry = english.find((q) => q.id === "w3-rc01-stormharbour-01") ?? null;
      // Founder Amendment -- optional stretch, never a required part of
      // the lesson. If this one row is ever unavailable, the stretch
      // offer simply never renders (see the render logic below) rather
      // than blocking or erroring the core, already-approved lesson.
      const stretch = english.find((q) => q.id === "w2-understudy-01") ?? null;

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

  async function recordGuidedAttempt(attemptNumber: 1 | 2 | 3, isCorrect: boolean) {
    if (!guidedItem) return;
    const supabase = supabaseRef.current;
    if (!supabase || !profileIdRef.current) return;

    if (attemptNumber === 1) {
      await withTimeout(
        recordPresentation(supabase, profileIdRef.current, [guidedItem.id], "learning_guided"),
        10000,
        "saving your progress"
      ).catch(() => {});
    }
    const supportTier: "independent" | "supported" = attemptNumber === 1 ? "independent" : "supported";
    await recordOutcome(
      supabase,
      profileIdRef.current,
      guidedItem.id,
      isCorrect,
      sessionIdRef.current,
      guidedItem.masteryThreshold,
      undefined,
      supportTier
    ).catch(() => {});
    if (preAttemptSnapshotRef.current) {
      await processEvidenceForCompetency(
        supabase,
        profileIdRef.current,
        COMPETENCY_ID,
        preAttemptSnapshotRef.current,
        isCorrect
      ).catch(() => {});
    }
  }

  function checkRetrieval(answer: string, item: BankQuestion): boolean {
    const q = item.prompt as EnglishComprehensionPrompt;
    return checkAcceptedAnswerSet(answer, q.acceptedAnswers ?? []).correct;
  }

  async function submitGuidedAttempt1() {
    if (!guidedItem) return;
    const isCorrect = checkRetrieval(guidedAnswer, guidedItem);
    setGuidedAttempt1({ answer: guidedAnswer, correct: isCorrect });
    await recordGuidedAttempt(1, isCorrect);
    if (isCorrect) {
      setGuidedLadderStage("resolved");
      setGuidedSubmitted(true);
      setCheckStage("guided");
    } else {
      setGuidedLadderStage("attempt-2");
    }
    setGuidedAnswer("");
  }

  async function submitGuidedAttempt2() {
    if (!guidedItem) return;
    const isCorrect = checkRetrieval(guidedAnswer, guidedItem);
    setGuidedAttempt2({ answer: guidedAnswer, correct: isCorrect });
    await recordGuidedAttempt(2, isCorrect);
    if (isCorrect) {
      setGuidedLadderStage("resolved");
      setGuidedSubmitted(true);
      setCheckStage("guided");
    } else {
      setGuidedLadderStage("attempt-3");
    }
    setGuidedAnswer("");
  }

  async function submitGuidedAttempt3() {
    if (!guidedItem) return;
    const isCorrect = checkRetrieval(guidedAnswer, guidedItem);
    setGuidedAttempt3({ answer: guidedAnswer, correct: isCorrect });
    await recordGuidedAttempt(3, isCorrect);
    setGuidedLadderStage("resolved");
    setGuidedSubmitted(true);
    setCheckStage("guided");
    setGuidedAnswer("");
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
    const isCorrect = checkRetrieval(independentAnswer, independentItem);
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
    const isCorrect = checkRetrieval(independentAnswer, independentItem);
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
    const isCorrect = checkRetrieval(independentFreshAnswer, independentRetryItem);
    setIndependentFreshAttempt({ answer: independentFreshAnswer, correct: isCorrect });
    await recordIndependentAttempt(independentRetryItem, isCorrect, true);
    setIndependentLadderStage("resolved");
    setCheckStage("independent");
    setIndependentFreshAnswer("");
  }

  /**
   * Founder Amendment -- a single, ungated attempt (no hint/reveal ladder,
   * per explicit instruction: "the purpose is transfer evidence," not
   * another teaching cycle). Reuses recordIndependentAttempt() unchanged --
   * the same real outcome-recording path every other attempt in this
   * lesson already uses, never a second evidence store.
   */
  async function submitStretch() {
    if (!stretchItem) return;
    const isCorrect = checkRetrieval(stretchAnswer, stretchItem);
    setStretchAttempt({ answer: stretchAnswer, correct: isCorrect });
    await recordIndependentAttempt(stretchItem, isCorrect, true);
    setStretchAnswer("");
  }

  const progression = progressionLabel(checkStage, educationalState);
  const independentResolved = independentLadderStage === "resolved";
  const independentUltimatelyCorrect =
    independentAttempt1?.correct || independentAttempt2?.correct || independentFreshAttempt?.correct || false;
  // Founder Amendment -- the smallest existing state that means "secure
  // success," conservatively read: correct on the FIRST independent
  // attempt, with neither a second attempt nor the fresh-retry
  // remediation path ever needed. A learner who only succeeded via
  // attempt 2 or the fresh retry is, by this same conservative reading,
  // not offered the stretch -- they proceed straight to ordinary
  // Practice, exactly as before this amendment.
  const secureIndependentSuccess = independentAttempt1?.correct === true;

  const guidedPrompt = guidedItem?.prompt as EnglishComprehensionPrompt | undefined;
  const independentPrompt = independentItem?.prompt as EnglishComprehensionPrompt | undefined;
  const independentRetryPrompt = independentRetryItem?.prompt as EnglishComprehensionPrompt | undefined;
  const stretchPrompt = stretchItem?.prompt as EnglishComprehensionPrompt | undefined;

  return (
    <PageLayout breadcrumbs={[{ label: "Learn", href: "/learning-intelligence/learn" }, { label: "Finding the Answer in the Text" }]}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {mode === "intro" && (
          <InfoCard>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Finding the Answer in the Text</h1>
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
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Finding the Answer in the Text</h1>
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
                Some comprehension questions ask you to find one clear fact the passage states directly, not
                something you have to work out or guess, just something written down somewhere in the text.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                The tricky part usually isn&apos;t understanding the passage. It&apos;s that the same person,
                place or thing often gets mentioned more than once, and only one of those mentions actually
                answers the question. Don&apos;t assume the first mention you spot is the right one, and never
                fill a gap with what seems likely. Only use what the passage actually says.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                You&apos;ll know your answer is right when you can point to the exact sentence in the passage
                that gives it. If you can&apos;t point to it, it&apos;s a guess, not a retrieval.
              </p>
            </section>

            {/* METHOD */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">The method</h2>
              <InfoCard>
                <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1">
                  <li>Read the question and pick out its key words: names, places, actions, times.</li>
                  <li>Scan the passage for those words, or very similar ones. Don&apos;t reread from the start each time.</li>
                  <li>Read the full sentence (and the one before or after, if needed) around each match.</li>
                  <li>Check which match actually answers what was asked, not just where a word appears, but where the answer is.</li>
                  <li>Give your answer using the passage&apos;s own information.</li>
                </ol>
              </InfoCard>
            </section>

            {/* MODEL — purpose-built teaching passage, never a live question */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Watching Angel do it</h2>
              <InfoCard>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">The Football Boots</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                  Leo had left his football boots at his cousin&apos;s house the weekend before, and training
                  started in twenty minutes. He rummaged through the cupboard under the stairs, pulling out a
                  broken umbrella, a deflated basketball, and a tangle of old extension leads, but no boots. His
                  sister Priya, who was doing her homework at the kitchen table, glanced up and said the spare
                  pair was still in the boot of Mum&apos;s car from the tournament last month. Leo sprinted
                  outside, wrenched open the car boot, and there they were, wedged behind a picnic blanket. He
                  grabbed them and was out of the door with four minutes to spare.
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3">
                  Where did Leo eventually find his football boots?
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Key words in the question:</strong> Leo, find, football boots.
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Scanning the passage:</strong> &ldquo;boots&rdquo; appears twice: once in
                    &ldquo;but no boots&rdquo; (the cupboard, where he looked and didn&apos;t find them), and
                    once near the end, in &ldquo;the boot of Mum&apos;s car&rdquo;.
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Checking which mention answers the question:</strong> the question asks where he
                    <em> found </em>them, not where he looked. The cupboard is where he searched and failed;
                    the car is where they actually were.
                  </p>
                  <p className="text-sm font-bold text-emerald-600 mt-1.5">
                    Answer: wedged behind a picnic blanket, in the boot of Mum&apos;s car.
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-start gap-1.5">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>A common wrong answer here is &ldquo;the cupboard under the stairs&rdquo;.</strong> That
                    means remembering the first place mentioned, rather than checking which mention actually matches
                    the verb in the question (<em>found</em>, not <em>looked</em>).
                  </p>
                </div>
              </InfoCard>
            </section>

            {/* GUIDED */}
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
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> The key words in the question are
                        &ldquo;Connor&rdquo; and &ldquo;lunch&rdquo;. Scan the passage for the moment those two
                        things happen together.
                      </p>
                    )}
                    {hintsShown >= 2 && (
                      <p className="text-xs text-sky-700 dark:text-sky-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> There&apos;s a sentence starting
                        &ldquo;At lunch, Connor…&rdquo;. Read that sentence closely.
                      </p>
                    )}
                    {hintsShown >= 3 && (
                      <p className="text-xs text-sky-700 dark:text-sky-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> What does Connor actually do with his
                        eyes, and then with his sandwich?
                      </p>
                    )}
                  </div>
                )}
                {guidedLadderStage === "attempt-1" && hintsShown < 3 && (
                  <button
                    onClick={() => setHintsShown((h) => h + 1)}
                    className="mt-2 text-xs font-semibold text-sky-700 dark:text-sky-400"
                  >
                    Need a hint?
                  </button>
                )}

                {guidedLadderStage === "attempt-1" && (
                  <>
                    <input
                      value={guidedAnswer}
                      onChange={(e) => setGuidedAnswer(e.target.value)}
                      className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                      placeholder="Your answer…"
                      aria-label="Your answer"
                    />
                    <button
                      onClick={() => void submitGuidedAttempt1()}
                      disabled={!guidedAnswer.trim()}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Submit
                    </button>
                  </>
                )}

                {guidedAttempt1 && !guidedAttempt1.correct && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 inline-flex items-center gap-1.5">
                      <XCircle size={16} /> Not quite yet. Let&apos;s look again.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 flex items-start gap-1.5">
                      <Lightbulb size={13} className="mt-0.5 shrink-0 text-sky-600" />
                      {classifyWrongAnswer(guidedAttempt1.answer, NEWTRAINERS_WRONG_PATTERNS) ??
                        "Go back and find the exact sentence about Connor, specifically at lunch, before answering again."}
                    </p>
                  </div>
                )}

                {guidedLadderStage === "attempt-2" && (
                  <>
                    <input
                      value={guidedAnswer}
                      onChange={(e) => setGuidedAnswer(e.target.value)}
                      className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                      placeholder="Try again…"
                      aria-label="Try again"
                    />
                    <button
                      onClick={() => void submitGuidedAttempt2()}
                      disabled={!guidedAnswer.trim()}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Submit
                    </button>
                  </>
                )}

                {guidedAttempt2 && !guidedAttempt2.correct && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 inline-flex items-center gap-1.5">
                      <XCircle size={16} /> Let&apos;s work through this one together.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                      {classifyWrongAnswer(guidedAttempt2.answer, NEWTRAINERS_WRONG_PATTERNS) ??
                        "Here's the exact sentence:"}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
                      &ldquo;At lunch, Connor glanced down at Jayden&apos;s feet for exactly one second, then
                      carried on eating his sandwich without a word.&rdquo;
                    </p>
                    <p className="text-sm font-bold text-emerald-600 mt-1.5">
                      Answer: he glances at them briefly, then carries on eating without saying anything.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Now that you&apos;ve seen how it works, try typing the answer yourself.</p>
                  </div>
                )}

                {guidedLadderStage === "attempt-3" && (
                  <>
                    <input
                      value={guidedAnswer}
                      onChange={(e) => setGuidedAnswer(e.target.value)}
                      className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                      placeholder="Type the answer above…"
                    />
                    <button
                      onClick={() => void submitGuidedAttempt3()}
                      disabled={!guidedAnswer.trim()}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Submit
                    </button>
                  </>
                )}

                {guidedLadderStage === "resolved" && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                    {(guidedAttempt3 ?? guidedAttempt2 ?? guidedAttempt1)?.correct ? (
                      <><CheckCircle2 size={16} className="text-emerald-500" /> Correct.</>
                    ) : (
                      <><XCircle size={16} className="text-amber-500" /> That&apos;s alright. You&apos;ve seen the full method now.</>
                    )}
                  </p>
                )}
              </InfoCard>
            </section>

            {/* COMMON MISTAKES */}
            {guidedSubmitted && (
              <section>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Watch out for</h2>
                <InfoCard className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li><strong>Answering from the first mention, not the right mention.</strong> A person, place or thing is often mentioned more than once. Only the mention that actually matches every part of the question, the person, the place, and the time, is the real answer.</li>
                    <li><strong>Guessing what seems likely instead of checking the text.</strong> A retrieval answer must come from a sentence you can point to. If you&apos;re filling in a gap with what feels probable, go back and find the exact sentence first.</li>
                  </ul>
                </InfoCard>
              </section>
            )}

            {/* INDEPENDENT */}
            {guidedSubmitted && (
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
                        {classifyWrongAnswer(independentAttempt1.answer, BAKERSAPPRENTICE_WRONG_PATTERNS) ??
                          "Find the exact sentence describing what Mr Fenwick does right at the start, before answering again."}
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
                        {classifyWrongAnswer(independentAttempt2.answer, BAKERSAPPRENTICE_WRONG_PATTERNS) ??
                          "Here's the exact sentence:"}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
                        &ldquo;Instead, he simply pointed to a mountain of flour sacks stacked against the wall
                        and said nothing at all.&rdquo;
                      </p>
                      <p className="text-sm font-bold text-emerald-600 mt-1.5">
                        Answer: he points to the flour sacks and says nothing.
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
                                {classifyWrongAnswer(independentFreshAttempt.answer, STORMHARBOUR_WRONG_PATTERNS) ??
                                  "The passage's answer: Mrs Okafor closed the café shutters two hours earlier than usual."}
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

            {/* STRETCH -- Founder Amendment. Optional, never required to
                finish the lesson: this section renders alongside REFLECT/
                NEXT STEP below, never gating it, so a learner can always
                continue straight into Practice without ever touching this. */}
            {independentResolved && secureIndependentSuccess && stretchItem && stretchPrompt && (
              <section>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Fancy a trickier one?</h2>
                {!stretchStarted && (
                  <InfoCard>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      You found that one straight away. Want a trickier one? This passage uses longer, more
                      grown-up writing. You don&apos;t have to try it to finish the lesson.
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
                            <CheckCircle2 size={16} className="text-emerald-500" /> Correct. You used the method
                            on a trickier passage.
                          </p>
                        ) : (
                          <>
                            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-500">
                              <XCircle size={16} /> Not quite this time.
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 flex items-start gap-1.5">
                              <Lightbulb size={13} className="mt-0.5 shrink-0 text-sky-600" />
                              {classifyWrongAnswer(stretchAttempt.answer, UNDERSTUDY_WRONG_PATTERNS) ??
                                "Look again for the exact sentence that answers this specifically -- that's still real practice either way."}
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
                      Retrieval questions appear throughout the English Comprehension paper, and this same
                      method is the foundation for almost every other Reading skill you&apos;ll meet. You
                      can&apos;t explain what a word means in its sentence, work out why a character feels a
                      certain way, or put events in the right order, without first being able to find the right
                      piece of text. This is the skill everything else builds on.
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
                      Practise finding answers in the text again <ArrowRight size={14} />
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
