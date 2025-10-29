import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { recommendationId, reactionType, userId } = await request.json()

    // Validation
    if (!recommendationId || !reactionType || !userId) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }

    const validReactionTypes = ['ittemiitai']
    if (!validReactionTypes.includes(reactionType)) {
      return NextResponse.json(
        { error: '無効なリアクションタイプです' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if reaction already exists
    const { data: existing } = await supabase
      .from('reactions')
      .select('id')
      .eq('recommendation_id', recommendationId)
      .eq('reaction_type', reactionType)
      .eq('user_identifier', userId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'すでにリアクション済みです' },
        { status: 409 }
      )
    }

    // Insert reaction
    const { data, error } = await supabase
      .from('reactions')
      .insert({
        recommendation_id: recommendationId,
        reaction_type: reactionType,
        user_identifier: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Reaction insert error:', error)
      return NextResponse.json(
        { error: 'リアクションの追加に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, reaction: data })
  } catch (error) {
    console.error('Add reaction error:', error)
    return NextResponse.json(
      { error: 'リアクション追加中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { recommendationId, reactionType, userId } = await request.json()

    // Validation
    if (!recommendationId || !reactionType || !userId) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find and delete the reaction
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('recommendation_id', recommendationId)
      .eq('reaction_type', reactionType)
      .eq('user_identifier', userId)

    if (error) {
      console.error('Reaction delete error:', error)
      return NextResponse.json(
        { error: 'リアクションの削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete reaction error:', error)
    return NextResponse.json(
      { error: 'リアクション削除中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
