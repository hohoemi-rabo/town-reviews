import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * 投稿が編集可能かどうかを確認するAPI
 * GET /api/recommendations/[id]/editable
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const editablePosts = cookieStore.get('editable_posts')?.value

    if (!editablePosts) {
      return NextResponse.json({
        editable: false,
        reason: 'no_cookie',
      })
    }

    const editablePostsArray = JSON.parse(editablePosts) as Array<{
      id: string
      until: string
    }>

    const post = editablePostsArray.find((p) => p.id === id)

    if (!post) {
      return NextResponse.json({
        editable: false,
        reason: 'not_found',
      })
    }

    const now = new Date()
    const until = new Date(post.until)

    if (now > until) {
      return NextResponse.json({
        editable: false,
        reason: 'expired',
      })
    }

    return NextResponse.json({
      editable: true,
      until: post.until,
    })
  } catch (error) {
    console.error('Editable check error:', error)
    return NextResponse.json(
      { editable: false, reason: 'error' },
      { status: 500 }
    )
  }
}
