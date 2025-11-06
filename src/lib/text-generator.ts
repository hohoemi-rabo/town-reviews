/**
 * タグから文章を自動生成するユーティリティ
 * テンプレートベースで自然な日本語文章を生成
 */

// タグカテゴリーの定義
const TAG_CATEGORIES = {
  // 🔴 料理ジャンル (6種類)
  cuisine: ['和食', '洋食・イタリアン', '中華', 'カフェ・スイーツ', 'ラーメン・麺類', '焼肉・居酒屋'],

  // 🔵 雰囲気・特徴 (7種類)
  atmosphere: ['絶景', '穴場', '人気', '静か', '賑やか', 'レトロ', 'SNS映え'],

  // 🟣 誰と行く (6種類)
  companion: ['家族向け', '子連れOK', 'デート向き', '一人でも楽しめる', '友人と', '団体OK'],

  // 🟢 アクセス・設備 (2種類)
  facility: ['駐車場あり', 'バリアフリー'],

  // 🟠 時間帯 (3種類)
  timeOfDay: ['朝がおすすめ', '昼がおすすめ', '夜がおすすめ'],
} as const

type TagCategory = keyof typeof TAG_CATEGORIES

/**
 * タグがどのカテゴリーに属するか判定
 */
function getCategoryOfTag(tag: string): TagCategory | null {
  for (const [category, tags] of Object.entries(TAG_CATEGORIES)) {
    if (tags.includes(tag as never)) {
      return category as TagCategory
    }
  }
  return null
}

/**
 * カテゴリー別にタグを分類
 */
function categorizeTag(tags: string[]): Record<TagCategory, string[]> {
  const categorized: Record<TagCategory, string[]> = {
    cuisine: [],
    atmosphere: [],
    companion: [],
    facility: [],
    timeOfDay: [],
  }

  for (const tag of tags) {
    const category = getCategoryOfTag(tag)
    if (category) {
      categorized[category].push(tag)
    }
  }

  return categorized
}

/**
 * 料理ジャンルカテゴリーの文章生成
 * 例: "和食" → "和食のお店です"
 */
function generateCuisineText(tags: string[]): string {
  if (tags.length === 0) return ''
  if (tags.length === 1) return `${tags[0]}のお店です`
  // 複数の場合は最初のタグのみ使用（通常は1つのみ選択される想定）
  return `${tags[0]}のお店です`
}

/**
 * 雰囲気・特徴カテゴリーの文章生成
 * 例: "絶景" → "絶景スポットです"
 * 例: "静か" → "静かな雰囲気です"
 */
function generateAtmosphereText(tags: string[]): string {
  if (tags.length === 0) return ''

  const parts: string[] = []

  for (const tag of tags) {
    // 「絶景」「穴場」「人気」は「○○スポット」
    if (['絶景', '穴場', '人気'].includes(tag)) {
      parts.push(`${tag}スポット`)
    }
    // 「静か」「賑やか」「レトロ」「SNS映え」は「○○な雰囲気」
    else if (['静か', '賑やか', 'レトロ'].includes(tag)) {
      parts.push(`${tag}な雰囲気`)
    } else if (tag === 'SNS映え') {
      parts.push('SNS映えする雰囲気')
    }
  }

  if (parts.length === 0) return ''
  if (parts.length === 1) return `${parts[0]}です`
  // 複数の場合は「、」で繋ぐ
  return `${parts.join('、')}です`
}

/**
 * 誰と行くカテゴリーの文章生成
 * 例: "家族向け" → "家族向け"
 * 例: "一人でも楽しめる" → "一人でも楽しめ"（語幹形）
 */
function generateCompanionText(tags: string[]): string {
  if (tags.length === 0) return ''

  // 「一人でも楽しめる」は語幹形に変換（後で「ます」を付けるため）
  const processedTags = tags.map((tag) => {
    if (tag === '一人でも楽しめる') return '一人でも楽しめ'
    return tag
  })

  return processedTags.join('、')
}

/**
 * アクセス・設備カテゴリーの文章生成
 * 例: "駐車場あり" → "駐車場があります"
 * 例: "駐車場あり、バリアフリー" → "駐車場があり、バリアフリー対応です"
 */
