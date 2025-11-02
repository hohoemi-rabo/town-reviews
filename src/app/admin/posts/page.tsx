'use client'

import { useEffect, useState } from 'react'
import { Tables } from '@/types/database.types'
import { useToast } from '@/components/Toast/ToastProvider'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import EditRecommendationModal from '@/components/Admin/EditRecommendationModal'

type Recommendation = Tables<'recommendations'> & {
  places: Tables<'places'> | null
}

export default function AdminPostsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const itemsPerPage = 20
  const { showToast } = useToast()

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations')
      const data = await response.json()

      if (data.success) {
        setRecommendations(data.recommendations as Recommendation[])
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredRecommendations.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredRecommendations.map((r) => r.id)))
    }
  }

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleDelete = (id: string) => {
    const rec = recommendations.find((r) => r.id === id)
    if (rec) {
      setDeleteConfirm({
        id,
        name: rec.places?.name || '不明なスポット',
      })
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      const response = await fetch(`/api/admin/recommendations/${deleteConfirm.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        showToast('投稿を削除しました', 'success')
        fetchRecommendations()
      } else {
        showToast(data.error || '削除に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      showToast('削除に失敗しました', 'error')
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    setBulkDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
    try {
      const response = await fetch('/api/admin/recommendations/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      const data = await response.json()

      if (data.success) {
        showToast(`${data.deletedCount}件の投稿を削除しました`, 'success')
        setSelectedIds(new Set())
        fetchRecommendations()
      } else {
        showToast(data.error || '一括削除に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to bulk delete:', error)
      showToast('一括削除に失敗しました', 'error')
    }
  }

  // Filter recommendations by search query
  const filteredRecommendations = recommendations.filter((rec) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      rec.note_formatted?.toLowerCase().includes(query) ||
      rec.places?.name.toLowerCase().includes(query) ||
      rec.author_name?.toLowerCase().includes(query)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredRecommendations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRecommendations = filteredRecommendations.slice(
    startIndex,
    endIndex
  )

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-washi-green"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="施設名・投稿内容・投稿者名で検索..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
            />
          </div>
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                選択を削除 ({selectedIds.size})
              </button>
            )}
            <button
              onClick={fetchRecommendations}
              className="px-4 py-2 bg-washi-green text-white rounded-lg hover:bg-washi-green-light transition-colors"
            >
              🔄 更新
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            総投稿数: <strong>{recommendations.length}件</strong>
          </span>
          <span>
            表示中: <strong>{filteredRecommendations.length}件</strong>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      filteredRecommendations.length > 0 &&
                      selectedIds.size === filteredRecommendations.length
                    }
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  投稿日時
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  施設名
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  投稿内容
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  カテゴリー・季節・タグ
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  投稿者
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRecommendations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    投稿がありません
                  </td>
                </tr>
              ) : (
                currentRecommendations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(rec.id)}
                        onChange={() => handleSelectOne(rec.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(rec.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {rec.places?.name || '不明'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {rec.note_formatted}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {/* Category */}
                        <span className="px-2 py-1 bg-washi-green text-white rounded text-xs font-medium">
                          {rec.review_category || 'その他'}
                        </span>

                        {/* Season */}
                        {rec.season && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {rec.season}
                          </span>
                        )}

                        {/* Tags */}
                        {rec.tags && Array.isArray(rec.tags) && rec.tags.length > 0 && (
                          rec.tags.slice(0, 3).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {rec.is_anonymous
                        ? '匿名'
                        : rec.author_name || '名無し'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingId(rec.id)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <EditRecommendationModal
        isOpen={editingId !== null}
        recommendationId={editingId}
        onClose={() => setEditingId(null)}
        onSuccess={fetchRecommendations}
      />

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

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="一括削除"
        message={`選択した${selectedIds.size}件の投稿を削除してもよろしいですか？この操作は取り消せません。`}
        confirmText="削除する"
        cancelText="キャンセル"
        type="danger"
      />

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
