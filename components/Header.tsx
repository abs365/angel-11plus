"use client";

import { Bell, User, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import LearnerSwitcher from "@/components/LearnerSwitcher";
import Popover from "@/components/ui/Popover";
import SearchBar from "@/components/ui/SearchBar";
import NotificationArea from "@/components/ui/NotificationArea";
import Breadcrumbs, { type Breadcrumb } from "@/components/ui/Breadcrumbs";
import { hasRegisteredParentAccount } from "@/lib/registeredAccess";

/**
 * Sprint 2 (Platform Shell) — the new top header bar every page now
 * inherits via `PageLayout`, per Angel V2.0's Sprint 1 foundation. Reuses
 * `UserMenu`/`NotificationArea`/`Popover`/`SearchBar`/`Breadcrumbs`
 * (all Sprint 1) unmodified — this file is composition, not new visual
 * language. `useAuth()` is the existing, unmodified auth hook
 * `Navigation.tsx` already uses; no authentication logic is touched.
 *
 * `notifications` is always empty — this product has no real notification
 * data source (Sprint 1's own documented constraint on `NotificationArea`
 * carries forward here unchanged), so the bell always opens an honest
 * empty state, never fabricated content.
 */
interface HeaderProps {
  breadcrumbs?: Breadcrumb[];
}

export default function Header({ breadcrumbs }: HeaderProps) {
  const { user: sessionUser, signOut, loading } = useAuth();
  // Every visitor holds a Supabase ANONYMOUS technical session. That is not a registered parent account, so it
  // never gets the child switcher ("Viewing: ...") or the account menu ("Sign out") -- only Sign in / Create
  // account (controlled-beta policy, lib/registeredAccess.ts).
  const user = hasRegisteredParentAccount(sessionUser) ? sessionUser : null;
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/dashboard");
  }

  return (
    // New Learner Experience Migration — sticks below the fixed top nav bar
    // (md:top-[var(--topbar-height)]), not the viewport top, so it never
    // scrolls under Navigation's z-40 bar. Mobile has no fixed top bar, so
    // top-0 is correct there.
    <header className="sticky top-0 md:top-[var(--topbar-height)] z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 px-4 md:px-8 py-3">
        <div className="flex-1 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <Breadcrumbs items={breadcrumbs} />
          ) : (
            <span className="sr-only">Angel 11+</span>
          )}
        </div>

        <div className="hidden sm:block">
          <SearchBar />
        </div>

        {!loading && user && <LearnerSwitcher />}

        <Popover
          label="Notifications"
          trigger={(props) => (
            <button
              {...props}
              aria-label="Notifications"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell size={18} />
            </button>
          )}
        >
          <NotificationArea notifications={[]} />
        </Popover>

        {!loading && user ? (
          <Popover
            label="Account menu"
            trigger={(props) => (
              <button
                {...props}
                aria-label="Account menu"
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <User size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
            )}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-3 w-56">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 px-2 mb-0.5">
                Parent Account
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate px-2 mb-2">{user.email}</p>
              <Link
                href="/learning-intelligence/parent"
                className="block w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors"
              >
                Parent Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors"
              >
                Sign out
              </button>
            </div>
          </Popover>
        ) : (
          !loading && (
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/login?mode=signin"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:underline shrink-0"
              >
                <LogIn size={15} />
                <span>Sign in</span>
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold bg-sky-700 text-white rounded-lg px-3 py-1.5 hover:bg-sky-800 transition-colors motion-reduce:transition-none shrink-0"
              >
                Create account
              </Link>
            </div>
          )
        )}
      </div>
    </header>
  );
}
