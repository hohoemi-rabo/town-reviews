'use client'

const REVIEW_CATEGORIES = [
  { value: 'グルメ', emoji: '🍴', label: 'グルメ' },
  { value: '景色', emoji: '🏞️', label: '景色' },
  { value: '体験', emoji: '🎯', label: '体験' },
  { value: '癒し', emoji: '♨️', label: '癒し' },
  { value: 'その他', emoji: '📝', label: 'その他' },
] as const

interface CategorySelectorProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategorySelector({
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        カテゴリー <span className="text-red-500">*</span>
      </label>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {REVIEW_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.value

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => onCategoryChange(category.value)}
              className={`
                py-3 px-2 rounded-lg border-2 transition-all
                flex flex-col items-center gap-1
                ${
                  isSelected
                    ? 'bg-washi-green text-white border-washi-green font-bold'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-washi-green-light'
                }
              `}
            >
              <span className="text-2xl">{category.emoji}</span>
              <span className="text-xs">{category.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
