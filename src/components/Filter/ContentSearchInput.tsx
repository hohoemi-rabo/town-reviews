'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

interface ContentSearchInputProps {
  value: string
  onChange: (value: string) => void
}

/**
 * 口コミ内容検索コンポーネント
 * デバウンス処理により、入力後500msで検索を実行
 */
export default function ContentSearchInput({
  value,
  onChange,
}: ContentSearchInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const debouncedValue = useDebounce(localValue, 500)

  // デバウンスされた値が変更されたら親に通知
  useEffect(() => {
    onChange(debouncedValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  // 外部から値が変更された場合（例: クリアボタン）
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-washi-green text-sm">キーワード検索</h3>
      <div className="relative">
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder="口コミ内容を検索..."
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {localValue && (
          <button
            onClick={() => setLocalValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500">
        口コミの内容を検索します（施設名検索は下の「施設」フィルタをご利用ください）
      </p>
    </div>
  )
}
