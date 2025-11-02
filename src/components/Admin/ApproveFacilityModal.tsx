'use client'

import { useState } from 'react'
import { Tables } from '@/types/database.types'
import { useToast } from '@/components/Toast/ToastProvider'

type FacilityRequest = Tables<'facility_requests'>

interface ApproveFacilityModalProps {
  isOpen: boolean
  request: FacilityRequest
  onClose: () => void
  onSuccess: () => void
}

export default function ApproveFacilityModal({
  isOpen,
  request,
  onClose,
  onSuccess,
}: ApproveFacilityModalProps) {
  const [saving, setSaving] = useState(false)
  const [facilityData, setFacilityData] = useState({
    name: request.facility_name || '',
    address: request.address || '',
    area: request.area || '',
    category: request.category || '',
    phone: '',
    google_maps_url: '',
  })
  const [adminNote, setAdminNote] = useState('')
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!facilityData.name.trim()) {
      showToast('施設名は必須です', 'error')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/facility-requests/${request.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          facility_data: facilityData,
          admin_note: adminNote,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showToast('施設を承認し、登録しました', 'success')
        onSuccess()
        onClose()
      } else {
        showToast(data.error || '承認に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to approve request:', error)
      showToast('承認に失敗しました', 'error')
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
            <h2 className="text-2xl font-bold text-green-600">施設リクエストを承認</h2>
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
              {/* Request Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2">リクエスト情報</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>リクエスト元: {request.requester_name || '匿名'}</p>
                  {request.requester_email && (
                    <p>メールアドレス: {request.requester_email}</p>
                  )}
                </div>
              </div>

              {/* Facility Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  施設名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={facilityData.name}
                  onChange={(e) =>
                    setFacilityData({ ...facilityData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  住所
                </label>
                <input
                  type="text"
                  value={facilityData.address}
                  onChange={(e) =>
                    setFacilityData({ ...facilityData, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  エリア
                </label>
                <input
                  type="text"
                  value={facilityData.area}
                  onChange={(e) =>
                    setFacilityData({ ...facilityData, area: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  value={facilityData.category}
                  onChange={(e) =>
                    setFacilityData({ ...facilityData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  value={facilityData.phone}
                  onChange={(e) =>
                    setFacilityData({ ...facilityData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  value={facilityData.google_maps_url}
                  onChange={(e) =>
                    setFacilityData({ ...facilityData, google_maps_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>

              {/* Admin Note */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  管理者メモ（任意）
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={3}
                  placeholder="承認時のメモを記入してください"
                />
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
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {saving ? '処理中...' : '承認して登録'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
