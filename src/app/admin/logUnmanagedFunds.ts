'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { recalculateMilestones } from '@/app/admin/actions';
import { logActivity } from '@/lib/logger';
import { nairaToKobo } from '@/lib/tiers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const logUnmanagedSchema = z.object({
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  transferDate: z.string(),
  narration: z.string().optional()
});

export async function logUnmanagedFunds(formData: FormData) {
  try {
    const session = await getSession();
    
    // STRICT ROLE ENFORCEMENT
    if (!session || session.role !== 'SUPERADMIN') {
      throw new Error('Unauthorized. 403 Forbidden: Super Admin privileges required to inject global funds.');
    }

    const parsed = logUnmanagedSchema.parse({
      amount: formData.get('amount'),
      transferDate: formData.get('transferDate'),
      narration: formData.get('narration')
    });

    const { amount, transferDate, narration } = parsed;

    // Identify Global Profile
    const globalProfile = await prisma.donor.findUnique({
      where: { phone: '+00000000000' }
    });

    if (!globalProfile) {
      throw new Error('Global System Profile not found. Please run the seed script.');
    }

    const amountKobo = nairaToKobo(Number(amount));

    // Atomic Execution
    await prisma.$transaction([
      prisma.contribution.create({
        data: {
          donorId: globalProfile.id,
          amount: amountKobo,
          date: new Date(transferDate),
          reference: `FREEWILL-${Date.now()}`,
          narrative: narration || 'Anonymous Freewill Offering',
          isConcierge: true
        }
      }),
      prisma.donor.update({
        where: { id: globalProfile.id },
        data: {
          totalContributed: { increment: amountKobo }
        }
      })
    ]);

    await logActivity('LOG_CONTRIBUTION', { 
      donorId: globalProfile.id, 
      amount: Number(amount), 
      method: 'UNMANAGED_FUNDS', 
      loggedBy: session.name 
    });

    await recalculateMilestones();

    // State Invalidation to trigger real-time updates
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/admin/ledger');

    return { success: true };
  } catch (error: unknown) {
    console.error('Log Unmanaged Funds error:', error);
    throw error;
  }
}
