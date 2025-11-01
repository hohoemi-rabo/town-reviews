'use client'

import {
  formatRelativeTime,
  getHeardFromIcon,
  getSeasonEmoji,
  getReviewCategoryEmoji,
  getReviewCategoryColor,
  getReviewCategoryBgColor,
  truncateText,
} from '@/lib/formatters'
import ReviewImage from './ReviewImage'
import ReviewTags from './ReviewTags'
// import ReactionButtons from '../Reaction/ReactionButtons' // TODO: Uncomment when ready
import { useEditPermission } from '@/hooks/useEditPermission'

interface ReviewCardProps {
  id: string
  spotName: string
  heardFrom: string
  heardFromType: string
  note: string
  reviewCategory: string
  images: string[]
  tags: string[]
  season: string | null
  authorName: string | null
  isAnonymous: boolean
  createdAt: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function ReviewCard({
  id,
  spotName,
  heardFrom,
  heardFromType,
  note,
  reviewCategory,
  images,
  tags,
  season,
  authorName,
  isAnonymous,
  createdAt,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const { editable, loading } = useEditPermission(id)

  return (
    <article
      className={`${getReviewCategoryBgColor(reviewCategory)} rounded-lg shadow-washi p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 border-2 border-[#333]`}
      role="article"
      aria-label={`${spotName}の口コミ`}
    >
      {/* Spot name with category badge and reaction buttons */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold text-washi-green">
            {spotName}
          </h3>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getReviewCategoryColor(reviewCategory)}`}
            aria-label={`カテゴリー: ${reviewCategory}`}
          >
            <span>{getReviewCategoryEmoji(reviewCategory)}</span>
            <span>{reviewCategory}</span>
          </span>
        </div>
        {/* Reactions - fixed position */}
        {/* TODO: Uncomment when ready to use reaction feature */}
        {/* <div className="flex-shrink-0">
          <ReactionButtons recommendationId={id} />
        </div> */}
      </div>

      {/* Heard from */}
      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
        <span aria-label={`情報源: ${heardFromType}`}>{getHeardFromIcon(heardFromType)}</span>
        <span>
          {heardFrom}から聞いた
          {season && (
            <>
              {' '}
              <span aria-label={`季節: ${season}`}>
                {getSeasonEmoji(season)} {season}
              </span>
            </>
          )}
        </span>
      </div>

      {/* Note content */}
      <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">
        {truncateText(note, 200)}
      </p>

      {/* Images */}
      {images.length > 0 && (
        <div className="mb-4">
          <ReviewImage images={images} />
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-4">
          <ReviewTags tags={tags} maxTags={5} />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-washi-beige-dark">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <time dateTime={createdAt}>{formatRelativeTime(createdAt)}</time>
          {!isAnonymous && authorName && (
            <>
              <span>•</span>
              <span>{authorName}</span>
            </>
          )}
        </div>

        {/* Edit/Delete buttons - only show if editable */}
        {!loading && editable && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(id)}
                className="px-3 py-1.5 text-sm font-medium text-washi-green border border-washi-green rounded-md hover:bg-washi-green hover:text-white transition-colors duration-200"
                aria-label="この投稿を編集"
              >
                編集
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-600 hover:text-white transition-colors duration-200"
                aria-label="この投稿を削除"
              >
                削除
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
