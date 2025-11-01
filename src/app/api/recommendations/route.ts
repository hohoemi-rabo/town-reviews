import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

/**
 * 口コミ一覧取得API（フィルタ機能付き）
 * GET /api/recommendations?facility_id=xxx&tags=tag1,tag2&season=春&heard_from_types=家族・親戚,友人・知人&categories=グルメ,景色&search=keyword
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const facilityId = searchParams.get('facility_id')
    const tagsParam = searchParams.get('tags')
    const season = searchParams.get('season')
    const heardFromTypesParam = searchParams.get('heard_from_types')
    const categoriesParam = searchParams.get('categories')
    const search = searchParams.get('search')

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('recommendations')
      .select(`
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
      `)

    // Filter by facility
    if (facilityId) {
      query = query.eq('place_id', facilityId)
    }

    // Filter by season
    if (season) {
      query = query.eq('season', season)
    }

    // Filter by heard_from_types (OR condition)
    if (heardFromTypesParam) {
      const heardFromTypes = heardFromTypesParam.split(',')
      query = query.in('heard_from_type', heardFromTypes)
    }

    // Filter by categories (OR condition)
    if (categoriesParam) {
      const categories = categoriesParam.split(',')
      query = query.in('review_category', categories)
    }

    // Filter by tags (OR condition)
    if (tagsParam) {
      const tags = tagsParam.split(',')
      // Use overlaps operator for array fields
      query = query.overlaps('tags', tags)
    }

    // Filter by keyword search (full-text search on note_formatted)
    if (search && search.trim()) {
      query = query.ilike('note_formatted', `%${search.trim()}%`)
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch recommendations:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch recommendations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      recommendations: data,
    })
  } catch (error) {
    console.error('Recommendations GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface PostRequestBody {
  place: {
    placeId: string
    name: string
    address: string
    lat: number
    lng: number
    category: string
  }
  heardFromType: string
  heardFrom: string
  note: string
  reviewCategory: string
  season?: string | null
  tags?: string[]
  images: string[]
  authorName: string | null
  isAnonymous: boolean
}

const VALID_REVIEW_CATEGORIES = ['グルメ', '景色', '体験', '癒し', 'その他'] as const

export async function POST(request: NextRequest) {
  try {
    const body: PostRequestBody = await request.json()
    const { place, heardFromType, heardFrom, note, reviewCategory, season, tags, images, authorName, isAnonymous } = body

    // Validation
    if (!place || !place.placeId || !place.name) {
      return NextResponse.json(
        { error: 'スポット情報が不正です' },
        { status: 400 }
      )
    }

    if (!heardFromType) {
      return NextResponse.json(
        { error: '情報源を選択してください' },
        { status: 400 }
      )
    }

    // TODO: Uncomment if you want to require input for "その他"
    // if (heardFromType === 'その他' && !heardFrom.trim()) {
    //   return NextResponse.json(
    //     { error: '情報源の詳細を入力してください' },
    //     { status: 400 }
    //   )
    // }

    if (!note.trim() || note.length > 200) {
      return NextResponse.json(
        { error: 'メモは1文字以上200文字以内で入力してください' },
        { status: 400 }
      )
    }

    if (!reviewCategory || !VALID_REVIEW_CATEGORIES.includes(reviewCategory as typeof VALID_REVIEW_CATEGORIES[number])) {
      return NextResponse.json(
        { error: '有効なカテゴリーを選択してください' },
        { status: 400 }
      )
    }

    if (images.length > 3) {
      return NextResponse.json(
        { error: '画像は最大3枚までです' },
        { status: 400 }
      )
    }

    if (!isAnonymous && (!authorName || authorName.length > 20)) {
      return NextResponse.json(
        { error: '投稿者名は20文字以内で入力してください' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get or create user ID from cookies
    const cookieStore = await cookies()
    let userId = cookieStore.get('user_id')?.value

    if (!userId) {
      userId = crypto.randomUUID()
      cookieStore.set('user_id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }

    // Hash IP address (for abuse prevention, not stored raw)
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0'
    const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex')

    // 1. Insert or get place
    const { data: existingPlace } = await supabase
      .from('places')
      .select('id')
      .eq('place_id', place.placeId)
      .single()

    let placeDbId: string

    if (existingPlace) {
      placeDbId = existingPlace.id
    } else {
      const { data: newPlace, error: placeInsertError } = await supabase
        .from('places')
        .insert({
          place_id: place.placeId,
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          category: place.category,
          address: place.address,
        })
        .select('id')
        .single()

      if (placeInsertError) {
        console.error('Place insert error:', placeInsertError)
        return NextResponse.json(
          { error: 'スポットの登録に失敗しました' },
          { status: 500 }
        )
      }

      placeDbId = newPlace.id
    }

    // 2. Insert recommendation
    const isEditableUntil = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours from now

    const { data: recommendation, error: recommendationError } = await supabase
      .from('recommendations')
      .insert({
        place_id: placeDbId,
        heard_from: heardFromType === 'その他' ? heardFrom : '',
        heard_from_type: heardFromType,
        note_raw: note,
        note_formatted: note, // TODO: AI tone conversion in Phase 2
        review_category: reviewCategory,
        tags: tags || [], // User-selected tags (AI generation in Phase 2 as enhancement)
        season: season || null, // User-selected season (AI extraction in Phase 2 as enhancement)
        author_name: isAnonymous ? null : authorName,
        author_ip_hash: ipHash,
        is_anonymous: isAnonymous,
        images: images,
        is_editable_until: isEditableUntil.toISOString(),
      })
      .select(`
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
      `)
      .single()

    if (recommendationError) {
      console.error('Recommendation insert error:', recommendationError)
      return NextResponse.json(
        { error: '投稿に失敗しました' },
        { status: 500 }
      )
    }

    // 3. Store recommendation ID in cookie for edit capability
    const editablePosts = cookieStore.get('editable_posts')?.value
    const editablePostsArray = editablePosts ? JSON.parse(editablePosts) : []
    editablePostsArray.push({
      id: recommendation.id,
      until: isEditableUntil.toISOString(),
    })

    cookieStore.set('editable_posts', JSON.stringify(editablePostsArray), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12, // 12 hours
    })

    return NextResponse.json({
      success: true,
      recommendation,
    })
  } catch (error) {
    console.error('Post recommendation error:', error)
    return NextResponse.json(
      { error: '投稿中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
