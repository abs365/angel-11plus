"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, ShieldAlert, LogOut, Mail } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { checkIsAdmin } from "@/lib/feedback";
import { getSupabaseClient } from "@/lib/supabase";
import {
  fetchQuestionFactoryCandidates,
  reviewQuestionFactoryCandidate,
  publishQuestionFactoryCandidate,
  type QuestionFactoryCandidateRow,
} from "@/lib/questionFactory/adminClient";

/**
 * Question Factory Wave 2, Section 4 — Human Educational Review.
 *
 * Admin/content-operations capability, not learner-facing -- gated by the
 * exact same auth pattern as app/admin-beta/review/page.tsx (checkIsAdmin(),
 * migration 008's is_current_user_admin() RPC), not a new authorisation
 * mechanism. A separate page from the existing family/content review
 * surface deliberately: Question Factory candidates carry a genuinely
 * different field set (generation spec, automated validation results,
 * similarity warnings) that the existing 18-criterion REVIEW_CRITERIA
 * shape does not fit -- reusing the AUTH gate, not forcing a parallel
 * content type into an unrelated review form.
 *
 * Every write on this page is exactly one of the three narrow RPCs
 * migration 230 defines (review_question_candidate / publish_question_
 * candidate) -- this page invents no additional write path, and there is
 * no "approve all" control anywhere here, per the Founder's explicit
 * "do not allow bulk approve everything to bypass educational judgement."
 */

function AdminSignIn() {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("sending");
    setErrorMsg("");
    const { error } = await signInWithMagicLink(email.trim());
    if (error) { setState("error"); setErrorMsg(error); } else { setState("sent"); }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Question Factory Review</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Admin-only access, sign in required</p>
        </div>
        {state === "sent" ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Check your email, we sent a magic link to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="email" value={email} onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
                placeholder="you@example.com" autoComplete="email" autoFocus required
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            {state === "error" && <p className="text-xs text-red-500">{errorMsg}</p>}
            <button
              type="submit" disabled={state === "sending" || !email.trim()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {state === "sending" ? "Sending…" : "Send magic link"}
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
          {email ? <>Signed in as <strong>{email}</strong>, but</> : "This account"} does not have admin access.
        </p>
        <button onClick={onSignOut} className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );
}

function CandidateCard({ candidate, onDecided }: { candidate: QuestionFactoryCandidateRow; onDecided: () => void }) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState<"rejected" | "needs_correction" | null>(null);

  const supabase = getSupabaseClient();

  async function handleApprove() {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const result = await reviewQuestionFactoryCandidate(supabase, candidate.candidateId, "approved");
    setBusy(false);
    if (!result.success) { setError(result.error ?? "Approval failed."); return; }
    onDecided();
  }

  async function handleRejectOrCorrect(decision: "rejected" | "needs_correction") {
    if (!supabase) return;
    if (!rejectionReason.trim()) { setError("A reason is required."); return; }
    setBusy(true);
    setError(null);
    const result = await reviewQuestionFactoryCandidate(supabase, candidate.candidateId, decision, rejectionReason.trim());
    setBusy(false);
    if (!result.success) { setError(result.error ?? "Action failed."); return; }
    onDecided();
  }

  async function handlePublish() {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const result = await publishQuestionFactoryCandidate(supabase, candidate.candidateId);
    setBusy(false);
    if (!result.success) { setError(result.error ?? "Publication failed."); return; }
    onDecided();
  }

  const questionContentText = typeof candidate.questionContent === "object" && candidate.questionContent !== null
    ? JSON.stringify(candidate.questionContent, null, 2)
    : String(candidate.questionContent);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-gray-400">{candidate.candidateId}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {candidate.reviewStatus} · {candidate.publicationStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <div><strong className="text-gray-700 dark:text-gray-300">Family:</strong> {candidate.familyId}</div>
        <div><strong className="text-gray-700 dark:text-gray-300">Competency:</strong> {candidate.competencyId ?? "None"}</div>
        <div><strong className="text-gray-700 dark:text-gray-300">Skill:</strong> {candidate.skill}</div>
        <div><strong className="text-gray-700 dark:text-gray-300">Difficulty:</strong> {candidate.difficulty}</div>
        <div><strong className="text-gray-700 dark:text-gray-300">Preparation stage:</strong> {candidate.preparationStage ?? "None"}</div>
        <div><strong className="text-gray-700 dark:text-gray-300">Pathway:</strong> {candidate.pathway.join(", ") || "None"}</div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Question</p>
        <pre className="text-xs bg-gray-50 dark:bg-gray-950 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{questionContentText}</pre>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Answer</p>
          <p className="text-sm text-gray-900 dark:text-gray-100">{candidate.claimedAnswer}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Worked explanation</p>
          <p className="text-sm text-gray-900 dark:text-gray-100">{candidate.workedExplanation ?? "None"}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Automated validation</p>
        <pre className="text-xs bg-gray-50 dark:bg-gray-950 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(candidate.mathematicalValidation, null, 2)}</pre>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Duplicate / similarity check</p>
        <pre className="text-xs bg-gray-50 dark:bg-gray-950 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(candidate.similarityValidation, null, 2)}</pre>
      </div>

      <div className="text-xs text-gray-400">
        Generated {new Date(candidate.generatedAt).toLocaleString()} · provenance: {candidate.provenance}
        {candidate.reviewerId && <> · reviewed by {candidate.reviewerId} at {candidate.reviewTimestamp ? new Date(candidate.reviewTimestamp).toLocaleString() : ""}</>}
        {candidate.rejectionReason && <> · reason: {candidate.rejectionReason}</>}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {candidate.reviewStatus === "pending_review" && (
        <div className="flex flex-wrap gap-2 pt-2">
          <button onClick={handleApprove} disabled={busy} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white disabled:opacity-50">Approve</button>
          <button onClick={() => setShowRejectForm("rejected")} disabled={busy} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white disabled:opacity-50">Reject</button>
          <button onClick={() => setShowRejectForm("needs_correction")} disabled={busy} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 text-white disabled:opacity-50">Needs correction</button>
        </div>
      )}

      {showRejectForm && (
        <div className="pt-2 space-y-2">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={`Reason for ${showRejectForm === "rejected" ? "rejection" : "requesting correction"} (required)`}
            className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-900"
            rows={2}
          />
          <button onClick={() => handleRejectOrCorrect(showRejectForm)} disabled={busy || !rejectionReason.trim()} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-700 text-white disabled:opacity-50">
            Confirm
          </button>
        </div>
      )}

      {candidate.reviewStatus === "approved" && candidate.publicationStatus === "unpublished" && (
        <div className="pt-2">
          <button onClick={handlePublish} disabled={busy} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white disabled:opacity-50">
            Publish to Practice
          </button>
        </div>
      )}

      {candidate.publicationStatus === "published" && (
        <p className="text-xs text-blue-600 dark:text-blue-400 pt-1">Published as {candidate.publishedQuestionId}</p>
      )}
    </div>
  );
}

