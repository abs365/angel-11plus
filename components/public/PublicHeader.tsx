"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { hasRegisteredParentAccount } from "@/lib/registeredAccess";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Increment 1 (Public Experience Foundation) — the homepage's own header,
 * deliberately NOT the authenticated app shell's `Navigation`/`Header`
 * (Today/Learn/Practise/Mock/Progress, search, notifications, learner
 * switcher). A public visitor has no learner to switch between and no app
 * surfaces to jump to yet; showing the app's internal navigation here would
 * be exactly the "architecture exposed as product" pattern the Experience
 * Gap Audit found elsewhere. Isolated by design (ANGEL_11PLUS_EXPERIENCE_
 * TRANSFORMATION Increment 1, §13) so this file can never accidentally
 * restyle an authenticated page.
 *
 * Same signed-in/signed-out pattern already used by Header.tsx/Navigation.tsx
 * (hasRegisteredParentAccount(sessionUser) ? sessionUser : null) — an
 * anonymous technical session is never presented as a real account here
 * either, and a registered parent who lands on "/" gets a single "Go to my
 * dashboard" action instead of Sign in/Create account.
 */
const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#what-you-practise", label: "What children practise" },
  { href: "#for-parents", label: "For parents" },
  { href: "#mock-tests", label: "Mock Tests" },
];

export default function PublicHeader() {
  const { user: sessionUser, loading } = useAuth();
  const user = hasRegisteredParentAccount(sessionUser) ? sessionUser : null;

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
          <span className="text-lg md:text-xl font-bold text-blue-700 dark:text-blue-400">Angel 11+</span>
        </Link>

        <nav aria-label="Angel 11+" className="hidden md:flex items-center gap-1 flex-1 min-w-0">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] transition-colors motion-reduce:transition-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1 md:hidden" />

        {!loading && user ? (
          <ButtonLink href="/dashboard" size="sm" className="shrink-0">
            Go to my dashboard
          </ButtonLink>
        ) : (
          !loading && (
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <Link
                href="/login?mode=signin"
                className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors motion-reduce:transition-none"
              >
                Sign in
              </Link>
              <ButtonLink href="/login" size="sm">
                Start preparing
              </ButtonLink>
            </div>
          )
        )}
      </div>
    </header>
  );
}
