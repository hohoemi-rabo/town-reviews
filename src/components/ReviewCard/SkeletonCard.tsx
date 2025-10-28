export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-washi p-4 sm:p-6 animate-pulse">
      {/* Spot name */}
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>

      {/* Heard from */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>

      {/* Note content */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>

      {/* Images */}
      <div className="flex gap-2 mb-4">
        <div className="w-48 h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div className="w-48 h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}
