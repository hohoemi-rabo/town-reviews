/**
 * Google Places API を使って南信州エリアの施設データを取得するスクリプト
 *
 * 使い方:
 * 1. .env.local に GOOGLE_MAPS_SERVER_API_KEY を設定
 * 2. npm install --save-dev tsx
 * 3. npx tsx scripts/fetch-facilities.ts
 *
 * 出力: scripts/output/facilities.csv
 */

import * as fs from 'fs'
import * as path from 'path'

// 環境変数の読み込み（.env.local から読み込む）
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=')
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim()
      }
    }
  })
}

const API_KEY = process.env.GOOGLE_MAPS_SERVER_API_KEY

if (!API_KEY) {
  console.error('Error: GOOGLE_MAPS_SERVER_API_KEY が設定されていません')
  process.exit(1)
}

// 南信州エリアの中心座標（飯田市）
const IIDA_CENTER = {
  lat: 35.5147,
  lng: 137.8219,
}

// 検索するカテゴリ（Google Places API types）
const PLACE_TYPES = [
  'restaurant', // 飲食店
  'cafe', // カフェ
  'tourist_attraction', // 観光地
  'park', // 公園
  'lodging', // 宿泊施設
  'spa', // 温泉・スパ
  'museum', // 美術館・博物館
  'shopping_mall', // ショッピングモール
  'store', // 店舗
  'point_of_interest', // その他の名所
  'bakery', // パン屋
  'convenience_store', // コンビニ
  'supermarket', // スーパー
  'clothing_store', // 衣料品店
  'book_store', // 書店
  'electronics_store', // 家電店
  'furniture_store', // 家具店
  'hardware_store', // ホームセンター
  'pharmacy', // 薬局
  'gas_station', // ガソリンスタンド
]

// 検索半径（メートル）
const SEARCH_RADIUS = 50000 // 50km（飯田市中心から南信州広域をカバー）

// レート制限対策（ミリ秒）
const DELAY_BETWEEN_REQUESTS = 100 // 100ms

// 取得する最大施設数
const MAX_FACILITIES = 1000

type PlaceResult = {
  place_id: string
  name: string
  address: string
  lat: number
  lng: number
  types: string[]
  rating?: number
  phone?: string
  google_maps_url?: string
}

// Sleep関数
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Nearby Search API でカテゴリごとに施設を取得
async function searchNearbyPlaces(
  location: { lat: number; lng: number },
  type: string,
  pageToken?: string
): Promise<{ results: any[]; next_page_token?: string }> {
  const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'

  const params = new URLSearchParams({
    location: `${location.lat},${location.lng}`,
    radius: SEARCH_RADIUS.toString(),
    type,
    language: 'ja',
    key: API_KEY!,
  })

  if (pageToken) {
    params.set('pagetoken', pageToken)
  }

  const url = `${baseUrl}?${params.toString()}`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error(`API Error (${type}):`, data.status, data.error_message)
    return { results: [] }
  }

  console.log(`  Found ${data.results?.length || 0} places for type: ${type}`)

  return {
    results: data.results || [],
    next_page_token: data.next_page_token,
  }
}

// Place Details API で詳細情報を取得
async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json'

  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'name,formatted_address,geometry,types,rating,formatted_phone_number,url',
    language: 'ja',
    key: API_KEY!,
  })

  const url = `${baseUrl}?${params.toString()}`

  await sleep(DELAY_BETWEEN_REQUESTS)

  const response = await fetch(url)
  const data = await response.json()

  if (data.status !== 'OK') {
    console.error(`Place Details Error (${placeId}):`, data.status)
    return null
  }

  const place = data.result

  return {
    place_id: placeId,
    name: place.name || '',
    address: place.formatted_address || '',
    lat: place.geometry?.location?.lat || 0,
    lng: place.geometry?.location?.lng || 0,
    types: place.types || [],
    rating: place.rating,
    phone: place.formatted_phone_number,
    google_maps_url: place.url,
  }
}

// カテゴリ判定（Google types → アプリのカテゴリ）
function categorizePlace(types: string[]): string {
  if (
    types.some((t) =>
      ['restaurant', 'cafe', 'food', 'meal_takeaway', 'bakery'].includes(t)
    )
  ) {
    return '飲食'
  }
  if (
    types.some((t) =>
      ['tourist_attraction', 'museum', 'art_gallery', 'aquarium'].includes(t)
    )
  ) {
    return '体験'
  }
  if (types.some((t) => ['park', 'natural_feature', 'campground'].includes(t))) {
    return '自然'
  }
  if (types.some((t) => ['spa', 'lodging'].includes(t))) {
    return '温泉'
  }
  if (
    types.some((t) =>
      [
        'store',
        'shopping_mall',
        'convenience_store',
        'supermarket',
        'clothing_store',
        'book_store',
        'electronics_store',
        'furniture_store',
        'hardware_store',
        'pharmacy',
        'gas_station',
      ].includes(t)
    )
  ) {
    return '買い物'
  }
  return 'その他'
}

