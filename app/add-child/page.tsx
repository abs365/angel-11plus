"use client";

import { useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import ErrorState from "@/components/ErrorState";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLearners } from "@/lib/useLearners";
import { REAL_PATHWAY_IDS } from "@/lib/activePathway";
import { getPathwayById } from "@/lib/pathways";

/**
 * Add another child. Asks only what is needed to create a separate learner:
 * a first name or nickname (so a parent can tell their children apart) and,
 * optionally, the exam pathway. Nothing else about the child is requested.
 * Each child then has completely separate progress, evidence,
 * recommendations and Mock results; the rest of setup (exam date, school
 * year) uses the existing Pathways and dashboard setup steps.
 */
export default function AddChildPage() {
  const { user, loading } = useAuth();
  const { learners, ready, addLearner } = useLearners();
  const [name, setName] = useState("");
  const [pathway, setPathway] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isAnonymous = Boolean(user?.is_anonymous);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const result = await addLearner(name, pathway || null);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
    }
    // On success the learner context switches and the page navigates to Today.
  }

  return (
    <PageLayout breadcrumbs={[{ label: "Parent Dashboard", href: "/learning-intelligence/parent" }, { label: "Add a child" }]}>
      <div className="max-w-md mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Add another child</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">
          Each child on your Angel 11+ account has their own progress, practice, recommendations and Mock results.
          Nothing is shared or mixed between children.
        </p>

        {!loading && isAnonymous ? (
          <div className="mt-6 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-gray-800 dark:text-gray-200 font-semibold text-sm">Create an account first</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">
              You can add more children once you have an Angel 11+ account. It takes a minute and needs no password.
            </p>
            <Link href="/login" className="inline-block mt-3 text-sm font-semibold bg-sky-700 text-white rounded-lg px-4 py-2 hover:bg-sky-800">
              Create account
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <div>
              <label htmlFor="add-child-name" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                First name or nickname
              </label>
              <input
                id="add-child-name"
                type="text"
                autoFocus
                required
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sam"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1.5 leading-relaxed">
                Only a first name or nickname. It is stored so you can tell your children apart and switch between them.
                We never ask for a surname, date of birth, school or photo.
              </p>
            </div>

            <div>
              <label htmlFor="add-child-pathway" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Exam pathway
              </label>
              <select
                id="add-child-pathway"
                value={pathway}
                onChange={(e) => setPathway(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Choose later</option>
                {REAL_PATHWAY_IDS.map((id) => (
                  <option key={id} value={id}>
                    {getPathwayById(id)?.shortName ?? id}
                  </option>
                ))}
              </select>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1.5 leading-relaxed">
                This tells Angel 11+ which exam this child is preparing for. Each child can have a different pathway, and you can change it any time.
              </p>
            </div>

            {error && <ErrorState variant="banner" message={error} />}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={busy || !name.trim() || !ready}
                className="bg-blue-600 text-white rounded-xl px-5 py-3 font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? "Adding…" : "Add child"}
              </button>
              <Link href="/learning-intelligence/parent" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
                Cancel
              </Link>
            </div>
            {ready && learners.length > 0 && (
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                You currently have {learners.length} {learners.length === 1 ? "child" : "children"} on this account.
              </p>
            )}
          </form>
        )}
      </div>
    </PageLayout>
  );
}
