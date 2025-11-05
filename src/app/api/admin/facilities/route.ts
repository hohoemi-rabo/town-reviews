import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateAdminSession } from '@/lib/admin-auth'

/**
 * 施設一覧取得API（管理者専用）
 * GET /api/admin/facilities?search=keyword&area=飯田市&category=飲食
 */
export async function GET(request: NextRequest) {
  // 管理者認証チェック
  const isAuthenticated = await validateAdminSession()
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: '認証が必要です' },
      { status: 401 }
    )
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const searchQuery = searchParams.get('search')
    const areaFilter = searchParams.get('area')
    const categoryFilter = searchParams.get('category')
    const showOnlyVerified = searchParams.get('verified') === 'true'
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '1000', 10)

    const supabase = createAdminClient()

    let query = supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by search keyword (name, name_kana, address)
    if (searchQuery && searchQuery.trim()) {
      const keyword = `%${searchQuery.trim()}%`
      query = query.or(`name.ilike.${keyword},name_kana.ilike.${keyword},address.ilike.${keyword}`)
    }

    // Filter by area
    if (areaFilter && areaFilter.trim()) {
      query = query.eq('area', areaFilter.trim())
    }

    // Filter by category
    if (categoryFilter && categoryFilter.trim()) {
      query = query.eq('category', categoryFilter.trim())
    }

    // Filter by verification status
    if (showOnlyVerified) {
      query = query.eq('is_verified', true)
    }

    // Add pagination support (offset and limit)
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch facilities:', error)
      return NextResponse.json(
        { success: false, error: '施設の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      facilities: data,
    })
  } catch (error) {
    console.error('Facilities GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
