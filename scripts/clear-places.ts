/**
 * placesテーブルの全データを削除するスクリプト
 * サービス公開前のクリーンアップ用
 *
 * 使い方:
 * NEXT_PUBLIC_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key npx tsx scripts/clear-places.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function clearPlaces() {
  try {
    console.log('🔍 placesテーブルの現在のデータ件数を確認中...')

    // 現在の件数を確認
    const { count: placesCount, error: countError } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw countError
    }

    console.log(`📊 現在のplaces件数: ${placesCount}件`)

    if (placesCount === 0) {
      console.log('✅ placesテーブルは既に空です')
      return
    }

    // recommendationsテーブルの件数も確認
    const { count: recsCount, error: recsCountError } = await supabase
      .from('recommendations')
      .select('*', { count: 'exact', head: true })

    if (recsCountError) {
      throw recsCountError
    }

    console.log(`📊 現在のrecommendations件数: ${recsCount}件`)

    if (recsCount && recsCount > 0) {
      console.log('⚠️  警告: recommendationsテーブルにデータが存在します')
      console.log('   placesを削除すると、recommendationsの参照が壊れる可能性があります')
    }

    console.log('\n🗑️  placesテーブルの全データを削除中...')

    // 全削除実行
    const { error: deleteError } = await supabase
      .from('places')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 全レコード削除（ダミー条件）

    if (deleteError) {
      throw deleteError
    }

    // 削除後の件数を確認
    const { count: afterCount, error: afterCountError } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true })

    if (afterCountError) {
      throw afterCountError
    }

    console.log(`✅ 削除完了！`)
    console.log(`   削除前: ${placesCount}件`)
    console.log(`   削除後: ${afterCount}件`)

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

// 実行
clearPlaces()
