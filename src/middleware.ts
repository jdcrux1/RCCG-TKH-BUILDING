import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';
import { jwtVerify } from 'jose';

// Valid roles from schema
const ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  VOLUNTEER: 'VOLUNTEER',
  ADMIN: 'ADMIN',
  ONBOARDER: 'ONBOARDER',
  DONOR: 'DONOR',
} as const;

type Role = typeof ROLES[keyof typeof ROLES];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
];

// API routes that are always public
const PUBLIC_API_ROUTES = [
  '/api/auth/identify',
  '/api/auth/verify',
  '/api/cron/maintenance',
  '/api/sudo-refresh',
];

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.includes(path) || 
         PUBLIC_API_ROUTES.includes(path);
}

function requiresSuperAdmin(path: string): boolean {
  return path === '/sudo-root' || path.startsWith('/api/sudo');
}

function requiresAdminAccess(path: string): boolean {
  return path.startsWith('/admin');
}

export default async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const sudoToken = request.cookies.get('sudo_token')?.value;
  const path = request.nextUrl.pathname;

  const origin = request.nextUrl.origin;

  // 1. Handle Super Admin routes
  if (requiresSuperAdmin(path)) {
    // Allow public sudo API unauthenticated access (if needed, but identify/verify handle it)
    if (path.startsWith('/api/sudo-refresh')) {
      return NextResponse.next();
    }
    
    // Validate sudo token
    if (sudoToken) {
      try {
        const jwtSecret = process.env.JWT_SECRET;
        if (jwtSecret) {
          const secret = new TextEncoder().encode(jwtSecret);
          const { payload } = await jwtVerify(sudoToken, secret);
          
          if (payload.role === ROLES.SUPERADMIN) {
            return NextResponse.next();
          }
          
          // RBAC: Non-SuperAdmin trying to access sudo routes = forbidden
          return NextResponse.json(
            { error: 'Forbidden: SuperAdmin access required' },
            { status: 403 }
          );
        }
      } catch {
        // Invalid token, redirect to unified login
      }
    }
    
    // Redirect to unified login
    return NextResponse.redirect(new URL('/login', origin));
  }

  // 2. Handle session-based authentication
  let payload = null;
  if (session) {
    try {
      payload = await decrypt(session);
    } catch {
      // Invalid session - clear and continue (will redirect below)
      const response = NextResponse.next();
      response.cookies.delete('session');
      return response;
    }
  } else if (sudoToken) {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload: sudoPayload } = await jwtVerify(sudoToken, secret);
        if (sudoPayload.role === ROLES.SUPERADMIN) {
          payload = sudoPayload;
        }
      }
    } catch {
      // Invalid sudo token, let it be null
    }
  }

  // 3. Public routes: redirect authenticated users to their dashboard
  if (path === '/login' && payload) {
    const role = payload.role;
    
    if (role === ROLES.ADMIN || role === ROLES.VOLUNTEER) {
      return NextResponse.redirect(new URL('/admin/dashboard', origin));
    }
    if (role === ROLES.ONBOARDER) {
      return NextResponse.redirect(new URL('/admin/onboard', origin));
    }
    if (role === ROLES.DONOR) {
      return NextResponse.redirect(new URL('/dashboard', origin));
    }
  }

  // 4. Protected routes: require authentication
  if (!isPublicRoute(path) && !payload) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  // 5. RBAC: Role-based access control
  if (payload) {
    const role = payload.role;

    // Admin/Committee/Volunteer routes
    if (requiresAdminAccess(path)) {
      // SuperAdmin can access admin dashboard
      if (role === ROLES.SUPERADMIN) {
        return NextResponse.next();
      }
      // Admin can access all admin routes
      if (role === ROLES.ADMIN) {
        return NextResponse.next();
      }
      // Volunteer (limited access)
      if (role === ROLES.VOLUNTEER) {
        // Volunteers can only access specific routes
        const volunteerAllowed = ['/admin/donors', '/admin/ledger', '/admin/onboard'];
        const isAllowed = volunteerAllowed.some(r => path.startsWith(r));
        if (isAllowed) {
          return NextResponse.next();
        }
        // Otherwise redirect to donors list
        return NextResponse.redirect(new URL('/admin/donors', origin));
      }
      // ONBOARDER can only access onboard
      if (role === ROLES.ONBOARDER) {
        if (path === '/admin/onboard') {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/admin/onboard', origin));
      }
      // DONOR cannot access admin - redirect to donor dashboard
      if (role === ROLES.DONOR) {
        return NextResponse.redirect(new URL('/dashboard', origin));
      }
    }

    // Donor dashboard routes
    if (path.startsWith('/dashboard')) {
      if (role === ROLES.DONOR) {
        return NextResponse.next();
      }
      // Non-donors redirect to their appropriate dashboard
      if (role === ROLES.ADMIN || role === ROLES.VOLUNTEER || role === ROLES.ONBOARDER) {
        return NextResponse.redirect(new URL('/admin/dashboard', origin));
      }
      if (role === ROLES.SUPERADMIN) {
        return NextResponse.redirect(new URL('/sudo-root', origin));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};