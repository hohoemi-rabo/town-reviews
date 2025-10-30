'use client'

import { useState, useEffect } from 'react'

interface TagFilterProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
}

/**
 * タグフィルタコンポーネント
 * よく使われるタグを表示し、複数選択可能（OR条件）
 */
export default function TagFilter({ selectedTags, onChange }: TagFilterProps) {
  const [availableTags, setAvailableTags] = useState<
    { name: string; count: number }[]
  >([])
  const [loading, setLoading] = useState(true)

  // タグ一覧を取得
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags')
        if (response.ok) {
          const data = await response.json()
          setAvailableTags(data.tags || [])
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  const handleToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag))
    } else {
      onChange([...selectedTags, tag])
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="font-bold text-washi-green text-sm">タグ</h3>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-washi-green"></div>
        </div>
      </div>
    )
  }

  if (availableTags.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="font-bold text-washi-green text-sm">タグ</h3>
        <p className="text-sm text-gray-500">タグがありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-washi-green text-sm">タグ</h3>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name)
          return (
            <button
              key={tag.name}
              onClick={() => handleToggle(tag.name)}
              className={`
                px-3 py-1 rounded-full text-sm transition-colors
                ${
                  isSelected
                    ? 'bg-washi-green text-white'
                    : 'bg-washi-beige text-washi-green hover:bg-washi-beige-dark'
                }
              `}
            >
              {tag.name} ({tag.count})
            </button>
          )
        })}
      </div>
    </div>
  )
}
