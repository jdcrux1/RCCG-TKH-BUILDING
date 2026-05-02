export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySudoToken, logAction } from '@/lib/sudo-auth';

export async function POST(request: Request) {
  if (!await verifySudoToken(request as any)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  await prisma.contribution.delete({ where: { id } });

  await logAction('SuperAdmin', 'Deleted Contribution', id);

  return NextResponse.json({ success: true });
}