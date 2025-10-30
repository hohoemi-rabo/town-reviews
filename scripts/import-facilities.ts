/**
 * CSVファイルから施設データをインポートするスクリプト
 * 既存のplace_idと重複しないデータのみを挿入
 * 使用方法: npx tsx scripts/import-facilities.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// .env.localファイルから環境変数を読み込む
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')

envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim()
    process.env[key] = value
  }
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

type FacilityRow = {
  place_id: string
  name: string
  address: string
  area: string
  category: string
  lat: number
  lng: number
  phone: string
  google_maps_url: string
  is_verified: boolean
  created_by: string
}

// CSV解析関数
function parseCSV(csvContent: string): FacilityRow[] {
  const lines = csvContent.split('\n').filter((line) => line.trim())
  const facilities: FacilityRow[] = []

  // ヘッダー行をスキップ
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    // CSV行をパース（ダブルクォート対応）
    const values: string[] = []
    let currentValue = ''
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]

      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          // エスケープされたダブルクォート
          currentValue += '"'
          j++
        } else {
          // クォートの開始/終了
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // フィールド区切り
        values.push(currentValue.trim())
        currentValue = ''
      } else {
        currentValue += char
      }
    }
    values.push(currentValue.trim()) // 最後のフィールド

    if (values.length >= 11) {
      facilities.push({
        place_id: values[0],
        name: values[1],
        address: values[2],
        area: values[3],
        category: values[4],
        lat: parseFloat(values[5]),
        lng: parseFloat(values[6]),
        phone: values[7] || '',
        google_maps_url: values[8] || '',
        is_verified: values[9] === 'true',
        created_by: values[10] || 'api',
      })
    }
  }

  return facilities
}

async function importFacilities() {
  console.log('🚀 施設データをインポート中...\n')

  // CSVファイルを読み込む
  const csvPath = resolve(process.cwd(), 'scripts/output/facilities.csv')
  console.log(`📄 CSVファイル読み込み: ${csvPath}`)

  let csvContent: string
  try {
    csvContent = readFileSync(csvPath, 'utf-8')
  } catch (error) {
    console.error('❌ CSVファイルが見つかりません:', csvPath)
    process.exit(1)
  }

  const csvFacilities = parseCSV(csvContent)
  console.log(`   CSVデータ: ${csvFacilities.length}件\n`)

  // 既存のplace_idを取得
  console.log('🔍 既存データをチェック中...')
  const { data: existingPlaces, error: fetchError } = await supabase
    .from('places')
    .select('place_id')

  if (fetchError) {
    console.error('❌ 既存データの取得に失敗しました:', fetchError)
    process.exit(1)
  }

  const existingPlaceIds = new Set(existingPlaces?.map((p) => p.place_id) || [])
  console.log(`   既存データ: ${existingPlaceIds.size}件\n`)

  // 重複を排除
  const newFacilities = csvFacilities.filter(
    (facility) => !existingPlaceIds.has(facility.place_id)
  )

  console.log(`📊 インポート対象: ${newFacilities.length}件（重複除外: ${csvFacilities.length - newFacilities.length}件）\n`)

  if (newFacilities.length === 0) {
    console.log('✅ インポートする新規データはありません。')
    return
  }

  // バッチサイズ（Supabaseの制限を考慮）
  const BATCH_SIZE = 100

  let insertedCount = 0
  let errorCount = 0

  for (let i = 0; i < newFacilities.length; i += BATCH_SIZE) {
    const batch = newFacilities.slice(i, i + BATCH_SIZE)
    console.log(
      `⏳ インポート中... (${i + 1}-${Math.min(i + BATCH_SIZE, newFacilities.length)}/${newFacilities.length})`
    )

    const { error: insertError } = await supabase.from('places').insert(batch)

    if (insertError) {
      console.error(`   ❌ バッチ ${i / BATCH_SIZE + 1} のインポートに失敗:`, insertError.message)
      errorCount += batch.length
    } else {
      insertedCount += batch.length
      console.log(`   ✅ ${batch.length}件 挿入完了`)
    }
  }

  // 最終結果の確認
  const { count: finalCount } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })

  console.log('\n' + '='.repeat(50))
  console.log('📊 インポート結果')
  console.log('='.repeat(50))
  console.log(`インポート成功: ${insertedCount}件`)
  console.log(`インポート失敗: ${errorCount}件`)
  console.log(`最終施設数: ${finalCount}件`)
  console.log('='.repeat(50))
  console.log('\n✨ インポート完了！')
}

importFacilities().catch(console.error)
