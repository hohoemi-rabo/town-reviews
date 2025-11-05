import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateAdminSession } from '@/lib/admin-auth'
import { createAuditLog } from '@/lib/audit-log'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

/**
 * 施設詳細取得API（管理者専用）
 * GET /api/admin/facilities/[id]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const isAuthenticated = await validateAdminSession()
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: '認証が必要です' },
      { status: 401 }
    )
  }

  try {
    const { id } = await context.params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Failed to fetch facility:', error)
      return NextResponse.json(
        { success: false, error: '施設が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      facility: data,
    })
  } catch (error) {
    console.error('Facility GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * 施設編集API（管理者専用）
 * PATCH /api/admin/facilities/[id]
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const isAuthenticated = await validateAdminSession()
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: '認証が必要です' },
      { status: 401 }
    )
  }

  try {
    const { id } = await context.params
    const body = await request.json()

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '施設名は必須です' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if facility exists
    const { data: existingFacility, error: fetchError } = await supabase
      .from('places')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingFacility) {
      return NextResponse.json(
        { success: false, error: '施設が見つかりません' },
        { status: 404 }
      )
    }

    // Update facility
    const { data, error } = await supabase
      .from('places')
      .update({
        name: body.name.trim(),
        name_kana: body.name_kana?.trim() || null,
        address: body.address?.trim() || '',
        area: body.area?.trim() || '',
        category: body.category?.trim() || '',
        lat: body.lat || 0,
        lng: body.lng || 0,
        place_id: body.place_id?.trim() || null,
        google_maps_url: body.google_maps_url?.trim() || null,
        phone: body.phone?.trim() || null,
        is_verified: body.is_verified !== undefined ? body.is_verified : true,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update facility:', error)
      return NextResponse.json(
        { success: false, error: '施設の更新に失敗しました' },
        { status: 500 }
      )
    }

    // 監査ログを記録
    await createAuditLog({
      action: 'update',
      targetType: 'facility',
      targetId: id,
      details: {
        name: body.name.trim(),
        name_kana: body.name_kana?.trim() || null,
        address: body.address?.trim() || '',
        area: body.area?.trim() || '',
        category: body.category?.trim() || '',
      },
      adminIdentifier: 'admin',
    })

    return NextResponse.json({
      success: true,
      message: '施設を更新しました',
      facility: data,
    })
  } catch (error) {
    console.error('Facility PATCH API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * 施設削除API（管理者専用）
 * 論理削除: is_verified = false
 * DELETE /api/admin/facilities/[id]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const isAuthenticated = await validateAdminSession()
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: '認証が必要です' },
      { status: 401 }
    )
  }

  try {
    const { id } = await context.params
    const supabase = createAdminClient()

    // Check if facility exists
    const { data: existingFacility, error: fetchError } = await supabase
      .from('places')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingFacility) {
      return NextResponse.json(
        { success: false, error: '施設が見つかりません' },
        { status: 404 }
      )
    }

    // Soft delete: set is_verified to false
    const { error } = await supabase
      .from('places')
      .update({
        is_verified: false,
      })
      .eq('id', id)

    if (error) {
      console.error('Failed to delete facility:', error)
      return NextResponse.json(
        { success: false, error: '施設の削除に失敗しました' },
        { status: 500 }
      )
    }

    // 監査ログを記録
    await createAuditLog({
      action: 'delete',
      targetType: 'facility',
      targetId: id,
      adminIdentifier: 'admin',
    })

    return NextResponse.json({
      success: true,
      message: '施設を削除しました',
    })
  } catch (error) {
    console.error('Facility DELETE API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
