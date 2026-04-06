import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const PROTECTED_PATHS = ['/dashboard', '/settings', '/my-cards'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path requires authentication
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (isProtectedPath) {
    // Check for session token (simplified check)
    const sessionToken =
      request.cookies.get('next-auth.session-token') ??
      request.cookies.get('__Secure-next-auth.session-token');

    if (!sessionToken) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
