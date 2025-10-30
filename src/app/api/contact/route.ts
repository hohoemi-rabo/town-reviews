import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'rabo.hohoemi@gmail.com'

/**
 * お問い合わせ送信API
 * POST /api/contact
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // バリデーション
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'お名前を入力してください' },
        { status: 400 }
      )
    }

    if (!email || email.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'メールアドレスを入力してください' },
        { status: 400 }
      )
    }

    // 簡単なメールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      )
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'お問い合わせ内容を入力してください' },
        { status: 400 }
      )
    }

    if (message.trim().length > 2000) {
      return NextResponse.json(
        { success: false, error: 'お問い合わせ内容は2000文字以内で入力してください' },
        { status: 400 }
      )
    }

    // Resend APIキーのチェック
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { success: false, error: 'メール送信機能が設定されていません' },
        { status: 500 }
      )
    }

    // Resend APIでメール送信
    const { error } = await resend.emails.send({
      from: 'まち口コミ帳 <onboarding@resend.dev>', // Resendのデフォルトアドレス
      to: ADMIN_EMAIL,
      replyTo: email.trim(),
      subject: `【お問い合わせ】${name.trim()}様より`,
      html: `
        <h2>新しいお問い合わせが届きました</h2>
        <p><strong>お名前:</strong> ${name.trim()}</p>
        <p><strong>メールアドレス:</strong> ${email.trim()}</p>
        <h3>お問い合わせ内容:</h3>
        <p style="white-space: pre-wrap;">${message.trim()}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">このメールは「まち口コミ帳」のお問い合わせフォームから送信されました。</p>
      `,
    })

    if (error) {
      console.error('Failed to send email via Resend:', error)
      return NextResponse.json(
        { success: false, error: 'お問い合わせの送信に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'お問い合わせを受け付けました。ご連絡ありがとうございます。',
    })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
