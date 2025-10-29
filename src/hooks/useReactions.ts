'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ReactionCounts {
  ittemiitai: number
}

/**
 * Hook to manage reaction counts with Realtime updates
 */
export function useReactions(recommendationId: string) {
  const [counts, setCounts] = useState<ReactionCounts>({
    ittemiitai: 0,
  })
  const [loading, setLoading] = useState(true)

  // Expose increment and decrement functions for optimistic updates
  const incrementCount = (reactionType: 'ittemiitai') => {
    setCounts((prev) => ({
      ...prev,
      [reactionType]: prev[reactionType] + 1,
    }))
  }

  const decrementCount = (reactionType: 'ittemiitai') => {
    setCounts((prev) => ({
      ...prev,
      [reactionType]: Math.max(0, prev[reactionType] - 1),
    }))
  }

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial counts
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from('reactions')
        .select('reaction_type')
        .eq('recommendation_id', recommendationId)
        .eq('reaction_type', 'ittemiitai')

      if (error) {
        console.error('Failed to fetch reactions:', error)
        setLoading(false)
        return
      }

      // Count reactions
      setCounts({
        ittemiitai: data.length,
      })
      setLoading(false)
    }

    fetchCounts()

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`reactions:${recommendationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reactions',
          filter: `recommendation_id=eq.${recommendationId}`,
        },
        (payload) => {
          const type = payload.new.reaction_type as string
          if (type === 'ittemiitai') {
            setCounts((prev) => ({
              ittemiitai: prev.ittemiitai + 1,
            }))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'reactions',
          filter: `recommendation_id=eq.${recommendationId}`,
        },
        (payload) => {
          const type = payload.old.reaction_type as string
          if (type === 'ittemiitai') {
            setCounts((prev) => ({
              ittemiitai: Math.max(0, prev.ittemiitai - 1),
            }))
          }
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [recommendationId])

  return { counts, loading, incrementCount, decrementCount }
}
