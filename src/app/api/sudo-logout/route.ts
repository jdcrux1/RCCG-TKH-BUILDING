import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { verifySudoToken, endSession } from '@/lib/sudo-auth';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');

export async function POST(request: Request) {
  if (!await verifySudoToken(request as any)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cookieStore = await import('next/headers').then(h => h.cookies());
  const token = cookieStore.get('sudo_token')?.value;
  
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.sessionId) {
        await endSession(payload.sessionId as string);
      }
    } catch {}
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('sudo_token', '', { maxAge: 0, path: '/' });
  return response;
}