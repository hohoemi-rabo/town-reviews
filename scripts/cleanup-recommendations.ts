/**
 * recommendationsテーブルのデータをすべて削除するスクリプト
 * 使用方法: npx tsx scripts/cleanup-recommendations.ts
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

async function cleanupRecommendations() {
  console.log('🗑️  recommendationsテーブルのデータを削除中...')

  try {
    // まず件数を確認
    const { count: beforeCount, error: countError } = await supabase
      .from('recommendations')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw countError
    }

    console.log(`📊 削除前の投稿件数: ${beforeCount}件`)

    if (beforeCount === 0) {
      console.log('✅ データがありません。削除不要です。')
      return
    }

    // 画像URLを取得（Storageから削除するため）
    const { data: recommendations, error: fetchError } = await supabase
      .from('recommendations')
      .select('images')

    if (fetchError) {
      throw fetchError
    }

    // 画像ファイルのパスを収集
    const imagePaths: string[] = []
    recommendations?.forEach((rec) => {
      if (rec.images && Array.isArray(rec.images)) {
        rec.images.forEach((imageUrl: string) => {
          // URLからファイルパスを抽出
          const match = imageUrl.match(/recommendations-images\/(.+)$/)
          if (match) {
            imagePaths.push(match[1])
          }
        })
      }
    })

    console.log(`🖼️  画像ファイル: ${imagePaths.length}個`)

    // すべて削除
    const { error: deleteError } = await supabase
      .from('recommendations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // すべて削除

    if (deleteError) {
      throw deleteError
    }

    // 削除後の件数を確認
    const { count: afterCount, error: afterCountError } = await supabase
      .from('recommendations')
      .select('*', { count: 'exact', head: true })

    if (afterCountError) {
      throw afterCountError
    }

    console.log(`📊 削除後の投稿件数: ${afterCount}件`)
    console.log(`✅ ${beforeCount}件の投稿を削除しました！`)

    // Storageから画像を削除
    if (imagePaths.length > 0) {
      console.log('🖼️  Storageから画像を削除中...')
      const { error: storageError } = await supabase.storage
        .from('recommendations-images')
        .remove(imagePaths)

      if (storageError) {
        console.warn('⚠️  一部の画像削除に失敗しました:', storageError.message)
      } else {
        console.log(`✅ ${imagePaths.length}個の画像を削除しました！`)
      }
    }

    console.log('\n✨ データベースのクリーンアップが完了しました！')
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

cleanupRecommendations()
