'use server';

import { prisma } from '@/lib/prisma';
import { getTier } from '@/lib/tiers';
import { hashPin, getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { triggerNotification } from '@/lib/comm-engine';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logActivity } from '@/lib/logger';
import { z } from 'zod';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function logout() {
  (await cookies()).set('session', '', { expires: new Date(0) });
  redirect('/');
}

const addDonorSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  monthlyPledge: z.coerce.number().positive(),
  pin: z.string().optional(),
});

export async function addDonor(formData: FormData) {
  const session = await requireAdmin();

  const parsed = addDonorSchema.parse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    monthlyPledge: formData.get('monthlyPledge'),
    pin: formData.get('pin') || undefined,
  });

  const { name, phone, monthlyPledge } = parsed;
  const pin = parsed.pin || Math.floor(1000 + Math.random() * 9000).toString(); // Random 4-digit PIN
  
  const tier = getTier(monthlyPledge);
  const totalPledged = monthlyPledge * 24;
  const hashedPin = await hashPin(pin);

  const donor = await prisma.donor.create({
    data: {
      name,
      phone,
      monthlyPledge,
      totalPledged,
      tier,
      pin: hashedPin,
      role: 'DONOR',
    }
  });

  // Trigger Notification
  await triggerNotification('PLEDGE_CONFIRMATION', donor.id, { pin });

  // Log Activity
  await logActivity('CREATE_DONOR', { donorId: donor.id, name: donor.name, phone: donor.phone, adminId: session.userId });

  revalidatePath('/admin/donors');
}

const logContributionSchema = z.object({
  donorId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  reference: z.string().min(1),
  date: z.string().min(1),
});

export async function logContribution(formData: FormData) {
  const session = await requireAdmin();

  const parsed = logContributionSchema.parse({
    donorId: formData.get('donorId'),
    amount: formData.get('amount'),
    reference: formData.get('reference'),
    date: formData.get('date'),
  });

  const { donorId, amount, reference, date } = parsed;

  const contribution = await prisma.contribution.create({
    data: {
      donorId,
      amount,
      reference,
      date: new Date(date),
    },
    include: { donor: { include: { contributions: true } } }
  });

  // Calculate fulfillment rate for notification
  const totalContributed = contribution.donor.contributions.reduce((sum, c) => sum + c.amount, 0);
  const fulfillmentRate = (totalContributed / contribution.donor.totalPledged) * 100;

  await triggerNotification('CONTRIBUTION_RECEIVED', donorId, {
    amount,
    fulfillmentRate
  });

  // Log Activity
  await logActivity('LOG_CONTRIBUTION', { donorId, amount, reference, adminId: session.userId });

  await recalculateMilestones();

  revalidatePath('/admin/ledger');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/milestones');
  revalidatePath('/dashboard');
}

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

