import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  // Define public routes
  const isPublicRoute = path === '/' || path === '/login' || path === '/admin/login';

  if (isPublicRoute) {
    if (session) {
      try {
        const payload = await decrypt(session);
        if (payload.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.nextUrl.origin));
        }
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin));
      } catch (e) {
        // Invalid session, let them stay on public route
      }
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!session) {
    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.nextUrl.origin));
    }
    return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
  }

  try {
    const payload = await decrypt(session);

    // RBAC check
    if (path.startsWith('/admin') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
    }
    if (path.startsWith('/dashboard') && payload.role !== 'DONOR') {
      return NextResponse.redirect(new URL('/admin/login', request.nextUrl.origin));
    }

    return NextResponse.next();
  } catch (e) {
    return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
