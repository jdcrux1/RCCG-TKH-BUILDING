'use server';

import { prisma } from '@/lib/prisma';
import { getTier } from '@/lib/tiers';
import { hashPin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { triggerNotification } from '@/lib/comm-engine';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  (await cookies()).set('session', '', { expires: new Date(0) });
  redirect('/');
}

export async function addDonor(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const monthlyPledge = parseFloat(formData.get('monthlyPledge') as string);
  const pin = formData.get('pin') as string || '1234'; // Default PIN
  
  const tier = getTier(monthlyPledge);
  const totalPledged = monthlyPledge * 24;
  const hashedPin = await hashPin(pin);

  const donor = await prisma.donor.create({
    data: {
      name,
      phone,
      email,
      monthlyPledge,
      totalPledged,
      tier,
      pin: hashedPin,
      role: 'DONOR',
    }
  });

  // Trigger Notification
  await triggerNotification('PLEDGE_CONFIRMATION', donor.id, {});

  revalidatePath('/admin/donors');
}

export async function logContribution(formData: FormData) {
  const donorId = formData.get('donorId') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const reference = formData.get('reference') as string;
  const date = formData.get('date') as string;

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

  revalidatePath('/admin/ledger');
  revalidatePath('/admin/dashboard');
}

export async function updateMilestone(formData: FormData) {
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  const currentAmount = parseFloat(formData.get('currentAmount') as string);

  await prisma.milestone.update({
    where: { id },
    data: { status, currentAmount }
  });

  revalidatePath('/admin/milestones');
  revalidatePath('/dashboard');
}
