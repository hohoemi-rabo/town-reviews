'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/types/database.types'
import SeasonSelector from '@/components/PostModal/SeasonSelector'
import TagSelector from '@/components/PostModal/TagSelector'

type Recommendation = Tables<'recommendations'> & {
  places: Tables<'places'> | null
}

interface EditRecommendationModalProps {
  isOpen: boolean
  recommendationId: string | null
  onClose: () => void
  onSuccess: () => void
}

const REVIEW_CATEGORIES = ['グルメ', '景色', '体験', '癒し', 'その他'] as const
const HEARD_FROM_TYPES = [
  '家族・親戚',
  '友人・知人',
  '近所の人',
  '職場の人',
  'SNS',
  'その他',
] as const

export default function EditRecommendationModal({
  isOpen,
  recommendationId,
  onClose,
  onSuccess,
}: EditRecommendationModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null
  )
  const [formData, setFormData] = useState({
    note_raw: '',
    note_formatted: '',
    heard_from: '',
    heard_from_type: '',
    review_category: '',
    tags: [] as string[],
    season: null as string | null,
    author_name: '',
    is_anonymous: false,
  })

  useEffect(() => {
    if (isOpen && recommendationId) {
      fetchRecommendation()
    }
  }, [isOpen, recommendationId])

  const fetchRecommendation = async () => {
    if (!recommendationId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/recommendations/${recommendationId}`)
      const data = await response.json()

      if (data.success) {
        const rec = data.recommendation as Recommendation
        setRecommendation(rec)
        setFormData({
          note_raw: rec.note_raw || '',
          note_formatted: rec.note_formatted || '',
          heard_from: rec.heard_from || '',
          heard_from_type: rec.heard_from_type || '',
          review_category: rec.review_category || '',
          tags: (rec.tags as string[]) || [],
          season: rec.season || null,
          author_name: rec.author_name || '',
          is_anonymous: rec.is_anonymous || false,
        })
      }
    } catch (error) {
      console.error('Failed to fetch recommendation:', error)
      alert('投稿の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recommendationId) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/recommendations/${recommendationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (data.success) {
        alert('投稿を更新しました')
        onSuccess()
        onClose()
      } else {
        alert(data.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update:', error)
      alert('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-washi-green">投稿を編集</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-washi-green"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Facility Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-700 mb-2">施設情報</h3>
                  <p className="text-sm text-gray-600">
                    {recommendation?.places?.name || '不明'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {recommendation?.places?.address}
                  </p>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    投稿内容（生データ）
                  </label>
                  <textarea
                    value={formData.note_raw}
                    onChange={(e) =>
                      setFormData({ ...formData, note_raw: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                    rows={4}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.note_raw.length}/200文字
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    投稿内容（表示用）
                  </label>
                  <textarea
                    value={formData.note_formatted}
                    onChange={(e) =>
                      setFormData({ ...formData, note_formatted: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                    rows={4}
                  />
                </div>

                {/* Review Category */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    カテゴリー
                  </label>
                  <select
                    value={formData.review_category}
                    onChange={(e) =>
                      setFormData({ ...formData, review_category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                  >
                    <option value="">選択してください</option>
                    {REVIEW_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Heard From Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    情報源
                  </label>
                  <select
                    value={formData.heard_from_type}
                    onChange={(e) =>
                      setFormData({ ...formData, heard_from_type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                  >
                    <option value="">選択してください</option>
                    {HEARD_FROM_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.heard_from_type === 'その他' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      情報源の詳細
                    </label>
                    <input
                      type="text"
                      value={formData.heard_from}
                      onChange={(e) =>
                        setFormData({ ...formData, heard_from: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                    />
                  </div>
                )}

                {/* Season */}
                <SeasonSelector
                  selectedSeason={formData.season}
                  onChange={(season) => setFormData({ ...formData, season })}
                />

                {/* Tags */}
                <TagSelector
                  selectedTags={formData.tags}
                  onChange={(tags) => setFormData({ ...formData, tags })}
                  maxTags={7}
                />

                {/* Author */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    投稿者名
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_anonymous}
                        onChange={(e) =>
                          setFormData({ ...formData, is_anonymous: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">匿名</span>
                    </label>
                    {!formData.is_anonymous && (
                      <input
                        type="text"
                        value={formData.author_name}
                        onChange={(e) =>
                          setFormData({ ...formData, author_name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                        maxLength={20}
                      />
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || loading}
              className="px-6 py-2 bg-washi-green text-white rounded-lg hover:bg-washi-green-light transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
