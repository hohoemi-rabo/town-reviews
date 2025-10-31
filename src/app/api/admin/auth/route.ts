import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

/**
 * 管理者認証API
 * POST /api/admin/auth - ログイン
 * DELETE /api/admin/auth - ログアウト
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Simple session storage (in-memory, for MVP - replace with Redis in production)
const activeSessions = new Set<string>()

/**
 * ログイン処理
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'パスワードを入力してください' },
        { status: 400 }
      )
    }

    if (!ADMIN_PASSWORD) {
      console.error('ADMIN_PASSWORD is not set in environment variables')
      return NextResponse.json(
        { success: false, error: 'サーバー設定エラー' },
        { status: 500 }
      )
    }

    // パスワード検証
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'パスワードが正しくありません' },
        { status: 401 }
      )
    }

    // セッショントークン生成
    const sessionToken = crypto.randomBytes(32).toString('hex')
    activeSessions.add(sessionToken)

    // Cookieにセッショントークンを保存
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      message: 'ログインしました',
    })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { success: false, error: '認証中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * ログアウト処理
 */
export async function DELETE(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionToken) {
      activeSessions.delete(sessionToken)
    }

    cookieStore.delete(SESSION_COOKIE_NAME)

    return NextResponse.json({
      success: true,
      message: 'ログアウトしました',
    })
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { success: false, error: 'ログアウト中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * セッション検証用のヘルパー関数
 */
export async function validateSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return false
    }

    return activeSessions.has(sessionToken)
  } catch (error) {
    console.error('Session validation error:', error)
    return false
  }
}
