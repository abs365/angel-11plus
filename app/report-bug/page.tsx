"use client";

import { useState } from "react";
import { Bug, CheckCircle } from "lucide-react";
import SupportLayout from "@/components/SupportLayout";
import ErrorState from "@/components/ErrorState";
import { saveBugReport } from "@/lib/feedback";

const PAGES = [
  "Dashboard",
  "English",
  "English lesson",
  "Maths",
  "Vocabulary",
  "Writing",
  "Verbal Reasoning",
  "Non-Verbal Reasoning",
  "Spatial Reasoning",
  "Numerical Reasoning",
  "Mock Exams (list)",
  "Mock Exam (in progress)",
  "Progress",
  "Parent Dashboard",
  "Pathways",
  "Login",
  "Beta / Welcome",
  "Getting Started",
  "Other",
];

const ISSUE_TYPES = [
  "Page won't load",
  "Button or link not working",
  "Wrong answer accepted",
  "Correct answer rejected",
  "Timer issue",
  "Progress not saving",
  "Display / layout problem",
  "Dark mode issue",
  "Data missing or reset",
  "Other",
];

export default function ReportBugPage() {
  const [page, setPage] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!page) e.page = "Please select which page";
    if (!issueType) e.issueType = "Please select an issue type";
    if (!description.trim() || description.trim().length < 10) e.description = "Please describe the issue (at least 10 characters)";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    const { error } = await saveBugReport({ page, issueType, description: description.trim() });
    setSubmitting(false);
    if (error) {
      setErrors({ description: error });
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SupportLayout backHref="/dashboard" backLabel="Back">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
            <CheckCircle size={30} className="text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Bug reported</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed">
            Thank you for taking the time. We&apos;ll investigate and aim to fix it quickly.
          </p>
          <button
            onClick={() => { setSubmitted(false); setPage(""); setIssueType(""); setDescription(""); setErrors({}); }}
            className="mt-6 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Report another bug
          </button>
        </div>
      </SupportLayout>
    );
  }

  return (
    <SupportLayout backHref="/dashboard" backLabel="Back">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
          <Bug size={22} className="text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Report a Bug
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
          Found something broken? Tell us. We fix bugs fast.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">

        {/* Page */}
        <div>
          <label htmlFor="page" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Which page?
          </label>
          <select
            id="page"
            value={page}
            onChange={(e) => { setPage(e.target.value); setErrors((p) => ({ ...p, page: "" })); }}
            aria-describedby={errors.page ? "page-error" : undefined}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent appearance-none"
          >
            <option value="">Select a page…</option>
            {PAGES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <ErrorState id="page-error" message={errors.page} />
        </div>

        {/* Issue type */}
        <div>
          <label htmlFor="issueType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            What kind of issue?
          </label>
          <select
            id="issueType"
            value={issueType}
            onChange={(e) => { setIssueType(e.target.value); setErrors((p) => ({ ...p, issueType: "" })); }}
            aria-describedby={errors.issueType ? "issueType-error" : undefined}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent appearance-none"
          >
            <option value="">Select issue type…</option>
            {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ErrorState id="issueType-error" message={errors.issueType} />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            What happened?
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
            placeholder="Describe what you did, what you expected to happen, and what actually happened…"
            rows={5}
            aria-describedby={errors.description ? "description-error" : undefined}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
          />
          <ErrorState id="description-error" message={errors.description} />
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
            Tip: if possible, note your device and browser (e.g. iPad, Safari). It helps us reproduce the issue faster.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Submit Bug Report"}
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Bug reports are sent securely and reviewed by the founder.
        </p>
      </form>
    </SupportLayout>
  );
}
