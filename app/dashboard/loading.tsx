/**
 * Premium Frontend programme (2026-08-31), H4/Stage 4 — this skeleton had
 * drifted from the real page it stands in for (a pre-Stage-1A "nav bar +
 * XP bar + four subject cards" shape, none of which the current dashboard
 * renders: there is no in-page nav bar, XP is not shown per
 * PRODUCT_EXPERIENCE_STANDARD_V1.md Correction 2, and the page is
 * Orientation text + one Mission card + a secondary rail, not four equal
 * subject cards). Reshaped to mirror the real current layout so the
 * loading state doesn't visually promise a different page than the one
 * that actually appears.
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)]" aria-live="polite" aria-label="Loading your admission journey">
      <div className="max-w-4xl lg:max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* Orientation skeleton */}
        <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse motion-reduce:animate-none mb-3" />
        <div className="h-6 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse motion-reduce:animate-none mb-4" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-24 bg-gray-50 dark:bg-gray-800/60 rounded-full animate-pulse motion-reduce:animate-none" />
          ))}
        </div>

        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
          {/* Mission card skeleton */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <div className="h-5 w-56 bg-gray-100 dark:bg-gray-800 rounded animate-pulse motion-reduce:animate-none mb-5" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 w-full bg-gray-50 dark:bg-gray-800/60 rounded-xl animate-pulse motion-reduce:animate-none mb-3" />
            ))}
            <div className="h-11 w-full bg-blue-100 dark:bg-blue-950 rounded-xl animate-pulse motion-reduce:animate-none mt-2" />
          </div>

          {/* Secondary rail skeleton */}
          <div className="mt-8 lg:mt-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
            <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse motion-reduce:animate-none" />
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse motion-reduce:animate-none" />
            <div className="h-px bg-gray-100 dark:bg-gray-800" />
            <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse motion-reduce:animate-none" />
            <div className="h-10 w-full bg-gray-50 dark:bg-gray-800/60 rounded-xl animate-pulse motion-reduce:animate-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
