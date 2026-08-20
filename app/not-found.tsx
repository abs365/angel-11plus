import Link from "next/link";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-5">
          <BookOpen size={28} className="text-purple-600" />
        </div>

        <h1 className="text-gray-900 font-bold text-xl mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-7">
          The page you&apos;re looking for doesn&apos;t exist. Your progress is safe, so head back to your dashboard.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-purple-700 transition-colors"
        >
          <Home size={15} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
