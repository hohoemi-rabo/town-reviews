import { NextRequest, NextResponse } from 'next/server'

/**
 * ミドルウェア: 管理画面のアクセス制御
 */

const SESSION_COOKIE_NAME = 'admin_session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 管理画面へのアクセスをチェック
  if (pathname.startsWith('/admin')) {
    // ログインページとAPIは認証不要
    if (pathname === '/admin/login' || pathname.startsWith('/api/admin/auth')) {
      return NextResponse.next()
    }

    // セッションCookieをチェック
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      // 未認証の場合はログインページへリダイレクト
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // セッションがある場合は続行
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Only match /admin routes (exclude /api/upload which requires Node.js runtime)
     */
    '/admin/:path*',
  ],
}
