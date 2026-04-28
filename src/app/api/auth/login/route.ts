import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePin, encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { logActivity } from '@/lib/logger';

export async function POST(request: Request) {
  const { phone, pin, role } = await request.json();

  const user = await prisma.donor.findUnique({
    where: { phone },
  });

  if (!user) {
    await logActivity('LOGIN_FAILED', { phone, reason: 'USER_NOT_FOUND' });
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isCorrectPin = await comparePin(pin, user.pin);
  if (!isCorrectPin) {
    await logActivity('LOGIN_FAILED', { userId: user.id, phone, reason: 'INCORRECT_PIN' });
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
  }

  if (role && user.role !== role) {
    await logActivity('LOGIN_FAILED', { userId: user.id, phone, reason: 'UNAUTHORIZED_ROLE' });
    return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
  }

  // Create session
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const sessionData = { userId: user.id, role: user.role, name: user.name, expires };
  const session = await encrypt(sessionData);

  (await cookies()).set('session', session, { expires, httpOnly: true });

  await logActivity('LOGIN_SUCCESS', { userId: user.id, role: user.role });

  return NextResponse.json({ success: true, role: user.role });
}
