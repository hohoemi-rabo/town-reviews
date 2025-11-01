import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * 編集可能な投稿のIDリストを取得するAPI
 * GET /api/recommendations/editable-list
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const editablePosts = cookieStore.get('editable_posts')?.value

    if (!editablePosts) {
      return NextResponse.json({
        editableIds: [],
      })
    }

    const editablePostsArray = JSON.parse(editablePosts) as Array<{
      id: string
      until: string
    }>

    // 期限切れでないものだけをフィルター
    const now = new Date()
    const validEditableIds = editablePostsArray
      .filter((post) => new Date(post.until) > now)
      .map((post) => post.id)

    return NextResponse.json({
      editableIds: validEditableIds,
    })
  } catch (error) {
    console.error('Editable list fetch error:', error)
    return NextResponse.json({
      editableIds: [],
    })
  }
}
