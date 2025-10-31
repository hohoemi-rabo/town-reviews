/**
 * 飯田市の施設データを削除するスクリプト
 *
 * Usage:
 * npx tsx scripts/delete-iida-facilities.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function deleteIidaFacilities() {
  console.log('🗑️  飯田市の施設データを削除します...\n')

  // 削除前の件数を確認
  const { count: beforeCount, error: countError } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('area', '飯田市')

  if (countError) {
    console.error('❌ データ件数の取得に失敗:', countError)
    process.exit(1)
  }

  console.log(`📊 削除対象: ${beforeCount}件（area='飯田市'）`)

  if (beforeCount === 0) {
    console.log('✅ 削除対象のデータがありません')
    return
  }

  // 確認プロンプト
  console.log('\n⚠️  このまま削除を続けますか？')
  console.log('   Ctrl+C でキャンセルできます')
  console.log('   5秒後に削除を開始します...\n')

  // カウントダウン
  for (let i = 5; i > 0; i--) {
    process.stdout.write(`   ${i}... `)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  console.log('\n')

  // 削除実行
  console.log('🗑️  削除実行中...')

  const { error: deleteError } = await supabase
    .from('places')
    .delete()
    .eq('area', '飯田市')

  if (deleteError) {
    console.error('❌ 削除エラー:', deleteError)
    process.exit(1)
  }

  // 削除後の件数を確認
  const { count: afterCount } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('area', '飯田市')

  console.log(`\n✅ 削除完了`)
  console.log(`   削除件数: ${beforeCount}件`)
  console.log(`   残存件数: ${afterCount}件（area='飯田市'）`)

  // 全体の件数も表示
  const { count: totalCount } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })

  console.log(`   データベース全体: ${totalCount}件\n`)
}

deleteIidaFacilities().catch(console.error)
