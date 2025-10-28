// Format relative time in Japanese
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'たった今'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}時間前`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}日前`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}週間前`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}ヶ月前`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears}年前`
}

// Get icon for heard-from type
export function getHeardFromIcon(heardFromType: string): string {
  const iconMap: Record<string, string> = {
    '家族・親戚': '👨‍👩‍👧',
    '友人・知人': '👥',
    '近所の人': '🏘️',
    'お店の人': '🏪',
    'SNS': '📱',
    'その他': '💬',
  }

  return iconMap[heardFromType] || '💬'
}

// Get tag color class
export function getTagColor(tag: string): string {
  // Hash the tag string to get a consistent color
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-pink-100 text-pink-700',
    'bg-purple-100 text-purple-700',
    'bg-indigo-100 text-indigo-700',
    'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700',
  ]

  return colors[Math.abs(hash) % colors.length]
}

// Get season emoji
export function getSeasonEmoji(season: string | null): string {
  if (!season) return ''

  const seasonMap: Record<string, string> = {
    '春': '🌸',
    '夏': '☀️',
    '秋': '🍂',
    '冬': '⛄',
  }

  return seasonMap[season] || ''
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
