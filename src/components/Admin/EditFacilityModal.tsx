'use client'

import { useState } from 'react'
import { Tables } from '@/types/database.types'

type Facility = Tables<'places'>

interface EditFacilityModalProps {
  isOpen: boolean
  facility: Facility
  onClose: () => void
  onSuccess: () => void
}

export default function EditFacilityModal({
  isOpen,
  facility,
  onClose,
  onSuccess,
}: EditFacilityModalProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: facility.name || '',
    name_kana: facility.name_kana || '',
    address: facility.address || '',
    area: facility.area || '',
    category: facility.category || '',
    phone: facility.phone || '',
    google_maps_url: facility.google_maps_url || '',
    lat: facility.lat || 0,
    lng: facility.lng || 0,
    is_verified: facility.is_verified ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('施設名は必須です')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/facilities/${facility.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert('施設を更新しました')
        onSuccess()
      } else {
        alert(data.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update facility:', error)
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
            <h2 className="text-2xl font-bold text-washi-green">施設を編集</h2>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Facility Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-2">施設ID</h3>
                <p className="text-sm text-gray-600">{facility.id}</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  施設名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                  required
                />
              </div>

              {/* Name Kana */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ふりがな
                </label>
                <input
                  type="text"
                  value={formData.name_kana}
                  onChange={(e) =>
                    setFormData({ ...formData, name_kana: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                  placeholder="みかわか"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  住所
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  エリア
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                  placeholder="例: 飯田市, 阿智村"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  カテゴリー
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                  placeholder="例: 飲食, 観光, 宿泊"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                  placeholder="例: 0265-XX-XXXX"
                />
              </div>

              {/* Google Maps URL */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={formData.google_maps_url}
                  onChange={(e) =>
                    setFormData({ ...formData, google_maps_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    緯度
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) =>
                      setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    経度
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) =>
                      setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
                  />
                </div>
              </div>

              {/* Is Verified */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) =>
                      setFormData({ ...formData, is_verified: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-washi-green focus:ring-washi-green"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    承認済み（検索結果に表示される）
                  </span>
                </label>
              </div>
            </form>
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
              disabled={saving}
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
