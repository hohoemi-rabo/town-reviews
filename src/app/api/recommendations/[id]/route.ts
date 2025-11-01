import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

const VALID_REVIEW_CATEGORIES = ['グルメ', '景色', '体験', '癒し', 'その他'] as const

/**
 * 投稿編集API（Cookie認証）
 * PATCH /api/recommendations/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      heardFromType,
      heardFrom,
      note,
      reviewCategory,
      season,
      tags,
      images,
      authorName,
      isAnonymous,
    } = body

    // 1. Check if editable (Cookie verification)
    const cookieStore = await cookies()
    const editablePosts = cookieStore.get('editable_posts')?.value

    if (!editablePosts) {
      return NextResponse.json(
        { error: '編集権限がありません' },
        { status: 403 }
      )
    }

    const editablePostsArray = JSON.parse(editablePosts) as Array<{
      id: string
      until: string
    }>

    const post = editablePostsArray.find((p) => p.id === id)

    if (!post) {
      return NextResponse.json(
        { error: 'この投稿を編集する権限がありません' },
        { status: 403 }
      )
    }

    const now = new Date()
    const until = new Date(post.until)

    if (now > until) {
      return NextResponse.json(
        { error: '編集期限（12時間）を過ぎています' },
        { status: 403 }
      )
    }

    // 2. Validation
    if (!heardFromType) {
      return NextResponse.json(
        { error: '情報源を選択してください' },
        { status: 400 }
      )
    }

    // TODO: Uncomment if you want to require input for "その他"
    // if (heardFromType === 'その他' && !heardFrom?.trim()) {
    //   return NextResponse.json(
    //     { error: '情報源の詳細を入力してください' },
    //     { status: 400 }
    //   )
    // }

    if (!note?.trim() || note.length > 200) {
      return NextResponse.json(
        { error: 'メモは1文字以上200文字以内で入力してください' },
        { status: 400 }
      )
    }

    if (
      !reviewCategory ||
      !VALID_REVIEW_CATEGORIES.includes(
        reviewCategory as (typeof VALID_REVIEW_CATEGORIES)[number]
      )
    ) {
      return NextResponse.json(
        { error: '有効なカテゴリーを選択してください' },
        { status: 400 }
      )
    }

    if (images && images.length > 3) {
      return NextResponse.json(
        { error: '画像は最大3枚までです' },
        { status: 400 }
      )
    }

    if (!isAnonymous && (!authorName?.trim() || authorName.trim().length > 20)) {
      return NextResponse.json(
        { error: '投稿者名は20文字以内で入力してください' },
        { status: 400 }
      )
    }

    // 3. Update recommendation (use admin client to bypass RLS)
    const supabase = createAdminClient()

    const { data: recommendation, error: updateError } = await supabase
      .from('recommendations')
      .update({
        heard_from: heardFromType === 'その他' ? heardFrom : '',
        heard_from_type: heardFromType,
        note_raw: note,
        note_formatted: note, // TODO: AI tone conversion in Phase 2
        review_category: reviewCategory,
        tags: tags || [],
        season: season || null,
        author_name: isAnonymous ? null : authorName,
        is_anonymous: isAnonymous,
        images: images || [],
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Recommendation update error:', updateError)
      return NextResponse.json(
        { error: '更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      recommendation,
    })
  } catch (error) {
    console.error('Update recommendation error:', error)
    return NextResponse.json(
      { error: '更新中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * 投稿削除API（Cookie認証）
 * DELETE /api/recommendations/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Check if editable (Cookie verification)
    const cookieStore = await cookies()
    const editablePosts = cookieStore.get('editable_posts')?.value

    if (!editablePosts) {
      return NextResponse.json(
        { error: '削除権限がありません' },
        { status: 403 }
      )
    }

    const editablePostsArray = JSON.parse(editablePosts) as Array<{
      id: string
      until: string
    }>

    const post = editablePostsArray.find((p) => p.id === id)

    if (!post) {
      return NextResponse.json(
        { error: 'この投稿を削除する権限がありません' },
        { status: 403 }
      )
    }

    const now = new Date()
    const until = new Date(post.until)

    if (now > until) {
      return NextResponse.json(
        { error: '編集期限（12時間）を過ぎています' },
        { status: 403 }
      )
    }

    // 2. Delete recommendation (use admin client to bypass RLS)
    const supabase = createAdminClient()

    const { error: deleteError } = await supabase
      .from('recommendations')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Recommendation delete error:', deleteError)
      return NextResponse.json(
        { error: '削除に失敗しました' },
        { status: 500 }
      )
    }

    // 3. Remove from editable_posts cookie
    const updatedPosts = editablePostsArray.filter((p) => p.id !== id)
    cookieStore.set('editable_posts', JSON.stringify(updatedPosts), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12, // 12 hours
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete recommendation error:', error)
    return NextResponse.json(
      { error: '削除中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
