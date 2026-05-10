import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import { verifySudoToken, logAction } from '@/lib/sudo-auth';

export async function POST(request: NextRequest) {
  if (!await verifySudoToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { key, value } = await request.json();

  const systemVar = await prisma.systemVariable.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  await logAction('SuperAdmin', `Updated System Variable`, undefined, `${key}=${value}`);

  return NextResponse.json(systemVar);
}