import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import { verifySudoToken, logAction } from '@/lib/sudo-auth';

export async function POST(request: NextRequest) {
  if (!await verifySudoToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  await prisma.contribution.delete({ where: { id } });

  await logAction('SuperAdmin', 'Deleted Contribution', id);

  return NextResponse.json({ success: true });
}