import { NextRequest, NextResponse } from 'next/server';
import { auth } from './lib/auth/server';

const gate = auth.middleware({ loginUrl: '/sign-in' });

/**
 * First line of defense: every admin page and API route requires a valid Neon Auth session.
 * Allowlist enforcement (ADMIN_ALLOWED_EMAILS) is applied again in the layout and each API handler.
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public: sign-in page and the Neon Auth proxy endpoints
  if (pathname === '/sign-in' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // API calls must get a JSON 401 instead of a redirect to the login page
  if (pathname.startsWith('/api/')) {
    const res = await gate(request);
    const isRedirect = res.status >= 300 && res.status < 400;
    if (isRedirect) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return res;
  }

  return gate(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|images/).*)'],
};
