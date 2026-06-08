'use server';

import { prisma } from '@/lib/prisma';
import { sanitizePhoneNumber } from '@/lib/sanitize';

export async function submitFastTrackSeed(formData: FormData) {
  try {
    const rawPhone = formData.get('phone') as string;
    const rawAmount = formData.get('amount') as string;
    const rawDate = formData.get('date') as string;
    const rawBank = formData.get('bankName') as string;

    if (!rawPhone || !rawAmount || !rawDate) {
      return { success: false, error: 'Please provide phone number, amount, and date.' };
    }

    const phone = sanitizePhoneNumber(rawPhone);
    const amountKobo = BigInt(Math.round(parseFloat(rawAmount) * 100));

    // Look up the donor securely
    const donor = await prisma.donor.findUnique({
      where: { phone }
    });

    if (!donor) {
      // Don't leak that the account doesn't exist to prevent enumeration. 
      // Instead, we just say we couldn't match it and they should check the number.
      return { success: false, error: 'Could not match this phone number to an active Kingdom Builder profile. Please check the number.' };
    }

    // Check if there is an exact duplicate claim already pending to prevent spam
    const existingClaim = await prisma.paymentClaim.findFirst({
      where: {
        donorId: donor.id,
        amount: amountKobo,
        date: new Date(rawDate),
        status: 'PENDING'
      }
    });

    if (existingClaim) {
      return { success: false, error: 'A claim for this exact amount and date is already pending verification.' };
    }

    // Create the claim
    await prisma.paymentClaim.create({
      data: {
        donorId: donor.id,
        amount: amountKobo,
        date: new Date(rawDate),
        bankName: rawBank || null,
        status: 'PENDING'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('[Fast-Track Seed Error]', error);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}
