import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSearchVariants } from '@/lib/text-utils'

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

    // Validate query length (minimum 2 characters for better UX)
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: '検索キーワードは2文字以上で入力してください',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Generate search variants (ひらがな, カタカナ, etc.)
    const searchVariants = generateSearchVariants(query)

    // Build OR conditions for all variants
    const orConditions = searchVariants
      .map((variant) => {
        const term = `%${variant}%`
        return `name.ilike.${term},name_kana.ilike.${term},address.ilike.${term},area.ilike.${term}`
      })
      .join(',')

    // Build query
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

    // Search with multiple variants (ひらがな・カタカナ対応)
    queryBuilder = queryBuilder.or(orConditions)

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
