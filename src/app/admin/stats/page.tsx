'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface StatsData {
  posts: {
    total: number
    monthly: number
    byCategory: Record<string, number>
  }
  facilities: {
    total: number
    byArea: Record<string, number>
    byCategory: Record<string, number>
  }
  popularSpots: Array<{
    place_id: string
    name: string
    count: number
  }>
  tags: Array<{
    tag: string
    count: number
  }>
  reactions: {
    total: number
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  グルメ: '#F97316',
  景色: '#10B981',
  体験: '#3B82F6',
  癒し: '#8B5CF6',
  その他: '#6B7280',
  未設定: '#D1D5DB',
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      } else {
        alert(data.error || '統計データの取得に失敗しました')
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      alert('統計データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-washi-green"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-12">
        統計データが取得できませんでした
      </div>
    )
  }

  // データ整形
  const postsByCategoryData = Object.entries(stats.posts.byCategory).map(
    ([category, count]) => ({
      name: category,
      value: count,
      color: CATEGORY_COLORS[category] || '#6B7280',
    })
  )

  const facilitiesByAreaData = Object.entries(stats.facilities.byArea)
    .map(([area, count]) => ({
      name: area,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const facilitiesByCategoryData = Object.entries(stats.facilities.byCategory).map(
    ([category, count]) => ({
      name: category,
      count,
    })
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-washi-green">統計ダッシュボード</h1>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-washi-green text-white rounded-lg hover:bg-washi-green-light transition-colors"
        >
          🔄 更新
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">総投稿数</div>
          <div className="text-3xl font-bold text-gray-900">{stats.posts.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">今月の投稿</div>
          <div className="text-3xl font-bold text-blue-600">{stats.posts.monthly}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">登録施設数</div>
          <div className="text-3xl font-bold text-green-600">
            {stats.facilities.total}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">総リアクション</div>
          <div className="text-3xl font-bold text-pink-600">{stats.reactions.total}</div>
        </div>
      </div>

      {/* Review Categories */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          レビューカテゴリー別投稿数
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={postsByCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {postsByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center">
            {postsByCategoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-3 mb-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-700 flex-1">{item.name}</span>
                <span className="font-bold text-gray-900">{item.value}件</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Facilities by Area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">エリア別施設数 TOP10</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={facilitiesByAreaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#10B981" name="施設数" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Facilities by Category */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">カテゴリー別施設数</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={facilitiesByCategoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3B82F6" name="施設数" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Popular Spots */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">人気スポット TOP10</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  順位
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  施設名
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                  投稿数
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.popularSpots.map((spot, index) => (
                <tr key={spot.place_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : index === 1
                            ? 'bg-gray-100 text-gray-800'
                            : index === 2
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{spot.name}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                    {spot.count}件
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Tags */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">人気タグ TOP10</h2>
        <div className="flex flex-wrap gap-3">
          {stats.tags.map((tag) => (
            <div
              key={tag.tag}
              className="px-4 py-2 bg-washi-beige-light rounded-full flex items-center gap-2"
            >
              <span className="text-sm font-medium text-gray-700">{tag.tag}</span>
              <span className="text-xs font-bold text-washi-green bg-white px-2 py-1 rounded-full">
                {tag.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