// エリア判定（住所から推測）
function detectArea(address: string): string | null {
  const areaPatterns = [
    '飯田市',
    '下條村',
    '売木村',
    '天龍村',
    '泰阜村',
    '喬木村',
    '豊丘村',
    '大鹿村',
    '上松町',
    '南木曽町',
    '木祖村',
    '王滝村',
    '大桑村',
    '木曽町',
    '阿南町',
    '阿智村',
    '平谷村',
    '根羽村',
    '下伊那郡',
    '木曽郡',
    // 追加エリア（50km圏内）
    '駒ヶ根市',
    '伊那市',
    '辰野町',
    '箕輪町',
    '飯島町',
    '南箕輪村',
    '中川村',
    '宮田村',
    '松川町',
    '高森町',
    '上伊那郡',
  ]

  for (const area of areaPatterns) {
    if (address.includes(area)) {
      return area
    }
  }

  // 長野県南部であれば受け入れる（エリア不明として）
  if (address.includes('長野県')) {
    return 'その他'
  }

  return null
}

// CSVエクスポート
function exportToCSV(facilities: PlaceResult[], outputPath: string) {
  const header =
    'place_id,name,address,area,category,lat,lng,phone,google_maps_url,is_verified,created_by\n'

  const rows = facilities.map((f) => {
    const area = detectArea(f.address) || ''
    const category = categorizePlace(f.types)

    return [
      f.place_id,
      `"${f.name.replace(/"/g, '""')}"`, // CSV escape
      `"${f.address.replace(/"/g, '""')}"`,
      area,
      category,
      f.lat,
      f.lng,
      f.phone || '',
      f.google_maps_url || '',
      'true', // is_verified
      'api', // created_by
    ].join(',')
  })

  const csv = header + rows.join('\n')

  fs.writeFileSync(outputPath, csv, 'utf-8')
  console.log(`\n✅ CSV exported: ${outputPath}`)
  console.log(`   Total facilities: ${facilities.length}`)
}

// メイン処理
async function main() {
  console.log('🚀 Starting facility data collection from Google Places API...\n')
  console.log(`Search center: 飯田市 (${IIDA_CENTER.lat}, ${IIDA_CENTER.lng})`)
  console.log(`Search radius: ${SEARCH_RADIUS / 1000}km`)
  console.log(`Max facilities: ${MAX_FACILITIES}\n`)

  const allPlaces = new Map<string, PlaceResult>() // place_id をキーに重複排除

  // 各カテゴリで検索
  for (const type of PLACE_TYPES) {
    console.log(`\n📍 Searching for: ${type}`)

    try {
      let pageToken: string | undefined = undefined
      let pageCount = 0
      const MAX_PAGES = 3 // Google Places APIは最大3ページまで

      // ページネーション対応（最大60件/カテゴリ）
      do {
        const searchResult = await searchNearbyPlaces(IIDA_CENTER, type, pageToken)

        for (const place of searchResult.results) {
          if (allPlaces.size >= MAX_FACILITIES) {
            console.log(`\n⚠️  Reached max limit (${MAX_FACILITIES}). Stopping.`)
            break
          }

          if (allPlaces.has(place.place_id)) {
            continue // 重複スキップ
          }

          console.log(`  Fetching details: ${place.name}`)

          const details = await getPlaceDetails(place.place_id)

          if (details) {
            // 南信州エリア外の施設は除外
            const area = detectArea(details.address)
            if (area) {
              allPlaces.set(place.place_id, details)
              console.log(`    ✅ Added (${allPlaces.size}/${MAX_FACILITIES})`)
            } else {
              console.log(`    ⏭️  Skipped (outside target area)`)
            }
          }
        }

        pageToken = searchResult.next_page_token
        pageCount++

        // next_page_tokenがある場合は少し待機（APIの仕様）
        if (pageToken && pageCount < MAX_PAGES && allPlaces.size < MAX_FACILITIES) {
          console.log(`  📄 Loading next page (${pageCount + 1}/${MAX_PAGES})...`)
          await sleep(2000) // 2秒待機（Google推奨）
        }

        await sleep(DELAY_BETWEEN_REQUESTS)
      } while (pageToken && pageCount < MAX_PAGES && allPlaces.size < MAX_FACILITIES)
    } catch (error) {
      console.error(`Error searching ${type}:`, error)
    }

    if (allPlaces.size >= MAX_FACILITIES) {
      break
    }
  }

  // CSV出力
  const outputDir = path.join(__dirname, 'output')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = path.join(outputDir, 'facilities.csv')
  exportToCSV(Array.from(allPlaces.values()), outputPath)

  console.log('\n✨ Done!')
}

main().catch(console.error)
