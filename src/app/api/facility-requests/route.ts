import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type FacilityRequestBody = {
  facility_name: string
  address?: string
  area?: string
  category?: string
  requester_name?: string
  requester_email?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FacilityRequestBody
    const { facility_name, address, area, category, requester_name, requester_email } = body

    // Validate required fields
    if (!facility_name || facility_name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '施設名は必須です',
        },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (requester_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requester_email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'メールアドレスの形式が正しくありません',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insert facility request
    const { data, error } = await supabase
      .from('facility_requests')
      .insert({
        facility_name: facility_name.trim(),
        address: address?.trim() || null,
        area: area?.trim() || null,
        category: category || null,
        requester_name: requester_name?.trim() || null,
        requester_email: requester_email?.trim() || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Facility request insertion error:', error)
      return NextResponse.json(
        {
          success: false,
          error: '施設追加リクエストの送信中にエラーが発生しました',
        },
        { status: 500 }
      )
    }

    // Send email notification to admin via Resend
    try {
      await sendAdminNotification({
        facility_name: facility_name.trim(),
        address: address?.trim(),
        area: area?.trim(),
        category,
        requester_name: requester_name?.trim(),
        requester_email: requester_email?.trim(),
        request_id: data.id,
      })
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Failed to send admin notification email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: '施設追加リクエストを受け付けました。管理者が確認後、追加いたします。',
      request_id: data.id,
    })
  } catch (error) {
    console.error('Unexpected error in facility request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'サーバーエラーが発生しました',
      },
      { status: 500 }
    )
  }
}

async function sendAdminNotification(params: {
  facility_name: string
  address?: string
  area?: string
  category?: string
  requester_name?: string
  requester_email?: string
  request_id: string
}) {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email notification')
    return
  }

  const { facility_name, address, area, category, requester_name, requester_email, request_id } =
    params

  const emailBody = `
新しい施設追加リクエストがありました。

【施設情報】
施設名: ${facility_name}
住所: ${address || '未入力'}
エリア: ${area || '未入力'}
カテゴリ: ${category || '未入力'}

【リクエスト元】
名前: ${requester_name || '未入力'}
メールアドレス: ${requester_email || '未入力'}

【リクエストID】
${request_id}

管理画面から承認・却下の処理を行ってください。
`.trim()

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'まち口コミ帳 <noreply@resend.dev>',
      to: ['rabo.hohoemi@gmail.com'],
      subject: `【まち口コミ帳】施設追加リクエスト - ${facility_name}`,
      text: emailBody,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend API error: ${response.status} - ${errorText}`)
  }
}
