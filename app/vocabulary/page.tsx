"use client";

import { useState, useEffect } from "react";
import { BookMarked, Volume2, ChevronRight, CheckCircle, XCircle, Star } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { vocabWords } from "@/data/vocabulary";
import { completeLesson } from "@/lib/progress";

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
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    const dayIndex = Math.floor(Date.now() / 86400000) % vocabWords.length;
    setTodayWord(vocabWords[dayIndex]);
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
    if (quizIndex + 1 >= vocabWords.length) {
      const knew = Object.values({ ...scores, [vocabWords[quizIndex].id]: result }).filter((v) => v === "knew").length;
      const xp = knew * 8 + 5;
      setXpGained(xp);
      completeLesson("vocab-session", Math.round((knew / vocabWords.length) * 100), xp);
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-gray-900 font-bold text-2xl mb-2">Vocab Session Done!</h1>
          <p className="text-gray-500 mb-2">
            {knewCount} of {vocabWords.length} words known
          </p>
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-semibold mb-8">
            <Star size={16} className="text-green-500" />
            +{xpGained} XP earned
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-left mb-6">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
              Words to review
            </p>
            {Object.entries(scores)
              .filter(([, v]) => v === "learning")
              .map(([id]) => {
                const word = vocabWords.find((w) => w.id === id);
                return word ? (
                  <div key={id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-800 font-medium text-sm">{word.word}</span>
                    <span className="text-gray-400 text-sm">— {word.definition}</span>
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
              className="flex-1 bg-green-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-green-700 transition-colors"
            >
              Back to Vocabulary
            </button>
            <button
              onClick={startQuiz}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3.5 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Try Again
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
              className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
            >
              ← Vocabulary
            </button>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-green-500 h-full rounded-full transition-all"
                style={{ width: `${((quizIndex + 1) / vocabWords.length) * 100}%` }}
              />
            </div>
            <span className="text-gray-400 text-sm shrink-0">
              {quizIndex + 1}/{vocabWords.length}
            </span>
          </div>

          {/* Flashcard */}
          <div
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer select-none"
            onClick={() => cardMode === "front" && setCardMode("revealed")}
          >
            {/* Front */}
            <div className="p-8 text-center">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full mb-4 inline-block ${
                currentWord.category === "literary"
                  ? "bg-purple-100 text-purple-700"
                  : currentWord.category === "tier3"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}>
                {currentWord.category === "tier2" ? "Academic Vocabulary" : currentWord.category === "tier3" ? "Advanced" : "Literary"}
              </span>

              <h2 className="text-4xl font-bold text-gray-900 mb-2">{currentWord.word}</h2>

              <p className="text-gray-400 text-sm mb-6">
                {difficultyLabel[currentWord.difficulty]}
              </p>

              {cardMode === "front" ? (
                <div className="bg-gray-50 rounded-xl px-5 py-3 text-gray-400 text-sm">
                  Tap to reveal definition
                </div>
              ) : (
                <>
                  <p className="text-gray-700 text-base leading-relaxed mb-5 text-left bg-gray-50 rounded-xl p-4">
                    {currentWord.definition}
                  </p>

                  {/* Synonyms */}
                  <div className="text-left mb-4">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                      Synonyms
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentWord.synonyms.map((s) => (
                        <span key={s} className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Antonyms */}
                  <div className="text-left mb-4">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                      Antonyms
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentWord.antonyms.map((a) => (
                        <span key={a} className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Example sentence */}
                  <div className="text-left mb-5">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                      Example
                    </p>
                    <p className="text-gray-600 text-sm italic leading-relaxed border-l-2 border-green-300 pl-3">
                      &ldquo;{currentWord.exampleSentence}&rdquo;
                    </p>
                  </div>

                  {/* Sentence challenge */}
                  {!sentenceSubmitted ? (
                    <div className="text-left">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                        Your Sentence Challenge
                      </p>
                      <textarea
                        value={sentenceInput}
                        onChange={(e) => setSentenceInput(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={`Write a sentence using "${currentWord.word}"...`}
                        rows={2}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400 mb-2"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSentenceSubmitted(true);
                        }}
                        disabled={!sentenceInput.trim()}
                        className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-green-700 disabled:opacity-40 transition-colors"
                      >
                        Submit Sentence
                      </button>
                    </div>
                  ) : (
                    <div className="text-left bg-green-50 rounded-xl p-3 mb-2">
                      <p className="text-xs text-green-600 font-semibold mb-1">Your sentence:</p>
                      <p className="text-gray-700 text-sm italic">&ldquo;{sentenceInput}&rdquo;</p>
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
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-xl py-4 font-semibold text-sm hover:bg-red-100 transition-colors"
              >
                <XCircle size={16} />
                Still learning
              </button>
              <button
                onClick={() => markWord("knew")}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-4 font-semibold text-sm hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={16} />
                I knew it!
              </button>
            </div>
          )}

          {cardMode === "front" && (
            <p className="text-center text-gray-400 text-sm mt-4">
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
          <div className="bg-green-100 p-2.5 rounded-xl">
            <BookMarked size={22} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-2xl">Vocabulary Builder</h1>
            <p className="text-gray-400 text-sm">Academic & literary word mastery</p>
          </div>
        </div>

        {/* Word of the day */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-6 text-white mb-5">
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
          className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-6"
        >
          Start Flashcard Session
          <ChevronRight size={18} />
        </button>

        {/* Word list */}
        <div className="mb-3">
          <h2 className="text-gray-900 font-semibold text-lg mb-4">All Words ({vocabWords.length})</h2>
          <div className="flex flex-col gap-2">
            {vocabWords.map((word) => (
              <div
                key={word.id}
                className="bg-white rounded-xl p-4 border border-gray-100 hover:border-green-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-gray-900 font-semibold">{word.word}</p>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {difficultyLabel[word.difficulty]}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm leading-snug">{word.definition}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {word.synonyms.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Volume2 size={14} className="text-gray-300 mt-1 ml-2 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
