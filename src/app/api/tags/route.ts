import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * タグ一覧取得API
 * 使用頻度順にソートされたタグのリストを返す
 *
 * GET /api/tags
 * Response: { tags: [{ name: string, count: number }] }
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // recommendationsテーブルからすべてのタグを取得
    const { data, error } = await supabase
      .from('recommendations')
      .select('tags')

    if (error) {
      console.error('Failed to fetch recommendations:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tags' },
        { status: 500 }
      )
    }

    // タグの使用頻度をカウント
    const tagCount = new Map<string, number>()

    data.forEach((recommendation) => {
      const tags = recommendation.tags as string[] | null
      if (tags && Array.isArray(tags)) {
        tags.forEach((tag) => {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
        })
      }
    })

    // Map → Array に変換し、使用頻度順にソート
    const sortedTags = Array.from(tagCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json(
      {
        success: true,
        tags: sortedTags,
      },
      {
        headers: {
          // リアルタイム更新のためキャッシュ無効化
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Tags API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
