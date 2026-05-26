import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

const secretKey = (process.env.JWT_SECRET || 'default-secret') + '-v2-force-logout';
if (!secretKey) throw new Error('JWT_SECRET must be set');
const key = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  id?: string;
  name?: string;
  phone?: string;
  role: string;
  expires?: Date | string;
  [key: string]: any;
};

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionPayload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  
  if (session) {
    try {
      const parsed = await decrypt(session);
      
      // Dynamic Enterprise Session Revocation Check
      if (parsed.sessionId) {
        const dbSession = await prisma.userSession.findUnique({
          where: { sessionId: parsed.sessionId }
        });
        if (!dbSession || dbSession.logoutTimestamp) {
          return null; // Session has been revoked!
        }
      }
      
      return parsed;
    } catch {
      // Fallback below
    }
  }

  // Fallback to sudo_token
  const sudoToken = cookieStore.get('sudo_token')?.value;
  if (sudoToken) {
    try {
      const sudoSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');
      const { payload } = await jwtVerify(sudoToken, sudoSecret);
      return payload; // { role: 'SUPERADMIN', ... }
    } catch {
      return null;
    }
  }

  return null;
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
