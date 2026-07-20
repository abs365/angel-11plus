"use client";

import { useState } from "react";
import { Lightbulb, CheckCircle } from "lucide-react";
import SupportLayout from "@/components/SupportLayout";
import ErrorState from "@/components/ErrorState";
import { saveFeatureRequest } from "@/lib/feedback";

export default function FeatureRequestPage() {
  const [feature, setFeature] = useState("");
  const [why, setWhy] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!feature.trim() || feature.trim().length < 5) e.feature = "Please describe the feature (at least 5 characters)";
    if (!why.trim() || why.trim().length < 10) e.why = "Please explain why it would help (at least 10 characters)";
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
    const { error } = await saveFeatureRequest({ feature: feature.trim(), why: why.trim() });
    setSubmitting(false);
    if (error) {
      setErrors({ why: error });
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Request received!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed">
            Feature requests from families like yours directly influence our roadmap. Thank you for sharing this.
          </p>
          <button
            onClick={() => { setSubmitted(false); setFeature(""); setWhy(""); setErrors({}); }}
            className="mt-6 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline"
          >
            Submit another request
          </button>
        </div>
      </SupportLayout>
    );
  }

  return (
    <SupportLayout backHref="/dashboard" backLabel="Back">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4">
          <Lightbulb size={22} className="text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Feature Request
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
          What would make Angel 11+ more useful for your family? Your requests go straight to the top of the roadmap.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">

        {/* Feature */}
        <div>
          <label htmlFor="feature" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            What feature would you like?
          </label>
          <textarea
            id="feature"
            value={feature}
            onChange={(e) => { setFeature(e.target.value); setErrors((p) => ({ ...p, feature: "" })); }}
            placeholder="e.g. Email weekly progress report to parents, Printable vocabulary lists, Harder reasoning questions…"
            rows={3}
            aria-describedby={errors.feature ? "feature-error" : undefined}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          <ErrorState id="feature-error" message={errors.feature} />
        </div>

        {/* Why */}
        <div>
          <label htmlFor="why" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Why would this help your family?
          </label>
          <textarea
            id="why"
            value={why}
            onChange={(e) => { setWhy(e.target.value); setErrors((p) => ({ ...p, why: "" })); }}
            placeholder="Help us understand the problem you're trying to solve…"
            rows={4}
            aria-describedby={errors.why ? "why-error" : undefined}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          <ErrorState id="why-error" message={errors.why} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Submit Request"}
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Feature requests are sent securely and reviewed by the founder.
        </p>
      </form>
    </SupportLayout>
  );
}
