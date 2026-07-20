"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, MessageSquare, Bug, Lightbulb, Star, Target,
  BarChart2, Clock, Flame, Zap, Trash2, RefreshCw,
  ChevronDown, ChevronUp, Mail, ArrowRight, ShieldAlert, LogOut,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  fetchFeedback, fetchBugReports, fetchFeatureRequests,
  fetchBetaFamilyApplications, fetchTestimonials, checkIsAdmin,
  type FeedbackEntry, type BugReport, type FeatureRequest,
  type BetaFamilyApplication, type Testimonial,
} from "@/lib/feedback";
import { getBetaEvents, clearBetaEvents, type TrackingEvent } from "@/lib/betaTracking";
import { getMockResults } from "@/lib/mockProgress";
import { getProgress } from "@/lib/progress";
import type { MockResult } from "@/types/mock";
import type { UserProgress } from "@/types";

// Phase 5A — Enterprise Beta Readiness. The hardcoded client-side access
// code previously defined here has been removed entirely — access is now
// gated by real Supabase Authentication (magic-link, the same flow
// app/login/page.tsx uses) plus a server-enforced admin check
// (is_current_user_admin(), migration 008). The actual security boundary
// is Postgres RLS on the 5 beta-submission tables, not this component —
// even a modified/bypassed client would receive empty results from
// Supabase for a non-admin session, not real data. There is no
// self-service path to becoming an admin; a founder must run one SQL
// statement in the Supabase Dashboard after signing in once (see
// migration 008's bootstrap comment).

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

// ─── Learning Engine Coverage (Capability 3, Wave 4 — Founder Operations)
// A real, read-only verification utility: how much of Assessment Brain
// V1's 27 Question Types actually have content authored in
// ali_question_bank today, cross-DB-instance (not "this device only" like
// the sections below), reusing Wave 1's own read pattern unchanged. No
// new educational logic — just a count. ─────────────────────────────────

