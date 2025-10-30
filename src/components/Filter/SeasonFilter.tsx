'use client'

interface SeasonFilterProps {
  selectedSeason?: string
  onChange: (season?: string) => void
}

const SEASONS = [
  { value: '春', label: '春', emoji: '🌸' },
  { value: '夏', label: '夏', emoji: '☀️' },
  { value: '秋', label: '秋', emoji: '🍁' },
  { value: '冬', label: '冬', emoji: '⛄' },
]

/**
 * 季節フィルタコンポーネント
 * 単一選択で季節を絞り込み
 */
export default function SeasonFilter({
  selectedSeason,
  onChange,
}: SeasonFilterProps) {
  const handleSelect = (season: string) => {
    if (selectedSeason === season) {
      // 同じ季節を再度クリックしたら解除
      onChange(undefined)
    } else {
      onChange(season)
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-washi-green text-sm">季節</h3>
      <div className="grid grid-cols-2 gap-2">
        {SEASONS.map((season) => {
          const isSelected = selectedSeason === season.value
          return (
            <button
              key={season.value}
              onClick={() => handleSelect(season.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  isSelected
                    ? 'bg-washi-green text-white'
                    : 'bg-washi-beige text-washi-green hover:bg-washi-beige-dark'
                }
              `}
            >
              <span className="mr-1">{season.emoji}</span>
              {season.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
