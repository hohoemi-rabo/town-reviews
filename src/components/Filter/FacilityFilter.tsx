'use client'

import { useState, useEffect, useRef } from 'react'

interface Facility {
  id: string
  name: string
  address: string
  area: string
  category: string
}

interface FacilityFilterProps {
  selectedFacilityId?: string
  onChange: (facilityId?: string, facilityName?: string) => void
}

/**
 * 施設フィルタコンポーネント
 * Ticket 016のFacilitySearchInputの機能を再利用
 */
export default function FacilityFilter({
  onChange,
}: FacilityFilterProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Facility[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  )
  const wrapperRef = useRef<HTMLDivElement>(null)

  // 外部クリックで候補リストを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 検索処理（デバウンス付き）
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
        }
      } catch (error) {
        console.error('Facility search error:', error)
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (facility: Facility) => {
    setSelectedFacility(facility)
    setQuery(facility.name)
    setShowSuggestions(false)
    onChange(facility.id, facility.name)
  }

  const handleClear = () => {
    setSelectedFacility(null)
    setQuery('')
    setSuggestions([])
    onChange(undefined, undefined)
  }

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-washi-green text-sm">施設</h3>
      <div className="relative" ref={wrapperRef}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="施設名を検索..."
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
        {query && (
          <button
            onClick={handleClear}
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

        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-washi-green"></div>
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((facility) => (
              <button
                key={facility.id}
                onClick={() => handleSelect(facility)}
                className="w-full px-4 py-2 text-left hover:bg-washi-beige transition-colors"
              >
                <div className="font-medium text-washi-green">
                  {facility.name}
                </div>
                <div className="text-xs text-gray-600">
                  {facility.area} - {facility.category}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && suggestions.length === 0 && !isSearching && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-sm text-gray-500 text-center">
            該当する施設が見つかりませんでした
          </div>
        )}
      </div>

      {selectedFacility && (
        <div className="flex items-center gap-2 p-2 bg-washi-beige rounded-lg">
          <span className="text-sm text-washi-green flex-1">
            📍 {selectedFacility.name}
          </span>
        </div>
      )}
    </div>
  )
}
