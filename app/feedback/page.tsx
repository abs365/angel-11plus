"use client";

import { useState } from "react";
import { MessageSquare, CheckCircle, ThumbsUp, Lightbulb, HelpCircle } from "lucide-react";
import SupportLayout from "@/components/SupportLayout";
import { saveFeedback, type FeedbackType } from "@/lib/feedback";

const TYPES: { id: FeedbackType; label: string; icon: typeof MessageSquare; desc: string }[] = [
  { id: "positive", label: "Positive feedback", icon: ThumbsUp, desc: "Something that's working well" },
  { id: "suggestion", label: "Suggestion", icon: Lightbulb, desc: "An idea to improve the platform" },
  { id: "general", label: "General comment", icon: HelpCircle, desc: "Anything else on your mind" },
];

export default function FeedbackPage() {
  const [type, setType] = useState<FeedbackType>("positive");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!message.trim() || message.trim().length < 10) {
      setError("Please write at least 10 characters.");
      return;
    }

    setSubmitting(true);
    const { error: submitError } = await saveFeedback({ type, subject: subject.trim(), message: message.trim() });
    setSubmitting(false);

    if (submitError) {
      setError(submitError);
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Thank you!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed">
            Your feedback has been recorded. We read everything and use it to improve Angel 11+.
          </p>
          <button
            onClick={() => { setSubmitted(false); setSubject(""); setMessage(""); }}
            className="mt-6 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline"
          >
            Send more feedback
          </button>
        </div>
      </SupportLayout>
    );
  }

  return (
    <SupportLayout backHref="/dashboard" backLabel="Back">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
          <MessageSquare size={22} className="text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Feedback
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
          Your feedback shapes what we build next. We read every message.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">

        {/* Type selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Type of feedback
          </label>
          <div className="space-y-2">
            {TYPES.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                type="button"
                onClick={() => setType(id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  type === id
                    ? "border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  type === id ? "bg-purple-100 dark:bg-purple-900" : "bg-gray-100 dark:bg-gray-800"
                }`}>
                  <Icon size={15} className={type === id ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${type === id ? "text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"}`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
                </div>
                {type === id && <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Subject <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Maths sessions, Dark mode, Progress page…"
            maxLength={100}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Your feedback
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts, ideas or experience…"
            rows={5}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending…" : "Send Feedback"}
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Feedback is sent securely and reviewed by the founder.
        </p>
      </form>
    </SupportLayout>
  );
}
