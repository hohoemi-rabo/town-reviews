'use client'

import { useEffect, useState } from 'react'
import { Tables } from '@/types/database.types'
import { useToast } from '@/components/Toast/ToastProvider'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import EditFacilityModal from '@/components/Admin/EditFacilityModal'

type Facility = Tables<'places'> & { name_kana?: string | null }

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [areaFilter, setAreaFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showOnlyVerified, setShowOnlyVerified] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [importing, setImporting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const [importConfirm, setImportConfirm] = useState<{ file: File } | null>(null)
  const itemsPerPage = 20
  const { showToast } = useToast()

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFacilities()
    }, 1000) // Wait 1 second after user stops typing

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch immediately when other filters change
  useEffect(() => {
    fetchFacilities()
  }, [areaFilter, categoryFilter, showOnlyVerified])

  const fetchFacilities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (areaFilter) params.append('area', areaFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      if (showOnlyVerified) params.append('verified', 'true')

      const response = await fetch(`/api/admin/facilities?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setFacilities(data.facilities as Facility[])
        setCurrentPage(1) // Reset to first page on filter change
      } else {
        showToast(data.error || '施設の取得に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to fetch facilities:', error)
      showToast('施設の取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      const response = await fetch(`/api/admin/facilities/${deleteConfirm.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        showToast('施設を削除しました', 'success')
        fetchFacilities()
      } else {
        showToast(data.error || '削除に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Failed to delete facility:', error)
      showToast('削除に失敗しました', 'error')
    }
  }

  const handleExportCSV = async () => {
    // CSV export functionality - fetch all facilities (not just current filtered view)
    try {
      setLoading(true)
      const allFacilities = await fetchAllFacilities()
      const csv = generateCSV(allFacilities)
      downloadCSV(csv, 'facilities.csv')
      showToast(`${allFacilities.length}件の施設データをCSV出力しました`, 'success')
    } catch (error) {
      console.error('CSV export failed:', error)
      showToast('CSV出力に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      showToast('CSVファイルを選択してください', 'error')
      event.target.value = '' // Reset input
      return
    }

    setImportConfirm({ file })
    event.target.value = '' // Reset input for next import
  }

  const confirmImport = async () => {
    if (!importConfirm) return
    const { file } = importConfirm

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/import-facilities', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        showToast(data.message, 'success')

        // Show warnings if there were any errors
        if (data.parseErrors || data.dbErrors) {
          let warningMessage = '⚠️ 一部のレコードでエラーがありました:'
          if (data.parseErrors) {
            warningMessage += '\n\nパースエラー:\n' + data.parseErrors.slice(0, 5).join('\n')
            if (data.parseErrors.length > 5) {
              warningMessage += `\n...他${data.parseErrors.length - 5}件`
            }
          }
          if (data.dbErrors) {
            warningMessage += '\n\nデータベースエラー:\n' + data.dbErrors.slice(0, 5).join('\n')
            if (data.dbErrors.length > 5) {
              warningMessage += `\n...他${data.dbErrors.length - 5}件`
            }
          }
          // Log full details to console for debugging
          console.warn('CSV Import warnings:', { parseErrors: data.parseErrors, dbErrors: data.dbErrors })
          showToast(warningMessage, 'info')
        }

        fetchFacilities() // Refresh the list
      } else {
        showToast(`インポート失敗: ${data.error}`, 'error')
        if (data.details) {
          console.error('Import details:', data.details)
        }
      }
    } catch (error) {
      console.error('Import failed:', error)
      showToast('インポートに失敗しました', 'error')
    } finally {
      setImporting(false)
    }
  }

  const fetchAllFacilities = async (): Promise<Facility[]> => {
    // Fetch all facilities with pagination (Supabase limit is 1000 per request)
    const allFacilities: Facility[] = []
    let offset = 0
    const limit = 1000

    while (true) {
      const params = new URLSearchParams()
      params.append('offset', offset.toString())
      params.append('limit', limit.toString())
      // Note: Don't apply filters for CSV export - export all data

      const response = await fetch(`/api/admin/facilities?${params.toString()}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || '施設の取得に失敗しました')
      }

      const batch = data.facilities as Facility[]
      allFacilities.push(...batch)

      // If we got less than the limit, we've reached the end
      if (batch.length < limit) {
        break
      }

      offset += limit
    }

    return allFacilities
  }

  const generateCSV = (data: Facility[]) => {
    const headers = [
      'id',
      'name',
      'name_kana',
      'address',
      'area',
      'category',
      'lat',
      'lng',
      'place_id',
      'google_maps_url',
      'phone',
      'is_verified',
      'created_by',
      'created_at',
    ]

    const rows = data.map((facility) =>
      headers.map((header) => {
        const value = facility[header as keyof Facility]
        // Escape commas and quotes
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        return `"${stringValue.replace(/"/g, '""')}"`
      })
    )

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    // Add BOM (Byte Order Mark) for Excel to recognize UTF-8 properly
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  // Get unique areas and categories for filters
  const uniqueAreas = Array.from(
    new Set(facilities.map((f) => f.area).filter((area): area is string => Boolean(area)))
  )
  const uniqueCategories = Array.from(
    new Set(facilities.map((f) => f.category).filter((cat): cat is string => Boolean(cat)))
  )

  // Pagination
  const totalPages = Math.ceil(facilities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentFacilities = facilities.slice(startIndex, endIndex)

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
        <h1 className="text-2xl font-bold text-washi-green">施設管理</h1>
        <div className="flex gap-2">
          <label
            className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer ${
              importing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {importing ? '📤 処理中...' : '📤 CSV取込'}
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              disabled={importing}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExportCSV}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📥 CSV出力
          </button>
          <button
            onClick={fetchFacilities}
            className="px-4 py-2 bg-washi-green text-white rounded-lg hover:bg-washi-green-light transition-colors"
          >
            🔄 更新
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              キーワード検索
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="施設名、住所で検索..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-washi-green border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          {/* Area Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              エリア
            </label>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
            >
              <option value="">すべて</option>
              {uniqueAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリー
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
            >
              <option value="">すべて</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Verification Status Filter */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyVerified}
              onChange={(e) => setShowOnlyVerified(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-washi-green focus:ring-washi-green"
            />
            <span className="text-sm font-medium text-gray-700">
              承認済み施設のみ表示（削除された施設を非表示）
            </span>
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-sm text-gray-600">
          表示中: <strong>{facilities.length}件</strong>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
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
                  登録元
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                  承認
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentFacilities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    施設がありません
                  </td>
                </tr>
              ) : (
                currentFacilities.map((facility) => (
                  <tr key={facility.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {facility.name}
                      {facility.name_kana && (
                        <div className="text-xs text-gray-500">{facility.name_kana}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {facility.address || '未入力'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {facility.area || '未入力'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {facility.category || '未入力'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {facility.created_by === 'admin' && '管理者'}
                      {facility.created_by === 'api' && 'API'}
                      {facility.created_by === 'user' && 'ユーザー'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          facility.is_verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {facility.is_verified ? '承認済み' : '未承認'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingFacility(facility)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(facility.id, facility.name)}
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
      {editingFacility && (
        <EditFacilityModal
          isOpen={true}
          facility={editingFacility}
          onClose={() => setEditingFacility(null)}
          onSuccess={() => {
            setEditingFacility(null)
            fetchFacilities()
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="施設を削除"
        message={`施設「${deleteConfirm?.name}」を削除しますか？\n（is_verified = false になります）`}
        confirmText="削除する"
        cancelText="キャンセル"
        type="danger"
      />

      {/* Import Confirmation Modal */}
      <ConfirmModal
        isOpen={!!importConfirm}
        onClose={() => setImportConfirm(null)}
        onConfirm={confirmImport}
        title="CSVインポート"
        message={`CSVファイル「${importConfirm?.file.name}」をインポートしますか？\n既存の施設は更新され、新しい施設は追加されます。`}
        confirmText="インポートする"
        cancelText="キャンセル"
        type="warning"
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
