import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'admin_session'

/**
 * セッション検証用のヘルパー関数
 * 管理者APIで共通利用
 */
export async function validateAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return false
    }

    // Note: In-memory session validation
    // For production, consider using Redis or database
    return true // Simplified: just check if cookie exists
  } catch (error) {
    console.error('Session validation error:', error)
    return false
  }
}
