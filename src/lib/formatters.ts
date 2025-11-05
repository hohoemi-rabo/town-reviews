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

// Get tag color class based on category
export function getTagColor(tag: string): string {
  // 料理ジャンル (6タグ) - 赤系
  const cuisineTags = ['和食', '洋食・イタリアン', '中華', 'カフェ・スイーツ', 'ラーメン・麺類', '焼肉・居酒屋']
  if (cuisineTags.includes(tag)) {
    return 'bg-red-100 text-red-700'
  }

  // 雰囲気・特徴 (7タグ) - 青系
  const atmosphereTags = ['絶景', '穴場', '人気', '静か', '賑やか', 'レトロ', 'SNS映え']
  if (atmosphereTags.includes(tag)) {
    return 'bg-blue-100 text-blue-700'
  }

  // 誰と行く (6タグ) - 紫系
  const companionTags = ['家族向け', '子連れOK', 'デート向き', '一人でも楽しめる', '友人と', '団体OK']
  if (companionTags.includes(tag)) {
    return 'bg-purple-100 text-purple-700'
  }

  // アクセス・設備 (2タグ) - 緑系
  const accessTags = ['駐車場あり', 'バリアフリー']
  if (accessTags.includes(tag)) {
    return 'bg-green-100 text-green-700'
  }

  // 時間帯 (3タグ) - オレンジ系
  const timeTags = ['朝がおすすめ', '昼がおすすめ', '夜がおすすめ']
  if (timeTags.includes(tag)) {
    return 'bg-orange-100 text-orange-700'
  }

  // デフォルト（該当なし）- グレー系
  return 'bg-gray-100 text-gray-700'
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

// Get review category emoji
export function getReviewCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'グルメ': '🍴',
    '景色': '🏞️',
    '体験': '🎯',
    '癒し': '♨️',
    'その他': '📝',
  }

  return emojiMap[category] || '📝'
}

// Get review category color (for badges)
export function getReviewCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'グルメ': 'bg-orange-100 text-orange-700 border-orange-200',
    '景色': 'bg-green-100 text-green-700 border-green-200',
    '体験': 'bg-blue-100 text-blue-700 border-blue-200',
    '癒し': 'bg-purple-100 text-purple-700 border-purple-200',
    'その他': 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return colorMap[category] || 'bg-gray-100 text-gray-700 border-gray-200'
}

// Get review category background color (for cards)
export function getReviewCategoryBgColor(category: string): string {
  const bgColorMap: Record<string, string> = {
    'グルメ': 'bg-orange-50',
    '景色': 'bg-green-50',
    '体験': 'bg-blue-50',
    '癒し': 'bg-purple-50',
    'その他': 'bg-gray-50',
  }

  return bgColorMap[category] || 'bg-gray-50'
}
