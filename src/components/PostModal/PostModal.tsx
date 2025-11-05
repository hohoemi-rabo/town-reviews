'use client'

import { useState, FormEvent } from 'react'
import SourceSelector from './SourceSelector'
import ImageUpload from './ImageUpload'
import CategorySelector from './CategorySelector'
import FacilitySearchInput, { type Facility } from './FacilitySearchInput'
import FacilityRequestModal from './FacilityRequestModal'
import SeasonSelector from './SeasonSelector'
import TagSelector from './TagSelector'
import type { Tables } from '@/types/database.types'

type ExtendedRecommendation = Tables<'recommendations'> & {
  places: Tables<'places'> | null
}

interface PostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitSuccess?: (newRecommendation: ExtendedRecommendation) => void
}

interface PlaceData {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
  category: string
}

export default function PostModal({
  isOpen,
  onClose,
  onSubmitSuccess,
}: PostModalProps) {
  const [step, setStep] = useState<'search' | 'form'>('search')
  const [placeData, setPlaceData] = useState<PlaceData | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)

  // Form state
  const [heardFromType, setHeardFromType] = useState('')
  const [heardFrom, setHeardFrom] = useState('')
  const [note, setNote] = useState('')
  const [reviewCategory, setReviewCategory] = useState('その他')
  const [season, setSeason] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [images, setImages] = useState<File[]>([])
  const [authorName, setAuthorName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  // const [agreedToTerms, setAgreedToTerms] = useState(false) // TODO: Uncomment when ready

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSelectFacility = (facility: Facility) => {
    // Convert Facility to PlaceData format
    setPlaceData({
      placeId: facility.id, // Use database UUID as placeId
      name: facility.name,
      address: facility.address,
      lat: facility.lat,
      lng: facility.lng,
      category: facility.category,
    })
    setStep('form')
  }

  const handleRequestNewFacility = () => {
    setShowRequestModal(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validation
    if (!heardFromType) {
      setError('情報源を選択してください')
      return
    }

    // TODO: Uncomment if you want to require input for "その他"
    // if (heardFromType === 'その他' && !heardFrom.trim()) {
    //   setError('情報源の詳細を入力してください')
    //   return
    // }

    if (!note.trim()) {
      setError('メモを入力してください')
      return
    }

    if (!isAnonymous && !authorName.trim()) {
      setError('投稿者名を入力してください')
      return
    }

    // TODO: Uncomment when ready to enforce terms agreement
    // if (!agreedToTerms) {
    //   setError('利用規約に同意してください')
    //   return
    // }

    setError(null)
    setIsSubmitting(true)

    try {
      // Upload images if any
      let imageUrls: string[] = []
      if (images.length > 0) {
        const uploadPromises = images.map(async (image) => {
          const formData = new FormData()
          formData.append('file', image)

          const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('画像のアップロードに失敗しました')
          }

          const data = await response.json()
          return data.url
        })

        imageUrls = await Promise.all(uploadPromises)
      }

      // Submit recommendation
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place: placeData,
          heardFromType,
          heardFrom: heardFromType === 'その他' ? heardFrom : '',
          note,
          reviewCategory,
          season,
          tags,
          images: imageUrls,
          authorName: isAnonymous ? null : authorName,
          isAnonymous,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '投稿に失敗しました')
      }

      // Success - pass new recommendation data to parent BEFORE closing
      if (data.success && data.recommendation) {
        // Transform places from array to single object (Supabase JOIN returns array)
        const transformedRecommendation = {
          ...data.recommendation,
          places: Array.isArray(data.recommendation.places)
            ? data.recommendation.places[0] || null
            : data.recommendation.places,
        }

        // Call parent callback first
        if (onSubmitSuccess) {
          onSubmitSuccess(transformedRecommendation)
        }

        // Then close modal
        handleClose()
      } else {
        handleClose()
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : '投稿に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('search')
    setPlaceData(null)
    setHeardFromType('')
    setHeardFrom('')
    setNote('')
    setReviewCategory('その他')
    setImages([])
    setAuthorName('')
    setIsAnonymous(true)
    setError(null)
    onClose()
  }

  const handleBack = () => {
    setStep('search')
    setPlaceData(null)
    setError(null)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-2xl font-bold text-washi-green">
              {step === 'search' ? '📍 施設を選択' : '✍️ 口コミを投稿'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {step === 'search' ? (
              /* Step 1: Facility search */
              <div>
                <FacilitySearchInput
                  onSelectFacility={handleSelectFacility}
                  onRequestNewFacility={handleRequestNewFacility}
                />
              </div>
            ) : (
              /* Step 2: Review form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Place info */}
                <div className="bg-washi-beige rounded-lg p-4 border-2 border-washi-green-light">
                  <p className="text-sm text-gray-600 mb-1">投稿先の施設</p>
                  <p className="font-bold text-washi-green text-lg">
                    {placeData?.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{placeData?.address}</p>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="mt-2 text-sm text-washi-green hover:underline"
                  >
                    ← 別の施設を選択
                  </button>
                </div>

                {/* Source selector */}
                <SourceSelector
                  heardFromType={heardFromType}
                  heardFrom={heardFrom}
                  onHeardFromTypeChange={setHeardFromType}
                  onHeardFromChange={setHeardFrom}
                />

                {/* Note input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    メモ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="例: 手打ちそばが絶品！鴨南蛮がおすすめ。お店の雰囲気も落ち着いていて、ゆっくり食事ができます。"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green resize-none"
                    rows={5}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {note.length}/200文字
                  </p>
                </div>

                {/* Image upload */}
                <ImageUpload images={images} onImagesChange={setImages} />

                {/* Category selector */}
                <CategorySelector
                  selectedCategory={reviewCategory}
                  onCategoryChange={setReviewCategory}
                />

                {/* Season selector */}
                <SeasonSelector
                  selectedSeason={season}
                  onChange={setSeason}
                />

                {/* Tag selector */}
                <TagSelector
                  selectedTags={tags}
                  onChange={setTags}
                  maxTags={3}
                />

                {/* Author info */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-washi-green focus:ring-washi-green"
                    />
                    <span className="text-sm text-gray-700">匿名で投稿</span>
                  </label>

                  {!isAnonymous && (
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="投稿者名 (例: 山田)"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                      maxLength={20}
                    />
                  )}
                </div>

                {/* Terms agreement */}
                {/* TODO: Uncomment when ready to enforce terms agreement */}
                {/* <div className="space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-washi-green focus:ring-washi-green"
                    />
                    <span className="text-sm text-gray-700">
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-washi-green hover:underline font-medium"
                      >
                        利用規約
                      </a>
                      と
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-washi-green hover:underline font-medium"
                      >
                        プライバシーポリシー
                      </a>
                      に同意する <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div> */}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-washi-orange text-white rounded-lg font-bold hover:bg-washi-orange-light transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '投稿中...' : '✨ 投稿する'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  投稿後24時間は編集・削除が可能です
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Facility Request Modal */}
      <FacilityRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </>
  )
}
