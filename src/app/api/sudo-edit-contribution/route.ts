import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import { verifySudoToken, logAction } from '@/lib/sudo-auth';

export async function POST(request: NextRequest) {
  if (!await verifySudoToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, amount } = await request.json();

  const updated = await prisma.contribution.update({
    where: { id },
    data: { amount },
  });

  await logAction('SuperAdmin', 'Edited Contribution', id, `Amount: ${amount}`);

  return NextResponse.json(updated);
}