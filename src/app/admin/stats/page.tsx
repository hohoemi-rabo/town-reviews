'use client'

export default function AdminStatsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-yellow-800 mb-2">
          🚧 実装中
        </h2>
        <p className="text-yellow-700">
          統計ダッシュボード機能は Phase 4 で実装予定です。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">実装予定の機能</h3>
        <ul className="space-y-2 text-gray-600">
          <li>✓ 総投稿数・施設数・リアクション数</li>
          <li>✓ 人気スポットTOP10</li>
          <li>✓ タグ使用状況</li>
          <li>✓ エリア別・カテゴリー別分布</li>
          <li>✓ 期間絞り込み</li>
          <li>✓ グラフ表示（Chart.js or Recharts）</li>
        </ul>
      </div>
    </div>
  )
}
