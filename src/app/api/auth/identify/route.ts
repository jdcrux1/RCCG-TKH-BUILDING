import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientKey } from '@/lib/rate-limit';
import { sanitizePhoneNumber } from '@/lib/sanitize';

export async function POST(request: Request) {
  const clientKey = getClientKey(request as any);
  const rateLimitId = `identify:${clientKey}`;
  
  if (process.env.NODE_ENV === 'production' && !checkRateLimit(rateLimitId, 10, 900000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429 }
    );
  }

  try {
    const { identifier } = await request.json();
    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ error: 'Identifier is required' }, { status: 400 });
    }

    const normalized = identifier.trim();
    
    if (normalized.toLowerCase() === 'sudo') {
      return NextResponse.json({ role: 'SUPERADMIN' });
    }

    const staff = await prisma.staff.findUnique({
      where: { username: normalized },
    });

    if (staff) {
      if (!staff.isActive) {
        return NextResponse.json({ error: 'Account disabled' }, { status: 403 });
      }
      return NextResponse.json({ role: staff.role });
    }

    const phone = sanitizePhoneNumber(normalized);
    const donor = await prisma.donor.findUnique({
      where: { phone },
    });

    if (donor) {
      if (donor.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'Account not active' }, { status: 403 });
      }
      return NextResponse.json({ role: donor.role }); // Usually 'DONOR'
    }

    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  } catch (error) {
    console.error('[Identify API Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
