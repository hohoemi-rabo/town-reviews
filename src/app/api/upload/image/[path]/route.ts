import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const { path } = await params

    if (!path) {
      return NextResponse.json(
        { error: 'パスが指定されていません' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Decode the path (it might be URL-encoded)
    const decodedPath = decodeURIComponent(path)

    console.log('Deleting image:', decodedPath)

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('recommendations-images')
      .remove([decodedPath])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { error: '画像の削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '画像が削除されました',
    })
  } catch (error) {
    console.error('Image delete error:', error)
    return NextResponse.json(
      { error: '画像の削除中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
