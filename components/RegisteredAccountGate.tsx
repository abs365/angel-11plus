"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import PageLayout from "@/components/PageLayout";
import { decideAccess, isParentOnlyRoute } from "@/lib/registeredAccess";
import { useHouseholdMode } from "@/lib/useHouseholdMode";
import { useLearners } from "@/lib/useLearners";
import LearnerPinModal from "@/components/parent/LearnerPinModal";

/**
 * Controlled-beta policy: a registered parent account is required for the persistent learner experience
 * (lib/registeredAccess.ts). Wraps every page from the root layout so the rule lives in ONE place.
 *
 * For a visitor who is only holding the anonymous technical session (or no session), a learner surface is not
 * mounted at all: it shows this panel instead. Because the page never mounts it cannot read a learner profile,
 * show the child switcher, or record any practice/Mock evidence. Public pages (getting started, privacy, terms,
 * support forms, sign in) are unaffected.
 */
export default function RegisteredAccountGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { user, loading } = useAuth();
  const decision = decideAccess({ pathname, loading, user });
  const { isLearnerMode, hasLearnerToken, enterLearnerSpace } = useHouseholdMode();
  const { active: activeLearner, ready: learnersReady } = useLearners();

  if (decision === "allow" && isLearnerMode && isParentOnlyRoute(pathname)) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto px-4 py-10 md:px-8 md:py-16" data-testid="parent-mode-required">
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl md:text-3xl">
            Ask a parent or carer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mt-3 leading-relaxed">
            This page is for parents and carers to manage the account. A parent or carer can return
            here using their Parent PIN.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center text-sm font-semibold bg-sky-700 text-white rounded-xl px-5 py-3 hover:bg-sky-800 transition-colors motion-reduce:transition-none"
            >
              Back to my preparation
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  // PRIVATE LEARNER SPACE, Part 2: the mode pointer says "learner" (it
  // persists across a closed/reopened tab on the same device, by design --
  // see lib/householdMode.ts) but no learner-PIN session token is present
  // in THIS tab (tokens are session-only, never persisted to localStorage).
  // This is the real server-enforced boundary, not merely a UI nicety:
  // current_learner_id() itself would refuse any data request here anyway
  // (migration 263) -- this panel is what turns that refusal into a clear
  // "enter your PIN" moment instead of a blank/broken page. Learners with
  // no PIN configured are unaffected (isLearnerMode can only be true here
  // via a genuine prior entry, and a learner with no PIN never needed a
  // token in the first place).
  if (decision === "allow" && isLearnerMode && !hasLearnerToken && learnersReady && activeLearner) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto px-4 py-10 md:px-8 md:py-16" data-testid="learner-pin-required">
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl md:text-3xl">
            Enter your learner PIN
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mt-3 leading-relaxed">
            {activeLearner.name ?? "This learner"}, enter your PIN to open your learning space.
          </p>
          <PinRePromptButton learnerId={activeLearner.id} learnerName={activeLearner.name ?? "your child"} onSuccess={(token) => enterLearnerSpace(activeLearner.id, token)} />
        </div>
      </PageLayout>
    );
  }

  if (decision === "allow") return <>{children}</>;

  if (decision === "pending") {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center" data-testid="access-pending">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium" aria-live="polite">Loading…</p>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-xl mx-auto px-4 py-10 md:px-8 md:py-16" data-testid="account-required">
        <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl md:text-3xl">
          Create your free parent account to get started
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mt-3 leading-relaxed">
          Angel 11+ keeps each child&rsquo;s practice, progress and Mock results in a parent account, so nothing is lost
          and nothing is ever mixed between families. Create an account or sign in to continue.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center text-sm font-semibold bg-sky-700 text-white rounded-xl px-5 py-3 hover:bg-sky-800 transition-colors motion-reduce:transition-none"
          >
            Create account
          </Link>
          <Link
            href="/login?mode=signin"
            className="inline-flex items-center justify-center text-sm font-semibold border border-sky-700 text-sky-700 dark:text-sky-400 dark:border-sky-400 rounded-xl px-5 py-3 hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors motion-reduce:transition-none"
          >
            Sign in
          </Link>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-6 leading-relaxed">
          No child&rsquo;s information is shown or saved until you are signed in. Want to see how it works first?{" "}
          <Link href="/getting-started" className="text-sky-700 dark:text-sky-400 font-medium hover:underline">
            Read the getting-started guide
          </Link>
          .
        </p>
      </div>
    </PageLayout>
  );
}

/** Opens LearnerPinModal (verify mode) for the learner-PIN re-prompt panel above. A separate component so its own open/close state doesn't force the whole gate to re-render on every keystroke. */
function PinRePromptButton({
  learnerId,
  learnerName,
  onSuccess,
}: {
  learnerId: string;
  learnerName: string;
  onSuccess: (sessionToken: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center text-sm font-semibold bg-sky-700 text-white rounded-xl px-5 py-3 hover:bg-sky-800 transition-colors motion-reduce:transition-none"
        >
          Enter PIN
        </button>
      </div>
      {open && (
        <LearnerPinModal
          mode="verify"
          learnerId={learnerId}
          learnerName={learnerName}
          onCancel={() => setOpen(false)}
          onSuccess={(token) => {
            setOpen(false);
            onSuccess(token);
          }}
        />
      )}
    </>
  );
}
