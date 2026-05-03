'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/sudo-auth';

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }
}

export async function approvePaymentClaim(claimId: string) {
  try {
    await requireSuperAdmin();

    await prisma.$transaction(async (tx) => {
      const claim = await tx.paymentClaim.findUnique({
        where: { id: claimId },
        include: { donor: true }
      });

      if (!claim || claim.status !== 'PENDING') {
        throw new Error('Claim not found or already processed');
      }

      // 1. Update PaymentClaim status
      await tx.paymentClaim.update({
        where: { id: claimId },
        data: { status: 'APPROVED' }
      });

      // 2. Create verified Contribution ledger entry
      await tx.contribution.create({
        data: {
          donorId: claim.donorId,
          amount: claim.amount,
          date: claim.date,
          reference: `REF-${claim.donor.donorRefId}`,
          narrative: `Bank Claim Approved: ${claim.bankName || 'N/A'}`
        }
      });

      await tx.donor.update({
        where: { id: claim.donorId },
        data: {
          totalContributed: { increment: claim.amount }
        }
      });
    });

    await logAction('SUPERADMIN', 'APPROVE_PAYMENT_CLAIM', claimId);
    revalidatePath('/sudo-root');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Approve claim error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to approve claim' };
  }
}

export async function rejectPaymentClaim(claimId: string) {
  try {
    await requireSuperAdmin();

    await prisma.paymentClaim.update({
      where: { id: claimId },
      data: { status: 'REJECTED' }
    });

    await logAction('SUPERADMIN', 'REJECT_PAYMENT_CLAIM', claimId);
    revalidatePath('/sudo-root');
    return { success: true };
  } catch (error) {
    console.error('Reject claim error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reject claim' };
  }
}
export async function generateMasterReport() {
  try {
    await requireSuperAdmin();

    const donors = await prisma.donor.findMany({
      include: { contributions: true }
    });

    const rows = [
      ['Donor ID', 'Name', 'Phone', 'Tier', 'Total Pledged', 'Total Given', 'Pending Balance']
    ];

    donors.forEach(donor => {
      const pledged = Number(donor.totalPledged) / 100;
      const given = Number(donor.totalContributed) / 100;
      const balance = pledged - given;

      rows.push([
        donor.donorRefId || donor.id.slice(0, 8),
        donor.name,
        donor.phone,
        donor.tier,
        pledged.toFixed(2),
        given.toFixed(2),
        balance.toFixed(2)
      ]);
    });

    await logAction('SUPERADMIN', 'GENERATE_REPORT', 'SYSTEM');
    return { success: true, csv: rows.map(r => r.join(',')).join('\n') };
  } catch (error) {
    console.error('Report generation error:', error);
    throw error;
  }
}

export async function reverseContribution(contributionId: string) {
  try {
    await requireSuperAdmin();

    await prisma.$transaction(async (tx) => {
      const contribution = await tx.contribution.findUnique({
        where: { id: contributionId },
        include: { donor: true }
      });

      if (!contribution) throw new Error('Contribution not found');

      // 1. Deduct from donor's totalContributed
      await tx.donor.update({
        where: { id: contribution.donorId },
        data: {
          totalContributed: { decrement: contribution.amount }
        }
      });

      // 2. Delete the contribution
      await tx.contribution.delete({
        where: { id: contributionId }
      });
    });

    await logAction('SUPERADMIN', 'REVERSE_CONTRIBUTION', contributionId);
    revalidatePath('/sudo-root');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Reverse contribution error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reverse contribution' };
  }
}

export async function updateSystemVariable(key: string, value: string) {
  try {
    await requireSuperAdmin();

    await prisma.systemVariable.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    await logAction('SUPERADMIN', 'UPDATE_SYSTEM_VAR', key, value);
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/sudo-root');
    return { success: true };
  } catch (error) {
    console.error('Update system var error:', error);
    return { success: false, error: 'Failed to update system variable' };
  }
}
