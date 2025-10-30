import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'admin_session'

/**
 * セッション検証
 */
async function validateAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
  return !!sessionToken
}

/**
 * 投稿一括削除API（管理者専用）
 * POST /api/admin/recommendations/bulk-delete
 */
export async function POST(request: NextRequest) {
  try {
    // セッション検証
    const isAuthenticated = await validateAdminSession()
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: '削除するIDが指定されていません' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 投稿を一括削除
    const { error } = await supabase
      .from('recommendations')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('Failed to bulk delete recommendations:', error)
      return NextResponse.json(
        { success: false, error: '投稿の一括削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length}件の投稿を削除しました`,
      deletedCount: ids.length,
    })
  } catch (error) {
    console.error('Bulk delete recommendations error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
