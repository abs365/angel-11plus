"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { useChildName } from "@/lib/useChildName";
import { getPathwayById } from "@/lib/pathways";
import { getSelectedPathwayId } from "@/lib/progress";
import ChildNameForm from "@/components/parent/ChildNameForm";

/**
 * Parent Dashboard -- "whose progress am I looking at?" (Family #1
 * onboarding finding). Angel 11+ supports one learner per account today
 * (profiles.auth_user_id is UNIQUE), so there is exactly one learner to
 * identify and nothing to switch between. The one-child limit is stated
 * plainly rather than hidden behind a control that could not be honoured;
 * the feedback link records real demand for more.
 */
export default function LearnerIdentityBanner() {
  const { name, ready, save } = useChildName();
  const [editing, setEditing] = useState(false);
  const pathway = getPathwayById(getSelectedPathwayId() ?? "");

  if (!ready) return null;

  const showForm = editing || !name;

  return (
    <section
      aria-label="Which child this dashboard shows"
      className="mt-4 rounded-2xl border border-sky-100 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/30 px-4 py-3"
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-400">
        Viewing
      </p>

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
              Add your child&apos;s first name so you can see whose progress this is
            </p>
          )}
          <ChildNameForm
            initial={name}
            autoFocus={editing}
            onSave={(n) => {
              if (save(n)) setEditing(false);
            }}
            onCancel={editing ? () => setEditing(false) : undefined}
          />
        </div>
      )}

      <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mt-2">
        A first name or nickname is enough. It is kept on this device only and is never sent to Angel 11+.
        {" "}Angel 11+ currently supports one child per account. Preparing more than one child?{" "}
        <Link href="/feedback" className="text-sky-700 dark:text-sky-400 font-medium hover:underline">
          Tell us
        </Link>
        .
      </p>
    </section>
  );
}
