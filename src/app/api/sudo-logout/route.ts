import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { verifySudoToken, endSession } from '@/lib/sudo-auth';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');

export async function POST(request: NextRequest) {
  const cookieStore = await import('next/headers').then(h => h.cookies());
  const token = cookieStore.get('sudo_token')?.value;
  
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.sessionId) {
        await endSession(payload.sessionId as string);
      }
    } catch {
      // Ignore token verification errors during logout, we still want to clear the cookie
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('sudo_token', '', { maxAge: 0, path: '/' });
  response.cookies.set('tkh_session', '', { maxAge: 0, path: '/' });
  return response;
}