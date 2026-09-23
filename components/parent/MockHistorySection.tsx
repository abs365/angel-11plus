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
      <h2 className="text-xs font-bold text-[var(--angel-muted)] uppercase tracking-widest mb-3">
        Mock Performance
      </h2>
      {mockResults.length === 0 ? (
        <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5 flex items-start gap-3">
          <FileText size={18} className="text-[var(--angel-muted)] mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--angel-navy)] mb-0.5">No mocks attempted yet</p>
            <p className="text-xs text-[var(--angel-muted)] leading-relaxed mb-3">
              Timed mock exams reveal how your child performs under exam conditions. Aim for at least one mock per fortnight.
            </p>
            <Link
              href="/mocks"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Play size={12} />
              Start a Practice Mock
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Summary row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-4">
              <p className="text-xs text-[var(--angel-muted)] mb-0.5">Mocks completed</p>
              <p className="text-2xl font-bold text-[var(--angel-navy)]">{mockResults.length}</p>
            </div>
            <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-4">
              <p className="text-xs text-[var(--angel-muted)] mb-0.5">Best score</p>
              <p className={`text-2xl font-bold ${
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
          <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--angel-border)] flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--angel-navy)]">Recent Mocks</p>
              <Link href="/mocks" className="text-xs text-[var(--angel-blue)] font-medium hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-[var(--angel-border)]">
              {mockResults.slice(-3).reverse().map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                  <FileText size={15} className="text-[var(--angel-muted)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--angel-navy)] truncate">{r.pathwayName}</p>
                    <p className="text-xs text-[var(--angel-muted)]">
                      {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${r.totalScore >= 75 ? "text-green-600" : r.totalScore >= 55 ? "text-amber-600" : "text-red-500"}`}>
                      {r.totalScore}%
                    </p>
                    <p className="text-xs text-[var(--angel-muted)]">{r.durationMinutes} min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section breakdown of most recent mock */}
          {mockResults.length > 0 && mockResults[mockResults.length - 1].sectionResults.length > 0 && (
            <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--angel-border)]">
                <p className="text-sm font-semibold text-[var(--angel-navy)]">Last Mock: Section Breakdown</p>
              </div>
              <div className="p-4 space-y-3">
                {mockResults[mockResults.length - 1].sectionResults.map((s) => (
                  <div key={s.sectionId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[var(--angel-ink)]">{s.sectionName}</span>
                      <span className={`text-xs font-bold ${s.score >= 75 ? "text-green-600" : s.score >= 55 ? "text-amber-600" : "text-red-500"}`}>
                        {s.score}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--angel-sky)] rounded-full overflow-hidden">
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
            className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-[var(--angel-border)] text-sm font-semibold text-[var(--angel-ink)] hover:bg-[var(--angel-paper)] transition-colors"
          >
            <Play size={14} />
            Start another mock
          </Link>
        </div>
      )}
    </section>
  );
}
