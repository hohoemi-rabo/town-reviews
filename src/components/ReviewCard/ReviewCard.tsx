'use client'

import { useState } from 'react'
import {
  formatRelativeTime,
  getHeardFromIcon,
  getSeasonEmoji,
  truncateText,
} from '@/lib/formatters'
import ReviewImage from './ReviewImage'
import ReviewTags from './ReviewTags'

interface ReviewCardProps {
  id: string
  spotName: string
  heardFrom: string
  heardFromType: string
  note: string
  images: string[]
  tags: string[]
  season: string | null
  authorName: string | null
  isAnonymous: boolean
  createdAt: string
  reactions: {
    hokkorisu: number
    ittemiitai: number
    memoshita: number
  }
  onReactionClick?: (reactionType: string) => void
}

export default function ReviewCard({
  spotName,
  heardFrom,
  heardFromType,
  note,
  images,
  tags,
  season,
  authorName,
  isAnonymous,
  createdAt,
  reactions,
  onReactionClick,
}: ReviewCardProps) {
  const [selectedReactions, setSelectedReactions] = useState<Set<string>>(new Set())

  const handleReaction = (reactionType: string) => {
    const newSelected = new Set(selectedReactions)
    if (newSelected.has(reactionType)) {
      newSelected.delete(reactionType)
    } else {
      newSelected.add(reactionType)
    }
    setSelectedReactions(newSelected)
    onReactionClick?.(reactionType)
  }

  return (
    <article
      className="bg-washi-beige rounded-lg shadow-washi p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300"
      role="article"
      aria-label={`${spotName}の口コミ`}
    >
      {/* Spot name */}
      <h3 className="text-xl sm:text-2xl font-bold text-washi-green mb-2">
        {spotName}
      </h3>

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
      <div className="flex items-center justify-between pt-4 border-t border-washi-beige-dark">
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
        <div className="flex gap-2">
          <button
            onClick={() => handleReaction('hokkorisu')}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
              selectedReactions.has('hokkorisu')
                ? 'bg-washi-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            aria-label="ほっこりリアクション"
          >
            😊 {reactions.hokkorisu}
          </button>
          <button
            onClick={() => handleReaction('ittemiitai')}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
              selectedReactions.has('ittemiitai')
                ? 'bg-washi-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            aria-label="行ってみたいリアクション"
          >
            🚶 {reactions.ittemiitai}
          </button>
          <button
            onClick={() => handleReaction('memoshita')}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
              selectedReactions.has('memoshita')
                ? 'bg-washi-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            aria-label="メモしたリアクション"
          >
            📝 {reactions.memoshita}
          </button>
        </div>
      </div>
    </article>
  )
}