function CandidateReviewDashboard() {
  const [candidates, setCandidates] = useState<QuestionFactoryCandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending_review" | "approved" | "rejected" | "needs_correction" | "all">("pending_review");

  const load = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const data = await fetchQuestionFactoryCandidates(supabase, filter === "all" ? undefined : filter);
    setCandidates(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {(["pending_review", "approved", "rejected", "needs_correction", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${filter === f ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>
      {loading && <p className="text-sm text-gray-400">Loading candidates…</p>}
      {!loading && candidates.length === 0 && <p className="text-sm text-gray-400">No candidates in this state.</p>}
      <div className="space-y-4">
        {candidates.map((c) => (
          <CandidateCard key={c.candidateId} candidate={c} onDecided={load} />
        ))}
      </div>
    </div>
  );
}

type AccessState = "checking" | "not-signed-in" | "not-admin" | "admin";

export default function QuestionFactoryReviewPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [access, setAccess] = useState<AccessState>("checking");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setAccess("not-signed-in"); return; }
    checkIsAdmin().then((isAdmin) => setAccess(isAdmin ? "admin" : "not-admin"));
  }, [authLoading, user]);

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
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin-beta" className="text-blue-700 dark:text-blue-400 font-bold text-base shrink-0">Angel 11+</Link>
            <span className="text-gray-300 dark:text-gray-700 shrink-0">·</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">Question Factory Review</span>
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-3 py-1.5 rounded-lg">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 pb-16">
        <Link href="/admin-beta/review" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4">
          <ArrowLeft size={12} /> Content review
        </Link>
        <CandidateReviewDashboard />
      </main>
    </div>
  );
}
