'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  // 管理画面では表示しない
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="md:fixed md:bottom-0 md:left-0 md:right-0 bg-white border-t border-gray-200 z-10">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Site name */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">
              © 2025 まち口コミ帳. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              href="/terms"
              className="text-gray-600 hover:text-washi-green transition-colors"
            >
              利用規約
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-washi-green transition-colors"
            >
              プライバシーポリシー
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-washi-green transition-colors"
            >
              お問い合わせ
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              href="https://www.instagram.com/masayuki.kiwami/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-washi-green transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              href="https://x.com/masayuki_kiwami"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-washi-green transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
