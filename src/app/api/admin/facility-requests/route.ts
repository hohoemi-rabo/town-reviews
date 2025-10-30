import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateSession } from '../auth/route'

/**
 * 施設追加リクエスト一覧取得API（管理者専用）
 * GET /api/admin/facility-requests?status=pending
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
    const statusFilter = searchParams.get('status') // 'pending', 'approved', 'rejected', or null (all)

    const supabase = createAdminClient()

    // First, check if table has any data at all (debug)
    const { data: allData, error: checkError } = await supabase
      .from('facility_requests')
      .select('id, facility_name, status')
      .limit(10)

    console.log('Debug - All facility requests (first 10):', allData)
    console.log('Debug - Check error:', checkError)

    let query = supabase
      .from('facility_requests')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by status if specified
    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch facility requests:', error)
      return NextResponse.json(
        { success: false, error: '施設リクエストの取得に失敗しました' },
        { status: 500 }
      )
    }

    console.log(`Fetched ${data?.length || 0} facility requests with status: ${statusFilter || 'all'}`)

    return NextResponse.json({
      success: true,
      requests: data,
    })
  } catch (error) {
    console.error('Facility requests GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
