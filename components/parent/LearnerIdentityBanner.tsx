"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, LogIn, Pencil, Plus } from "lucide-react";
import { useLearners } from "@/lib/useLearners";
import { learnerDisplayName } from "@/lib/learnerDisplay";
import { getPathwayById } from "@/lib/pathways";
import ChildNameForm from "@/components/parent/ChildNameForm";
import LearnerPinModal from "@/components/parent/LearnerPinModal";
import { getLearnerPinStatus } from "@/lib/learnerPin";
import { useHouseholdMode } from "@/lib/useHouseholdMode";

/**
 * Parent Dashboard family overview. Angel 11+ now supports several children
 * under one parent account (migration 260), each with completely separate
 * progress and evidence, so this states plainly WHOSE progress is on screen,
 * lets the parent choose another child, and offers "Add another child".
 * Children are never combined into an aggregate score.
 *
 * PRIVATE LEARNER SPACE, Part 2 -- "Enter learner space" is gated by THIS
 * learner's own PIN (migration 263), not the household's Parent PIN
 * (ParentPinModal, used only for the Learner Mode -> Parent Mode return
 * trip). "Manage learner PIN" lets the parent set or reset it at any time.
 */
export default function LearnerIdentityBanner() {
  const { learners, active, ready, switchLearner, renameLearner } = useLearners();
  const { enterLearnerSpace } = useHouseholdMode();
  const [editing, setEditing] = useState(false);
  // null = not yet known for the current active learner; refetched whenever
  // the parent switches which child this banner is showing. Derived from
  // "status belongs to this exact learner id" rather than reset via a
  // synchronous setState in the effect body, so switching learners shows a
  // genuine loading state (null) with no extra render.
  const [pinStatusFor, setPinStatusFor] = useState<{ id: string; hasPin: boolean } | null>(null);
  const hasLearnerPin = pinStatusFor && active && pinStatusFor.id === active.id ? pinStatusFor.hasPin : null;
  const [pinModal, setPinModal] = useState<"set" | "verify" | "manage" | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    getLearnerPinStatus(active.id).then((status) => {
      if (!cancelled) setPinStatusFor({ id: active.id, hasPin: status?.hasPin ?? false });
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  if (!ready || !active) return null;

  const activeIndex = learners.findIndex((l) => l.id === active.id);
  const name = active.name;
  const pathway = getPathwayById(active.pathway ?? "");
  const showForm = editing || !name;
  const activeDisplayName = name ?? learnerDisplayName(active, activeIndex);

  function handleEnterLearnerSpace() {
    setPinModal(hasLearnerPin === false ? "set" : "verify");
  }

  return (
    <section
      aria-label="Which child this dashboard shows"
      className="rounded-lg bg-[var(--angel-sky)] px-4 py-3"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--angel-blue)]">Viewing</p>

      {name && !editing && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[var(--angel-navy)] font-bold text-xl leading-snug truncate">
              {name}&rsquo;s progress
            </p>
            {pathway && (
              <p className="text-[var(--angel-muted)] text-xs mt-0.5">{pathway.shortName} pathway</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-[var(--angel-muted)] hover:text-[var(--angel-blue)] text-xs font-medium shrink-0 py-1 transition-colors motion-reduce:transition-none"
          >
            <Pencil size={11} aria-hidden="true" />
            Edit name
          </button>
        </div>
      )}

      {showForm && (
        <div className="mt-1">
          {!name && (
            <p className="text-[var(--angel-navy)] font-semibold text-base mb-2">
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
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleEnterLearnerSpace}
            disabled={hasLearnerPin === null}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogIn size={15} aria-hidden="true" />
            Enter {activeDisplayName}&rsquo;s learner space
          </button>
          <button
            type="button"
            onClick={() => setPinModal("manage")}
            disabled={hasLearnerPin === null}
            title={hasLearnerPin ? `Change ${activeDisplayName}'s learner PIN` : `Set ${activeDisplayName}'s learner PIN`}
            aria-label={hasLearnerPin ? `Change ${activeDisplayName}'s learner PIN` : `Set ${activeDisplayName}'s learner PIN`}
            className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border border-[var(--angel-border)] text-[var(--angel-blue)] hover:bg-[var(--angel-paper)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <KeyRound size={16} aria-hidden="true" />
          </button>
        </div>
      )}
      {hasLearnerPin === false && (
        <p className="text-[var(--angel-muted)] text-xs leading-relaxed mt-1.5">
          {activeDisplayName} has no learner PIN yet. Entering will ask you to create one.
        </p>
      )}

      {pinModal && (
        <LearnerPinModal
          mode={pinModal === "manage" ? "set" : pinModal}
          learnerId={active.id}
          learnerName={activeDisplayName}
          onCancel={() => setPinModal(null)}
          onSuccess={(sessionToken) => {
            setPinModal(null);
            setPinStatusFor({ id: active.id, hasPin: true });
            // "Manage learner PIN" only sets/resets it -- it does not enter
            // the learner's space on the parent's behalf.
            if (pinModal !== "manage") enterLearnerSpace(active.id, sessionToken);
          }}
        />
      )}

      <div className="mt-3 pt-3 border-t border-[var(--angel-border)]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--angel-muted)] mb-2">
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
                      ? "text-sm font-semibold rounded-full px-3 py-1 bg-blue-600 text-white"
                      : "text-sm font-medium rounded-full px-3 py-1 bg-[var(--angel-paper)] border border-[var(--angel-border)] text-[var(--angel-ink)] hover:border-[var(--angel-blue)]"
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
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--angel-blue)] hover:underline px-1 py-1"
            >
              <Plus size={14} aria-hidden="true" />
              Add another child
            </Link>
          </li>
        </ul>
        <p className="text-[var(--angel-muted)] text-xs leading-relaxed mt-2">
          Each child has their own progress, practice and recommendations. A first name or nickname is all Angel 11+ stores to tell them apart.
        </p>
      </div>
    </section>
  );
}
