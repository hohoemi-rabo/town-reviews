import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

/**
 * 管理者用Supabaseクライアント
 * サービスロールキーを使用し、RLSポリシーをバイパスする
 *
 * ⚠️ 注意: このクライアントはサーバーサイドでのみ使用すること
 * クライアントサイドで使用すると、サービスロールキーが漏洩する危険があります
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

/**
 * サービスロールキーを使った管理者用クライアントを作成
 * RLSポリシーをバイパスして全データにアクセス可能
 */
export const createAdminClient = () => {
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
