import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySudoToken, logAction } from '@/lib/sudo-auth';

export async function POST(request: Request) {
  if (!await verifySudoToken(request as any)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, isActive } = await request.json();

  const staff = await prisma.staff.update({
    where: { id },
    data: { isActive },
  });

  await logAction('SuperAdmin', isActive ? 'Restored Staff' : 'Revoked Staff', id);

  return NextResponse.json(staff);
}