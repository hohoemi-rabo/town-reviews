/**
 * 特定の施設を削除するスクリプト
 * 使用方法: npx tsx scripts/delete-place.ts
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

const TARGET_ID = '71254387-bcb8-4805-bb36-e5f5e0a243c2'

async function deletePlace() {
  console.log(`🗑️  施設を削除中... (ID: ${TARGET_ID})`)

  try {
    // まず施設情報を取得
    const { data: place, error: fetchError } = await supabase
      .from('places')
      .select('*')
      .eq('id', TARGET_ID)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.log('❌ 指定されたIDの施設が見つかりません')
        return
      }
      throw fetchError
    }

    console.log(`📍 削除対象: ${place.name}`)
    console.log(`📍 住所: ${place.address}`)

    // 削除実行
    const { error: deleteError } = await supabase
      .from('places')
      .delete()
      .eq('id', TARGET_ID)

    if (deleteError) {
      throw deleteError
    }

    console.log(`✅ 施設「${place.name}」を削除しました！`)
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

deletePlace()
