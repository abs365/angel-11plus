"use client";

import { useEffect } from "react";
import { BookOpen, RefreshCw } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to console for debugging — replace with Sentry/logging service in production
    console.error("[Angel 11+] Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-5">
          <BookOpen size={28} className="text-purple-600" />
        </div>

        <h1 className="text-gray-900 font-bold text-xl mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-7">
          Don&apos;t worry, your progress is safe. Try refreshing the page and
          everything should be back to normal.
        </p>

        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-purple-700 transition-colors"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </div>
    </div>
  );
}
