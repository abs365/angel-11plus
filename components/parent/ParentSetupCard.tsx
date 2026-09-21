"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import ChildNameForm from "@/components/parent/ChildNameForm";

/**
 * First-run parent -> child setup (Family #1 onboarding finding): a new
 * parent lands here after confirming their email with no explanation of
 * what Angel 11+ needs or why. Two real steps only -- the exam pathway
 * (which decides the practice and mock papers) and the child's first name
 * (so the parent can always see whose progress is on screen). Disappears
 * for good once both exist, so it never clutters a set-up family.
 */
export default function ParentSetupCard({
  hasName,
  pathwayName,
  onSaveName,
}: {
  hasName: boolean;
  pathwayName: string | null;
  onSaveName: (name: string) => void;
}) {
  const hasPathway = pathwayName !== null;

  return (
    <section
      aria-labelledby="setup-heading"
      className="mt-5 rounded-2xl border border-sky-100 dark:border-sky-900 bg-white dark:bg-gray-900 p-5"
    >
      <h2 id="setup-heading" className="text-gray-900 dark:text-gray-100 font-bold text-lg leading-snug">
        Set up Angel 11+ for your child
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">
        Two quick steps. Then your child can start today&apos;s practice, and you can follow their progress in the
        Parent Dashboard.
      </p>

      <ol className="mt-4 space-y-4">
        <li className="flex items-start gap-3">
          {hasPathway ? (
            <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" aria-label="Done" />
          ) : (
            <Circle size={20} className="text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" aria-label="Not done yet" />
          )}
          <div className="min-w-0">
            <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
              {hasPathway ? `Exam pathway: ${pathwayName}` : "Choose your child’s exam pathway"}
            </p>
            {!hasPathway && (
              <>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 leading-relaxed">
                  This tells Angel 11+ which exam your child is preparing for, so their practice and mock papers match it.
                </p>
                <Link
                  href="/pathways"
                  className="inline-block mt-2 text-xs font-semibold bg-sky-700 text-white rounded-lg px-3 py-2 hover:bg-sky-800 transition-colors motion-reduce:transition-none"
                >
                  Choose pathway
                </Link>
              </>
            )}
          </div>
        </li>

        <li className="flex items-start gap-3">
          {hasName ? (
            <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" aria-label="Done" />
          ) : (
            <Circle size={20} className="text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" aria-label="Not done yet" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
              {hasName ? "Your child’s name is added" : "Add your child’s first name"}
            </p>
            {!hasName && (
              <>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 mb-2 leading-relaxed">
                  So you always know whose progress you are looking at. A first name or nickname is enough. It is
                  saved with your account only so you can tell your children apart.
                </p>
                <ChildNameForm autoFocus={false} onSave={onSaveName} />
              </>
            )}
          </div>
        </li>
      </ol>
    </section>
  );
}
