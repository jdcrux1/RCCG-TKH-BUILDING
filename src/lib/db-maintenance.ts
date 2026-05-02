import { prisma } from '@/lib/prisma';

export async function pruneOldLogs() {
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [logsDeleted, sessionsDeleted] = await Promise.all([
    prisma.actionLog.deleteMany({
      where: { timestamp: { lte: cutoffDate } },
    }),
    prisma.userSession.deleteMany({
      where: { logoutTimestamp: { lte: cutoffDate } },
    }),
  ]);

  console.log(`[DB Maintenance] Pruned ${logsDeleted.count} action logs, ${sessionsDeleted.count} old sessions`);
  return { logsDeleted: logsDeleted.count, sessionsDeleted: sessionsDeleted.count };
}

export async function runMaintenance() {
  try {
    const pruneResult = await pruneOldLogs();
    return { ...pruneResult };
  } catch (error) {
    console.error('[DB Maintenance] Error:', error);
    throw error;
  }
}