"use client";

import { useState } from "react";
import { Bug, CheckCircle } from "lucide-react";
import SupportLayout from "@/components/SupportLayout";
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

  function validate() {
    const e: Record<string, string> = {};
    if (!page) e.page = "Please select which page";
    if (!issueType) e.issueType = "Please select an issue type";
    if (!description.trim() || description.trim().length < 10) e.description = "Please describe the issue (at least 10 characters)";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    saveBugReport({ page, issueType, description: description.trim() });
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
            className="mt-6 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline"
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
          Found something broken? Tell us. We fix beta bugs fast.
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
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent appearance-none"
          >
            <option value="">Select a page…</option>
            {PAGES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {errors.page && <p className="text-xs text-red-500 mt-1">{errors.page}</p>}
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
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent appearance-none"
          >
            <option value="">Select issue type…</option>
            {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.issueType && <p className="text-xs text-red-500 mt-1">{errors.issueType}</p>}
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
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
            Tip: if possible, note your device and browser (e.g. iPad, Safari) — it helps us reproduce the issue faster.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
        >
          Submit Bug Report
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Bug reports are stored locally on this device during beta.
        </p>
      </form>
    </SupportLayout>
  );
}
