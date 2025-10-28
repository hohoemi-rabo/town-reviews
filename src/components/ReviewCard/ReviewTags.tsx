import { getTagColor } from '@/lib/formatters'

interface ReviewTagsProps {
  tags: string[]
  maxTags?: number
}

export default function ReviewTags({ tags, maxTags = 5 }: ReviewTagsProps) {
  const displayTags = tags.slice(0, maxTags)
  const remainingCount = tags.length - maxTags

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
      {displayTags.map((tag, index) => (
        <span
          key={index}
          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTagColor(tag)}`}
        >
          #{tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 whitespace-nowrap">
          +{remainingCount}
        </span>
      )}
    </div>
  )
}
