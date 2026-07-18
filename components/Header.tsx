"use client";

import { Bell, User, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Popover from "@/components/ui/Popover";
import SearchBar from "@/components/ui/SearchBar";
import NotificationArea from "@/components/ui/NotificationArea";
import Breadcrumbs, { type Breadcrumb } from "@/components/ui/Breadcrumbs";

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
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/dashboard");
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
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
                className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                <User size={16} className="text-purple-600 dark:text-purple-300" />
              </button>
            )}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-3 w-56">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate px-2 mb-2">{user.email}</p>
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
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline shrink-0"
            >
              <LogIn size={15} />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )
        )}
      </div>
    </header>
  );
}
