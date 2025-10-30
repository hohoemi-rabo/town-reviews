'use client'

import { useEffect, useState } from 'react'
import { Tables } from '@/types/database.types'
import ApproveFacilityModal from '@/components/Admin/ApproveFacilityModal'
import RejectFacilityModal from '@/components/Admin/RejectFacilityModal'

type FacilityRequest = Tables<'facility_requests'>

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function FacilityRequestsPage() {
  const [requests, setRequests] = useState<FacilityRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [approvingRequest, setApprovingRequest] = useState<FacilityRequest | null>(null)
  const [rejectingRequest, setRejectingRequest] = useState<FacilityRequest | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const url =
        statusFilter === 'all'
          ? '/api/admin/facility-requests'
          : `/api/admin/facility-requests?status=${statusFilter}`

      console.log('Fetching facility requests from:', url)
      const response = await fetch(url)
      const data = await response.json()
      console.log('Facility requests response:', data)

      if (data.success) {
        console.log('Number of requests:', data.requests?.length || 0)
        setRequests(data.requests as FacilityRequest[])
      } else {
        console.error('Failed to fetch requests:', data.error)
        alert(data.error || 'リクエストの取得に失敗しました')
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      alert('リクエストの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '不明'
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string | null) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    const labels = {
      pending: '未処理',
      approved: '承認済み',
      rejected: '却下',
    }
    const statusKey = status || 'pending'
    const color = badges[statusKey as keyof typeof badges] || 'bg-gray-100 text-gray-800'
    const label = labels[statusKey as keyof typeof labels] || statusKey

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-washi-green"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-washi-green">施設追加リクエスト</h1>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-washi-green text-white rounded-lg hover:bg-washi-green-light transition-colors"
        >
          🔄 更新
        </button>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-washi-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' && 'すべて'}
              {status === 'pending' && '未処理'}
              {status === 'approved' && '承認済み'}
              {status === 'rejected' && '却下'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-sm text-gray-600">
          表示中: <strong>{requests.length}件</strong>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  ステータス
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  リクエスト日時
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  施設名
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  住所
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  エリア
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  カテゴリー
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  リクエスト元
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    リクエストがありません
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {req.facility_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {req.address || '未入力'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {req.area || '未入力'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {req.category || '未入力'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>
                        {req.requester_name || '匿名'}
                        {req.requester_email && (
                          <div className="text-xs text-gray-500">{req.requester_email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setApprovingRequest(req)}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                          >
                            承認
                          </button>
                          <button
                            onClick={() => setRejectingRequest(req)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                          >
                            却下
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {req.admin_note ? (
                            <div title={req.admin_note}>メモあり</div>
                          ) : (
                            '処理済み'
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      {approvingRequest && (
        <ApproveFacilityModal
          isOpen={true}
          request={approvingRequest}
          onClose={() => setApprovingRequest(null)}
          onSuccess={() => {
            setApprovingRequest(null)
            fetchRequests()
          }}
        />
      )}

      {/* Reject Modal */}
      {rejectingRequest && (
        <RejectFacilityModal
          isOpen={true}
          request={rejectingRequest}
          onClose={() => setRejectingRequest(null)}
          onSuccess={() => {
            setRejectingRequest(null)
            fetchRequests()
          }}
        />
      )}
    </div>
  )
}
