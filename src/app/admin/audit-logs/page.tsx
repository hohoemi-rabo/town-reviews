'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/Toast/ToastProvider'

interface AuditLog {
  id: string
  action: string
  target_type: string
  target_id: string | null
  details: Record<string, unknown> | null
  admin_identifier: string
  created_at: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50
  const { showToast } = useToast()

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * itemsPerPage
      const response = await fetch(
        `/api/admin/audit-logs?limit=${itemsPerPage}&offset=${offset}`
      )
      const data = await response.json()

      if (data.success) {
        setLogs(data.logs)
        setTotal(data.total)
      } else {
        showToast(data.error || '監査ログの取得に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      showToast('監査ログの取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: '作成',
      update: '更新',
      delete: '削除',
      approve: '承認',
      reject: '却下',
    }
    return labels[action] || action
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      approve: 'bg-purple-100 text-purple-800',
      reject: 'bg-orange-100 text-orange-800',
    }
    return colors[action] || 'bg-gray-100 text-gray-800'
  }

  const getTargetTypeLabel = (targetType: string) => {
    const labels: Record<string, string> = {
      recommendation: '投稿',
      facility: '施設',
      facility_request: '施設リクエスト',
    }
    return labels[targetType] || targetType
  }

  const totalPages = Math.ceil(total / itemsPerPage)

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
        <h1 className="text-2xl font-bold text-washi-green">監査ログ</h1>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-washi-green text-white rounded-lg hover:bg-washi-green-light transition-colors"
        >
          🔄 更新
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-sm text-gray-600">
          総ログ数: <strong>{total}件</strong>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  日時
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  アクション
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  対象タイプ
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  対象ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  管理者
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  詳細
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    ログがありません
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
                          log.action
                        )}`}
                      >
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {getTargetTypeLabel(log.target_type)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {log.target_id ? (
                        <span className="text-xs">{log.target_id.substring(0, 8)}...</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.admin_identifier}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {log.details ? (
                        <details className="cursor-pointer">
                          <summary className="text-washi-green hover:underline">
                            表示
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  )
}
