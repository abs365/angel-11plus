"use client";

import { useState, useEffect } from "react";
import { BookMarked, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { vocabWords } from "@/data/vocabulary";
import { completeLesson, getProgress } from "@/lib/progress";
import { computeAnalytics } from "@/lib/analytics";
import { recordLegacyPracticeEvidence, recordLegacyPracticeSessionCompletion } from "@/lib/learningEngine/legacyPracticeEvidence";
import SessionInfoBar from "@/components/SessionInfoBar";
import { SUBJECT_ESTIMATED_MINUTES, SUBJECT_LEARNING_OBJECTIVE, SUBJECT_EXPECTED_BENEFIT } from "@/lib/subjectMeta";
import type { AnalyticsReport } from "@/types/analytics";

type CardMode = "front" | "revealed";
type QuizState = "browse" | "quiz" | "done";

export default function VocabularyPage() {
  const [state, setState] = useState<QuizState>("browse");
  const [todayWord, setTodayWord] = useState(vocabWords[0]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [cardMode, setCardMode] = useState<CardMode>("front");
  const [sentenceInput, setSentenceInput] = useState("");
  const [sentenceSubmitted, setSentenceSubmitted] = useState(false);
  const [scores, setScores] = useState<Record<string, "knew" | "learning">>({});
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [evidenceSessionId] = useState<string>(() => crypto.randomUUID());

  useEffect(() => {
    const dayIndex = Math.floor(Date.now() / 86400000) % vocabWords.length;
    setTodayWord(vocabWords[dayIndex]);
    setReport(computeAnalytics(getProgress()));
  }, []);

  function startQuiz() {
    setState("quiz");
    setQuizIndex(0);
    setCardMode("front");
    setScores({});
    setSentenceInput("");
    setSentenceSubmitted(false);
  }

  function markWord(result: "knew" | "learning") {
    setScores((prev) => ({ ...prev, [vocabWords[quizIndex].id]: result }));

    // Integration Correction — Educational Intelligence Engine evidence.
    // "knew"/"learning" is a self-report, not an objective correctness
    // check, but it is the exact same signal this page's own score
    // computation below already treats as correct/incorrect (knew counts,
    // learning doesn't) — reused, not reinterpreted. No vocabulary
    // question is tagged into ali_question_bank yet (Discovery finding),
    // so this honestly no-ops today; wiring is real and ready once tagged.
    recordLegacyPracticeEvidence({
      questionId: vocabWords[quizIndex].id,
      isCorrect: result === "knew",
      sessionId: evidenceSessionId,
      source: "legacy_vocabulary_practice",
    }).catch(() => {});

    if (quizIndex + 1 >= vocabWords.length) {
      const knew = Object.values({ ...scores, [vocabWords[quizIndex].id]: result }).filter((v) => v === "knew").length;
      const xp = knew * 8 + 5;
      completeLesson("vocab-session", Math.round((knew / vocabWords.length) * 100), xp);
      // Phase 3.0, WP3 (Learning History) — best-effort, fire-and-forget,
      // reuses the already-tested Readiness snapshot pipeline unchanged.
      recordLegacyPracticeSessionCompletion().catch(() => {});
      setState("done");
    } else {
      setQuizIndex((i) => i + 1);
      setCardMode("front");
    }
  }

  const currentWord = vocabWords[quizIndex];
  const difficultyLabel: Record<string, string> = {
    "advanced-year4": "Year 4+",
    "year5-core": "Year 5",
    "year5-advanced": "Year 5 Advanced",
    "year6-exam": "Year 6 Exam",
  };

  if (state === "done") {
    const knewCount = Object.values(scores).filter((v) => v === "knew").length;
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-12 md:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <CheckCircle size={32} aria-hidden="true" className="text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-2">Vocabulary session complete</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {knewCount} of {vocabWords.length} words known
          </p>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 text-left mb-6">
            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
              Words to review
            </p>
            {Object.entries(scores)
              .filter(([, v]) => v === "learning")
              .map(([id]) => {
                const word = vocabWords.find((w) => w.id === id);
                return word ? (
                  <div key={id} className="flex items-center gap-2 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <span className="text-gray-800 dark:text-gray-100 font-medium text-sm">{word.word}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-sm">— {word.definition}</span>
                  </div>
                ) : null;
              })}
            {Object.values(scores).every((v) => v === "knew") && (
              <p className="text-green-600 text-sm font-medium">You knew all of them!</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setState("browse")}
              className="flex-1 bg-green-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-green-700 transition-colors motion-reduce:transition-none"
            >
              Back to vocabulary
            </button>
            <button
              onClick={startQuiz}
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl py-3.5 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors motion-reduce:transition-none"
            >
              Try again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (state === "quiz") {
    return (
      <PageLayout>
        <div className="max-w-lg mx-auto px-4 py-6 md:px-8">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setState("browse")}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm transition-colors motion-reduce:transition-none"
            >
              ← Vocabulary
            </button>
            {/* AN-105: kept as its own markup rather than adopting the
                shared ProgressBar — its colour prop supports emerald, not
                the green-500 this subject uses throughout (word cards,
                synonym chips, buttons); emerald is a visibly different hue
                and switching only the bar would look inconsistent against
                the rest of this same page, so the existing colour is kept
                and only real ARIA progress semantics were added. */}
            <div
              role="progressbar"
              aria-valuenow={Math.round(((quizIndex + 1) / vocabWords.length) * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Flashcard progress"
              className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2"
            >
              <div
                className="bg-green-500 h-full rounded-full transition-all motion-reduce:transition-none"
                style={{ width: `${((quizIndex + 1) / vocabWords.length) * 100}%` }}
              />
            </div>
            <span className="text-gray-400 dark:text-gray-500 text-sm shrink-0">
              {quizIndex + 1}/{vocabWords.length}
            </span>
          </div>

          {/* Flashcard */}
          {/* AN-105: keyboard access added. This div had a click handler
              but no keyboard equivalent at all — a genuine gap surfaced
              during implementation (not part of AN-104's discovery
              findings), fixed here since it falls under Step 6's explicit
              "keyboard accessibility" checklist. role/tabIndex/keyboard
              handler are only present while cardMode is "front": once
              revealed, this element contains real interactive content of
              its own (the sentence-challenge textarea and its submit
              button), and ARIA authoring practice disallows nesting
              interactive controls inside a role="button" element — scoping
              the button semantics to the front state only avoids that,
              while the flip action itself was already only ever active in
              that state (onClick's own existing guard). */}
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden cursor-pointer select-none"
            onClick={() => cardMode === "front" && setCardMode("revealed")}
            role={cardMode === "front" ? "button" : undefined}
            tabIndex={cardMode === "front" ? 0 : undefined}
            aria-label={cardMode === "front" ? "Reveal definition" : undefined}
            onKeyDown={
              cardMode === "front"
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCardMode("revealed");
                    }
                  }
                : undefined
            }
          >
            {/* Front */}
            <div className="p-8 text-center">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full mb-4 inline-block ${
                currentWord.category === "literary"
                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                  : currentWord.category === "tier3"
                  ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                  : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              }`}>
                {currentWord.category === "tier2" ? "Academic Vocabulary" : currentWord.category === "tier3" ? "Advanced" : "Literary"}
              </span>

              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{currentWord.word}</h2>

              <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                {difficultyLabel[currentWord.difficulty]}
              </p>

              {cardMode === "front" ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-5 py-3 text-gray-400 dark:text-gray-500 text-sm">
                  Tap to reveal definition
                </div>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-5 text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    {currentWord.definition}
                  </p>

                  {/* Synonyms */}
                  <div className="text-left mb-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-2">
                      Synonyms
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentWord.synonyms.map((s) => (
                        <span key={s} className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 text-xs font-medium px-2.5 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Antonyms */}
                  <div className="text-left mb-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-2">
                      Antonyms
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentWord.antonyms.map((a) => (
                        <span key={a} className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs font-medium px-2.5 py-1 rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Example sentence */}
                  <div className="text-left mb-5">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-2">
                      Example
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm italic leading-relaxed border-l-2 border-green-300 pl-3">
                      &ldquo;{currentWord.exampleSentence}&rdquo;
                    </p>
                  </div>

                  {/* Sentence challenge */}
                  {!sentenceSubmitted ? (
                    <div className="text-left">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mb-2">
                        Your Sentence Challenge
                      </p>
                      <textarea
                        value={sentenceInput}
                        onChange={(e) => setSentenceInput(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={`Write a sentence using "${currentWord.word}"...`}
                        rows={2}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400 mb-2"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSentenceSubmitted(true);
                        }}
                        disabled={!sentenceInput.trim()}
                        className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-green-700 disabled:opacity-40 transition-colors motion-reduce:transition-none"
                      >
                        Submit sentence
                      </button>
                    </div>
                  ) : (
                    <div className="text-left bg-green-50 dark:bg-green-950 rounded-xl p-3 mb-2">
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">Your sentence:</p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm italic">&ldquo;{sentenceInput}&rdquo;</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Know it? */}
          {cardMode === "revealed" && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => markWord("learning")}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-xl py-4 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900 transition-colors motion-reduce:transition-none"
              >
                <XCircle size={16} aria-hidden="true" />
                Still learning
              </button>
              <button
                onClick={() => markWord("knew")}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-4 font-semibold text-sm hover:bg-green-700 transition-colors motion-reduce:transition-none"
              >
                <CheckCircle size={16} aria-hidden="true" />
                I knew it!
              </button>
            </div>
          )}

          {cardMode === "front" && (
            <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-4">
              Tap the card to reveal
            </p>
          )}
        </div>
      </PageLayout>
    );
  }

  // Browse mode
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-2xl">
            <BookMarked size={22} aria-hidden="true" className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Vocabulary Builder</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Academic & literary word mastery</p>
          </div>
        </div>

        {/* Study Sessions info strip (Sprint 4) — browse (pre-session) state
            only; Vocabulary has no per-skill breakdown (SkillAnalytics.group
            covers english/maths/reasoning only), so this shows the honest
            whole-subject fallback rather than fabricating one. */}
        <div className="mb-5">
          <SessionInfoBar
            objective={SUBJECT_LEARNING_OBJECTIVE.vocabulary!}
            estimatedMinutes={SUBJECT_ESTIMATED_MINUTES.vocabulary!}
            subjectAnalytics={report?.subjects.find((s) => s.subject === "vocabulary")}
            expectedBenefit={SUBJECT_EXPECTED_BENEFIT.vocabulary}
          />
        </div>

        {/* Word of the day — AN-105: bg-emerald-600 measured ~3.43:1 against
            the card's text-green-100/text-green-50 small text (below the
            4.5:1 AA threshold; verified by direct sRGB relative-luminance
            calculation, not assumed). Corrected to emerald-700, the exact
            shade this codebase's own Sprint 1 --color-success token already
            uses for the identical reason (its own logged WCAG correction
            for emerald-600-plus-light-text) — reused, not reinvented.
            emerald-700 measures ~4.99:1 for text-green-100 and ~5.49:1 for
            the h2's white text (already-compliant large text, now improved
            further). No separate dark: value needed since dark mode's
            existing bg-emerald-700 was already this same shade. */}
        <div className="bg-emerald-700 rounded-2xl p-6 text-white mb-5">
          <p className="text-green-100 text-xs font-semibold uppercase tracking-wide mb-2">
            Word of the Day
          </p>
          <h2 className="text-3xl font-bold mb-2">{todayWord.word}</h2>
          <p className="text-green-100 leading-relaxed text-sm mb-4">{todayWord.definition}</p>
          <p className="text-green-50 text-sm italic">
            &ldquo;{todayWord.exampleSentence}&rdquo;
          </p>
        </div>

        {/* Start quiz */}
        <button
          onClick={startQuiz}
          className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-green-700 transition-colors motion-reduce:transition-none flex items-center justify-center gap-2 mb-6"
        >
          Start flashcard session
          <ChevronRight size={18} aria-hidden="true" />
        </button>

        {/* Word list */}
        <div className="mb-3">
          <h2 className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-4">All Words ({vocabWords.length})</h2>
          <div className="flex flex-col gap-2">
            {vocabWords.map((word) => (
              <div
                key={word.id}
                className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-700 transition-colors motion-reduce:transition-none"
              >
                {/* AN-105: the speaker icon previously here (a trailing
                    sibling of this content div) had no click handler or
                    audio behaviour — a decorative element that visually
                    implied a pronunciation feature that doesn't exist.
                    Removed rather than wired up (out of scope — no
                    text-to-speech in this package) or left as a misleading
                    affordance. The word/badge/definition/synonym layout
                    below is otherwise byte-for-byte unchanged. */}
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{word.word}</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {difficultyLabel[word.difficulty]}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-snug">{word.definition}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {word.synonyms.slice(0, 3).map((s) => (
                    <span key={s} className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
