import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type SearchRequestBody = {
  query: string
  limit?: number
  area?: string
  category?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SearchRequestBody
    const { query, limit = 10, area, category } = body

    // Validate query length (minimum 3 characters for performance)
    if (!query || query.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: '検索キーワードは3文字以上で入力してください',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Build query with pg_trgm similarity search
    let queryBuilder = supabase
      .from('places')
      .select(
        `
        id,
        name,
        address,
        area,
        category,
        lat,
        lng,
        phone,
        google_maps_url,
        is_verified
      `
      )
      .eq('is_verified', true) // Only return verified facilities

    // Apply filters
    if (area) {
      queryBuilder = queryBuilder.eq('area', area)
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    // Use pg_trgm for fuzzy text search on name, address, and area
    // Note: Supabase doesn't directly expose similarity(), so we use ilike for basic matching
    // For production, consider using a full-text search or similarity function via RPC
    const searchTerm = `%${query}%`
    queryBuilder = queryBuilder.or(
      `name.ilike.${searchTerm},address.ilike.${searchTerm},area.ilike.${searchTerm}`
    )

    // Order by name and limit results
    queryBuilder = queryBuilder.order('name', { ascending: true }).limit(limit)

    const { data: facilities, error } = await queryBuilder

    if (error) {
      console.error('Facility search error:', error)
      return NextResponse.json(
        {
          success: false,
          error: '施設の検索中にエラーが発生しました',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      facilities: facilities || [],
      total: facilities?.length || 0,
    })
  } catch (error) {
    console.error('Unexpected error in facility search:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'サーバーエラーが発生しました',
      },
      { status: 500 }
    )
  }
}
