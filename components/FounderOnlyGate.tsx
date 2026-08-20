"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowRight, Mail } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { checkIsAdmin } from "@/lib/feedback";
import { resolveGateAccess } from "@/lib/accessControl";

/**
 * Gate 001 / Decision 130 LR-3 — Founder-Validation Route Protection.
 *
 * Reuses this app's existing authentication/admin architecture unchanged
 * (magic-link sign-in via AuthProvider + migration 008's
 * is_current_user_admin() RPC, the same mechanism app/admin-beta/page.tsx
 * already relies on) rather than introducing a new one. The real security
 * boundary is server-side RLS behind is_current_user_admin(); this
 * component only prevents ordinary families from ever reaching the
 * founder-only UI underneath it.
 */
export default function FounderOnlyGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signInWithMagicLink, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sendError, setSendError] = useState<string | null>(null);

  const access = resolveGateAccess(authLoading, user, isAdmin);

  useEffect(() => {
    if (authLoading || !user) return;
    checkIsAdmin().then(setIsAdmin);
  }, [authLoading, user]);

  if (access === "checking") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">Checking access…</p>
      </div>
    );
  }

  if (access === "not-signed-in") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center">Founder sign-in required</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6 text-center leading-relaxed">
            This page is restricted to the founder account.
          </p>
          {sendState === "sent" ? (
            <p className="text-sm text-center text-gray-600 dark:text-gray-300">
              Check <strong>{email}</strong> for a sign-in link.
            </p>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSendState("sending");
                const { error } = await signInWithMagicLink(email);
                if (error) {
                  setSendError(error);
                  setSendState("error");
                } else {
                  setSendState("sent");
                }
              }}
              className="space-y-3"
            >
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSendState("idle"); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  required
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              {sendState === "error" && <p className="text-xs text-red-500">{sendError}</p>}
              <button
                type="submit"
                disabled={sendState === "sending" || !email.trim()}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendState === "sending" ? "Sending…" : (<>Send magic link <ArrowRight size={16} /></>)}
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

  if (access === "not-admin") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={24} className="text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Not authorised</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            {user?.email ? <>Signed in as <strong>{user.email}</strong>, but</> : "This account"} does not have
            founder access.
          </p>
          <button
            onClick={() => signOut()}
            className="mt-6 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Sign out
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            <Link href="/dashboard" className="hover:underline">← Back to app</Link>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
