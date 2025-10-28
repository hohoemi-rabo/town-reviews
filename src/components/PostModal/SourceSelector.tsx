import { getHeardFromIcon } from '@/lib/formatters'

interface SourceSelectorProps {
  heardFromType: string
  heardFrom: string
  onHeardFromTypeChange: (type: string) => void
  onHeardFromChange: (value: string) => void
}

const HEARD_FROM_TYPES = [
  '家族・親戚',
  '友人・知人',
  '近所の人',
  'お店の人',
  'SNS',
  'その他',
]

export default function SourceSelector({
  heardFromType,
  heardFrom,
  onHeardFromTypeChange,
  onHeardFromChange,
}: SourceSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        誰から聞きましたか？ <span className="text-red-500">*</span>
      </label>

      <div className="grid grid-cols-2 gap-2">
        {HEARD_FROM_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              onHeardFromTypeChange(type)
              if (type !== 'その他') {
                onHeardFromChange('')
              }
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
              heardFromType === type
                ? 'border-washi-green bg-washi-beige'
                : 'border-gray-200 hover:border-washi-green-light bg-white'
            }`}
          >
            <span className="text-xl">{getHeardFromIcon(type)}</span>
            <span className="text-sm font-medium">{type}</span>
          </button>
        ))}
      </div>

      {heardFromType === 'その他' && (
        <input
          type="text"
          value={heardFrom}
          onChange={(e) => onHeardFromChange(e.target.value)}
          placeholder="例: 職場の同僚、インターネット記事"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
          maxLength={50}
        />
      )}

      {heardFromType !== 'その他' && heardFromType && (
        <input
          type="text"
          value={heardFrom}
          onChange={(e) => onHeardFromChange(e.target.value)}
          placeholder={`例: 母、田中さん`}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-washi-green"
          maxLength={50}
        />
      )}
    </div>
  )
}
