import { prisma } from './prisma';
import { getSession } from './auth';

export async function logActivity(action: string, details: Record<string, unknown>) {
  try {
    const session = await getSession();
    
    await prisma.activityLog.create({
      data: {
        action,
        details: details as any, // Prisma Json field
        userId: session?.userId || 'SYSTEM',
        userName: session?.name || 'SYSTEM',
      }
    });
  } catch (error: unknown) {
    console.error('[ACTIVITY_LOG_ERROR] Failed to log activity:', action, details, error);
  }
}
