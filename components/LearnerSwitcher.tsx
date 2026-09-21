"use client";

import Link from "next/link";
import { Check, ChevronDown, Plus } from "lucide-react";
import Popover from "@/components/ui/Popover";
import { useLearners } from "@/lib/useLearners";
import { learnerDisplayName } from "@/lib/learnerDisplay";

/**
 * "Viewing: Loni ▾" -- the ONE place a parent chooses which child every
 * learner-facing surface shows. Choosing a child changes the whole learner
 * context (lib/learnerContext.ts); pages never keep their own selector.
 * Shown in the shared Header so it is on every page, including Today,
 * Learn, Practice, Mock, Progress and the Parent Dashboard.
 */
export default function LearnerSwitcher() {
  const { learners, active, ready, switchLearner } = useLearners();
  if (!ready || !active) return null;

  const activeIndex = learners.findIndex((l) => l.id === active.id);
  const label = learnerDisplayName(active, activeIndex);

  return (
    <Popover
      label="Choose which child you are viewing"
      trigger={(props) => (
        <button
          {...props}
          className="flex items-center gap-1.5 max-w-[10rem] sm:max-w-[14rem] rounded-xl px-2.5 py-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors motion-reduce:transition-none"
        >
          <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">Viewing:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{label}</span>
          <ChevronDown size={14} aria-hidden="true" className="shrink-0 text-gray-400" />
        </button>
      )}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-2 w-64 max-w-[85vw]">
        <p className="px-2 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Your children
        </p>
        <ul className="flex flex-col">
          {learners.map((l, i) => {
            const isActive = l.id === active.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => switchLearner(l.id)}
                  aria-current={isActive ? "true" : undefined}
                  className="flex items-center justify-between gap-2 w-full text-left text-sm rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors motion-reduce:transition-none"
                >
                  <span className="truncate">{learnerDisplayName(l, i)}</span>
                  {isActive && <Check size={14} aria-hidden="true" className="shrink-0 text-sky-700 dark:text-sky-400" />}
                </button>
              </li>
            );
          })}
        </ul>
        <Link
          href="/add-child"
          className="mt-1 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 pt-2 px-2 pb-1 text-sm font-medium text-sky-700 dark:text-sky-400 hover:underline"
        >
          <Plus size={14} aria-hidden="true" />
          Add another child
        </Link>
      </div>
    </Popover>
  );
}
