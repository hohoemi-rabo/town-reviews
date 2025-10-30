'use client'

export default function AdminFacilityRequestsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-yellow-800 mb-2">
          🚧 実装中
        </h2>
        <p className="text-yellow-700">
          施設追加リクエスト管理機能は Phase 3 で実装予定です。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">実装予定の機能</h3>
        <ul className="space-y-2 text-gray-600">
          <li>✓ ユーザーからの施設追加リクエスト一覧</li>
          <li>✓ pending/approved/rejected フィルタ</li>
          <li>✓ リクエスト詳細モーダル</li>
          <li>✓ 承認/却下機能</li>
          <li>✓ 施設情報入力フォーム</li>
          <li>✓ placesテーブルへ追加</li>
        </ul>
      </div>
    </div>
  )
}
