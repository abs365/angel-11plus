import Link from "next/link";
import { FileText, Play } from "lucide-react";
import type { MockResult } from "@/types/mock";

/**
 * Mock History — Sprint 4 Completion Package (FD-020, WP4B). Extracted
 * verbatim from the legacy /parent page's "Mock Performance" section
 * (same data, same computation, same markup) so it can be shared by both
 * branches of the unified Parent Dashboard instead of existing on only one
 * of two separate pages. getMockResults() (lib/mockProgress.ts) is
 * pathway-agnostic real data — no calculation changes, a pure move.
 */
export function MockHistorySection({ mockResults }: { mockResults: MockResult[] }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Mock Performance
      </h2>
      {mockResults.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-gray-400 dark:text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-0.5">No mocks attempted yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed mb-3">
              Timed mock exams reveal how your child performs under exam conditions. Aim for at least one mock per fortnight.
            </p>
            <Link
              href="/mocks"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-3 py-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
            >
              <Play size={12} />
              Start a Practice Mock
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Summary row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Mocks completed</p>
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{mockResults.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Best score</p>
              <p className={`text-2xl font-black ${
                Math.max(...mockResults.map(r => r.totalScore)) >= 75
                  ? "text-green-600"
                  : Math.max(...mockResults.map(r => r.totalScore)) >= 55
                  ? "text-amber-600"
                  : "text-red-500"
              }`}>
                {Math.max(...mockResults.map(r => r.totalScore))}%
              </p>
            </div>
          </div>

          {/* Recent mock results */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent Mocks</p>
              <Link href="/mocks" className="text-xs text-purple-600 dark:text-purple-400 font-medium">View all</Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {mockResults.slice(-3).reverse().map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <FileText size={13} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{r.pathwayName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${r.totalScore >= 75 ? "text-green-600" : r.totalScore >= 55 ? "text-amber-600" : "text-red-500"}`}>
                      {r.totalScore}%
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{r.durationMinutes} min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section breakdown of most recent mock */}
          {mockResults.length > 0 && mockResults[mockResults.length - 1].sectionResults.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Last Mock: Section Breakdown</p>
              </div>
              <div className="p-4 space-y-3">
                {mockResults[mockResults.length - 1].sectionResults.map((s) => (
                  <div key={s.sectionId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{s.sectionName}</span>
                      <span className={`text-xs font-bold ${s.score >= 75 ? "text-green-600" : s.score >= 55 ? "text-amber-600" : "text-red-500"}`}>
                        {s.score}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.score >= 75 ? "bg-green-500" : s.score >= 55 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/mocks"
            className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Play size={14} />
            Start another mock
          </Link>
        </div>
      )}
    </section>
  );
}
