import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export default async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  // Define public routes
  const isPublicRoute = ['/', '/login', '/admin/login', '/api/auth/login'].includes(path);

  let payload = null;
  if (session) {
    try {
      payload = await decrypt(session);
    } catch (e) {
      // Invalid session, clear it
      const response = NextResponse.next();
      response.cookies.delete('session');
      return response;
    }
  }

  // 1. If user is on a public route and has a valid session, redirect to their home
  if (isPublicRoute && payload) {
    if (payload.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.nextUrl.origin));
    }
    if (payload.role === 'ONBOARDER') {
      return NextResponse.redirect(new URL('/admin/onboard', request.nextUrl.origin));
    }
    if (payload.role === 'DONOR') {
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin));
    }
  }

  // 2. If user is NOT on a public route and HAS NO session, redirect to login
  if (!isPublicRoute && !payload) {
    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.nextUrl.origin));
    }
    return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
  }

  // 3. RBAC checks for authenticated users on protected routes
  if (payload) {
    // Admin routes
    if (path.startsWith('/admin')) {
      if (payload.role === 'ADMIN') {
        return NextResponse.next();
      }
      if (payload.role === 'ONBOARDER') {
        if (path === '/admin/onboard') {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/admin/onboard', request.nextUrl.origin));
      }
      // If not admin or onboarder, kick to donor dashboard if they are a donor
      if (payload.role === 'DONOR') {
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin));
      }
    }

    // Donor routes
    if (path.startsWith('/dashboard')) {
      if (payload.role === 'DONOR') {
        return NextResponse.next();
      }
      // If not donor, kick to their respective home
      if (payload.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.nextUrl.origin));
      }
      if (payload.role === 'ONBOARDER') {
        return NextResponse.redirect(new URL('/admin/onboard', request.nextUrl.origin));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
