"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, LogOut, Mail, ArrowRight, CheckCircle2, AlertTriangle, FileCheck } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { checkIsAdmin } from "@/lib/feedback";
import { getSupabaseClient } from "@/lib/supabase";
import { releaseMockReport, backfillNamedMathematicsAcceptanceAnalysis } from "@/lib/mockAttempt/client";

/**
 * CSSE Two-Paper Mock, final production acceptance — the bounded admin
 * Mock Report Release surface. The governed backend this page drives
 * already existed before this page did: mock_release_report() (migration
 * 074, hardened by 227) derives admin authority entirely from
 * is_current_user_admin(), and releaseMockReport() (lib/mockAttempt/
 * client.ts) is the existing, unmodified client wrapper around it — this
 * page adds no RPC, no RLS policy, no new backend logic of any kind, and
 * cannot weaken the RPC's own enforcement (a non-admin caller is refused
 * by the database regardless of what this page renders).
 *
 * WHY A BOUNDED ATTEMPT-ID FORM, NOT A LIST: traced directly before
 * building this — neither ali_mock_attempt's own RLS
 * (ali_mock_attempt_select_own, migration 070: `profile_id in (caller's
 * own profile)`) nor ali_mock_attempt_report's own RLS
 * (ali_mock_attempt_report_select_released, migration 072: owner AND
 * released only) grants an admin any broader read than an ordinary
 * learner gets for their own rows — unlike ali_writing_assessment
 * (migration 245), which does have an `is_current_user_admin()` clause.
 * Building a "completed but unreleased" list would need a NEW RPC or RLS
 * change, exactly what this pass is scoped not to introduce. The
 * smallest production-safe surface is therefore exactly what the
 * Founder's own brief named as the fallback: an attempt-ID input, one
 * explicit release action, and an honest disclosure that this page
 * cannot show or reconcile a live report list.
 *
 * Admin gating mirrors app/admin-beta/page.tsx's own established
 * pattern exactly (useAuth + checkIsAdmin, fail-closed on every branch
 * other than a confirmed admin).
 */

type AccessState = "checking" | "not-signed-in" | "not-admin" | "admin";
type ReleaseStatus = "idle" | "confirming" | "releasing" | "success" | "error";
type BackfillStatus = "idle" | "confirming" | "running" | "success" | "error";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
            <FileCheck size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mock Report Release</h1>
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
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            {state === "error" && <p className="text-xs text-red-500">{errorMsg}</p>}
            <button
              type="submit"
              disabled={state === "sending" || !email.trim()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          {email ? <>Signed in as <strong>{email}</strong>, but</> : "This account"} does not have admin access to Mock report release.
        </p>
        <button onClick={onSignOut} className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <LogOut size={14} /> Sign out
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          <Link href="/dashboard" className="hover:underline">← Back to app</Link>
        </p>
      </div>
    </div>
  );
}

