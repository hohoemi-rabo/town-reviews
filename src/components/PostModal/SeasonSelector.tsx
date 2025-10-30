'use client'

interface SeasonSelectorProps {
  selectedSeason: string | null
  onChange: (season: string | null) => void
}

const SEASONS = [
  { value: '春', emoji: '🌸', color: 'bg-pink-100 border-pink-300 text-pink-700' },
  { value: '夏', emoji: '☀️', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { value: '秋', emoji: '🍁', color: 'bg-orange-100 border-orange-300 text-orange-700' },
  { value: '冬', emoji: '⛄', color: 'bg-blue-100 border-blue-300 text-blue-700' },
] as const

export default function SeasonSelector({
  selectedSeason,
  onChange,
}: SeasonSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-washi-green mb-2">
        おすすめの季節（任意）
      </label>
      <p className="text-xs text-gray-500 mb-3">
        このスポットが特におすすめの季節を選んでください
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SEASONS.map((season) => {
          const isSelected = selectedSeason === season.value

          return (
            <button
              key={season.value}
              type="button"
              onClick={() => onChange(season.value)}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                isSelected
                  ? 'bg-washi-green border-washi-green text-white scale-105'
                  : `${season.color} hover:scale-105`
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{season.emoji}</span>
                <span className="text-sm">{season.value}</span>
              </div>
            </button>
          )
        })}
      </div>

      {selectedSeason && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-sm text-gray-500 hover:text-gray-700 underline mt-2"
        >
          季節の選択を解除
        </button>
      )}
    </div>
  )
}
