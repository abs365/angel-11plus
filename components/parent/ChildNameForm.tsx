"use client";

import { useState } from "react";

/**
 * Small inline form for the child's first name (or nickname). Shared by the
 * Parent Dashboard identity banner and the first-run setup card so the
 * wording and limits are identical everywhere. The name is local to this
 * device (lib/childProfile.ts) -- never sent to Angel 11+ servers.
 */
export default function ChildNameForm({
  initial,
  onSave,
  onCancel,
  autoFocus = true,
}: {
  initial?: string | null;
  onSave: (name: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [draft, setDraft] = useState(initial ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (draft.trim()) onSave(draft);
      }}
      className="flex items-center gap-2"
    >
      <label htmlFor="child-first-name" className="sr-only">
        Your child&apos;s first name
      </label>
      <input
        id="child-first-name"
        type="text"
        autoFocus={autoFocus}
        maxLength={40}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="First name or nickname"
        className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2"
      />
      <button
        type="submit"
        disabled={!draft.trim()}
        className="text-xs font-semibold bg-sky-700 text-white rounded-lg px-3 py-2 hover:bg-sky-800 disabled:opacity-50 transition-colors motion-reduce:transition-none"
      >
        Save
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-2 transition-colors motion-reduce:transition-none"
        >
          Cancel
        </button>
      )}
    </form>
  );
}
