import Link from "next/link";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-950 rounded-2xl mb-5">
          <BookOpen size={28} className="text-blue-600 dark:text-blue-400" />
        </div>

        <h1 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-7">
          The page you&apos;re looking for doesn&apos;t exist. Your progress is safe, so head back to your dashboard.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-600 text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-blue-700 dark:hover:bg-blue-500 active:scale-[0.98] transition-all motion-reduce:transition-none"
        >
          <Home size={15} aria-hidden="true" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
