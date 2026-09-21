"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import PageLayout from "@/components/PageLayout";
import { decideAccess } from "@/lib/registeredAccess";

/**
 * Controlled-beta policy: a registered parent account is required for the persistent learner experience
 * (lib/registeredAccess.ts). Wraps every page from the root layout so the rule lives in ONE place.
 *
 * For a visitor who is only holding the anonymous technical session (or no session), a learner surface is not
 * mounted at all: it shows this panel instead. Because the page never mounts it cannot read a learner profile,
 * show the child switcher, or record any practice/Mock evidence. Public pages (getting started, privacy, terms,
 * support forms, sign in) are unaffected.
 */
export default function RegisteredAccountGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { user, loading } = useAuth();
  const decision = decideAccess({ pathname, loading, user });

  if (decision === "allow") return <>{children}</>;

  if (decision === "pending") {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center" data-testid="access-pending">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium" aria-live="polite">Loading…</p>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-xl mx-auto px-4 py-10 md:px-8 md:py-16" data-testid="account-required">
        <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl md:text-3xl">
          Create your free parent account to get started
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mt-3 leading-relaxed">
          Angel 11+ keeps each child&rsquo;s practice, progress and Mock results in a parent account, so nothing is lost
          and nothing is ever mixed between families. Create an account or sign in to continue.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center text-sm font-semibold bg-sky-700 text-white rounded-xl px-5 py-3 hover:bg-sky-800 transition-colors motion-reduce:transition-none"
          >
            Create account
          </Link>
          <Link
            href="/login?mode=signin"
            className="inline-flex items-center justify-center text-sm font-semibold border border-sky-700 text-sky-700 dark:text-sky-400 dark:border-sky-400 rounded-xl px-5 py-3 hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors motion-reduce:transition-none"
          >
            Sign in
          </Link>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-6 leading-relaxed">
          No child&rsquo;s information is shown or saved until you are signed in. Want to see how it works first?{" "}
          <Link href="/getting-started" className="text-sky-700 dark:text-sky-400 font-medium hover:underline">
            Read the getting-started guide
          </Link>
          .
        </p>
      </div>
    </PageLayout>
  );
}
