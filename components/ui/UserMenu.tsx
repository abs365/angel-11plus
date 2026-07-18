"use client";

import { User, LogOut, LogIn } from "lucide-react";
import Link from "next/link";

/**
 * Sprint 1 (Angel V2.0 Enterprise UI Foundation) — Navigation Components.
 * Extracts `Navigation.tsx`'s existing user-auth block (avatar circle,
 * truncated email, sign-out) into a standalone, reusable component under
 * this sprint's formal Navigation Components catalogue — the exact same
 * markup and behaviour, not a new pattern. `Navigation.tsx` itself is not
 * modified to consume this in this sprint (that would be touching an
 * existing, working page/component beyond this sprint's foundation-only
 * scope) — it remains available for a future wave to adopt.
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
        className="flex items-center gap-2 w-full text-xs text-purple-600 dark:text-purple-400 font-medium py-1.5 px-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
      >
        <LogIn size={13} />
        Sign in to sync progress
      </Link>
    );
  }

  return (
    <div className="px-3 py-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
          <User size={14} className="text-purple-600 dark:text-purple-300" />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate flex-1">{email}</p>
      </div>
      <button
        onClick={onSignOut}
        className="flex items-center gap-2 w-full text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-1.5 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <LogOut size={13} />
        Sign out
      </button>
    </div>
  );
}
