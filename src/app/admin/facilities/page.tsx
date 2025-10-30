'use client'

export default function AdminFacilitiesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-yellow-800 mb-2">
          🚧 実装中
        </h2>
        <p className="text-yellow-700">
          施設管理機能は Phase 3 で実装予定です。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">実装予定の機能</h3>
        <ul className="space-y-2 text-gray-600">
          <li>✓ 施設一覧表示（130件登録済み）</li>
          <li>✓ 検索・絞り込み（エリア、カテゴリー）</li>
          <li>✓ 編集機能</li>
          <li>✓ 削除機能（論理削除: is_verified = false）</li>
          <li>✓ Google Maps URL編集</li>
          <li>✓ CSVインポート/エクスポート</li>
        </ul>
      </div>
    </div>
  )
}
