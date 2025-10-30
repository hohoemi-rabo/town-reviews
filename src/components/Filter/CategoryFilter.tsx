'use client'

interface CategoryFilterProps {
  selectedCategories: string[]
  onChange: (categories: string[]) => void
}

const REVIEW_CATEGORIES = [
  { value: 'グルメ', label: 'グルメ', emoji: '🍴' },
  { value: '景色', label: '景色', emoji: '🌄' },
  { value: '体験', label: '体験', emoji: '🎨' },
  { value: '癒し', label: '癒し', emoji: '💆' },
  { value: 'その他', label: 'その他', emoji: '📍' },
]

/**
 * レビューカテゴリーフィルタコンポーネント
 * 複数選択可能（OR条件）
 */
export default function CategoryFilter({
  selectedCategories,
  onChange,
}: CategoryFilterProps) {
  const handleToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter((c) => c !== category))
    } else {
      onChange([...selectedCategories, category])
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-washi-green text-sm">カテゴリー</h3>
      <div className="grid grid-cols-2 gap-2">
        {REVIEW_CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.value)
          return (
            <button
              key={category.value}
              onClick={() => handleToggle(category.value)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  isSelected
                    ? 'bg-washi-green text-white'
                    : 'bg-washi-beige text-washi-green hover:bg-washi-beige-dark'
                }
              `}
            >
              <span className="mr-1">{category.emoji}</span>
              {category.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
