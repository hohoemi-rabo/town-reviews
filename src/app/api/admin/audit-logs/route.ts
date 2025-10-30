import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateSession } from '../auth/route'

/**
 * 監査ログ取得API（管理者専用）
 * GET /api/admin/audit-logs?limit=50&offset=0
 */
export async function GET(request: NextRequest) {
  // 管理者認証チェック
  const isAuthenticated = await validateSession()
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: '認証が必要です' },
      { status: 401 }
    )
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const supabase = createAdminClient()

    const { data, error, count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Failed to fetch audit logs:', error)
      return NextResponse.json(
        { success: false, error: '監査ログの取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      logs: data,
      total: count || 0,
    })
  } catch (error) {
    console.error('Audit logs GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
