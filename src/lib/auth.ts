import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
const secretKey = (process.env.JWT_SECRET || 'default-secret') + '-v2-force-logout';
if (!secretKey) throw new Error('JWT_SECRET must be set');
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  
  if (session) {
    try {
      return await decrypt(session);
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
  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
