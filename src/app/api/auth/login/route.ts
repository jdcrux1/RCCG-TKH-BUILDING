import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePin, encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { phone, pin, role } = await request.json();

  const user = await prisma.donor.findUnique({
    where: { phone },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isCorrectPin = await comparePin(pin, user.pin);
  if (!isCorrectPin) {
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
  }

  if (role && user.role !== role) {
    return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
  }

  // Create session
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId: user.id, role: user.role, expires });

  (await cookies()).set('session', session, { expires, httpOnly: true });

  return NextResponse.json({ success: true, role: user.role });
}
