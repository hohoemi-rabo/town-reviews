/**
 * 施設データの重複を検出するスクリプト
 */

import * as fs from 'fs'
import * as path from 'path'

// 環境変数の読み込み
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Supabase credentials not found in .env.local')
  process.exit(1)
}

type Facility = {
  id: string
  name: string
  name_kana: string | null
  address: string
  area: string
  category: string
  lat: number
  lng: number
  place_id: string | null
  google_maps_url: string | null
  phone: string | null
  is_verified: boolean
  created_by: string
  created_at: string
}

async function fetchAllFacilities(): Promise<Facility[]> {
  const facilities: Facility[] = []
  let offset = 0
  const limit = 1000

  console.log('施設データを取得中...')

  while (true) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/places?select=*&limit=${limit}&offset=${offset}&order=created_at.asc`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY as string,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch facilities:', await response.text())
      process.exit(1)
    }

    const batch: Facility[] = await response.json()
    facilities.push(...batch)

    console.log(`  取得済み: ${facilities.length}件`)

    if (batch.length < limit) break
    offset += limit
  }

  return facilities
}

function findDuplicates(facilities: Facility[]) {
  console.log('\n' + '='.repeat(60))
  console.log('🔍 重複検出結果')
  console.log('='.repeat(60))

  // 1. place_id による重複（nullは除外）
  const placeIdMap = new Map<string, Facility[]>()
  facilities.forEach((f) => {
    if (f.place_id) {
      if (!placeIdMap.has(f.place_id)) {
        placeIdMap.set(f.place_id, [])
      }
      placeIdMap.get(f.place_id)!.push(f)
    }
  })

  const placeIdDuplicates = Array.from(placeIdMap.entries()).filter(
    ([_, facs]) => facs.length > 1
  )

  console.log(`\n📍 place_id による重複: ${placeIdDuplicates.length}グループ`)
  if (placeIdDuplicates.length > 0) {
    console.log('\n詳細:')
    placeIdDuplicates.slice(0, 10).forEach(([placeId, facs]) => {
      console.log(`\nplace_id: ${placeId} (${facs.length}件)`)
      facs.forEach((f) => {
        console.log(
          `  - ID: ${f.id} | ${f.name} | ${f.area} | created: ${f.created_at}`
        )
      })
    })
    if (placeIdDuplicates.length > 10) {
      console.log(`\n...他${placeIdDuplicates.length - 10}グループ`)
    }
  }

  // 2. 施設名による重複
  const nameMap = new Map<string, Facility[]>()
  facilities.forEach((f) => {
    const key = f.name.trim().toLowerCase()
    if (!nameMap.has(key)) {
      nameMap.set(key, [])
    }
    nameMap.get(key)!.push(f)
  })

  const nameDuplicates = Array.from(nameMap.entries()).filter(([_, facs]) => facs.length > 1)

  console.log(`\n📝 施設名による重複: ${nameDuplicates.length}グループ`)
  if (nameDuplicates.length > 0) {
    console.log('\n詳細（上位10件）:')
    nameDuplicates
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .forEach(([name, facs]) => {
        console.log(`\n施設名: ${name} (${facs.length}件)`)
        facs.forEach((f) => {
          console.log(
            `  - ID: ${f.id} | ${f.area} | place_id: ${f.place_id || 'なし'} | ${f.address}`
          )
        })
      })
  }

  // 3. 緯度経度による重複（100m以内）
  const locationDuplicates: Array<{ distance: number; facilities: [Facility, Facility] }> = []

  for (let i = 0; i < facilities.length; i++) {
    for (let j = i + 1; j < facilities.length; j++) {
      const f1 = facilities[i]
      const f2 = facilities[j]

      const distance = calculateDistance(f1.lat, f1.lng, f2.lat, f2.lng)

      // 100m以内を重複とみなす
      if (distance < 0.1) {
        locationDuplicates.push({ distance, facilities: [f1, f2] })
      }
    }
  }

  console.log(`\n📍 位置による重複 (100m以内): ${locationDuplicates.length}ペア`)
  if (locationDuplicates.length > 0) {
    console.log('\n詳細（上位10件）:')
    locationDuplicates
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10)
      .forEach(({ distance, facilities: [f1, f2] }) => {
        console.log(`\n距離: ${(distance * 1000).toFixed(0)}m`)
        console.log(`  1: ${f1.name} (${f1.area}) - ID: ${f1.id}`)
        console.log(`  2: ${f2.name} (${f2.area}) - ID: ${f2.id}`)
      })
  }

  // 4. サマリー
  console.log('\n' + '='.repeat(60))
  console.log('📊 重複サマリー')
  console.log('='.repeat(60))
  console.log(`総施設数: ${facilities.length}件`)
  console.log(`place_id重複グループ: ${placeIdDuplicates.length}`)
  console.log(`施設名重複グループ: ${nameDuplicates.length}`)
  console.log(`位置重複ペア (100m以内): ${locationDuplicates.length}`)

  // 重複レコードの総数を計算
  const placeIdDupCount = placeIdDuplicates.reduce(
    (sum, [_, facs]) => sum + facs.length - 1,
    0
  )
  const nameDupCount = nameDuplicates.reduce((sum, [_, facs]) => sum + facs.length - 1, 0)

  console.log(`\n推定削除可能レコード数:`)
  console.log(`  place_id重複: ${placeIdDupCount}件`)
  console.log(`  施設名重複: ${nameDupCount}件 (place_id重複と重なる可能性あり)`)

  return {
    placeIdDuplicates,
    nameDuplicates,
    locationDuplicates,
  }
}

// Haversine formula で2点間の距離を計算（km単位）
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // 地球の半径 (km)
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

async function main() {
  console.log('🔍 施設データ重複検出スクリプト\n')

  const facilities = await fetchAllFacilities()
  console.log(`✅ ${facilities.length}件の施設を取得しました\n`)

  findDuplicates(facilities)

  console.log('\n✨ 完了！')
}

main().catch(console.error)
