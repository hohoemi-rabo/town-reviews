'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardStats {
  totalRecommendations: number
  totalFacilities: number
  totalReactions: number
  pendingRequests: number
  todayRecommendations: number
  thisMonthRecommendations: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRecommendations: 0,
    totalFacilities: 0,
    totalReactions: 0,
    pendingRequests: 0,
    todayRecommendations: 0,
    thisMonthRecommendations: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()

      if (data.success) {
        // 今日の投稿数を計算
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // 承認待ちリクエスト数を取得
        const requestsRes = await fetch('/api/admin/facility-requests?status=pending')
        const requestsData = await requestsRes.json()
        const pendingCount = requestsData.success ? requestsData.requests.length : 0

        setStats({
          totalRecommendations: data.stats.posts.total,
          totalFacilities: data.stats.facilities.total,
          totalReactions: data.stats.reactions.total,
          pendingRequests: pendingCount,
          todayRecommendations: 0, // TODO: 今日の投稿数を計算する場合はAPI拡張が必要
          thisMonthRecommendations: data.stats.posts.monthly,
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: '総投稿数',
      value: stats.totalRecommendations,
      icon: '📝',
      color: 'bg-blue-500',
      link: '/admin/posts',
    },
    {
      title: '登録施設数',
      value: stats.totalFacilities,
      icon: '🏢',
      color: 'bg-green-500',
      link: '/admin/facilities',
    },
    {
      title: '総リアクション',
      value: stats.totalReactions,
      icon: '❤️',
      color: 'bg-pink-500',
    },
    {
      title: '承認待ちリクエスト',
      value: stats.pendingRequests,
      icon: '⏳',
      color: 'bg-orange-500',
      link: '/admin/facility-requests',
    },
    {
      title: '今日の投稿',
      value: stats.todayRecommendations,
      icon: '🆕',
      color: 'bg-purple-500',
    },
    {
      title: '今月の投稿',
      value: stats.thisMonthRecommendations,
      icon: '📅',
      color: 'bg-indigo-500',
    },
  ]

  const quickActions = [
    {
      title: '投稿を管理',
      description: '投稿の閲覧・編集・削除',
      icon: '📝',
      href: '/admin/posts',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      title: '施設リクエスト',
      description: 'ユーザーからの施設追加リクエストを承認',
      icon: '📋',
      href: '/admin/facility-requests',
      color: 'bg-orange-50 border-orange-200',
    },
    {
      title: '施設管理',
      description: '施設の編集・CSV管理',
      icon: '🏢',
      href: '/admin/facilities',
      color: 'bg-green-50 border-green-200',
    },
    {
      title: '統計を見る',
      description: '詳細な統計とグラフ',
      icon: '📈',
      href: '/admin/stats',
      color: 'bg-purple-50 border-purple-200',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-washi-green"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-washi-green to-washi-green-light text-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-2">ようこそ、管理者さん 👋</h2>
        <p className="text-white/90">
          まち口コミ帳の管理画面です。投稿や施設の管理ができます。
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{card.icon}</span>
              <div
                className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center`}
              >
                <span className="text-2xl font-bold text-white">
                  {card.value > 99 ? '99+' : card.value}
                </span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              {card.title}
            </h3>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            {card.link && (
              <Link
                href={card.link}
                className="mt-4 text-sm text-washi-green hover:underline inline-flex items-center"
              >
                詳細を見る →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">クイックアクション</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`${action.color} border-2 rounded-lg p-6 hover:shadow-md transition-all`}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{action.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
