"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, MessageSquare, Bug, Lightbulb, Star, Target,
  BarChart2, Clock, Flame, Zap, Eye, EyeOff, Trash2, RefreshCw,
  ChevronDown, ChevronUp,
} from "lucide-react";
import {
  getFeedback, getBugReports, getFeatureRequests,
  getBetaFamilyApplications, getTestimonials,
  type FeedbackEntry, type BugReport, type FeatureRequest,
  type BetaFamilyApplication, type Testimonial,
} from "@/lib/feedback";
import { getBetaEvents, clearBetaEvents, type TrackingEvent } from "@/lib/betaTracking";
import { getMockResults } from "@/lib/mockProgress";
import { getProgress } from "@/lib/progress";
import type { MockResult } from "@/types/mock";
import type { UserProgress } from "@/types";

// ─── PIN gate ────────────────────────────────────────────────────────────────

const ADMIN_PIN = "angel2026";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function subjectFromLessonId(id: string): string {
  if (id.startsWith("eng") || id.includes("english")) return "English";
  if (id.startsWith("math") || id.includes("maths")) return "Maths";
  if (id.startsWith("vocab") || id.includes("vocab")) return "Vocabulary";
  if (id.startsWith("writ") || id.includes("writing")) return "Writing";
  if (id.includes("verbal")) return "Verbal Reasoning";
  if (id.includes("non-verbal")) return "Non-Verbal Reasoning";
  if (id.includes("spatial")) return "Spatial Reasoning";
  if (id.includes("numerical") || id.includes("number")) return "Numerical Reasoning";
  if (id.includes("mock")) return "Mock Test";
  return "Other";
}

const PATHWAY_LABELS: Record<string, string> = {
  gl: "GL Assessment",
  cem: "CEM",
  csse: "CSSE",
  iseb: "ISEB Pre-Test",
  "core-foundation": "Core Foundation",
  independent: "Independent",
  "not-sure": "Not Sure",
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, sub, color,
}: {
  label: string; value: string | number; icon: React.ReactNode; sub?: string; color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && <div className="border-t border-gray-50 dark:border-gray-800">{children}</div>}
    </div>
  );
}

// ─── Pathway bar ─────────────────────────────────────────────────────────────

function PathwayBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{count}</span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Admin dashboard ─────────────────────────────────────────────────────────

interface AdminData {
  families: BetaFamilyApplication[];
  feedback: FeedbackEntry[];
  bugs: BugReport[];
  features: FeatureRequest[];
  testimonials: Testimonial[];
  events: TrackingEvent[];
  mockResults: MockResult[];
  progress: UserProgress;
}

