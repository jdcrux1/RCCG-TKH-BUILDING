import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import { getActiveSessions, getActionLogs } from '@/lib/sudo-auth';
import { verifySudoToken } from '@/lib/sudo-auth';

export async function GET(request: NextRequest) {
  if (!await verifySudoToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [sessions, actionLogs, staff, pledgeRequests] = await Promise.all([
    prisma.userSession.findMany({ orderBy: { loginTimestamp: 'desc' }, take: 100 }),
    prisma.actionLog.findMany({ orderBy: { timestamp: 'desc' }, take: 200 }),
    prisma.staff.findMany(),
    prisma.pledgeRequest.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' } })
  ]);

  return NextResponse.json({ sessions, actionLogs, staff, pledgeRequests });
}