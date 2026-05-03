'use server';

import { prisma } from '@/lib/prisma';
import { getTier, generateSecurePin, nairaToKobo, isValidTier } from '@/lib/tiers';
import { hashPin } from '@/lib/password';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { triggerNotification } from '@/lib/comm-engine';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logActivity } from '@/lib/logger';
import { sanitizePhoneNumber, toTitleCase } from '@/lib/sanitize';
import { z } from 'zod';
import crypto from 'crypto';

async function requireAdmin() {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
    throw new Error('Unauthorized');
  }
  return session;
}

async function requireAdminOrOnboarder() {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'ONBOARDER' && session.role !== 'SUPERADMIN' && session.role !== 'VOLUNTEER')) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', { expires: new Date(0) });
  cookieStore.set('sudo_token', '', { expires: new Date(0) });
  redirect('/login');
}

// ZOD VALIDATION
const addDonorSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  phone: z.string().min(10, 'Phone number is required'),
  monthlyPledge: z.coerce.number()
    .min(5000, 'Minimum pledge is ₦5,000')
    .max(100000000, 'Maximum pledge is ₦100,000,000'),
});

type AddDonorInput = z.infer<typeof addDonorSchema>;

// IDEMPOTENCY CHECK
async function checkIdempotency(phone: string): Promise<boolean> {
  const thirtySecondsAgo = new Date(Date.now() - 30000);
  const recentDonor = await prisma.donor.findFirst({
    where: { phone, createdAt: { gte: thirtySecondsAgo } },
  });
  return !!recentDonor;
}

// Sequential Reference Generation
async function generateDonorRefId() {
  const count = await prisma.donor.count();
  return `KB-${(count + 1).toString().padStart(3, '0')}`;
}

// ADD DONOR
export async function addDonor(formData: FormData) {
  try {
    const session = await requireAdminOrOnboarder();
    const parsed = addDonorSchema.parse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      monthlyPledge: formData.get('monthlyPledge'),
    });

    const { name, phone, monthlyPledge } = parsed;
    const sanitizedPhone = sanitizePhoneNumber(phone);
    const sanitizedName = toTitleCase(name.trim());

    const isDuplicate = await checkIdempotency(sanitizedPhone);
    if (isDuplicate) {
      throw new Error('Duplicate submission detected');
    }

    const existing = await prisma.donor.findUnique({ where: { phone: sanitizedPhone } });
    if (existing) {
      throw new Error('Donor with this phone already exists');
    }

    const donorRefId = await generateDonorRefId();
    const donorPin = crypto.randomInt(1000, 10000).toString();
    const monthlyPledgeKobo = nairaToKobo(monthlyPledge);
    const totalPledgedKobo = monthlyPledgeKobo * BigInt(24);
    const tier = getTier(monthlyPledge);

    if (totalPledgedKobo > BigInt(2500000000)) {
      throw new Error('Total pledge exceeds maximum');
    }

    const hashedPin = await hashPin(donorPin);

    const donor = await prisma.donor.create({
      data: {
        name: sanitizedName,
        phone: sanitizedPhone,
        monthlyPledge: monthlyPledgeKobo,
        totalPledged: totalPledgedKobo,
        tier,
        donorRefId,
        pin: hashedPin,
        role: 'DONOR',
      },
    });

    // UPDATED WHATSAPP PAYLOAD
    const loginUrl = 'https://rccg-tkh-building.vercel.app/login';
    const message = `Hello ${sanitizedName.split(' ')[0]}, you've been invited to the Kingdom Builders portal!\n\nLog in with your phone: ${sanitizedPhone}\nYour unique login PIN: ${donorPin}\n\nVisit: ${loginUrl}\n\nIMPORTANT: When making bank transfers, you MUST use your unique Donor ID (${donorRefId}) in the transfer narration/description.`;

    await triggerNotification('PLEDGE_CONFIRMATION', donor.id, { 
      pin: donorPin,
      donorRefId,
      customMessage: message 
    });
    await logActivity('CREATE_DONOR', {
      donorId: donor.id,
      name: sanitizedName,
      phone: sanitizedPhone,
      pin: donorPin,
      tier,
    });

    revalidatePath('/admin/donors');
  } catch (error: unknown) {
    console.error('Add donor error:', error);
    throw error;
  }
}

// CONTRIBUTION LOGGING - ATOMIC TRANSACTION
const logContributionSchema = z.object({
  donorId: z.string().uuid(),
  amount: z.coerce.number().min(1).max(1000000000),
  reference: z.string().max(100).optional().or(z.literal('')),
  date: z.string(),
});

export async function logContribution(formData: FormData) {
  try {
    const session = await requireAdmin();
    const parsed = logContributionSchema.parse({
      donorId: formData.get('donorId'),
      amount: formData.get('amount'),
      reference: formData.get('reference'),
      date: formData.get('date'),
    });

    const { donorId, amount, reference, date } = parsed;
    const amountKobo = nairaToKobo(amount);

    // ATOMIC TRANSACTION: Both operations succeed or both fail
    await prisma.$transaction([
      prisma.contribution.create({
        data: { donorId, amount: amountKobo, reference, date: new Date(date) },
      }),
      prisma.donor.update({
        where: { id: donorId },
        data: {
          status: 'ACTIVE', // Ensure donor is active
        },
      }),
    ]);

    await logActivity('LOG_CONTRIBUTION', { donorId, amount: amountKobo, reference });
    await recalculateMilestones();

    // Revalidate all affected routes
    revalidatePath('/admin/ledger');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/milestones');
    revalidatePath('/dashboard');
    revalidatePath('/admin/donors');
  } catch (error: unknown) {
    console.error('Log contribution error:', error);
    throw error;
  }
}

// UPDATE DONOR STATUS (e.g., Welcome Sent)
export async function updateDonorStatus(donorId: string, newStatus: string) {
  try {
    const session = await requireAdmin();
    
    await prisma.donor.update({
      where: { id: donorId },
      data: { status: newStatus as any },
    });

    await logActivity('UPDATE_DONOR_STATUS', { donorId, newStatus });

    revalidatePath('/admin/donors');
    revalidatePath('/admin/dashboard');
  } catch (error: unknown) {
    console.error('Update donor status error:', error);
    throw error;
  }
}

// RECALCULATE MILESTONES
async function recalculateMilestones() {
  const sumResult = await prisma.contribution.aggregate({ _sum: { amount: true } });
  let remainingAmount = BigInt(sumResult._sum.amount || 0);

  const milestones = await prisma.milestone.findMany({ orderBy: { order: 'asc' } });

  for (const m of milestones) {
    let currentAmount = BigInt(0);
    let status = 'PENDING';

    if (remainingAmount >= m.targetAmount) {
      currentAmount = m.targetAmount;
      status = 'FUNDED';
      remainingAmount -= m.targetAmount;
    } else if (remainingAmount > BigInt(0)) {
      currentAmount = remainingAmount;
      status = 'IN_PROGRESS';
      remainingAmount = BigInt(0);
    }

    if (m.currentAmount !== currentAmount || m.status !== status) {
      await prisma.milestone.update({
        where: { id: m.id },
        data: { currentAmount, status: status as any },
      });
    }
  }
}