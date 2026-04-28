import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const donor = await prisma.donor.findFirst({
    where: { role: 'DONOR' }
  });

  if (!donor) {
    return NextResponse.json({ error: 'No donor found' }, { status: 404 });
  }

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ 
    userId: donor.id, 
    name: donor.name, 
    role: 'DONOR',
    expires 
  });

  (await cookies()).set('session', session, { expires, httpOnly: true });

  return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin));
}
