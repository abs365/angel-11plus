export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      {/* Nav skeleton */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="h-5 w-24 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        {/* XP bar skeleton */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse mb-3" />
          <div className="h-2 w-full bg-gray-100 rounded-full animate-pulse" />
        </div>

        {/* Subject card skeletons */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
              <div>
                <div className="h-4 w-28 bg-gray-100 rounded animate-pulse mb-1.5" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
