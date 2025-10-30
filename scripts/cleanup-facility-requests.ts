/**
 * facility_requestsテーブルのデータをすべて削除するスクリプト
 * 使用方法: npx tsx scripts/cleanup-facility-requests.ts
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
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupFacilityRequests() {
  console.log('🗑️  facility_requestsテーブルのデータを削除中...')

  try {
    // まず件数を確認
    const { count: beforeCount, error: countError } = await supabase
      .from('facility_requests')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw countError
    }

    console.log(`📊 削除前の件数: ${beforeCount}件`)

    if (beforeCount === 0) {
      console.log('✅ データがありません。削除不要です。')
      return
    }

    // すべて削除
    const { error: deleteError } = await supabase
      .from('facility_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // すべて削除（IDが存在しないUUIDを指定）

    if (deleteError) {
      throw deleteError
    }

    // 削除後の件数を確認
    const { count: afterCount, error: afterCountError } = await supabase
      .from('facility_requests')
      .select('*', { count: 'exact', head: true })

    if (afterCountError) {
      throw afterCountError
    }

    console.log(`📊 削除後の件数: ${afterCount}件`)
    console.log(`✅ ${beforeCount}件のデータを削除しました！`)
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

cleanupFacilityRequests()
