'use client'

import { useEffect, useRef, useState } from 'react'
import ReviewCard from './ReviewCard'
import SkeletonCard from './SkeletonCard'
import type { Tables } from '@/types/database.types'

interface ReviewListProps {
  initialReviews?: ExtendedRecommendation[]
  onLoadMore?: (page: number) => Promise<ExtendedRecommendation[]>
}

type ExtendedRecommendation = Tables<'recommendations'> & {
  places: Tables<'places'> | null
  reactions: {
    hokkorisu: number
    ittemiitai: number
    memoshita: number
  }
}

export default function ReviewList({ initialReviews = [], onLoadMore }: ReviewListProps) {
  const [reviews, setReviews] = useState<ExtendedRecommendation[]>(initialReviews)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, loading])

  const loadMore = async () => {
    if (!onLoadMore) return

    setLoading(true)
    try {
      const nextPage = page + 1
      const newReviews = await onLoadMore(nextPage)

      if (newReviews.length === 0) {
        setHasMore(false)
      } else {
        setReviews((prev) => [...prev, ...newReviews])
        setPage(nextPage)
      }
    } catch (error) {
      console.error('Failed to load more reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  if (reviews.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">まだ口コミがありません</p>
        <p className="text-gray-400 text-sm mt-2">
          最初の口コミを投稿してみませんか？
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            id={review.id}
            spotName={review.places?.name || '不明なスポット'}
            heardFrom={review.heard_from}
            heardFromType={review.heard_from_type}
            note={review.note_formatted || review.note_raw || ''}
            images={review.images || []}
            tags={review.tags || []}
            season={review.season}
            authorName={review.author_name}
            isAnonymous={review.is_anonymous ?? true}
            createdAt={review.created_at || new Date().toISOString()}
            reactions={review.reactions}
          />
        ))}

        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
      </div>

      {/* Intersection Observer target */}
      <div ref={observerTarget} className="h-10 mt-4" />

      {!hasMore && reviews.length > 0 && (
        <p className="text-center text-gray-400 text-sm py-8">
          すべての口コミを表示しました
        </p>
      )}
    </div>
  )
}
