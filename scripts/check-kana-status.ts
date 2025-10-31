import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkStatus() {
  // 総数
  const { count: total, error: totalError } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })

  if (totalError) {
    console.error('エラー:', totalError)
    process.exit(1)
  }

  // name_kanaが設定されている件数
  const { count: withKana, error: kanaError } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .not('name_kana', 'is', null)

  if (kanaError) {
    console.error('エラー:', kanaError)
    process.exit(1)
  }

  const remaining = (total || 0) - (withKana || 0)
  const progress = total ? ((withKana || 0) / total) * 100 : 0

  console.log('==========================================')
  console.log('📊 かな生成 進捗状況')
  console.log('==========================================')
  console.log(`総施設数: ${total}件`)
  console.log(`かな生成済み: ${withKana}件`)
  console.log(`残り: ${remaining}件`)
  console.log(`進捗: ${progress.toFixed(1)}%`)
  console.log('==========================================')
}

checkStatus()
