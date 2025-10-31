import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function countPlaces() {
  // 総数
  const { count: total, error: totalError } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })

  if (totalError) {
    console.error('エラー:', totalError)
    process.exit(1)
  }

  // created_by='api' の件数
  const { count: apiCount, error: apiError } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', 'api')

  if (apiError) {
    console.error('エラー:', apiError)
    process.exit(1)
  }

  // created_by='admin' の件数
  const { count: adminCount, error: adminError } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', 'admin')

  if (adminError) {
    console.error('エラー:', adminError)
    process.exit(1)
  }

  // created_by='user' の件数
  const { count: userCount, error: userError } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', 'user')

  if (userError) {
    console.error('エラー:', userError)
    process.exit(1)
  }

  // エリア別の上位10件
  const { data: areaBreakdown, error: areaError } = await supabase
    .from('places')
    .select('area')
    .limit(5000)

  if (areaError) {
    console.error('エラー:', areaError)
    process.exit(1)
  }

  const countsByArea = areaBreakdown.reduce((acc: any, item: any) => {
    const area = item.area || 'その他'
    acc[area] = (acc[area] || 0) + 1
    return acc
  }, {})

  console.log('==========================================')
  console.log('📊 施設データ 最終集計')
  console.log('==========================================')
  console.log(`総施設数: ${total}件`)
  console.log(`\n登録元別:`)
  console.log(`  api: ${apiCount}件`)
  if (adminCount && adminCount > 0) {
    console.log(`  admin: ${adminCount}件`)
  }
  if (userCount && userCount > 0) {
    console.log(`  user: ${userCount}件`)
  }
  console.log(`\nエリア別 TOP10:`)
  Object.entries(countsByArea)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 10)
    .forEach(([key, value]) => {
      console.log(`  ${key}: ${value}件`)
    })
  console.log('==========================================')
}

countPlaces()
