"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, Pencil, Plus } from "lucide-react";
import { useLearners } from "@/lib/useLearners";
import { learnerDisplayName } from "@/lib/learnerDisplay";
import { getPathwayById } from "@/lib/pathways";
import ChildNameForm from "@/components/parent/ChildNameForm";
import ParentPinModal from "@/components/parent/ParentPinModal";
import { getHouseholdPinStatus } from "@/lib/householdPin";
import { useHouseholdMode } from "@/lib/useHouseholdMode";

/**
 * Parent Dashboard family overview. Angel 11+ now supports several children
 * under one parent account (migration 260), each with completely separate
 * progress and evidence, so this states plainly WHOSE progress is on screen,
 * lets the parent choose another child, and offers "Add another child".
 * Children are never combined into an aggregate score.
 */
export default function LearnerIdentityBanner() {
  const { learners, active, ready, switchLearner, renameLearner } = useLearners();
  const { enterLearnerSpace } = useHouseholdMode();
  const [editing, setEditing] = useState(false);
  // PRIVATE LEARNER SPACE -- a household PIN must exist before Learner Mode
  // can ever be entered (the return gate must already work). null = not yet
  // known; the button is disabled rather than risk entering with no PIN set.
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [pinModal, setPinModal] = useState<"set" | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHouseholdPinStatus().then((status) => {
      if (!cancelled) setHasPin(status?.hasPin ?? false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || !active) return null;

  const activeIndex = learners.findIndex((l) => l.id === active.id);
  const name = active.name;
  const pathway = getPathwayById(active.pathway ?? "");
  const showForm = editing || !name;
  const activeDisplayName = name ?? learnerDisplayName(active, activeIndex);

  function handleEnterLearnerSpace() {
    if (hasPin === false) {
      setPinModal("set");
      return;
    }
    enterLearnerSpace(active!.id);
  }

  return (
    <section
      aria-label="Which child this dashboard shows"
      className="mt-4 rounded-2xl border border-sky-100 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/30 px-4 py-3"
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-400">Viewing</p>

      {name && !editing && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-gray-900 dark:text-gray-100 font-bold text-xl leading-snug truncate">
              {name}&rsquo;s progress
            </p>
            {pathway && (
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{pathway.shortName} pathway</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-400 text-xs font-medium shrink-0 py-1 transition-colors motion-reduce:transition-none"
          >
            <Pencil size={11} aria-hidden="true" />
            Edit name
          </button>
        </div>
      )}

      {showForm && (
        <div className="mt-1">
          {!name && (
            <p className="text-gray-900 dark:text-gray-100 font-semibold text-base mb-2">
              Add {learnerDisplayName(active, activeIndex)}&rsquo;s first name so you can see whose progress this is
            </p>
          )}
          <ChildNameForm
            initial={name}
            autoFocus={editing}
            onSave={(n) => {
              if (renameLearner(active.id, n)) setEditing(false);
            }}
            onCancel={editing ? () => setEditing(false) : undefined}
          />
        </div>
      )}

      {name && !editing && (
        <button
          type="button"
          onClick={handleEnterLearnerSpace}
          disabled={hasPin === null}
          className="mt-3 flex items-center justify-center gap-2 w-full bg-sky-700 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-sky-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <LogIn size={15} aria-hidden="true" />
          Enter {activeDisplayName}&rsquo;s learner space
        </button>
      )}
      {hasPin === false && (
        <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mt-1.5">
          You&rsquo;ll be asked to set a Parent PIN first, so you can always get back here.
        </p>
      )}

      {pinModal && (
        <ParentPinModal
          mode={pinModal}
          onCancel={() => setPinModal(null)}
          onSuccess={() => {
            setPinModal(null);
            setHasPin(true);
            enterLearnerSpace(active!.id);
          }}
        />
      )}

      <div className="mt-3 pt-3 border-t border-sky-100 dark:border-sky-900">
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          Your children
        </p>
        <ul className="flex flex-wrap items-center gap-2">
          {learners.map((l, i) => {
            const isActive = l.id === active.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => switchLearner(l.id)}
                  aria-pressed={isActive}
                  className={
                    isActive
                      ? "text-sm font-semibold rounded-full px-3 py-1 bg-sky-700 text-white"
                      : "text-sm font-medium rounded-full px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-sky-400"
                  }
                >
                  {learnerDisplayName(l, i)}
                </button>
              </li>
            );
          })}
          <li>
            <Link
              href="/add-child"
              className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 dark:text-sky-400 hover:underline px-1 py-1"
            >
              <Plus size={14} aria-hidden="true" />
              Add another child
            </Link>
          </li>
        </ul>
        <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mt-2">
          Each child has their own progress, practice and recommendations. A first name or nickname is all Angel 11+ stores to tell them apart.
        </p>
      </div>
    </section>
  );
}
