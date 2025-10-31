/**
 * 重複施設データを削除するスクリプト
 *
 * 使い方:
 * npm run remove-duplicates        # ドライラン（削除対象を表示のみ）
 * npm run remove-duplicates:exec   # 実際に削除を実行
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

// コマンドライン引数で実行モードを判定
const isExecuteMode = process.argv.includes('--execute')

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

type DuplicateGroup = {
  reason: string
  facilities: Facility[]
  keepId: string
  deleteIds: string[]
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

function findExactDuplicates(facilities: Facility[]): DuplicateGroup[] {
  const duplicates: DuplicateGroup[] = []
  const locationMap = new Map<string, Facility[]>()

  // 緯度経度の組み合わせでグループ化
  facilities.forEach((f) => {
    const key = `${f.lat.toFixed(6)},${f.lng.toFixed(6)}`
    if (!locationMap.has(key)) {
      locationMap.set(key, [])
    }
    locationMap.get(key)!.push(f)
  })

  // 2件以上ある位置を重複として抽出
  locationMap.forEach((group, location) => {
    if (group.length > 1) {
      // created_atで昇順ソート（古い順）
      group.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      // 最新のものを残し、古いものを削除対象にする
      const keepFacility = group[group.length - 1]
      const deleteFacilities = group.slice(0, -1)

      duplicates.push({
        reason: `緯度経度が完全一致 (${location})`,
        facilities: group,
        keepId: keepFacility.id,
        deleteIds: deleteFacilities.map((f) => f.id),
      })
    }
  })

  return duplicates
}

function findNameAndAddressDuplicates(
  facilities: Facility[],
  alreadyMarkedForDeletion: Set<string>
): DuplicateGroup[] {
  const duplicates: DuplicateGroup[] = []
  const nameAddressMap = new Map<string, Facility[]>()

  // 既に削除対象になっている施設を除外
  const remainingFacilities = facilities.filter((f) => !alreadyMarkedForDeletion.has(f.id))

  // 施設名＋住所でグループ化
  remainingFacilities.forEach((f) => {
    const key = `${f.name.trim().toLowerCase()}|${f.address.trim().toLowerCase()}`
    if (!nameAddressMap.has(key)) {
      nameAddressMap.set(key, [])
    }
    nameAddressMap.get(key)!.push(f)
  })

  // 2件以上あるものを重複として抽出
  nameAddressMap.forEach((group) => {
    if (group.length > 1) {
      // created_atで昇順ソート（古い順）
      group.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      // 最新のものを残し、古いものを削除対象にする
      const keepFacility = group[group.length - 1]
      const deleteFacilities = group.slice(0, -1)

      duplicates.push({
        reason: `施設名と住所が一致 (${keepFacility.name})`,
        facilities: group,
        keepId: keepFacility.id,
        deleteIds: deleteFacilities.map((f) => f.id),
      })
    }
  })

  return duplicates
}

async function backupToCSV(facilities: Facility[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `backup_before_dedup_${timestamp}.csv`
  const filepath = path.join(__dirname, 'output', filename)

  // output ディレクトリを作成
  const outputDir = path.join(__dirname, 'output')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const headers = [
    'id',
    'name',
    'name_kana',
    'address',
    'area',
    'category',
    'lat',
    'lng',
    'place_id',
    'google_maps_url',
    'phone',
    'is_verified',
    'created_by',
    'created_at',
  ]

  const rows = facilities.map((f) =>
    headers.map((h) => {
      const value = f[h as keyof Facility]
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      return `"${stringValue.replace(/"/g, '""')}"`
    })
  )

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  const bom = '\uFEFF'

  fs.writeFileSync(filepath, bom + csv, 'utf-8')

  console.log(`✅ バックアップCSVを作成: ${filepath}`)
  return filepath
}

async function deleteFacilities(ids: string[]) {
  let successCount = 0
  let errorCount = 0

  console.log(`\n削除実行中...`)

  for (const id of ids) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/places?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_SERVICE_KEY as string,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          Prefer: 'return=minimal',
        },
      })

      if (response.ok) {
        successCount++
        process.stdout.write(`\r削除済み: ${successCount}/${ids.length}`)
      } else {
        errorCount++
        console.error(`\nID ${id} の削除失敗: ${await response.text()}`)
      }

      // Rate limit対策
      await new Promise((resolve) => setTimeout(resolve, 50))
    } catch (error) {
      errorCount++
      console.error(`\nID ${id} の削除エラー: ${error}`)
    }
  }

  console.log(`\n\n削除完了: 成功${successCount}件, 失敗${errorCount}件`)
}

function displayDuplicates(duplicateGroups: DuplicateGroup[]) {
  console.log('\n' + '='.repeat(70))
  console.log('🔍 重複検出結果')
  console.log('='.repeat(70))

  let totalDeleteCount = 0

  duplicateGroups.forEach((group, index) => {
    console.log(`\n【${index + 1}】 ${group.reason}`)
    console.log(`  グループ内件数: ${group.facilities.length}件`)
    console.log(`  削除対象: ${group.deleteIds.length}件\n`)

    group.facilities.forEach((f) => {
      const isKeep = f.id === group.keepId
      const marker = isKeep ? '✅ [保持]' : '❌ [削除]'
      console.log(`  ${marker} ID: ${f.id}`)
      console.log(`      施設名: ${f.name}`)
      console.log(`      住所: ${f.address}`)
      console.log(`      エリア: ${f.area}`)
      console.log(`      位置: (${f.lat}, ${f.lng})`)
      console.log(`      登録日時: ${f.created_at}`)
      console.log('')
    })

    totalDeleteCount += group.deleteIds.length
  })

  console.log('='.repeat(70))
  console.log('📊 サマリー')
  console.log('='.repeat(70))
  console.log(`重複グループ数: ${duplicateGroups.length}`)
  console.log(`削除対象施設数: ${totalDeleteCount}件`)
  console.log('='.repeat(70))

  return totalDeleteCount
}

async function main() {
  console.log('🔍 重複施設削除スクリプト\n')
  console.log(`モード: ${isExecuteMode ? '🔴 実行モード（削除実行）' : '🟢 ドライラン（確認のみ）'}\n`)

  // 1. 全施設を取得
  const facilities = await fetchAllFacilities()
  console.log(`✅ ${facilities.length}件の施設を取得しました\n`)

  // 2. バックアップCSVを作成
  console.log('バックアップCSV作成中...')
  await backupToCSV(facilities)

  // 3. 重複を検出
  console.log('\n重複検出中...')

  // 3-1. 緯度経度が完全一致する重複
  const exactDuplicates = findExactDuplicates(facilities)
  console.log(`  緯度経度完全一致: ${exactDuplicates.length}グループ`)

  // 3-2. 施設名＋住所が一致する重複（既に削除対象のものは除外）
  const markedForDeletion = new Set(exactDuplicates.flatMap((g) => g.deleteIds))
  const nameAddressDuplicates = findNameAndAddressDuplicates(facilities, markedForDeletion)
  console.log(`  施設名＋住所一致: ${nameAddressDuplicates.length}グループ`)

  // 4. 結果を表示
  const allDuplicates = [...exactDuplicates, ...nameAddressDuplicates]
  const totalDeleteCount = displayDuplicates(allDuplicates)

  if (totalDeleteCount === 0) {
    console.log('\n✨ 重複はありませんでした')
    return
  }

  // 5. 削除実行
  if (isExecuteMode) {
    console.log('\n⚠️  削除を実行します...')
    console.log('（Ctrl+C で中断できます。5秒待機中...）')
    await new Promise((resolve) => setTimeout(resolve, 5000))

    const allDeleteIds = allDuplicates.flatMap((g) => g.deleteIds)
    await deleteFacilities(allDeleteIds)

    console.log('\n✅ 削除完了しました')
    console.log(`残り施設数: ${facilities.length - totalDeleteCount}件（予定）`)
  } else {
    console.log('\n💡 これはドライランです。実際には削除されていません。')
    console.log('削除を実行するには以下のコマンドを実行してください:')
    console.log('  npm run remove-duplicates:exec')
  }

  console.log('\n✨ 完了！')
}

main().catch(console.error)
