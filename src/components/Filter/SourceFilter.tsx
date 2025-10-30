'use client'

interface SourceFilterProps {
  selectedSources: string[]
  onChange: (sources: string[]) => void
}

const HEARD_FROM_TYPES = [
  { value: '家族・親戚', label: '家族・親戚', emoji: '👨‍👩‍👧‍👦' },
  { value: '友人・知人', label: '友人・知人', emoji: '👥' },
  { value: '近所の人', label: '近所の人', emoji: '🏘️' },
  { value: 'お店の人', label: 'お店の人', emoji: '🏪' },
  { value: 'SNS', label: 'SNS', emoji: '📱' },
  { value: 'その他', label: 'その他', emoji: '💭' },
]

/**
 * 情報源フィルタコンポーネント
 * 複数選択可能（OR条件）
 */
export default function SourceFilter({
  selectedSources,
  onChange,
}: SourceFilterProps) {
  const handleToggle = (source: string) => {
    if (selectedSources.includes(source)) {
      onChange(selectedSources.filter((s) => s !== source))
    } else {
      onChange([...selectedSources, source])
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-washi-green text-sm">情報源</h3>
      <div className="space-y-2">
        {HEARD_FROM_TYPES.map((source) => {
          const isSelected = selectedSources.includes(source.value)
          return (
            <button
              key={source.value}
              onClick={() => handleToggle(source.value)}
              className={`
                w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left
                ${
                  isSelected
                    ? 'bg-washi-green text-white'
                    : 'bg-washi-beige text-washi-green hover:bg-washi-beige-dark'
                }
              `}
            >
              <span className="mr-2">{source.emoji}</span>
              {source.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
