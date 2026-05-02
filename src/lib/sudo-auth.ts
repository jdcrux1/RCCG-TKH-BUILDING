import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from './prisma';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Cannot start server.');
}
const secret = new TextEncoder().encode(jwtSecret);

export async function verifySudoToken(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('sudo_token')?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role === 'SUPERADMIN';
  } catch {
    return false;
  }
}

export async function logAction(
  userRole: string,
  actionType: string,
  targetRecordId?: string,
  details?: string
) {
  await prisma.actionLog.create({
    data: {
      userRole,
      actionType,
      targetRecordId,
      details,
    },
  });
}

export async function endSession(sessionId: string) {
  const session = await prisma.userSession.findUnique({ where: { sessionId } });
  if (!session || session.logoutTimestamp) return;

  const duration = Math.round(
    (new Date().getTime() - session.loginTimestamp.getTime()) / 60000
  );

  await prisma.userSession.update({
    where: { sessionId },
    data: {
      logoutTimestamp: new Date(),
      durationMinutes: duration,
    },
  });
}

export async function getActiveSessions() {
  return await prisma.userSession.findMany({
    where: { logoutTimestamp: null },
    orderBy: { loginTimestamp: 'desc' },
  });
}

export async function getActionLogs(limit = 100) {
  return await prisma.actionLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}