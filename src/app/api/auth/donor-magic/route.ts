import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Validate token against Donor
    const donor = await prisma.donor.findUnique({
      where: { claimToken: token }
    });

    if (!donor) {
      return NextResponse.redirect(new URL('/login?error=Invalid_Link', request.url));
    }

    if (donor.claimTokenExpires && donor.claimTokenExpires < new Date()) {
      return NextResponse.redirect(new URL('/login?error=Link_Expired', request.url));
    }

    // Create session
    const userSession = await prisma.userSession.create({
      data: { userRole: donor.role, userId: donor.id }
    });

    const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days session
    const sessionData = { 
      id: donor.id,
      userId: donor.id, 
      role: donor.role, 
      name: donor.name, 
      phone: donor.phone,
      expires: expires.toISOString(),
      sessionId: userSession.sessionId 
    };
    const sessionToken = await encrypt(sessionData);

    await logActivity('LOGIN_SUCCESS', { userId: donor.id, role: donor.role, note: 'DONOR_MAGIC_LINK_USED' });

    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('session', sessionToken, { 
      expires, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', // Lax sameSite allows automatic login on redirect from WhatsApp
      path: '/' 
    });

    return response;
  } catch (error) {
    console.error('[Donor Magic Link API Error]', error);
    return NextResponse.redirect(new URL('/login?error=Server_Error', request.url));
  }
}