function LearningEngineCoverage() {
  const [state, setState] = useState<"loading" | "ready" | "no-table" | "error">("loading");
  const [withContent, setWithContent] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const { getSupabaseClient } = await import("@/lib/supabase");
      const { ALL_QUESTION_TYPE_IDS } = await import("@/lib/learningEngine/assessmentBrainMap");
      setTotal(ALL_QUESTION_TYPE_IDS.length);

      const supabase = getSupabaseClient();
      if (!supabase) return setState("error");

      const { data, error } = await supabase
        .from("ali_question_bank")
        .select("skill")
        .in("skill", ALL_QUESTION_TYPE_IDS)
        .contains("pathway", ["csse"]);

      if (error) {
        // PGRST205 = table not found in schema cache — the honest, expected
        // state until migrations 004-013 are applied (see
        // CAP4_LAUNCH_ACCEPTANCE_PACK.md), not a bug to hide.
        return setState(error.code === "PGRST205" ? "no-table" : "error");
      }
      setWithContent(new Set((data ?? []).map((r) => r.skill)).size);
      setState("ready");
    })();
  }, []);

  return (
    <Section title="Learning Engine Coverage (CSSE, all devices)">
      <div className="px-5 py-4">
        {state === "loading" && <p className="text-sm text-gray-400 dark:text-gray-500">Checking…</p>}
        {state === "no-table" && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">ali_question_bank</code> does not
            exist yet in this database — migrations 004-013 have not been applied. This is the expected, honest state,
            not an error to fix here.
          </p>
        )}
        {state === "error" && <p className="text-sm text-gray-400 dark:text-gray-500">Could not check right now.</p>}
        {state === "ready" && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-bold">{withContent}</span> of <span className="font-bold">{total}</span> Assessment
            Brain V1 Question Types have real content authored, across every learner, in the live database.
          </p>
        )}
      </div>
    </Section>
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

  const pathwayCounts: Record<string, number> = {};
  for (const f of families) {
    const p = f.pathway || "not-sure";
    pathwayCounts[p] = (pathwayCounts[p] ?? 0) + 1;
  }
  const maxPathwayCount = Math.max(...Object.values(pathwayCounts), 1);

  const subjectCounts: Record<string, number> = {};
  for (const lesson of progress.completedLessons) {
    const s = subjectFromLessonId(lesson);
    subjectCounts[s] = (subjectCounts[s] ?? 0) + 1;
  }
  const maxSubjectCount = Math.max(...Object.values(subjectCounts), 1);

  const mockPathwayCounts: Record<string, number> = {};
  for (const r of mockResults) {
    mockPathwayCounts[r.pathway] = (mockPathwayCounts[r.pathway] ?? 0) + 1;
  }

  const eventCounts: Record<string, number> = {};
  for (const e of events) {
    eventCounts[e.type] = (eventCounts[e.type] ?? 0) + 1;
  }

  const bestMock = mockResults.length > 0 ? Math.max(...mockResults.map((r) => r.totalScore)) : null;

  return (
    <div className="space-y-5">

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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Sessions (this device)" value={progress.completedLessons.length}
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
          label="Tracking Events (this device)" value={events.length}
          icon={<Clock size={15} className="text-gray-500 dark:text-gray-400" />}
          color="bg-gray-100 dark:bg-gray-800"
        />
      </div>

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

      {progress.completedLessons.length > 0 && (
        <Section title="Subject Usage (this device)">
          <div className="p-5 space-y-2.5">
            {Object.entries(subjectCounts).sort(([, a], [, b]) => b - a).map(([subject, count]) => (
              <PathwayBar key={subject} label={subject} count={count} max={maxSubjectCount} />
            ))}
          </div>
        </Section>
      )}

      <Section title="Beta Family Registrations" count={families.length}>
        {families.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">No registrations yet.</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {families.map((f) => (
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

      <Section title="Testimonials" count={testimonials.length}>
        {testimonials.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">No testimonials yet. <Link href="/testimonial" className="text-purple-600 dark:text-purple-400 hover:underline">Submit one</Link>.</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {testimonials.map((t) => (
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

      <Section title="Feedback" count={feedback.length}>
        {feedback.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">No feedback yet.</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {feedback.slice(0, 20).map((f) => (
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

      <Section title="Bug Reports" count={bugs.length}>
        {bugs.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">No bug reports yet.</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {bugs.slice(0, 20).map((b) => (
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

      <Section title="Feature Requests" count={features.length}>
        {features.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">No feature requests yet.</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {features.slice(0, 20).map((f) => (
              <div key={f.id} className="px-5 py-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{f.feature}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-1">{f.why}</p>
                <p className="text-xs text-gray-300 dark:text-gray-600">{fmtDate(f.submittedAt)}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {mockResults.length > 0 && (
        <Section title="Mock Exam Results (this device)" count={mockResults.length}>
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

      <LearningEngineCoverage />

      <Section title="Usage Events, this device only (last 30)" count={events.length}>
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

      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-5 py-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          Beta Families, Feedback, Bug Reports, Feature Requests and Testimonials are read from Supabase and reflect
          submissions from <strong>every</strong> beta family, on any device — not just this one (Phase 5A). Mock
          Exam Results, Subject Usage and Tracking Events above are still per-device only.
        </p>
      </div>
    </div>
  );
}

// ─── Sign-in gate ────────────────────────────────────────────────────────────

type SignInState = "idle" | "sending" | "sent" | "error";

function AdminSignIn() {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SignInState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("sending");
    setErrorMsg("");
    const { error } = await signInWithMagicLink(email.trim());
    if (error) {
      setState("error");
      setErrorMsg(error);
    } else {
      setState("sent");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
            <BarChart2 size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Beta Admin</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Founder-only access — sign in required</p>
        </div>

        {state === "sent" ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Check your email — we sent a magic link to <strong>{email}</strong>. Click it to sign in and return here.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                required
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            {state === "error" && <p className="text-xs text-red-500">{errorMsg}</p>}
            <button
              type="submit"
              disabled={state === "sending" || !email.trim()}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state === "sending" ? "Sending…" : (<>Send magic link <ArrowRight size={16} /></>)}
            </button>
          </form>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
          <Link href="/dashboard" className="hover:underline">← Back to app</Link>
        </p>
      </div>
    </div>
  );
}

function NotAuthorized({ email, onSignOut }: { email: string | null; onSignOut: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Not authorised</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          {email ? <>Signed in as <strong>{email}</strong>, but</> : "This account"} does not have admin access to
          the beta dashboard.
        </p>
        <button
          onClick={onSignOut}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <LogOut size={14} />
          Sign out
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          <Link href="/dashboard" className="hover:underline">← Back to app</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type AccessState = "checking" | "not-signed-in" | "not-admin" | "admin";

export default function AdminBetaPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [access, setAccess] = useState<AccessState>("checking");
  const [data, setData] = useState<AdminData | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setAccess("not-signed-in");
      return;
    }
    checkIsAdmin().then((isAdmin) => {
      setAccess(isAdmin ? "admin" : "not-admin");
    });
  }, [authLoading, user]);

  useEffect(() => {
    if (access === "admin") loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access]);

  async function loadData() {
    const [families, feedback, bugs, features, testimonials] = await Promise.all([
      fetchBetaFamilyApplications(),
      fetchFeedback(),
      fetchBugReports(),
      fetchFeatureRequests(),
      fetchTestimonials(),
    ]);
    setData({
      families, feedback, bugs, features, testimonials,
      events: getBetaEvents(),
      mockResults: getMockResults(),
      progress: getProgress(),
    });
    setLastRefreshed(new Date());
  }

  if (authLoading || access === "checking") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">Checking access…</p>
      </div>
    );
  }

  if (access === "not-signed-in") return <AdminSignIn />;
  if (access === "not-admin") return <NotAuthorized email={user?.email ?? null} onSignOut={signOut} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="text-purple-700 dark:text-purple-400 font-bold text-base shrink-0">
              Angel 11+
            </Link>
            <span className="text-gray-300 dark:text-gray-700 shrink-0">·</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">Beta Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
                if (confirm("Clear this device's tracking events? This cannot be undone.")) {
                  clearBetaEvents();
                  loadData();
                }
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <Trash2 size={13} />
              Clear events
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut size={13} />
              Sign out
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
