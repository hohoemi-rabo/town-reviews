'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'

export interface Facility {
  id: string
  name: string
  address: string
  area: string
  category: string
  lat: number
  lng: number
  phone?: string
  google_maps_url?: string
}

interface FacilitySearchInputProps {
  onSelectFacility: (facility: Facility) => void
  onRequestNewFacility: () => void
}

export default function FacilitySearchInput({
  onSelectFacility,
  onRequestNewFacility,
}: FacilitySearchInputProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Facility[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // デバウンス処理で施設検索
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch('/api/facilities/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit: 10 }),
        })

        const data = await response.json()

        if (data.success) {
          setSuggestions(data.facilities || [])
          setShowSuggestions(true)
          setSelectedIndex(-1)
        }
      } catch (error) {
        console.error('Facility search error:', error)
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300msデバウンス

    return () => clearTimeout(timer)
  }, [query])

  // キーボードナビゲーション
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectFacility(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  const handleSelectFacility = (facility: Facility) => {
    onSelectFacility(facility)
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  // カテゴリアイコン
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '飲食':
        return '🍴'
      case '体験':
        return '🎨'
      case '自然':
        return '🌳'
      case '温泉':
        return '♨️'
      default:
        return '📍'
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-washi-text mb-2">
          🔍 施設名を入力してください
        </label>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          placeholder="施設名で検索（例：カフェ、みかわや）"
          className="w-full px-4 py-3 border-2 border-washi-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green-500 focus:border-transparent text-base"
        />

        {isSearching && (
          <div className="absolute right-3 top-11 text-washi-text-light">
            <div className="animate-spin h-5 w-5 border-2 border-washi-green-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* サジェストリスト */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-2 bg-white border-2 border-washi-beige-200 rounded-lg shadow-washi max-h-80 overflow-y-auto"
          >
            {suggestions.map((facility, index) => (
              <button
                key={facility.id}
                type="button"
                onClick={() => handleSelectFacility(facility)}
                className={`w-full text-left px-4 py-3 hover:bg-washi-beige-50 transition-colors border-b border-washi-beige-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-washi-beige-100' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {getCategoryIcon(facility.category)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-washi-text truncate">
                      {facility.name}
                    </div>
                    <div className="text-sm text-washi-text-light truncate">
                      {facility.area} • {facility.category}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 検索結果なし */}
        {showSuggestions && !isSearching && query.trim().length >= 2 && suggestions.length === 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border-2 border-washi-beige-200 rounded-lg shadow-washi p-4 text-center text-washi-text-light">
            「{query}」に一致する施設が見つかりませんでした
          </div>
        )}
      </div>

      {/* 施設追加リクエストボタン */}
      <div className="border-t-2 border-dashed border-washi-beige-200 pt-4">
        <p className="text-sm text-washi-text-light mb-2">
          お探しの施設が見つかりませんか？
        </p>
        <button
          type="button"
          onClick={onRequestNewFacility}
          className="w-full px-4 py-2 bg-white border-2 border-washi-green-500 text-washi-green-700 rounded-lg hover:bg-washi-green-50 transition-colors font-medium"
        >
          ➕ 施設追加をリクエスト
        </button>
      </div>
    </div>
  )
}
