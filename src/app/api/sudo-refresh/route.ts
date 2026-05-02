import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getActiveSessions, getActionLogs } from '@/lib/sudo-auth';
import { verifySudoToken } from '@/lib/sudo-auth';

export async function GET(request: Request) {
  if (!await verifySudoToken(request as any)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [sessions, actionLogs, staff] = await Promise.all([
    getActiveSessions(),
    getActionLogs(100),
    prisma.staff.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  return NextResponse.json({ sessions, actionLogs, staff });
}