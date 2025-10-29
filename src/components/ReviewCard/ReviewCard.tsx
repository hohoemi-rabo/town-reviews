'use client'

import {
  formatRelativeTime,
  getHeardFromIcon,
  getSeasonEmoji,
  getReviewCategoryEmoji,
  getReviewCategoryColor,
  truncateText,
} from '@/lib/formatters'
import ReviewImage from './ReviewImage'
import ReviewTags from './ReviewTags'
import ReactionButtons from '../Reaction/ReactionButtons'

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
}: ReviewCardProps) {

  return (
    <article
      className="bg-washi-beige rounded-lg shadow-washi p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300"
      role="article"
      aria-label={`${spotName}の口コミ`}
    >
      {/* Spot name with category badge */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-washi-beige-dark">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <time dateTime={createdAt}>{formatRelativeTime(createdAt)}</time>
          {!isAnonymous && authorName && (
            <>
              <span>•</span>
              <span>{authorName}</span>
            </>
          )}
        </div>

        {/* Reactions */}
        <ReactionButtons recommendationId={id} />
      </div>
    </article>
  )
}
