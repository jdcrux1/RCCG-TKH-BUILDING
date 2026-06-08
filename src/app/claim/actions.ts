'use server';

import { prisma } from '@/lib/prisma';
import { hashPin } from '@/lib/password';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function claimAccount(token: string, pin: string) {
  if (!token || !pin) throw new Error('Invalid submission');

  const donor = await prisma.donor.findUnique({
    where: { claimToken: token }
  });

  if (!donor || donor.isClaimed || !donor.claimTokenExpires || donor.claimTokenExpires < new Date()) {
    throw new Error('Invalid or expired token');
  }

  // Hash pin
  const hashedPin = await hashPin(pin);

  // Update DB
  const updatedDonor = await prisma.donor.update({
    where: { id: donor.id },
    data: {
      pin: hashedPin,
      isClaimed: true,
      claimToken: null,
      claimTokenExpires: null,
      status: 'ACTIVE'
    }
  });

  // Create session
  const newSession = await prisma.userSession.create({
    data: {
      userRole: updatedDonor.role,
      userId: updatedDonor.id
    }
  });

  const sessionPayload = {
    id: updatedDonor.id,
    userId: updatedDonor.id,
    name: updatedDonor.name,
    phone: updatedDonor.phone,
    role: updatedDonor.role,
    sessionId: newSession.sessionId,
  };

  const encryptedSession = await encrypt(sessionPayload);
  const cookieStore = await cookies();
  cookieStore.set('session', encryptedSession, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 2 * 60 * 60 });

  return { success: true };
}
