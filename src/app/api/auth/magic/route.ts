import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { comparePassword } from '@/lib/password';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Validate token against Staff
    const staff = await prisma.staff.findUnique({
      where: { magicToken: token }
    });

    if (!staff) {
      return NextResponse.redirect(new URL('/login?error=Invalid_Link', request.url));
    }

    if (!staff.isActive) {
      return NextResponse.redirect(new URL('/login?error=Account_Disabled', request.url));
    }

    // Create session
    const userSession = await prisma.userSession.create({
      data: { userRole: staff.role, userId: staff.id }
    });

    const expires = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
    const sessionData = { 
      userId: staff.id, 
      role: staff.role, 
      name: staff.username, 
      expires: expires.toISOString(),
      sessionId: userSession.sessionId
    };
    
    const sessionToken = await encrypt(sessionData);

    await logActivity('LOGIN_SUCCESS', { userId: staff.id, role: staff.role, note: 'MAGIC_LINK_USED' });

    let redirectUrl = '/admin/dashboard';
    if (staff.role === 'EXECUTIVE') {
      redirectUrl = '/executive';
    }

    const response = NextResponse.redirect(new URL(redirectUrl, request.url));
    response.cookies.set('session', sessionToken, { 
      expires, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', // Must be lax for cross-site redirects (e.g. from whatsapp to open the app)
      path: '/' 
    });

    return response;
  } catch (error) {
    console.error('[Magic Link API Error]', error);
    return NextResponse.redirect(new URL('/login?error=Server_Error', request.url));
  }
}
