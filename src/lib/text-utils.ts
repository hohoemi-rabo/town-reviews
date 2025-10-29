/**
 * テキスト変換ユーティリティ
 */

/**
 * ひらがな → カタカナ
 */
export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60
    return String.fromCharCode(chr)
  })
}

/**
 * カタカナ → ひらがな
 */
export function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60
    return String.fromCharCode(chr)
  })
}

/**
 * 全角 → 半角
 */
export function fullWidthToHalfWidth(str: string): string {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  })
}

/**
 * 検索用に複数パターンの文字列を生成
 * 例: "みかわ" → ["みかわ", "ミカワ", "みかわ"]
 */
export function generateSearchVariants(query: string): string[] {
  const normalized = fullWidthToHalfWidth(query.trim())
  const variants = new Set<string>()

  // 元の文字列
  variants.add(normalized)

  // ひらがな版
  variants.add(katakanaToHiragana(normalized))

  // カタカナ版
  variants.add(hiraganaToKatakana(normalized))

  return Array.from(variants)
}
