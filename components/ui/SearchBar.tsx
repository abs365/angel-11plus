"use client";

import { Search } from "lucide-react";
import { useState } from "react";

/**
 * Sprint 2 (Platform Shell) — search entry point, presentation only, per
 * the sprint's own explicit instruction ("presentation only if search is
 * not yet implemented"). No search index, no query logic, and no fabricated
 * results exist anywhere in this codebase — this component honestly says
 * so on focus rather than pretending to search and silently doing nothing.
 */
export default function SearchBar() {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative w-full max-w-xs">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
      />
      <input
        type="search"
        placeholder="Search Angel 11+…"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-describedby="search-coming-soon"
        readOnly
        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent cursor-text"
      />
      {focused && (
        <p id="search-coming-soon" role="status" className="absolute mt-1.5 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-1.5 shadow-sm">
          Search is coming soon.
        </p>
      )}
    </div>
  );
}
