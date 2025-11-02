'use client'

import { useState } from 'react'
import { Tables } from '@/types/database.types'
import { useToast } from '@/components/Toast/ToastProvider'

type FacilityRequest = Tables<'facility_requests'>

interface RejectFacilityModalProps {
  isOpen: boolean
  request: FacilityRequest
  onClose: () => void
  onSuccess: () => void
}

export default function RejectFacilityModal({
  isOpen,
  request,
  onClose,
  onSuccess,
}: RejectFacilityModalProps) {
  const [saving, setSaving] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adminNote.trim()) {
      showToast('却下理由を入力してください', 'error')
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
          action: 'reject',
          admin_note: adminNote,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showToast('リクエストを却下しました', 'success')
        onSuccess()
        onClose()
      } else {
        showToast(data.error || '却下に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to reject request:', error)
      showToast('却下に失敗しました', 'error')
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
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-red-600">施設リクエストを却下</h2>
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
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">リクエスト情報</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>施設名: {request.facility_name}</p>
                  <p>リクエスト元: {request.requester_name || '匿名'}</p>
                  {request.requester_email && (
                    <p>メールアドレス: {request.requester_email}</p>
                  )}
                </div>
              </div>

              {/* Rejection Reason */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  却下理由 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={4}
                  placeholder="却下の理由を記入してください"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  ※ 入力した内容は記録されます
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {saving ? '処理中...' : '却下する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
