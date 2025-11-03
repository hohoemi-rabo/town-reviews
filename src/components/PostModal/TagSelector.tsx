'use client'

import { useState } from 'react'

interface TagSelectorProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
}

const TAG_CATEGORIES = [
  {
    name: '料理ジャンル',
    tags: ['和食', '洋食・イタリアン', '中華', 'カフェ・スイーツ', 'ラーメン・麺類', '焼肉・居酒屋'],
  },
  {
    name: '雰囲気・特徴',
    tags: ['絶景', '穴場', '人気', '静か', '賑やか', 'レトロ', 'SNS映え'],
  },
  {
    name: '誰と行く',
    tags: ['家族向け', '子連れOK', 'デート向き', '一人でも楽しめる', '友人と', '団体OK'],
  },
  // {
  //   name: '価格帯',
  //   tags: ['リーズナブル', '高級', '無料'],
  // },
  {
    name: 'アクセス・設備',
    tags: [/* '駅近', '車必須', */ '駐車場あり', 'バリアフリー'],
  },
  {
    name: '時間帯',
    tags: ['朝がおすすめ', '昼がおすすめ', '夜がおすすめ'],
  },
  // {
  //   name: '地域性・その他',
  //   tags: ['地元民おすすめ', '観光客向け', '歴史的', '自然豊か'],
  // },
]

export default function TagSelector({
  selectedTags,
  onChange,
  maxTags = 7,
}: TagSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // 選択解除
      onChange(selectedTags.filter((t) => t !== tag))
    } else {
      // 選択追加（最大数チェック）
      if (selectedTags.length < maxTags) {
        onChange([...selectedTags, tag])
      }
    }
  }

  const handleToggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName)
  }

  const isMaxReached = selectedTags.length >= maxTags

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-washi-green mb-2">
          タグを選択（最大{maxTags}つまで）
        </label>
        <p className="text-xs text-gray-500 mb-3">
          口コミの特徴を表すタグを選んでください
        </p>

        {/* 選択中のタグ表示 */}
        {selectedTags.length > 0 && (
          <div className="mb-4 p-3 bg-washi-beige rounded-lg">
            <p className="text-xs text-gray-600 mb-2">選択中のタグ:</p>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className="px-3 py-1 bg-washi-green text-white rounded-full text-sm font-medium flex items-center gap-1 hover:bg-washi-green-light transition-colors"
                >
                  {tag}
                  <span className="text-xs">✕</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* カテゴリー別タグ一覧 */}
      <div className="space-y-2">
        {TAG_CATEGORIES.map((category) => {
          const isExpanded = expandedCategory === category.name

          return (
            <div key={category.name} className="border border-gray-200 rounded-lg">
              {/* カテゴリーヘッダー */}
              <button
                type="button"
                onClick={() => handleToggleCategory(category.name)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-700">{category.name}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* タグボタン */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2">
                  <div className="flex flex-wrap gap-2">
                    {category.tags.map((tag) => {
                      const isSelected = selectedTags.includes(tag)
                      const isDisabled = !isSelected && isMaxReached

                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          disabled={isDisabled}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-washi-green text-white'
                              : isDisabled
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-washi-green hover:text-washi-green'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isMaxReached && (
        <p className="text-xs text-washi-orange">
          ※ 最大{maxTags}つまで選択できます。変更する場合は選択中のタグを削除してください。
        </p>
      )}
    </div>
  )
}
