import { prisma } from './prisma';
import { getSession } from './auth';

export async function logActivity(action: string, details: any) {
  try {
    const session = await getSession();
    
    await prisma.activityLog.create({
      data: {
        action,
        details: JSON.stringify(details),
        userId: session?.userId || 'SYSTEM',
        userName: session?.name || 'SYSTEM',
      }
    });
  } catch (error) {
    console.error('[ACTIVITY_LOG_ERROR] Failed to log activity:', action, details, error);
  }
}