function AdminDashboard({ data }: { data: AdminData }) {
  const { families, feedback, bugs, features, testimonials, events, mockResults, progress } = data;

  // Pathway distribution
  const pathwayCounts: Record<string, number> = {};
  for (const f of families) {
    const p = f.pathway || "not-sure";
    pathwayCounts[p] = (pathwayCounts[p] ?? 0) + 1;
  }
  const maxPathwayCount = Math.max(...Object.values(pathwayCounts), 1);

  // Subject usage from completed lessons
  const subjectCounts: Record<string, number> = {};
  for (const lesson of progress.completedLessons) {
    const s = subjectFromLessonId(lesson);
    subjectCounts[s] = (subjectCounts[s] ?? 0) + 1;
  }
  const maxSubjectCount = Math.max(...Object.values(subjectCounts), 1);

  // Mock pathway distribution
  const mockPathwayCounts: Record<string, number> = {};
  for (const r of mockResults) {
    mockPathwayCounts[r.pathway] = (mockPathwayCounts[r.pathway] ?? 0) + 1;
  }

  // Feature request frequency
  const featureMap: Record<string, number> = {};
  for (const f of features) {
    const key = f.feature.toLowerCase().slice(0, 60);
    featureMap[key] = (featureMap[key] ?? 0) + 1;
  }

  // Event counts
  const eventCounts: Record<string, number> = {};
  for (const e of events) {
    eventCounts[e.type] = (eventCounts[e.type] ?? 0) + 1;
  }

  const bestMock = mockResults.length > 0 ? Math.max(...mockResults.map((r) => r.totalScore)) : null;

  return (
    <div className="space-y-5">

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Beta Families" value={families.length}
          icon={<Users size={15} className="text-purple-600 dark:text-purple-400" />}
          color="bg-purple-50 dark:bg-purple-950"
        />
        <StatCard
          label="Feedback" value={feedback.length}
          icon={<MessageSquare size={15} className="text-blue-600 dark:text-blue-400" />}
          color="bg-blue-50 dark:bg-blue-950"
        />
        <StatCard
          label="Bug Reports" value={bugs.length}
          icon={<Bug size={15} className="text-red-600 dark:text-red-400" />}
          color="bg-red-50 dark:bg-red-950"
        />
        <StatCard
          label="Feature Requests" value={features.length}
          icon={<Lightbulb size={15} className="text-amber-600 dark:text-amber-400" />}
          color="bg-amber-50 dark:bg-amber-950"
        />
        <StatCard
          label="Testimonials" value={testimonials.length}
          sub={`${testimonials.filter((t) => t.publishPermission).length} publishable`}
          icon={<Star size={15} className="text-emerald-600 dark:text-emerald-400" />}
          color="bg-emerald-50 dark:bg-emerald-950"
        />
        <StatCard
          label="Mocks Completed" value={mockResults.length}
          sub={bestMock !== null ? `Best: ${bestMock}%` : undefined}
          icon={<Target size={15} className="text-indigo-600 dark:text-indigo-400" />}
          color="bg-indigo-50 dark:bg-indigo-950"
        />
      </div>

      {/* Usage summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Sessions" value={progress.completedLessons.length}
          icon={<BarChart2 size={15} className="text-teal-600 dark:text-teal-400" />}
          color="bg-teal-50 dark:bg-teal-950"
        />
        <StatCard
          label="Current Streak" value={`${progress.streak}d`}
          icon={<Flame size={15} className="text-orange-500" />}
          color="bg-orange-50 dark:bg-orange-950"
        />
        <StatCard
          label="XP Earned" value={progress.xp}
          icon={<Zap size={15} className="text-yellow-500" />}
          color="bg-yellow-50 dark:bg-yellow-950"
        />
        <StatCard
          label="Tracking Events" value={events.length}
          icon={<Clock size={15} className="text-gray-500 dark:text-gray-400" />}
          color="bg-gray-100 dark:bg-gray-800"
        />
      </div>

      {/* Pathway distribution */}
      {(families.length > 0 || mockResults.length > 0) && (
        <Section title="Pathway Distribution">
          <div className="p-5 space-y-4">
            {families.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Beta Family Registrations
                </p>
                <div className="space-y-2.5">
                  {Object.entries(pathwayCounts).sort(([, a], [, b]) => b - a).map(([pathway, count]) => (
                    <PathwayBar
                      key={pathway}
                      label={PATHWAY_LABELS[pathway] ?? pathway}
                      count={count}
                      max={maxPathwayCount}
                    />
                  ))}
                </div>
              </div>
            )}
            {mockResults.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                  Mock Tests Completed
                </p>
                <div className="space-y-2.5">
                  {Object.entries(mockPathwayCounts).sort(([, a], [, b]) => b - a).map(([pathway, count]) => (
                    <PathwayBar
                      key={pathway}
                      label={PATHWAY_LABELS[pathway] ?? pathway}
                      count={count}
                      max={Math.max(...Object.values(mockPathwayCounts))}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Subject usage */}
      {progress.completedLessons.length > 0 && (
        <Section title="Subject Usage (this device)">
          <div className="p-5 space-y-2.5">
            {Object.entries(subjectCounts).sort(([, a], [, b]) => b - a).map(([subject, count]) => (
              <PathwayBar key={subject} label={subject} count={count} max={maxSubjectCount} />
            ))}
          </div>
        </Section>
      )}

      {/* Beta families */}
      <Section title="Beta Family Registrations" count={families.length}>
        {families.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">No registrations yet.</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {[...families].reverse().map((f) => (
              <div key={f.id} className="px-5 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{f.parentName}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{f.yearGroup}</span>
                    <span className="text-xs bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                      {PATHWAY_LABELS[f.pathway] ?? f.pathway}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{f.email} · {fmtDate(f.submittedAt)}</p>
                </div>
                {f.contactPermission && (
                  <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-1.5 py-0.5 rounded shrink-0">
                    OK to contact
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Testimonials */}
      <Section title="Testimonials" count={testimonials.length}>
        {testimonials.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">No testimonials yet. <Link href="/testimonial" className="text-purple-600 dark:text-purple-400 hover:underline">Submit one</Link>.</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {[...testimonials].reverse().map((t) => (
              <div key={t.id} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.parentName}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{t.yearGroup}</span>
                  {t.publishPermission && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                      Publishable
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">&quot;{t.feedback}&quot;</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{fmtDate(t.submittedAt)}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Feedback */}
      <Section title="Feedback" count={feedback.length}>
        {feedback.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">No feedback yet.</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {[...feedback].reverse().slice(0, 20).map((f) => (
              <div key={f.id} className="px-5 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    f.type === "positive" ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : f.type === "suggestion" ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}>
                    {f.type}
                  </span>
                  {f.subject && <span className="text-xs text-gray-500 dark:text-gray-400">{f.subject}</span>}
                  <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">{fmtDate(f.submittedAt)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{f.message}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Bug reports */}
      <Section title="Bug Reports" count={bugs.length}>
        {bugs.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">No bug reports yet.</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {[...bugs].reverse().slice(0, 20).map((b) => (
              <div key={b.id} className="px-5 py-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded">
                    {b.page}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{b.issueType}</span>
                  <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">{fmtDate(b.submittedAt)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Feature requests */}
      <Section title="Feature Requests" count={features.length}>
        {features.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">No feature requests yet.</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {[...features].reverse().slice(0, 20).map((f) => (
              <div key={f.id} className="px-5 py-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{f.feature}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-1">{f.why}</p>
                <p className="text-xs text-gray-300 dark:text-gray-600">{fmtDate(f.submittedAt)}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Mock results */}
      {mockResults.length > 0 && (
        <Section title="Mock Exam Results" count={mockResults.length}>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {[...mockResults].reverse().slice(0, 10).map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{r.pathwayName}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{fmtDate(r.date)} · {r.durationMinutes} min</p>
                </div>
                <span className={`text-sm font-bold ${r.totalScore >= 75 ? "text-green-600" : r.totalScore >= 55 ? "text-amber-600" : "text-red-500"}`}>
                  {r.totalScore}%
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Tracking events */}
      <Section title="Usage Events (last 30)" count={events.length}>
        {events.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">No events tracked yet.</p>
        ) : (
          <div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {[...events].reverse().slice(0, 30).map((e) => (
                <div key={e.id} className="px-5 py-2.5 flex items-start gap-3">
                  <span className="text-xs font-mono text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                    {e.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    {e.data && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {Object.entries(e.data).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-300 dark:text-gray-600 shrink-0">
                    {fmtDate(e.timestamp)} {fmtTime(e.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Footer note */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-5 py-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          All data shown is from <strong>this device&apos;s localStorage</strong>. Family data from other devices will not appear until Supabase sync is enabled in Phase 4.
          Data survives page refreshes but will be lost if localStorage is cleared.
        </p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminBetaPage() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  function loadData() {
    setData({
      families: getBetaFamilyApplications(),
      feedback: getFeedback(),
      bugs: getBugReports(),
      features: getFeatureRequests(),
      testimonials: getTestimonials(),
      events: getBetaEvents(),
      mockResults: getMockResults(),
      progress: getProgress(),
    });
    setLastRefreshed(new Date());
  }

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setUnlocked(true);
      setPinError(false);
      loadData();
    } else {
      setPinError(true);
    }
  }

  // PIN gate
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
              <BarChart2 size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Beta Admin</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Founder-only access</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3">
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError(false); }}
                placeholder="Enter access code"
                autoComplete="current-password"
                className={`w-full bg-white dark:bg-gray-900 border rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  pinError ? "border-red-400 dark:border-red-600" : "border-gray-200 dark:border-gray-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pinError && <p className="text-xs text-red-500">Incorrect access code.</p>}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Enter Dashboard
            </button>
          </form>

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
            <Link href="/dashboard" className="hover:underline">← Back to app</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-purple-700 dark:text-purple-400 font-bold text-base">
              Angel 11+
            </Link>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Beta Observation Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            {lastRefreshed && (
              <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                Updated {lastRefreshed.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
            <button
              onClick={() => {
                if (confirm("Clear all tracking events? This cannot be undone.")) {
                  clearBetaEvents();
                  loadData();
                }
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <Trash2 size={13} />
              Clear events
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-16">
        {data ? <AdminDashboard data={data} /> : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-16">Loading…</p>
        )}
      </main>
    </div>
  );
}
