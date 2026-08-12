"use client";

import { useEffect } from "react";
import type { Pathway } from "@/types/pathway";

/**
 * Active Pathway Context (Section 6): shared confirmation dialog used by
 * both components/PathwaySwitcher.tsx (top-bar switcher) and
 * app/pathways/page.tsx (School Intelligence card grid) — the two places a
 * real pathway switch can be initiated, so the copy and behaviour stay in
 * one place rather than two hand-kept-in-sync dialogs.
 */
export default function PathwaySwitchConfirmDialog({
  from,
  to,
  onCancel,
  onConfirm,
}: {
  from: Pathway;
  to: Pathway;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button aria-label="Cancel" onClick={onCancel} className="absolute inset-0 bg-black/40" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pathway-switch-title"
        className="relative bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-5 w-full max-w-sm"
      >
        <h2 id="pathway-switch-title" className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
          Switch preparation pathway?
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          You are currently preparing for {from.name}. If you switch to {to.name}, Angel will focus your learning,
          practice and mock preparation on {to.name}. Your existing {from.name} progress will be kept.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl transition-colors"
          >
            Switch to {to.name}
          </button>
        </div>
      </div>
    </div>
  );
}
