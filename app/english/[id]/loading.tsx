export default function LessonLoading() {
  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Passage skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="h-5 w-48 bg-gray-100 rounded animate-pulse mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-3 bg-gray-100 rounded animate-pulse mb-2 last:w-3/4" />
          ))}
        </div>

        {/* Question skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-4" />
          <div className="h-24 w-full bg-gray-50 rounded-xl animate-pulse" />
        </div>

        <div className="h-12 w-full bg-purple-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
