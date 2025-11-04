import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
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
          </div>
        </div>
      </div>
    </footer>
  )
}
