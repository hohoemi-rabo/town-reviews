/**
 * Google Maps URL自動取得スクリプト
 *
 * google_maps_urlがnullの施設に対して、Google Places APIを使用して自動取得します。
 *
 * 処理フロー:
 * 1. places テーブルから google_maps_url が null のレコードを取得
 * 2. 各レコードについて name + address で Find Place from Text API を実行
 * 3. Place Details API で google_maps_url を取得
 * 4. データベースを更新
 * 5. プログレス保存（途中中断時の再開可能）
 *
 * 使い方:
 * npm run update-google-urls
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_SERVER_API_KEY!

const PROGRESS_FILE = path.join(__dirname, 'update-google-urls-progress.json')

type Facility = {
  id: string
  name: string
  address: string
  area: string
  category: string
}

type Progress = {
  totalCount: number
  processedCount: number
  successCount: number
  failedCount: number
  lastProcessedId: string | null
  failedFacilities: Array<{
    id: string
    name: string
    error: string
  }>
  startedAt: string
  lastUpdatedAt: string
}

// プログレスの初期化
let progress: Progress = {
  totalCount: 0,
  processedCount: 0,
  successCount: 0,
  failedCount: 0,
  lastProcessedId: null,
  failedFacilities: [],
  startedAt: new Date().toISOString(),
  lastUpdatedAt: new Date().toISOString(),
}

// プログレスの読み込み
function loadProgress(): Progress | null {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('⚠️ プログレスファイルの読み込みに失敗:', error)
  }
  return null
}

// プログレスの保存
function saveProgress() {
  try {
    progress.lastUpdatedAt = new Date().toISOString()
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8')
  } catch (error) {
    console.error('⚠️ プログレスファイルの保存に失敗:', error)
  }
}

// Find Place from Text API でPlace IDを取得
async function findPlaceId(name: string, address: string): Promise<string | null> {
  const query = `${name} ${address}`
  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json')
  url.searchParams.append('input', query)
  url.searchParams.append('inputtype', 'textquery')
  url.searchParams.append('fields', 'place_id')
  url.searchParams.append('key', GOOGLE_MAPS_API_KEY)

  try {
    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === 'OK' && data.candidates?.[0]?.place_id) {
      return data.candidates[0].place_id
    }

    return null
  } catch (error) {
    console.error(`❌ Find Place API エラー: ${error}`)
    return null
  }
}

// Place Details API で google_maps_url を取得
async function getGoogleMapsUrl(placeId: string): Promise<string | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.append('place_id', placeId)
  url.searchParams.append('fields', 'url')
  url.searchParams.append('key', GOOGLE_MAPS_API_KEY)

  try {
    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === 'OK' && data.result?.url) {
      return data.result.url
    }

    return null
  } catch (error) {
    console.error(`❌ Place Details API エラー: ${error}`)
    return null
  }
}

// メイン処理
async function main() {
  console.log('🚀 Google Maps URL 自動取得スクリプト開始\n')

  // 環境変数チェック
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase環境変数が設定されていません')
    process.exit(1)
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ GOOGLE_MAPS_SERVER_API_KEY が設定されていません')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // 既存のプログレスをチェック
  const existingProgress = loadProgress()
  if (existingProgress) {
    console.log('📂 既存のプログレスが見つかりました')
    console.log(`   処理済み: ${existingProgress.processedCount}/${existingProgress.totalCount}`)
    console.log(`   成功: ${existingProgress.successCount} | 失敗: ${existingProgress.failedCount}`)

    const answer = await new Promise<string>((resolve) => {
      process.stdout.write('\n続きから再開しますか？ (y/n): ')
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim().toLowerCase())
      })
    })

    if (answer === 'y') {
      progress = existingProgress
      console.log('✅ プログレスを復元しました\n')
    } else {
      console.log('🔄 新規実行します\n')
    }
  }

  // google_maps_url が null の施設を取得
  console.log('📊 対象施設を取得中...')
  let query = supabase
    .from('places')
    .select('id, name, address, area, category')
    .is('google_maps_url', null)
    .order('created_at', { ascending: true })

  // 再開の場合は前回の続きから
  if (progress.lastProcessedId) {
    query = query.gt('created_at', progress.lastProcessedId)
  }

  const { data: facilities, error } = await query

  if (error) {
    console.error('❌ 施設の取得に失敗:', error)
    process.exit(1)
  }

  if (!facilities || facilities.length === 0) {
    console.log('✅ すべての施設にgoogle_maps_urlが設定されています')
    process.exit(0)
  }

  progress.totalCount = progress.processedCount + facilities.length

  console.log(`\n📍 対象施設数: ${facilities.length}件`)
  console.log(`💰 推定コスト: 約$${((facilities.length * 2 * 0.017).toFixed(2))}`)
  console.log(`⏱️  推定時間: 約${Math.ceil((facilities.length * 200) / 60000)}分\n`)

  const answer = await new Promise<string>((resolve) => {
    process.stdout.write('処理を開始しますか？ (y/n): ')
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim().toLowerCase())
    })
  })

  if (answer !== 'y') {
    console.log('❌ キャンセルされました')
    process.exit(0)
  }

  console.log('\n🔄 処理開始...\n')

  // 各施設を処理
  for (let i = 0; i < facilities.length; i++) {
    const facility = facilities[i] as Facility
    const progressText = `[${progress.processedCount + 1}/${progress.totalCount}]`

    console.log(`${progressText} ${facility.name} (${facility.area})`)

    try {
      // 1. Place IDを検索
      const placeId = await findPlaceId(facility.name, facility.address)

      if (!placeId) {
        console.log(`   ⚠️  Place IDが見つかりません`)
        progress.failedCount++
        progress.failedFacilities.push({
          id: facility.id,
          name: facility.name,
          error: 'Place ID not found',
        })
        progress.processedCount++
        progress.lastProcessedId = facility.id
        saveProgress()
        await delay(100)
        continue
      }

      // 2. Google Maps URLを取得
      const googleMapsUrl = await getGoogleMapsUrl(placeId)

      if (!googleMapsUrl) {
        console.log(`   ⚠️  Google Maps URLが取得できません`)
        progress.failedCount++
        progress.failedFacilities.push({
          id: facility.id,
          name: facility.name,
          error: 'Google Maps URL not found',
        })
        progress.processedCount++
        progress.lastProcessedId = facility.id
        saveProgress()
        await delay(100)
        continue
      }

      // 3. データベースを更新
      const { error: updateError } = await supabase
        .from('places')
        .update({
          google_maps_url: googleMapsUrl,
          place_id: placeId,
        })
        .eq('id', facility.id)

      if (updateError) {
        console.log(`   ❌ DB更新エラー: ${updateError.message}`)
        progress.failedCount++
        progress.failedFacilities.push({
          id: facility.id,
          name: facility.name,
          error: updateError.message,
        })
      } else {
        console.log(`   ✅ 更新完了`)
        progress.successCount++
      }

      progress.processedCount++
      progress.lastProcessedId = facility.id
      saveProgress()

      // レート制限（100ms delay）
      await delay(100)
    } catch (error) {
      console.error(`   ❌ エラー: ${error}`)
      progress.failedCount++
      progress.failedFacilities.push({
        id: facility.id,
        name: facility.name,
        error: String(error),
      })
      progress.processedCount++
      progress.lastProcessedId = facility.id
      saveProgress()
      await delay(100)
    }
  }

  console.log('\n✅ 処理完了\n')
  console.log('📊 結果:')
  console.log(`   総数: ${progress.totalCount}`)
  console.log(`   成功: ${progress.successCount}`)
  console.log(`   失敗: ${progress.failedCount}`)

  if (progress.failedFacilities.length > 0) {
    console.log('\n⚠️  失敗した施設:')
    progress.failedFacilities.forEach((item) => {
      console.log(`   - ${item.name} (${item.error})`)
    })
  }

  // プログレスファイルを削除（完了時）
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE)
    console.log('\n🗑️  プログレスファイルを削除しました')
  }

  process.exit(0)
}

// Utility: delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// エラーハンドリング
process.on('SIGINT', () => {
  console.log('\n\n⚠️  中断されました。プログレスは保存されています。')
  console.log('再開するには、同じコマンドを再度実行してください。\n')
  process.exit(0)
})

// 実行
main().catch((error) => {
  console.error('❌ 予期しないエラー:', error)
  process.exit(1)
})
