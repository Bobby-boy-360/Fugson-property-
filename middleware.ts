import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route Protection Middleware for Fugson Property Management Portal
 * Role-Based Access Control (RBAC):
 * - /admin/* requires role === 'ADMIN'
 * - /agent/*  requires role === 'AGENT'
 * - /pay/*    is a public/tokenized route for Tenants
 * - /login    is public
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve the auth_token cookie
  const authTokenCookie = request.cookies.get('auth_token')?.value;

  // Parse token / user payload
  let userRole: string | null = null;

  if (authTokenCookie) {
    try {
      // Handles both JSON serialized session ({ role: 'ADMIN', email: '...' })
      // and direct role tokens ('ADMIN', 'AGENT', 'TENANT')
      if (authTokenCookie.startsWith('{')) {
        const parsed = JSON.parse(authTokenCookie);
        userRole = parsed.role ? String(parsed.role).toUpperCase() : null;
      } else {
        userRole = authTokenCookie.toUpperCase();
      }
    } catch {
      userRole = authTokenCookie.toUpperCase();
    }
  }

  // Admin Route Protection: If accessing /admin and not ADMIN, redirect to /login
  if (pathname.startsWith('/admin')) {
    if (!authTokenCookie || userRole !== 'ADMIN') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized_admin');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Agent Route Protection: If accessing /agent and not AGENT, redirect to /login
  if (pathname.startsWith('/agent')) {
    if (!authTokenCookie || userRole !== 'AGENT') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized_agent');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated and visiting /login, auto-redirect to respective dashboard or portal
  if (pathname === '/login' && userRole) {
    if (userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (userRole === 'AGENT') {
      return NextResponse.redirect(new URL('/agent', request.url));
    }
    if (userRole === 'TENANT') {
      return NextResponse.redirect(new URL('/pay/fg-tenant-98231', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match protected dashboard routes and login:
     * - /admin/:path*
     * - /agent/:path*
     * - /login
     */
    '/admin/:path*',
    '/agent/:path*',
    '/login',
  ],
};
