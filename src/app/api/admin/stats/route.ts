import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateSession } from '../auth/route'

/**
 * 統計データ取得API（管理者専用）
 * GET /api/admin/stats
 */
export async function GET() {
  // 管理者認証チェック
  const isAuthenticated = await validateSession()
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: '認証が必要です' },
      { status: 401 }
    )
  }

  try {
    const supabase = createAdminClient()

    // 1. 総投稿数
    const { count: totalPosts, error: postsError } = await supabase
      .from('recommendations')
      .select('*', { count: 'exact', head: true })

    if (postsError) {
      console.error('Failed to fetch total posts:', postsError)
    }

    // 2. 今月の投稿数
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const { count: monthlyPosts, error: monthlyError } = await supabase
      .from('recommendations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    if (monthlyError) {
      console.error('Failed to fetch monthly posts:', monthlyError)
    }

    // 3. 施設統計
    const { count: totalFacilities, error: facilitiesError } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true)

    if (facilitiesError) {
      console.error('Failed to fetch total facilities:', facilitiesError)
    }

    // 4. エリア別施設数
    const { data: facilitiesByArea, error: areaError } = await supabase
      .from('places')
      .select('area')
      .eq('is_verified', true)

    if (areaError) {
      console.error('Failed to fetch facilities by area:', areaError)
    }

    const areaCounts = facilitiesByArea?.reduce(
      (acc, item) => {
        const area = item.area || '未設定'
        acc[area] = (acc[area] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // 5. カテゴリー別施設数
    const { data: facilitiesByCategory, error: categoryError } = await supabase
      .from('places')
      .select('category')
      .eq('is_verified', true)

    if (categoryError) {
      console.error('Failed to fetch facilities by category:', categoryError)
    }

    const categoryCounts = facilitiesByCategory?.reduce(
      (acc, item) => {
        const category = item.category || '未設定'
        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // 6. 人気スポットTOP10（投稿数順）
    const { data: popularSpots, error: popularError } = await supabase
      .from('recommendations')
      .select('place_id, places(name)')
      .not('place_id', 'is', null)

    if (popularError) {
      console.error('Failed to fetch popular spots:', popularError)
    }

    const spotCounts = popularSpots?.reduce(
      (acc, item) => {
        if (item.place_id) {
          if (!acc[item.place_id]) {
            acc[item.place_id] = {
              place_id: item.place_id,
              name: Array.isArray(item.places) ? item.places[0]?.name : item.places?.name || '不明',
              count: 0,
            }
          }
          acc[item.place_id].count++
        }
        return acc
      },
      {} as Record<
        string,
        { place_id: string; name: string; count: number }
      >
    )

    const topSpots = Object.values(spotCounts || {})
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 7. タグ使用状況
    const { data: allTags, error: tagsError } = await supabase
      .from('recommendations')
      .select('tags')
      .not('tags', 'is', null)

    if (tagsError) {
      console.error('Failed to fetch tags:', tagsError)
    }

    const tagCounts = allTags?.reduce(
      (acc, item) => {
        if (Array.isArray(item.tags)) {
          item.tags.forEach((tag) => {
            acc[tag] = (acc[tag] || 0) + 1
          })
        }
        return acc
      },
      {} as Record<string, number>
    )

    const topTags = Object.entries(tagCounts || {})
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 8. リアクション統計
    const { count: totalReactions, error: reactionsError } = await supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })

    if (reactionsError) {
      console.error('Failed to fetch total reactions:', reactionsError)
    }

    // 9. レビューカテゴリー別投稿数
    const { data: postsByCategory, error: postCategoryError } = await supabase
      .from('recommendations')
      .select('review_category')

    if (postCategoryError) {
      console.error('Failed to fetch posts by category:', postCategoryError)
    }

    const reviewCategoryCounts = postsByCategory?.reduce(
      (acc, item) => {
        const category = item.review_category || '未設定'
        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      success: true,
      stats: {
        posts: {
          total: totalPosts || 0,
          monthly: monthlyPosts || 0,
          byCategory: reviewCategoryCounts || {},
        },
        facilities: {
          total: totalFacilities || 0,
          byArea: areaCounts || {},
          byCategory: categoryCounts || {},
        },
        popularSpots: topSpots,
        tags: topTags,
        reactions: {
          total: totalReactions || 0,
        },
      },
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