export default function MockReportReleasePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [access, setAccess] = useState<AccessState>("checking");
  const [attemptId, setAttemptId] = useState("");
  const [status, setStatus] = useState<ReleaseStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [releasedAttemptId, setReleasedAttemptId] = useState("");
  const [backfillStatus, setBackfillStatus] = useState<BackfillStatus>("idle");
  const [backfillErrorMessage, setBackfillErrorMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setAccess("not-signed-in"); return; }
    checkIsAdmin().then((isAdmin) => setAccess(isAdmin ? "admin" : "not-admin"));
  }, [authLoading, user]);

  const trimmedId = attemptId.trim();
  const isValidId = UUID_PATTERN.test(trimmedId);

  function handleRequestRelease() {
    if (!isValidId || status === "releasing") return;
    setStatus("confirming");
    setErrorMessage("");
  }

  function handleCancel() {
    setStatus("idle");
  }

  async function handleConfirmRelease() {
    if (!isValidId || status === "releasing") return; // guards against double submission
    setStatus("releasing");
    const supabase = getSupabaseClient();
    if (!supabase) { setStatus("error"); setErrorMessage("Not connected."); return; }
    const result = await releaseMockReport(supabase, trimmedId);
    if (result.error) {
      // The exact, governed error message from mock_release_report()
      // itself (migration 227) — never replaced with an invented,
      // friendlier one. The database remains the sole authority on
      // whether this succeeded.
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }
    setReleasedAttemptId(trimmedId);
    setStatus("success");
    setAttemptId("");
  }

  function handleRequestBackfill() {
    if (backfillStatus === "running") return;
    setBackfillStatus("confirming");
    setBackfillErrorMessage("");
  }

  function handleCancelBackfill() {
    setBackfillStatus("idle");
  }

  async function handleConfirmBackfill() {
    if (backfillStatus === "running") return; // guards against double submission
    setBackfillStatus("running");
    const supabase = getSupabaseClient();
    if (!supabase) { setBackfillStatus("error"); setBackfillErrorMessage("Not connected."); return; }
    const result = await backfillNamedMathematicsAcceptanceAnalysis(supabase);
    if (result.error) {
      // The exact, governed error message from the database function
      // itself, never replaced with an invented, friendlier one.
      setBackfillStatus("error");
      setBackfillErrorMessage(result.error);
      return;
    }
    setBackfillStatus("success");
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
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin-beta" className="text-sm font-semibold text-gray-700 dark:text-gray-300">← Admin</Link>
          <button onClick={signOut} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">Sign out</button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mock Report Release</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Releases exactly one Mock attempt&apos;s report through the existing governed path
            (mock_release_report(), admin-gated inside the database itself — this page cannot bypass that). Release one attempt at a time; there is no bulk action.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            This page does not show a list of completed or unreleased reports — no existing admin read capability provides one without a new RPC or RLS change, which is out of scope here. You need the attempt ID from elsewhere (e.g. the learner&apos;s own sitting hub, or your own records) before releasing.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Attempt ID</span>
            <input
              type="text"
              value={attemptId}
              onChange={(e) => { setAttemptId(e.target.value); setStatus("idle"); setErrorMessage(""); }}
              placeholder="00000000-0000-0000-0000-000000000000"
              disabled={status === "releasing" || status === "confirming"}
              className="mt-1 w-full font-mono text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            />
            {attemptId.trim().length > 0 && !isValidId && (
              <span className="text-xs text-red-500 mt-1 block">Not a valid attempt ID (expected a UUID).</span>
            )}
          </label>

          {status === "idle" && (
            <button
              onClick={handleRequestRelease}
              disabled={!isValidId}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Release report
            </button>
          )}

          {status === "confirming" && (
            <div className="border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                Release the report for attempt <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{trimmedId}</code>? This makes the result visible to that learner and cannot be undone from this page.
              </p>
              <div className="flex items-center gap-2">
                <button onClick={handleConfirmRelease} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors">
                  Confirm release
                </button>
                <button onClick={handleCancel} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-2 rounded-lg text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {status === "releasing" && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">Releasing…</p>
          )}

          {status === "success" && (
            <div className="flex items-start gap-3 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Released</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Attempt <code className="font-mono">{releasedAttemptId}</code> — the database confirmed the release (mock_release_report returned no error). This page cannot independently re-verify the row afterward; check from the learner&apos;s own account if you need to confirm.
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-3 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Not released</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">One-time recovery: Mathematics acceptance attempt</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            CSSE Two-Paper Mock P1 Repair — runs the real analysis pipeline (mock_analyse_attempt) for exactly one
            named, already-scored attempt. Not a general capability: the attempt ID is hardcoded inside the database
            function itself, not entered here.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
          {backfillStatus === "idle" && (
            <button
              onClick={handleRequestBackfill}
              className="w-full bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Backfill Mathematics analysis
            </button>
          )}

          {backfillStatus === "confirming" && (
            <div className="border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                Run analysis for the named Mathematics acceptance attempt? This does not release the report — release
                remains a separate, explicit action above.
              </p>
              <div className="flex items-center gap-2">
                <button onClick={handleConfirmBackfill} className="flex-1 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors">
                  Confirm backfill
                </button>
                <button onClick={handleCancelBackfill} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-2 rounded-lg text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {backfillStatus === "running" && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">Running…</p>
          )}

          {backfillStatus === "success" && (
            <div className="flex items-start gap-3 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Analysis run</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The database confirmed no error. This page cannot independently re-verify the row afterward — check
                  the attempt&apos;s analysis_state, then release it above once ready.
                </p>
              </div>
            </div>
          )}

          {backfillStatus === "error" && (
            <div className="flex items-start gap-3 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Not completed</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono leading-relaxed">{backfillErrorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
