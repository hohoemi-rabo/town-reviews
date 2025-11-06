'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { useToast } from '@/components/Toast/ToastProvider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const { showToast } = useToast()

  // ログインページはレイアウトを適用しない
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const navItems = [
    { href: '/admin', label: 'ダッシュボード', icon: '📊' },
    { href: '/admin/posts', label: '投稿管理', icon: '📝' },
    { href: '/admin/facility-requests', label: '施設リクエスト', icon: '📋' },
    { href: '/admin/facilities', label: '施設管理', icon: '🏢' },
    { href: '/admin/stats', label: '統計', icon: '📈' },
  ]

  const handleLogout = async () => {
    if (loggingOut) return

    setLoggingOut(true)
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      showToast('ログアウトに失敗しました', 'error')
      setLoggingOut(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-washi-green text-white shadow-lg z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">管理画面</h1>
          <p className="text-sm text-white/80">まち口コミ帳</p>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-white/20 border-l-4 border-washi-orange'
                    : 'hover:bg-white/10'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingOut ? 'ログアウト中...' : '🚪 ログアウト'}
          </button>
          <Link
            href="/"
            className="block mt-3 text-center text-sm text-white/70 hover:text-white"
          >
            ← サイトに戻る
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-washi-green">
              {navItems.find((item) => item.href === pathname)?.label ||
                '管理画面'}
            </h2>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
