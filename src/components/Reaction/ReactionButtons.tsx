'use client'

import { useState } from 'react'
import { useUserId } from '@/hooks/useUserId'
import { useReactions } from '@/hooks/useReactions'
import { hasUserReacted, addUserReaction, removeUserReaction } from '@/lib/local-storage'

interface ReactionButtonsProps {
  recommendationId: string
}

type ReactionType = 'ittemiitai'

interface Reaction {
  type: ReactionType
  emoji: string
  label: string
}

const REACTIONS: Reaction[] = [
  { type: 'ittemiitai', emoji: '👍', label: '行ってみたい' },
]

export default function ReactionButtons({
  recommendationId,
}: ReactionButtonsProps) {
  const userId = useUserId()
  const { counts, incrementCount, decrementCount } = useReactions(recommendationId)
  const [loading, setLoading] = useState<ReactionType | null>(null)

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (!userId || loading) return

    const isReacted = hasUserReacted(recommendationId, reactionType)
    setLoading(reactionType)

    try {
      if (isReacted) {
        // Remove reaction
        // Optimistically update the count immediately
        decrementCount(reactionType)
        removeUserReaction(recommendationId, reactionType)

        const response = await fetch('/api/reactions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recommendationId,
            reactionType,
            userId,
          }),
        })

        if (!response.ok) {
          // Revert on error
          incrementCount(reactionType)
          addUserReaction(recommendationId, reactionType)
          throw new Error('Failed to remove reaction')
        }
      } else {
        // Add reaction
        // Optimistically update the count immediately
        incrementCount(reactionType)
        addUserReaction(recommendationId, reactionType)

        const response = await fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recommendationId,
            reactionType,
            userId,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          if (response.status === 409) {
            // Already reacted (race condition) - keep the optimistic update
            console.log('Already reacted')
            return
          }
          // Revert on error
          decrementCount(reactionType)
          removeUserReaction(recommendationId, reactionType)
          throw new Error(data.error || 'Failed to add reaction')
        }
      }
    } catch (error) {
      console.error('Reaction error:', error)
    } finally {
      setLoading(null)
    }
  }

  if (!userId) {
    return null // Don't render until user ID is ready
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REACTIONS.map((reaction) => {
        const isReacted = hasUserReacted(recommendationId, reaction.type)
        const count = counts[reaction.type]
        const isLoading = loading === reaction.type

        return (
          <button
            key={reaction.type}
            onClick={() => handleReactionClick(reaction.type)}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition-all duration-200 ${
              isReacted
                ? 'border-washi-orange bg-washi-orange bg-opacity-10 text-washi-orange'
                : 'border-gray-200 bg-white text-gray-700 hover:border-washi-green hover:bg-washi-beige'
            } ${isLoading ? 'opacity-50 cursor-wait' : 'hover:scale-105 active:scale-95'}`}
            aria-label={`${reaction.label}: ${count}件`}
            aria-pressed={isReacted}
          >
            <span className="text-lg" role="img" aria-label={reaction.label}>
              {reaction.emoji}
            </span>
            <span className="text-sm font-medium">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
