import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateSession } from '../../auth/route'
import { createAuditLog } from '@/lib/audit-log'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

/**
 * 施設追加リクエストの承認/却下API（管理者専用）
 * PATCH /api/admin/facility-requests/[id]
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  // 管理者認証チェック
  const isAuthenticated = await validateSession()
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: '認証が必要です' },
      { status: 401 }
    )
  }

  try {
    const { id } = await context.params
    const body = await request.json()
    const { action, admin_note, facility_data } = body // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '無効なアクションです' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get the facility request
    const { data: facilityRequest, error: fetchError } = await supabase
      .from('facility_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !facilityRequest) {
      console.error('Failed to fetch facility request:', fetchError)
      return NextResponse.json(
        { success: false, error: 'リクエストが見つかりません' },
        { status: 404 }
      )
    }

    // Check if already processed
    if (facilityRequest.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'このリクエストは既に処理されています' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Approve: Create place entry and update request status

      // Validate facility_data if provided (for manual input)
      const placeData = facility_data || {
        name: facilityRequest.facility_name,
        address: facilityRequest.address || '',
        area: facilityRequest.area || '',
        category: facilityRequest.category || '',
      }

      if (!placeData.name || placeData.name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: '施設名は必須です' },
          { status: 400 }
        )
      }

      // Check if place already exists
      const { data: existingPlace } = await supabase
        .from('places')
        .select('id, name')
        .eq('name', placeData.name.trim())
        .single()

      if (existingPlace) {
        return NextResponse.json(
          { success: false, error: `施設「${existingPlace.name}」は既に登録されています` },
          { status: 400 }
        )
      }

      // Insert place
      const { data: newPlace, error: placeInsertError } = await supabase
        .from('places')
        .insert({
          name: placeData.name.trim(),
          address: placeData.address?.trim() || '',
          area: placeData.area?.trim() || '',
          category: placeData.category || '',
          lat: placeData.lat || 0, // Coordinates can be added later via edit
          lng: placeData.lng || 0,
          place_id: placeData.place_id || null, // Google Place ID if available (null if not set)
          google_maps_url: placeData.google_maps_url || null,
          phone: placeData.phone || null,
          is_verified: true, // Admin approved
          created_by: 'admin',
        })
        .select()
        .single()

      if (placeInsertError) {
        console.error('Failed to insert place:', placeInsertError)
        return NextResponse.json(
          { success: false, error: '施設の登録に失敗しました' },
          { status: 500 }
        )
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('facility_requests')
        .update({
          status: 'approved',
          admin_note: admin_note || null,
        })
        .eq('id', id)

      if (updateError) {
        console.error('Failed to update facility request:', updateError)
        return NextResponse.json(
          { success: false, error: 'リクエストの更新に失敗しました' },
          { status: 500 }
        )
      }

      // 監査ログを記録
      await createAuditLog({
        action: 'approve',
        targetType: 'facility_request',
        targetId: id,
        details: {
          facility_name: placeData.name.trim(),
          created_place_id: newPlace.id,
        },
        adminIdentifier: 'admin',
      })

      return NextResponse.json({
        success: true,
        message: '施設を承認し、登録しました',
        place: newPlace,
      })
    } else {
      // Reject: Update request status only
      const { error: updateError } = await supabase
        .from('facility_requests')
        .update({
          status: 'rejected',
          admin_note: admin_note || null,
        })
        .eq('id', id)

      if (updateError) {
        console.error('Failed to update facility request:', updateError)
        return NextResponse.json(
          { success: false, error: 'リクエストの更新に失敗しました' },
          { status: 500 }
        )
      }

      // 監査ログを記録
      await createAuditLog({
        action: 'reject',
        targetType: 'facility_request',
        targetId: id,
        details: {
          facility_name: facilityRequest.facility_name,
          admin_note: admin_note || null,
        },
        adminIdentifier: 'admin',
      })

      return NextResponse.json({
        success: true,
        message: 'リクエストを却下しました',
      })
    }
  } catch (error) {
    console.error('Facility request PATCH API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
