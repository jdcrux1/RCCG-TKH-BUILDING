'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { nairaToKobo } from '@/lib/tiers';

const paymentClaimSchema = z.object({
  amount: z.coerce.number().min(1, 'Amount is required').max(100000000),
  date: z.string().min(1, 'Date is required'),
  bankName: z.string().min(1, 'Bank name is required'),
});

export async function submitPaymentClaim(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'DONOR') {
      throw new Error('Unauthorized');
    }

    const parsed = paymentClaimSchema.parse({
      amount: formData.get('amount'),
      date: formData.get('date'),
      bankName: formData.get('bankName'),
    });

    const { amount, date, bankName } = parsed;
    const amountKobo = nairaToKobo(amount);

    await prisma.paymentClaim.create({
      data: {
        donorId: session.userId,
        amount: amountKobo,
        date: new Date(date),
        bankName,
        status: 'PENDING',
      },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Submit payment claim error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Something went wrong' };
  }
}
