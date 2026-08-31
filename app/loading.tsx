export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 animate-spin motion-reduce:animate-none" />
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium" aria-live="polite">Loading…</p>
      </div>
    </div>
  );
}
