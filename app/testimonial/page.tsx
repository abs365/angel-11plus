"use client";

import { useState } from "react";
import { Star, CheckCircle } from "lucide-react";
import SupportLayout from "@/components/SupportLayout";
import ErrorState from "@/components/ErrorState";
import { saveTestimonial } from "@/lib/feedback";

const YEAR_GROUPS = ["Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Prefer not to say"];

export default function TestimonialPage() {
  const [parentName, setParentName] = useState("");
  const [yearGroup, setYearGroup] = useState("");
  const [feedback, setFeedback] = useState("");
  const [publishPermission, setPublishPermission] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!parentName.trim() || parentName.trim().length < 2) e.parentName = "Please enter your name";
    if (!yearGroup) e.yearGroup = "Please select a year group";
    if (!feedback.trim() || feedback.trim().length < 20) e.feedback = "Please write at least 20 characters";
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
    const { error } = await saveTestimonial({
      parentName: parentName.trim(),
      yearGroup,
      feedback: feedback.trim(),
      publishPermission,
    });
    setSubmitting(false);
    if (error) {
      setErrors({ feedback: error });
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SupportLayout backHref="/dashboard" backLabel="Back">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4">
            <CheckCircle size={30} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Thank you!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed mb-4">
            Your testimonial means a lot to us and will help other families discover Angel 11+.
          </p>
          {publishPermission && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl px-4 py-3 max-w-xs">
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                We may share your kind words on our website — we&apos;ll never use your surname or child&apos;s name.
              </p>
            </div>
          )}
        </div>
      </SupportLayout>
    );
  }

  return (
    <SupportLayout backHref="/dashboard" backLabel="Back">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4">
          <Star size={22} className="text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Share your experience
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
          How has Angel 11+ been for your family? Your honest experience helps other parents and guides how we improve.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">

        <div>
          <label htmlFor="parentName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Your first name
          </label>
          <input
            id="parentName"
            type="text"
            value={parentName}
            onChange={(e) => { setParentName(e.target.value); setErrors((p) => ({ ...p, parentName: "" })); }}
            placeholder="e.g. Sarah"
            autoComplete="given-name"
            aria-describedby={errors.parentName ? "parentName-error" : undefined}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          <ErrorState id="parentName-error" message={errors.parentName} />
        </div>

        <div>
          <label htmlFor="yearGroup" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Child&apos;s current year group
          </label>
          <select
            id="yearGroup"
            value={yearGroup}
            onChange={(e) => { setYearGroup(e.target.value); setErrors((p) => ({ ...p, yearGroup: "" })); }}
            aria-describedby={errors.yearGroup ? "yearGroup-error" : undefined}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent appearance-none"
          >
            <option value="">Select year group…</option>
            {YEAR_GROUPS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <ErrorState id="yearGroup-error" message={errors.yearGroup} />
        </div>

        <div>
          <label htmlFor="feedback" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Your experience
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => { setFeedback(e.target.value); setErrors((p) => ({ ...p, feedback: "" })); }}
            placeholder="Tell us how Angel 11+ has helped your child, what you liked, and what you thought of the experience…"
            rows={5}
            aria-describedby={errors.feedback ? "feedback-error" : undefined}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          <div className="flex items-center justify-between mt-1">
            {errors.feedback ? <ErrorState id="feedback-error" message={errors.feedback} /> : <span />}
            <p className="text-xs text-gray-400 dark:text-gray-500">{feedback.length} chars</p>
          </div>
        </div>

        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={publishPermission}
                onChange={(e) => setPublishPermission(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-amber-500 focus:ring-amber-400"
              />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              I am happy for Angel 11+ to share an edited version of my feedback on the website (first name only — no surnames or child details).
            </span>
          </label>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 ml-7">Optional — we&apos;ll never publish without this permission.</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Submit Experience"}
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Your response is private unless you tick the publish permission box above.
        </p>
      </form>
    </SupportLayout>
  );
}
