export default function MockTestLoading() {
  return (
    <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-10 h-10 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Preparing your mock test…</p>
      </div>
    </div>
  );
}
