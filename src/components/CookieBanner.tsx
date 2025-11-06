'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const COOKIE_CONSENT_KEY = 'cookie_consent'

export default function CookieBanner() {
  const pathname = usePathname()
  const [showBanner, setShowBanner] = useState(false)

  // 管理画面では表示しない
  const isAdminPage = pathname?.startsWith('/admin')

  useEffect(() => {
    // 管理画面では表示しない
    if (isAdminPage) {
      setShowBanner(false)
      return
    }

    // LocalStorageから同意状態を確認
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setShowBanner(true)
    }
  }, [isAdminPage])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setShowBanner(false)
  }

  // 管理画面では常に非表示
  if (!showBanner || isAdminPage) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-washi-green shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Message */}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">
              Cookieの使用について
            </h3>
            <p className="text-sm text-gray-600">
              本サービスは、サービスの提供と改善のため、Cookieを使用しています。
              <br className="hidden sm:inline" />
              詳細は
              <Link
                href="/privacy"
                className="text-washi-green hover:underline mx-1"
              >
                プライバシーポリシー
              </Link>
              をご確認ください。
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="px-6 py-2 bg-washi-green text-white rounded-lg font-medium hover:bg-washi-green-light transition-colors whitespace-nowrap"
            >
              同意する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
