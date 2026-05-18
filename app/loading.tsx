export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
        <p className="text-purple-400 text-sm font-medium">Loading…</p>
      </div>
    </div>
  );
}