function generateFacilityText(tags: string[]): string {
  if (tags.length === 0) return ''

  const parts: string[] = []

  for (const tag of tags) {
    if (tag === '駐車場あり') {
      parts.push('駐車場')
    } else if (tag === 'バリアフリー') {
      parts.push('バリアフリー対応')
    }
  }

  if (parts.length === 0) return ''
  if (parts.length === 1) {
    return tags[0] === '駐車場あり' ? '駐車場があります' : 'バリアフリー対応です'
  }
  // 複数の場合: "駐車場があり、バリアフリー対応です"
  return `${parts[0]}があり、${parts.slice(1).join('、')}です`
}

/**
 * 時間帯カテゴリーの文章生成
 * 例: "夜がおすすめ" → "夜がおすすめです"
 */
function generateTimeOfDayText(tags: string[]): string {
  if (tags.length === 0) return ''

  // 複数選択された場合は「、」で繋ぐ
  if (tags.length === 1) return `${tags[0]}です`
  return `${tags.join('、')}です`
}

/**
 * 選択されたタグから自然な文章を生成
 * @param tags - 選択されたタグの配列
 * @returns 生成された文章（タグが空の場合は空文字列）
 */
export function generateTextFromTags(tags: string[]): string {
  // タグが空の場合は空文字列を返す
  if (tags.length === 0) return ''

  // タグをカテゴリー別に分類
  const categorized = categorizeTag(tags)

  // 各カテゴリーの基本形を生成（接続詞なし）
  const cuisine = categorized.cuisine.length > 0 ? generateCuisineText(categorized.cuisine) : null
  const atmosphere = categorized.atmosphere.length > 0 ? generateAtmosphereText(categorized.atmosphere) : null
  const companion = categorized.companion.length > 0 ? generateCompanionText(categorized.companion) : null
  const timeOfDay = categorized.timeOfDay.length > 0 ? generateTimeOfDayText(categorized.timeOfDay) : null
  const facility = categorized.facility.length > 0 ? generateFacilityText(categorized.facility) : null

  // 全て null の場合は空文字列
  if (!cuisine && !atmosphere && !companion && !timeOfDay && !facility) return ''

  // 文章を組み立て
  const sentences: string[] = []

  // パターン1: 料理ジャンルがある場合（最優先）
  if (cuisine) {
    sentences.push(cuisine)
  }

  // パターン2: 雰囲気・特徴がある場合
  if (atmosphere) {
    sentences.push(atmosphere)
  }

  // パターン3: 残りの要素を繋げる
  const remainingParts: string[] = []
  if (companion) remainingParts.push(companion)
  if (timeOfDay) remainingParts.push(timeOfDay.replace(/です$/, ''))
  if (facility) remainingParts.push(facility.replace(/です$/, '').replace(/があります$/, ''))

  // 残りの要素を「で、」「も」で自然に繋げる
  if (remainingParts.length > 0) {
    if (remainingParts.length === 1) {
      // 1つだけの場合
      const part = remainingParts[0]
      if (facility && !companion && !timeOfDay) {
        // 設備のみの場合: "駐車場もあります"
        sentences.push(`${part}もあります`)
      } else if (part.endsWith('一人でも楽しめ')) {
        // 動詞の場合: "一人でも楽しめます"
        sentences.push(`${part}ます`)
      } else {
        // その他: "家族向けです"
        sentences.push(`${part}です`)
      }
    } else if (remainingParts.length === 2) {
      // 2つの場合: "家族向けで、駐車場もあります"
      const [first, second] = remainingParts
      if (facility) {
        sentences.push(`${first}で、${second}もあります`)
      } else if (second.endsWith('一人でも楽しめ')) {
        // 最後が動詞の場合: "家族向けで、一人でも楽しめます"
        sentences.push(`${first}で、${second}ます`)
      } else {
        sentences.push(`${first}で、${second}です`)
      }
    } else {
      // 3つの場合: "家族向けで、昼がおすすめ、駐車場もあります"
      const last = remainingParts[remainingParts.length - 1]
      const others = remainingParts.slice(0, -1)
      if (facility) {
        sentences.push(`${others.join('で、')}で、${last}もあります`)
      } else if (last.endsWith('一人でも楽しめ')) {
        // 最後が動詞の場合
        sentences.push(`${others.join('で、')}で、${last}ます`)
      } else {
        sentences.push(`${others.join('で、')}で、${last}です`)
      }
    }
  }

  // 文章を「。」で繋げて返す
  return sentences.join('。')
}
