'use client'

import {
  formatRelativeTime,
  getHeardFromIcon,
  // getSeasonEmoji, // Commented out - not used after hiding season display
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
  googleMapsUrl: string | null
  heardFrom: string
  heardFromType: string
  note: string
  reviewCategory: string
  images: string[]
  tags: string[]
  // season: string | null // Commented out - not displayed after user request
  authorName: string | null
  isAnonymous: boolean
  createdAt: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function ReviewCard({
  id,
  spotName,
  googleMapsUrl,
  heardFrom,
  heardFromType,
  note,
  reviewCategory,
  images,
  tags,
  // season, // Commented out - not displayed after user request
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

      {/* Google Maps link */}
      {googleMapsUrl && (
        <div className="mb-4">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-washi-green text-washi-green rounded-lg font-medium text-sm hover:bg-washi-green hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Google マップで開く"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Google マップで見る</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}

      {/* Heard from & Season */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
          aria-label={`情報源: ${heardFromType}`}
        >
          <span className="text-base">{getHeardFromIcon(heardFromType)}</span>
          <span>{heardFrom}から</span>
        </span>
        {/* Season badge - Commented out as per user request */}
        {/* {season && (
          <span
            className="inline-flex items-center gap-1 px-3 py-1 bg-washi-beige text-washi-green rounded-full text-xs font-medium"
            aria-label={`季節: ${season}`}
          >
            <span className="text-base">{getSeasonEmoji(season)}</span>
            <span>{season}</span>
          </span>
        )} */}
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
