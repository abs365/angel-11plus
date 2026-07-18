"use client";

import { Crown } from "lucide-react";
import SupportLayout from "@/components/SupportLayout";

/**
 * Sprint 2 (Platform Shell) — Angel Plus. No premium tier, billing, or new
 * business logic exists anywhere in this codebase, and this sprint
 * explicitly does not introduce any ("Do NOT introduce new business
 * logic" / "Do not fabricate information"). This page exists only so the
 * new "Angel Plus" navigation entry (components/Navigation.tsx) leads
 * somewhere honest rather than a broken link or an invented feature list.
 */
export default function AngelPlusPage() {
  return (
    <SupportLayout backHref="/dashboard" backLabel="My Admission Journey">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
          <Crown size={28} className="text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">Angel Plus</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed">
          Coming soon. We&apos;re not ready to say more than that yet — when Angel Plus is real, this page will describe it honestly.
        </p>
      </div>
    </SupportLayout>
  );
}
