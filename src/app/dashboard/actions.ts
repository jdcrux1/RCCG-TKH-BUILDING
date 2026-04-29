'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { triggerNotification } from '@/lib/comm-engine';

const selfRecordContributionSchema = z.object({
  donorId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  date: z.string().min(1),
});

export async function selfRecordContribution(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const parsed = selfRecordContributionSchema.parse({
    donorId: formData.get('donorId'),
    amount: formData.get('amount'),
    date: formData.get('date'),
  });

  const { donorId, amount, date } = parsed;

  // Verify the user is recording for themselves
  if (session.userId !== donorId) {
    throw new Error('Unauthorized');
  }

  // Create contribution flagged as self-reported
  await prisma.contribution.create({
    data: {
      donorId,
      amount,
      date: new Date(date),
      reference: 'SELF_REPORTED',
      narrative: 'Awaiting Admin Verification',
    }
  });

  // Calculate new milestones?
  // We can choose to recalculate milestones now, or wait until admin verifies.
  // For now, let's recalculate so they see immediate impact on their dashboard.
  await recalculateMilestones();

  revalidatePath('/dashboard');
  revalidatePath('/admin/ledger');
}

// Duplicated recalculate logic here since it's not exported from admin/actions.ts
// In a real app, this should be moved to a shared lib/milestones.ts
async function recalculateMilestones() {
  const sumResult = await prisma.contribution.aggregate({
    _sum: { amount: true }
  });
  let remainingAmount = sumResult._sum.amount || 0;

  const milestones = await prisma.milestone.findMany({
    orderBy: { order: 'asc' }
  });

  for (const m of milestones) {
    let currentAmount = 0;
    let status = 'PENDING';

    if (remainingAmount >= m.targetAmount) {
      currentAmount = m.targetAmount;
      status = 'FUNDED';
      remainingAmount -= m.targetAmount;
    } else if (remainingAmount > 0) {
      currentAmount = remainingAmount;
      status = 'IN_PROGRESS';
      remainingAmount = 0;
    }

    if (m.currentAmount !== currentAmount || m.status !== status) {
      await prisma.milestone.update({
        where: { id: m.id },
        data: { currentAmount, status }
      });
    }
  }
}
