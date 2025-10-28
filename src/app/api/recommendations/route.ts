import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

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
  images: string[]
  authorName: string | null
  isAnonymous: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: PostRequestBody = await request.json()
    const { place, heardFromType, heardFrom, note, images, authorName, isAnonymous } = body

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

    if (heardFromType === 'その他' && !heardFrom.trim()) {
      return NextResponse.json(
        { error: '情報源の詳細を入力してください' },
        { status: 400 }
      )
    }

    if (!note.trim() || note.length > 200) {
      return NextResponse.json(
        { error: 'メモは1文字以上200文字以内で入力してください' },
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
    const { data: existingPlace, error: placeSelectError } = await supabase
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
    const isEditableUntil = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    const { data: recommendation, error: recommendationError } = await supabase
      .from('recommendations')
      .insert({
        place_id: placeDbId,
        heard_from: heardFromType === 'その他' ? heardFrom : '',
        heard_from_type: heardFromType,
        note_raw: note,
        note_formatted: note, // TODO: AI tone conversion in Phase 2
        tags: [], // TODO: AI tag generation in Phase 2
        season: null, // TODO: Can be extracted from note in Phase 2
        author_name: isAnonymous ? null : authorName,
        author_ip_hash: ipHash,
        is_anonymous: isAnonymous,
        images: images,
        is_editable_until: isEditableUntil.toISOString(),
      })
      .select()
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
      maxAge: 60 * 60 * 24, // 24 hours
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
