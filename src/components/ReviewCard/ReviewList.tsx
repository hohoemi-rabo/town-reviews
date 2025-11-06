'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/Toast/ToastProvider'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import ReviewCard from './ReviewCard'
import SkeletonCard from './SkeletonCard'
import EditModal from './EditModal'
import type { Tables } from '@/types/database.types'

export type ExtendedRecommendation = Tables<'recommendations'> & {
  places: Tables<'places'> | null
}

interface ReviewListProps {
  initialReviews?: ExtendedRecommendation[]
  onLoadMore?: (page: number) => Promise<ExtendedRecommendation[]>
  onTagsChanged?: () => void
}

export default function ReviewList({ initialReviews = [], onLoadMore, onTagsChanged }: ReviewListProps) {
  const [reviews, setReviews] = useState<ExtendedRecommendation[]>(initialReviews)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [editingReview, setEditingReview] = useState<ExtendedRecommendation | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  // Update internal state when parent passes new data (e.g., manual refresh)
  useEffect(() => {
    setReviews(initialReviews)
    setPage(1)
    setHasMore(true)
  }, [initialReviews])

  const loadMore = useCallback(async () => {
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
  }, [onLoadMore, page])

  const handleEdit = useCallback((id: string) => {
    const review = reviews.find((r) => r.id === id)
    if (review) {
      setEditingReview(review)
    }
  }, [reviews])

  const handleDelete = useCallback((id: string) => {
    const review = reviews.find((r) => r.id === id)
    if (review) {
      setDeleteConfirm({
        id,
        name: review.places?.name || '不明なスポット',
      })
    }
  }, [reviews])

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return

    try {
      const response = await fetch(`/api/recommendations/${deleteConfirm.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '削除に失敗しました')
      }

      // Remove from local state
      setReviews((prev) => prev.filter((r) => r.id !== deleteConfirm.id))
      // Refresh tag list after deletion
      onTagsChanged?.()
      showToast('投稿を削除しました', 'success')
    } catch (error) {
      console.error('Delete error:', error)
      showToast(error instanceof Error ? error.message : '削除に失敗しました', 'error')
    }
  }, [deleteConfirm, onTagsChanged, showToast])

  const handleEditSuccess = useCallback((updatedData: {
    heardFromType: string
    heardFrom: string
    note: string
    reviewCategory: string
    season?: string | null
    tags: string[]
    images: string[]
    authorName: string | null
    isAnonymous: boolean
  }) => {
    if (!editingReview) return

    // Update local state immediately
    setReviews((prev) =>
      prev.map((review) =>
        review.id === editingReview.id
          ? {
              ...review,
              heard_from_type: updatedData.heardFromType,
              heard_from: updatedData.heardFrom,
              note_raw: updatedData.note,
              note_formatted: updatedData.note,
              review_category: updatedData.reviewCategory,
              season: updatedData.season ?? null,
              tags: updatedData.tags,
              images: updatedData.images,
              author_name: updatedData.authorName,
              is_anonymous: updatedData.isAnonymous,
            }
          : review
      )
    )

    // Refresh tag list if tags changed
    onTagsChanged?.()

    // Close the edit modal
    setEditingReview(null)
  }, [editingReview, onTagsChanged])

  useEffect(() => {
    const currentTarget = observerTarget.current
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loading, loadMore])

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
    <>
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              id={review.id}
              spotName={review.places?.name || '不明なスポット'}
              googleMapsUrl={review.places?.google_maps_url || null}
              heardFrom={review.heard_from}
              heardFromType={review.heard_from_type}
              note={review.note_formatted || review.note_raw || ''}
              reviewCategory={review.review_category || 'その他'}
              images={review.images || []}
              tags={review.tags || []}
              // season={review.season} // Commented out - not displayed after user request
              authorName={review.author_name}
              isAnonymous={review.is_anonymous ?? true}
              createdAt={review.created_at || new Date().toISOString()}
              onEdit={handleEdit}
              onDelete={handleDelete}
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

      {/* Edit Modal */}
      {editingReview && (
        <EditModal
          isOpen={!!editingReview}
          onClose={() => setEditingReview(null)}
          recommendationId={editingReview.id}
          initialData={{
            heardFromType: editingReview.heard_from_type,
            heardFrom: editingReview.heard_from,
            note: editingReview.note_raw || '',
            reviewCategory: editingReview.review_category || 'その他',
            // season: editingReview.season, // Commented out - not displayed after user request
            tags: editingReview.tags || [],
            images: editingReview.images || [],
            authorName: editingReview.author_name,
            isAnonymous: editingReview.is_anonymous ?? true,
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="投稿を削除"
        message={`「${deleteConfirm?.name}」の口コミを削除してもよろしいですか？この操作は取り消せません。`}
        confirmText="削除する"
        cancelText="キャンセル"
        type="danger"
      />
    </>
  )
}
