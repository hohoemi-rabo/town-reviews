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
 * 投稿削除API（管理者専用）
 * DELETE /api/admin/recommendations/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // セッション検証
    const isAuthenticated = await validateAdminSession()
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDが指定されていません' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 投稿を削除
    const { error } = await supabase
      .from('recommendations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete recommendation:', error)
      return NextResponse.json(
        { success: false, error: '投稿の削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '投稿を削除しました',
    })
  } catch (error) {
    console.error('Delete recommendation error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * 投稿編集API（管理者専用）
 * PATCH /api/admin/recommendations/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // セッション検証
    const isAuthenticated = await validateAdminSession()
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDが指定されていません' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 更新可能なフィールドのみ抽出
    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'note_raw',
      'note_formatted',
      'heard_from',
      'heard_from_type',
      'review_category',
      'tags',
      'season',
      'author_name',
      'is_anonymous',
      'images',
    ]

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: '更新するデータがありません' },
        { status: 400 }
      )
    }

    // 投稿を更新
    const { data, error } = await supabase
      .from('recommendations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update recommendation:', error)
      return NextResponse.json(
        { success: false, error: '投稿の更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '投稿を更新しました',
      recommendation: data,
    })
  } catch (error) {
    console.error('Update recommendation error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * 投稿取得API（管理者専用）
 * GET /api/admin/recommendations/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // セッション検証
    const isAuthenticated = await validateAdminSession()
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDが指定されていません' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 投稿を取得
    const { data, error } = await supabase
      .from('recommendations')
      .select(
        `
        *,
        places:place_id (
          id,
          place_id,
          name,
          lat,
          lng,
          category,
          address,
          created_at
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to fetch recommendation:', error)
      return NextResponse.json(
        { success: false, error: '投稿の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      recommendation: data,
    })
  } catch (error) {
    console.error('Get recommendation error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
