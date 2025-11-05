'use client'

import { useState, useEffect } from 'react'
import SourceSelector from '../PostModal/SourceSelector'
import CategorySelector from '../PostModal/CategorySelector'
import SeasonSelector from '../PostModal/SeasonSelector'
import TagSelector from '../PostModal/TagSelector'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  recommendationId: string
  initialData: {
    heardFromType: string
    heardFrom: string
    note: string
    reviewCategory: string
    season: string | null
    tags: string[]
    images: string[]
    authorName: string | null
    isAnonymous: boolean
  }
  onSuccess?: (updatedData: {
    heardFromType: string
    heardFrom: string
    note: string
    reviewCategory: string
    season: string | null
    tags: string[]
    images: string[]
    authorName: string | null
    isAnonymous: boolean
  }) => void
}

export default function EditModal({
  isOpen,
  onClose,
  recommendationId,
  initialData,
  onSuccess,
}: EditModalProps) {
  const [heardFromType, setHeardFromType] = useState(initialData.heardFromType)
  const [heardFrom, setHeardFrom] = useState(initialData.heardFrom)
  const [note, setNote] = useState(initialData.note)
  const [reviewCategory, setReviewCategory] = useState(
    initialData.reviewCategory
  )
  const [season, setSeason] = useState<string | null>(initialData.season)
  const [tags, setTags] = useState<string[]>(initialData.tags)
  const [images, setImages] = useState<string[]>(initialData.images)
  const [authorName, setAuthorName] = useState(initialData.authorName || '')
  const [isAnonymous, setIsAnonymous] = useState(initialData.isAnonymous)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setHeardFromType(initialData.heardFromType)
      setHeardFrom(initialData.heardFrom)
      setNote(initialData.note)
      setReviewCategory(initialData.reviewCategory)
      setSeason(initialData.season)
      setTags(initialData.tags)
      setImages(initialData.images)
      setAuthorName(initialData.authorName || '')
      setIsAnonymous(initialData.isAnonymous)
      setError(null)
    }
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validation: Max 3 tags
    if (tags.length > 3) {
      setError('タグは最大3つまで選択できます')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/recommendations/${recommendationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heardFromType,
          heardFrom,
          note,
          reviewCategory,
          season,
          tags,
          images,
          authorName: isAnonymous ? null : authorName,
          isAnonymous,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '更新に失敗しました')
      }

      // Success - pass updated data to parent
      onSuccess?.({
        heardFromType,
        heardFrom,
        note,
        reviewCategory,
        season,
        tags,
        images,
        authorName: isAnonymous ? null : authorName,
        isAnonymous,
      })
      onClose()
    } catch (err) {
      console.error('Update error:', err)
      setError(err instanceof Error ? err.message : '更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-washi-green">投稿を編集</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Source selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              情報源 <span className="text-red-500">*</span>
            </label>
            <SourceSelector
              heardFromType={heardFromType}
              heardFrom={heardFrom}
              onHeardFromTypeChange={setHeardFromType}
              onHeardFromChange={setHeardFrom}
            />
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              メモ <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">
                ({note.length}/200文字)
              </span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="このスポットについて教えてください"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-washi-green focus:border-transparent resize-none"
              rows={4}
              maxLength={200}
              required
            />
          </div>

          {/* Category selector */}
          <div>
            <CategorySelector
              selectedCategory={reviewCategory}
              onCategoryChange={setReviewCategory}
            />
          </div>

          {/* Season selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              季節 <span className="text-xs text-gray-500">(任意)</span>
            </label>
            <SeasonSelector selectedSeason={season} onChange={setSeason} />
          </div>

          {/* Tag selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ{' '}
              <span className="text-xs text-gray-500">(最大3つまで、任意)</span>
            </label>
            <TagSelector selectedTags={tags} onChange={setTags} maxTags={3} />
          </div>

          {/* Image display and removal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像 <span className="text-xs text-gray-500">(既存の画像を削除できます)</span>
            </label>
            {images.length > 0 ? (
              <div className="relative group max-w-xs">
                <img
                  src={images[0]}
                  alt="投稿画像"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setImages([])}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="画像を削除"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">画像がありません</p>
            )}
          </div>

          {/* Author name */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-washi-green border-gray-300 rounded focus:ring-washi-green"
              />
              <label
                htmlFor="isAnonymous"
                className="text-sm font-medium text-gray-700"
              >
                匿名で投稿
              </label>
            </div>
            {!isAnonymous && (
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="投稿者名（20文字以内）"
                maxLength={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-washi-green focus:border-transparent"
                required={!isAnonymous}
              />
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-washi-green text-white rounded-lg hover:bg-washi-green-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '更新中...' : '更新する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
