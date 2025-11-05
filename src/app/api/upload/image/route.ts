import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import sharp from 'sharp'

// Force Node.js runtime (sharp requires Node.js)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Note: Vercel Free plan has max 10 seconds, Pro plan allows up to 60 seconds

// Debug: Add GET method to verify function is working
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Image upload API is working',
    runtime: 'nodejs'
  })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'JPEG or PNG形式の画像のみアップロードできます' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process image: resize and convert to WebP
    const processedImage = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 80,
        effort: 6,
      })
      .toBuffer()

    // Generate unique filename with .webp extension
    const fileName = `${crypto.randomUUID()}.webp`
    const filePath = `recommendations/${fileName}`

    console.log('Uploading WebP image:', filePath, 'Size:', processedImage.length)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('recommendations-images')
      .upload(filePath, processedImage, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: '画像のアップロードに失敗しました' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('recommendations-images')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: '画像のアップロード中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
