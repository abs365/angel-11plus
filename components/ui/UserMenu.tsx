"use client";

import { LogOut, LogIn } from "lucide-react";
import Link from "next/link";

/**
 * Sprint 1 (Angel V2.0 Enterprise UI Foundation) — Navigation Components.
 * Extracts `Navigation.tsx`'s existing user-auth block (avatar circle,
 * truncated email, sign-out) into a standalone, reusable component under
 * this sprint's formal Navigation Components catalogue.
 *
 * AN-101 (Learning Navigation, Step 3E — Account Area) — replaces the
 * generic person icon with the account's own initial, matching the
 * initials-avatar treatment `Header.tsx`'s account popover already uses
 * elsewhere in the shell. Truncation and sign-out behaviour are unchanged;
 * no authentication logic is touched.
 */
interface UserMenuProps {
  email: string | null | undefined;
  loading: boolean;
  onSignOut: () => void;
}

export default function UserMenu({ email, loading, onSignOut }: UserMenuProps) {
  if (loading) return null;

  if (!email) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 w-full text-xs text-slate-600 dark:text-slate-400 font-medium py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors motion-reduce:transition-none"
      >
        <LogIn size={13} aria-hidden="true" />
        Sign in to sync progress
      </Link>
    );
  }

  const initial = email[0]?.toUpperCase() ?? "?";

  return (
    <div className="px-3 py-1">
      <div className="flex items-center gap-2 mb-2">
        <div
          aria-hidden="true"
          className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-300"
        >
          {initial}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate flex-1" title={email}>
          {email}
        </p>
      </div>
      <button
        onClick={onSignOut}
        className="flex items-center gap-2 w-full text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-1.5 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors motion-reduce:transition-none"
      >
        <LogOut size={13} aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}
