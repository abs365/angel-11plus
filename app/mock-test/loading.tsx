export default function MockTestLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-10 h-10 rounded-full border-2 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 animate-spin motion-reduce:animate-none mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm" aria-live="polite">Preparing your mock test…</p>
      </div>
    </div>
  );
}
