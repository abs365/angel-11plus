"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Clock, Star, ChevronRight, Lock, Sparkles } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { englishLessons } from "@/data/lessons";
import { getProgress } from "@/lib/progress";
import { computeAnalytics } from "@/lib/analytics";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";

const difficultyLabel: Record<string, string> = {
  "advanced-year4": "Year 4 Advanced",
  "year5-core": "Year 5 Core",
  "year5-advanced": "Year 5 Advanced",
  "year6-exam": "Year 6 Exam",
  "year4-foundation": "Year 4 Foundation",
};

const difficultyColor: Record<string, string> = {
  "advanced-year4": "bg-green-100 text-green-700",
  "year5-core": "bg-blue-100 text-blue-700",
  "year5-advanced": "bg-purple-100 text-purple-700",
  "year6-exam": "bg-red-100 text-red-700",
  "year4-foundation": "bg-gray-100 text-gray-600",
};

export default function EnglishPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [recommendedId, setRecommendedId] = useState<string | null>(null);

  useEffect(() => {
    const p = getProgress();
    const r = computeAnalytics(p);
    const adaptive = computeAdaptiveState(p, r);
    setRecommendedId(adaptive.recommendedEnglishLesson);
  }, []);

  const filtered = selectedDifficulty
    ? englishLessons.filter((l) => l.difficulty === selectedDifficulty)
    : englishLessons;

  const difficulties = Array.from(new Set(englishLessons.map((l) => l.difficulty)));

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 p-2.5 rounded-xl">
            <BookOpen size={22} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-2xl">English Comprehension</h1>
            <p className="text-gray-400 text-sm">Inference · Evidence · Atmosphere · Character</p>
          </div>
        </div>

        {/* Skills covered */}
        <div className="mt-4 bg-purple-50 rounded-xl p-4">
          <p className="text-purple-700 text-xs font-semibold uppercase tracking-wide mb-2">
            Skills Covered
          </p>
          <div className="flex flex-wrap gap-2">
            {["Inference", "Evidence retrieval", "Vocabulary in context", "Atmosphere", "Character analysis", "Writer's techniques"].map((skill) => (
              <span key={skill} className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="mt-5 mb-4">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
            Filter by level
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDifficulty(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedDifficulty
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d === selectedDifficulty ? null : d)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedDifficulty === d
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {difficultyLabel[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Lesson list */}
        <div className="flex flex-col gap-3">
          {filtered.map((lesson, i) => (
            <Link
              key={lesson.id}
              href={`/english/${lesson.id}`}
              className="block bg-white rounded-2xl p-5 border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor[lesson.difficulty]}`}>
                      {difficultyLabel[lesson.difficulty]}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={11} />
                      {lesson.estimatedMinutes} min
                    </span>
                  </div>
                  <h3 className="text-gray-900 font-semibold text-base mb-1 group-hover:text-purple-700 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {lesson.questions.length} questions ·{" "}
                    {lesson.questions.reduce((sum, q) => sum + q.marks, 0)} marks total
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {lesson.id === recommendedId ? (
                    <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={10} />
                      Recommended
                    </span>
                  ) : !recommendedId && i === 0 ? (
                    <span className="bg-amber-100 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star size={10} />
                      New
                    </span>
                  ) : null}
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming soon */}
        <div className="mt-3 bg-gray-50 rounded-2xl p-5 border border-dashed border-gray-200 flex items-center gap-3">
          <Lock size={16} className="text-gray-300" />
          <p className="text-gray-400 text-sm">More passages coming soon — mock test and advanced Year 6 content</p>
        </div>
      </div>
    </PageLayout>
  );
}
