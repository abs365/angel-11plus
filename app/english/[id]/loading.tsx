export default function LessonLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)]" aria-live="polite" aria-label="Loading lesson">
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Passage skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="h-5 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse motion-reduce:animate-none mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse motion-reduce:animate-none mb-2 last:w-3/4" />
          ))}
        </div>

        {/* Question skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse motion-reduce:animate-none mb-4" />
          <div className="h-24 w-full bg-gray-50 dark:bg-gray-800/60 rounded-xl animate-pulse motion-reduce:animate-none" />
        </div>

        <div className="h-12 w-full bg-blue-100 dark:bg-blue-950 rounded-xl animate-pulse motion-reduce:animate-none" />
      </div>
    </div>
  );
}
