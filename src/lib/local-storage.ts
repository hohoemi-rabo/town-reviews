/**
 * LocalStorage utility for managing user reactions
 * Tracks which reactions a user has made to prevent duplicates
 */

const REACTIONS_KEY = 'machi_user_reactions'

export interface UserReaction {
  recommendationId: string
  reactionType: 'ittemiitai'
  timestamp: number
}

/**
 * Get all user reactions from LocalStorage
 */
export function getUserReactions(): UserReaction[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(REACTIONS_KEY)
    if (!stored) return []

    return JSON.parse(stored) as UserReaction[]
  } catch (error) {
    console.error('Failed to get user reactions:', error)
    return []
  }
}

/**
 * Check if user has already reacted with a specific type
 */
export function hasUserReacted(
  recommendationId: string,
  reactionType: UserReaction['reactionType']
): boolean {
  const reactions = getUserReactions()
  return reactions.some(
    (r) => r.recommendationId === recommendationId && r.reactionType === reactionType
  )
}

/**
 * Add a reaction to LocalStorage
 */
export function addUserReaction(
  recommendationId: string,
  reactionType: UserReaction['reactionType']
): void {
  if (typeof window === 'undefined') return

  try {
    const reactions = getUserReactions()

    // Check if already exists
    if (hasUserReacted(recommendationId, reactionType)) {
      return
    }

    // Add new reaction
    reactions.push({
      recommendationId,
      reactionType,
      timestamp: Date.now(),
    })

    localStorage.setItem(REACTIONS_KEY, JSON.stringify(reactions))
  } catch (error) {
    console.error('Failed to add user reaction:', error)
  }
}

/**
 * Remove a reaction from LocalStorage
 */
export function removeUserReaction(
  recommendationId: string,
  reactionType: UserReaction['reactionType']
): void {
  if (typeof window === 'undefined') return

  try {
    const reactions = getUserReactions()
    const filtered = reactions.filter(
      (r) => !(r.recommendationId === recommendationId && r.reactionType === reactionType)
    )

    localStorage.setItem(REACTIONS_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to remove user reaction:', error)
  }
}

/**
 * Get all reactions for a specific recommendation
 */
export function getReactionsForRecommendation(
  recommendationId: string
): UserReaction['reactionType'][] {
  const reactions = getUserReactions()
  return reactions
    .filter((r) => r.recommendationId === recommendationId)
    .map((r) => r.reactionType)
}

/**
 * Clear old reactions (older than 90 days)
 */
export function cleanupOldReactions(): void {
  if (typeof window === 'undefined') return

  try {
    const reactions = getUserReactions()
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000

    const filtered = reactions.filter((r) => r.timestamp > ninetyDaysAgo)

    localStorage.setItem(REACTIONS_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to cleanup old reactions:', error)
  }
}
