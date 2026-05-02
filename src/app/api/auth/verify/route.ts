import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { comparePin, hashPassword, comparePassword } from '@/lib/password';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { logActivity } from '@/lib/logger';
import { checkRateLimit, getClientKey } from '@/lib/rate-limit';
import { sanitizePhoneNumber } from '@/lib/sanitize';
import { SignJWT } from 'jose';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Cannot start server.');
}
const secret = new TextEncoder().encode(jwtSecret);

export async function POST(request: Request) {
  const clientKey = getClientKey(request as any);
  const rateLimitId = `verify:${clientKey}`;
  
  if (process.env.NODE_ENV === 'production' && !checkRateLimit(rateLimitId, 5, 900000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 }
    );
  }

  try {
    const { identifier, credential, role } = await request.json();
    if (!identifier || !credential || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const normalizedIdentifier = identifier.trim();
    const normalizedCredential = credential.trim();

    // SUPERADMIN
    if (role === 'SUPERADMIN' || normalizedIdentifier.toLowerCase() === 'sudo') {
      const superAdmin = await prisma.superAdmin.findFirst();
      if (!superAdmin) {
        // First-time setup
        if (normalizedCredential.length < 3) {
          return NextResponse.json({ error: 'Passphrase too short for setup' }, { status: 400 });
        }
        const hash = await hashPassword(normalizedCredential.toLowerCase().replace(/\s+/g, ' '));
        const created = await prisma.superAdmin.create({ data: { passphrase: hash } });
        
        const userSession = await prisma.userSession.create({
          data: { userRole: 'SUPERADMIN', userId: created.id },
        });

        const token = await new SignJWT({ role: 'SUPERADMIN', sessionId: userSession.sessionId })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('12h')
          .sign(secret);

        const response = NextResponse.json({ success: true, redirectUrl: '/sudo-root' });
        response.cookies.set('sudo_token', token, { 
          httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 43200, sameSite: 'strict', path: '/' 
        });
        return response;
      }

      // Verify passphrase
      const isValid = await comparePassword(normalizedCredential.toLowerCase().replace(/\s+/g, ' '), superAdmin.passphrase);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid passphrase' }, { status: 401 });
      }

      const userSession = await prisma.userSession.create({
        data: { userRole: 'SUPERADMIN', userId: superAdmin.id },
      });

      const token = await new SignJWT({ role: 'SUPERADMIN', sessionId: userSession.sessionId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('12h')
        .sign(secret);

      const response = NextResponse.json({ success: true, redirectUrl: '/sudo-root' });
      response.cookies.set('sudo_token', token, { 
        httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 43200, sameSite: 'strict', path: '/' 
      });
      return response;
    }

    // DONOR
    if (role === 'DONOR') {
      const phone = sanitizePhoneNumber(normalizedIdentifier);
      const donor = await prisma.donor.findUnique({ where: { phone } });
      
      if (!donor) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      
      const isCorrectPin = await comparePin(normalizedCredential, donor.pin);
      if (!isCorrectPin) {
        await logActivity('LOGIN_FAILED', { userId: donor.id, phone, reason: 'INCORRECT_PIN' });
        return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
      }
      if (donor.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'Account not active' }, { status: 403 });
      }

      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const sessionData = { userId: donor.id, role: donor.role, name: donor.name, expires: expires.toISOString() };
      const sessionToken = await encrypt(sessionData);

      const response = NextResponse.json({ success: true, redirectUrl: '/dashboard' });
      response.cookies.set('session', sessionToken, { 
        expires, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' 
      });
      await logActivity('LOGIN_SUCCESS', { userId: donor.id, role: donor.role });
      return response;
    }

    // STAFF (ADMIN, VOLUNTEER, ONBOARDER)
    const staff = await prisma.staff.findUnique({ where: { username: normalizedIdentifier } });
    if (!staff) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    const isCorrectPassword = await comparePassword(normalizedCredential, staff.password);
    if (!isCorrectPassword) {
      await logActivity('LOGIN_FAILED', { userId: staff.id, username: staff.username, reason: 'INCORRECT_PASSWORD' });
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    if (!staff.isActive) {
      return NextResponse.json({ error: 'Account disabled' }, { status: 403 });
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const sessionData = { userId: staff.id, role: staff.role, name: staff.username, expires: expires.toISOString() };
    const sessionToken = await encrypt(sessionData);

    let redirectUrl = '/admin/dashboard';
    if (staff.role === 'VOLUNTEER') redirectUrl = '/admin/onboard'; // Or donors depending on logic, user requested onboard

    const response = NextResponse.json({ success: true, redirectUrl });
    response.cookies.set('session', sessionToken, { 
      expires, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' 
    });
    await logActivity('LOGIN_SUCCESS', { userId: staff.id, role: staff.role });
    return response;

  } catch (error) {
    console.error('[Verify API Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
