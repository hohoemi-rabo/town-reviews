/**
 * 大規模施設データ投入スクリプト
 *
 * 機能:
 * - 段階的実行（Phase 1→2→3）
 * - 重複排除（place_id ベース）
 * - フェイルセーフ（進捗保存 + レジューム）
 * - エラーログ
 *
 * 使い方:
 * npx tsx scripts/fetch-facilities-bulk.ts --phase=1
 * npx tsx scripts/fetch-facilities-bulk.ts --phase=2
 * npx tsx scripts/fetch-facilities-bulk.ts --phase=3
 * npx tsx scripts/fetch-facilities-bulk.ts --resume  # 途中から再開
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_SERVER_API_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GOOGLE_MAPS_API_KEY) {
  console.error('❌ 環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// 進捗ファイルのパス
const PROGRESS_FILE = path.join(__dirname, 'bulk-import-progress.json')
const ERROR_LOG_FILE = path.join(__dirname, 'bulk-import-errors.json')

// 除外する施設タイプ（ATM、ガソリンスタンド）
const EXCLUDED_TYPES = ['atm', 'gas_station']

// 対象施設タイプ
const FACILITY_TYPES = [
  // 飲食系
  'restaurant', 'cafe', 'bar', 'bakery', 'meal_takeaway', 'meal_delivery',
  // 観光系
  'tourist_attraction', 'park', 'museum', 'art_gallery', 'aquarium', 'zoo',
  'amusement_park', 'campground', 'rv_park', 'natural_feature',
  // 宿泊系
  'lodging', 'hotel',
  // 商業系
  'store', 'supermarket', 'convenience_store', 'shopping_mall',
  'department_store', 'book_store', 'clothing_store', 'electronics_store',
  'furniture_store', 'hardware_store', 'jewelry_store', 'shoe_store',
  // サービス系
  'beauty_salon', 'hair_care', 'spa', 'gym', 'laundry',
  // 公共施設
  'library', 'post_office', 'city_hall', 'hospital', 'doctor',
  'dentist', 'pharmacy', 'veterinary_care', 'school', 'university',
  // その他
  'parking', 'car_repair', 'bank'
]

// エリア定義
interface AreaConfig {
  name: string
  center: { lat: number; lng: number }
  radius: number // メートル
}

// Phase 1: 飯田市（目標1000件）
const PHASE1_AREAS: AreaConfig[] = [
  { name: '飯田市中心部', center: { lat: 35.5147, lng: 137.8216 }, radius: 5000 },
  { name: '飯田市北部', center: { lat: 35.5400, lng: 137.8200 }, radius: 5000 },
  { name: '飯田市南部', center: { lat: 35.4900, lng: 137.8200 }, radius: 5000 },
  { name: '飯田市東部', center: { lat: 35.5147, lng: 137.8600 }, radius: 5000 },
  { name: '飯田市西部', center: { lat: 35.5147, lng: 137.7800 }, radius: 5000 },
]

// Phase 2: 下伊那郡主要エリア（目標2000件）
const PHASE2_AREAS: AreaConfig[] = [
  { name: '阿智村', center: { lat: 35.4500, lng: 137.6833 }, radius: 8000 },
  { name: '松川町', center: { lat: 35.6000, lng: 137.9167 }, radius: 5000 },
  { name: '高森町', center: { lat: 35.5667, lng: 137.8833 }, radius: 5000 },
  { name: '豊丘村', center: { lat: 35.5500, lng: 137.8667 }, radius: 5000 },
  { name: '喬木村', center: { lat: 35.4833, lng: 137.8833 }, radius: 5000 },
  { name: '下條村', center: { lat: 35.4333, lng: 137.8667 }, radius: 5000 },
]

// Phase 3: 下伊那郡その他（目標2000件）
const PHASE3_AREAS: AreaConfig[] = [
  { name: '根羽村', center: { lat: 35.2167, lng: 137.5833 }, radius: 8000 },
  { name: '売木村', center: { lat: 35.3000, lng: 137.6167 }, radius: 8000 },
  { name: '天龍村', center: { lat: 35.2833, lng: 137.8167 }, radius: 10000 },
  { name: '泰阜村', center: { lat: 35.3833, lng: 137.8833 }, radius: 8000 },
  { name: '大鹿村', center: { lat: 35.5167, lng: 138.0333 }, radius: 10000 },
  { name: '平谷村', center: { lat: 35.2833, lng: 137.6500 }, radius: 8000 },
  { name: '阿南町', center: { lat: 35.3333, lng: 137.8000 }, radius: 8000 },
]

// 進捗管理の型定義
interface Progress {
  phase: number
  currentAreaIndex: number
  currentTypeIndex: number
  totalProcessed: number
  totalInserted: number
  totalDuplicates: number
  totalErrors: number
  startedAt: string
  lastUpdatedAt: string
  completed: boolean
}

// エラーログの型定義
interface ErrorLog {
  timestamp: string
  area: string
  type: string
  error: string
}

class BulkFacilityImporter {
  private progress: Progress
  private errors: ErrorLog[] = []
  private existingPlaceIds: Set<string> = new Set()

  constructor() {
    this.progress = this.loadProgress()
  }

  // 進捗ロード
  private loadProgress(): Progress {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf-8')
      console.log('📂 進捗ファイルを読み込みました')
      return JSON.parse(data)
    }

    return {
      phase: 1,
      currentAreaIndex: 0,
      currentTypeIndex: 0,
      totalProcessed: 0,
      totalInserted: 0,
      totalDuplicates: 0,
      totalErrors: 0,
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      completed: false
    }
  }

  // 進捗保存
  private saveProgress() {
    this.progress.lastUpdatedAt = new Date().toISOString()
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(this.progress, null, 2))
  }

  // エラーログ保存
  private saveError(area: string, type: string, error: string) {
    this.errors.push({
      timestamp: new Date().toISOString(),
      area,
      type,
      error
    })
    fs.writeFileSync(ERROR_LOG_FILE, JSON.stringify(this.errors, null, 2))
  }

  // 既存のplace_idを取得
  private async loadExistingPlaceIds() {
    console.log('🔍 既存施設のplace_idを取得中...')

    let allPlaceIds: string[] = []
    let from = 0
    const batchSize = 1000

    while (true) {
      const { data, error } = await supabase
        .from('places')
        .select('place_id')
        .not('place_id', 'is', null)
        .range(from, from + batchSize - 1)

      if (error) {
        console.error('❌ place_id取得エラー:', error)
        break
      }

      if (!data || data.length === 0) break

      allPlaceIds = allPlaceIds.concat(data.map(p => p.place_id).filter(Boolean) as string[])
      from += batchSize
    }

    this.existingPlaceIds = new Set(allPlaceIds)
    console.log(`✅ 既存施設: ${this.existingPlaceIds.size}件`)
  }

  // Google Places API: Nearby Search
  private async nearbySearch(
    location: { lat: number; lng: number },
    radius: number,
    type: string
  ): Promise<any[]> {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.searchParams.set('location', `${location.lat},${location.lng}`)
    url.searchParams.set('radius', radius.toString())
    url.searchParams.set('type', type)
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY)
    url.searchParams.set('language', 'ja')

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`API Error: ${data.status} - ${data.error_message || ''}`)
    }

    return data.results || []
  }

  // Google Places API: Place Details
  private async getPlaceDetails(placeId: string): Promise<any> {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('fields', 'name,formatted_address,geometry,formatted_phone_number,types,url')
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY)
    url.searchParams.set('language', 'ja')

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`API Error: ${data.status}`)
    }

    return data.result
  }

  // カテゴリーマッピング
  private mapCategory(types: string[]): string {
    const categoryMap: { [key: string]: string } = {
      restaurant: '飲食',
      cafe: '飲食',
      bar: '飲食',
      bakery: '飲食',
      meal_takeaway: '飲食',
      tourist_attraction: '観光',
      park: '観光',
      museum: '観光',
      lodging: '宿泊',
      hotel: '宿泊',
      store: '商業',
      supermarket: '商業',
      shopping_mall: '商業',
    }

    for (const type of types) {
      if (categoryMap[type]) return categoryMap[type]
    }

    return 'その他'
  }

  // エリア名を抽出
  private extractArea(address: string): string {
    const areaPatterns = [
      '飯田市', '阿智村', '松川町', '高森町', '豊丘村', '喬木村',
      '下條村', '根羽村', '売木村', '天龍村', '泰阜村', '大鹿村',
      '平谷村', '阿南町'
    ]

    for (const pattern of areaPatterns) {
      if (address.includes(pattern)) return pattern
    }

    return '飯田市'
  }

  // 施設データをDBに挿入
  private async insertFacility(place: any) {
    const { data, error } = await supabase
      .from('places')
      .insert({
        name: place.name,
        address: place.formatted_address || null,
        area: this.extractArea(place.formatted_address || ''),
        category: this.mapCategory(place.types || []),
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        place_id: place.place_id || null,
        google_maps_url: place.url || null,
        phone: place.formatted_phone_number || null,
        is_verified: true,
        created_by: 'api'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  // メイン処理
  async run(phase: number, resume: boolean = false) {
    console.log('\n🚀 大規模施設データ投入を開始します\n')
    console.log(`Phase: ${phase}`)
    console.log(`Resume: ${resume}`)
    console.log('==========================================\n')

    // 既存データをロード
    await this.loadExistingPlaceIds()

    // エリア選択
    let areas: AreaConfig[] = []
    if (phase === 1) areas = PHASE1_AREAS
    else if (phase === 2) areas = PHASE2_AREAS
    else if (phase === 3) areas = PHASE3_AREAS
    else {
      console.error('❌ 無効なPhase番号です（1, 2, 3のいずれか）')
      process.exit(1)
    }

    // レジューム設定
    if (!resume) {
      this.progress.phase = phase
      this.progress.currentAreaIndex = 0
      this.progress.currentTypeIndex = 0
      this.progress.completed = false
      this.saveProgress()
    }

    // エリアとタイプのループ
    for (let areaIdx = this.progress.currentAreaIndex; areaIdx < areas.length; areaIdx++) {
      const area = areas[areaIdx]
      console.log(`\n📍 エリア: ${area.name} (${areaIdx + 1}/${areas.length})`)

      for (let typeIdx = this.progress.currentTypeIndex; typeIdx < FACILITY_TYPES.length; typeIdx++) {
        const facilityType = FACILITY_TYPES[typeIdx]

        try {
          console.log(`  🔎 検索中: ${facilityType}`)

          // Nearby Search
          const places = await this.nearbySearch(area.center, area.radius, facilityType)
          console.log(`    結果: ${places.length}件`)

          let inserted = 0
          let duplicates = 0

          // 各施設を処理
          for (const place of places) {
            this.progress.totalProcessed++

            // 重複チェック
            if (place.place_id && this.existingPlaceIds.has(place.place_id)) {
              duplicates++
              this.progress.totalDuplicates++
              continue
            }

            // 除外タイプチェック
            const hasExcludedType = place.types?.some((t: string) => EXCLUDED_TYPES.includes(t))
            if (hasExcludedType) {
              continue
            }

            try {
              // Place Details取得
              const details = await this.getPlaceDetails(place.place_id)

              // DB挿入
              await this.insertFacility(details)

              // 挿入成功
              this.existingPlaceIds.add(place.place_id)
              inserted++
              this.progress.totalInserted++

              // レート制限対策（0.5秒待機）
              await new Promise(resolve => setTimeout(resolve, 500))
            } catch (err: any) {
              this.progress.totalErrors++
              this.saveError(area.name, facilityType, err.message)
              console.error(`    ⚠️  エラー: ${err.message}`)
            }
          }

          console.log(`    ✅ 挿入: ${inserted}件 / 重複: ${duplicates}件`)

          // 進捗更新
          this.progress.currentTypeIndex = typeIdx + 1
          this.saveProgress()

        } catch (err: any) {
          this.progress.totalErrors++
          this.saveError(area.name, facilityType, err.message)
          console.error(`  ❌ エリア検索エラー: ${err.message}`)
        }
      }

      // 次のエリアへ
      this.progress.currentAreaIndex = areaIdx + 1
      this.progress.currentTypeIndex = 0
      this.saveProgress()

      console.log(`\n📊 現在の進捗:`)
      console.log(`   処理済み: ${this.progress.totalProcessed}件`)
      console.log(`   挿入成功: ${this.progress.totalInserted}件`)
      console.log(`   重複: ${this.progress.totalDuplicates}件`)
      console.log(`   エラー: ${this.progress.totalErrors}件`)
    }

    // 完了
    this.progress.completed = true
    this.saveProgress()

    console.log('\n==========================================')
    console.log('✅ Phase', phase, '完了！')
    console.log('==========================================\n')
    console.log('📊 最終結果:')
    console.log(`   処理済み: ${this.progress.totalProcessed}件`)
    console.log(`   挿入成功: ${this.progress.totalInserted}件`)
    console.log(`   重複: ${this.progress.totalDuplicates}件`)
    console.log(`   エラー: ${this.progress.totalErrors}件\n`)
  }
}

// コマンドライン引数パース
const args = process.argv.slice(2)
const phaseArg = args.find(arg => arg.startsWith('--phase='))
const resumeArg = args.includes('--resume')

if (!phaseArg && !resumeArg) {
  console.error('❌ 使い方:')
  console.error('  npx tsx scripts/fetch-facilities-bulk.ts --phase=1')
  console.error('  npx tsx scripts/fetch-facilities-bulk.ts --phase=2')
  console.error('  npx tsx scripts/fetch-facilities-bulk.ts --phase=3')
  console.error('  npx tsx scripts/fetch-facilities-bulk.ts --resume')
  process.exit(1)
}

let phase = 1
if (phaseArg) {
  phase = parseInt(phaseArg.split('=')[1])
}

// 実行
const importer = new BulkFacilityImporter()
importer.run(phase, resumeArg).catch(err => {
  console.error('❌ 予期しないエラー:', err)
  process.exit(1)
})
