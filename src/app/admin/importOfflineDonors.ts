'use server';

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';
import { getTier, nairaToKobo } from '@/lib/tiers';
import { sanitizePhoneNumber, toTitleCase } from '@/lib/sanitize';
import { revalidatePath } from 'next/cache';

// Helper to strip scripts and html tags for XSS prevention
function stripHtml(input: string) {
  return input.replace(/<[^>]*>?/gm, '').trim();
}

export async function importOfflineDonors(donors: any[]) {
  const session = await getSession();
  
  // Strict Role Enforcement (Reject at server level)
  if (!session || session.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized. Only Super Admins can perform bulk imports.');
  }

  if (!Array.isArray(donors) || donors.length === 0) {
    throw new Error('Invalid or empty payload.');
  }

  const phoneSet = new Set<string>();
  const processedData = [];

  const count = await prisma.donor.count();
  let baseId = count + 1;

  for (const [index, row] of donors.entries()) {
    const rawName = row.name || '';
    const rawPhone = row.phone || '';
    
    if (!rawName || !rawPhone) {
      throw new Error(`Row ${index + 1} is missing a Name or Phone number.`);
    }

    // Input Sanitization
    const sanitizedName = toTitleCase(stripHtml(rawName));
    const sanitizedPhone = sanitizePhoneNumber(rawPhone);

    // In-batch duplicate detection
    if (phoneSet.has(sanitizedPhone)) {
      throw new Error(`Duplicate phone number detected within the CSV at row ${index + 1}: ${sanitizedPhone}`);
    }
    phoneSet.add(sanitizedPhone);

    const monthlyPledgeAmount = Number(row.monthlyPledge);
    if (isNaN(monthlyPledgeAmount) || monthlyPledgeAmount < 0) {
      throw new Error(`Row ${index + 1} has an invalid pledge amount. Only numerical values allowed (e.g. 100000).`);
    }

    // High Entropy Cryptographic Token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
    const donorRefId = `KB-${baseId.toString().padStart(3, '0')}`;
    baseId++;

    const monthlyPledgeKobo = nairaToKobo(monthlyPledgeAmount);
    const totalPledgedKobo = monthlyPledgeKobo * BigInt(24);
    const tier = getTier(monthlyPledgeAmount);

    processedData.push({
      name: sanitizedName,
      phone: sanitizedPhone,
      pin: null, // shell account
      donorRefId,
      tier,
      monthlyPledge: monthlyPledgeKobo,
      totalPledged: totalPledgedKobo,
      isClaimed: false,
      claimToken: token,
      claimTokenExpires: expires,
      role: 'DONOR'
    });
  }

  // Pre-check for existing DB duplicates
  const existingPhones = await prisma.donor.findMany({
    where: { phone: { in: Array.from(phoneSet) } },
    select: { phone: true }
  });

  if (existingPhones.length > 0) {
    const duplicates = existingPhones.map(e => e.phone).join(', ');
    throw new Error(`Database Integrity Error: The following phone numbers already exist in the system and cannot be imported again: ${duplicates}`);
  }

  // All-or-Nothing Commit with Chunking
  const chunkSize = 1000;
  
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < processedData.length; i += chunkSize) {
      const chunk = processedData.slice(i, i + chunkSize);
      await tx.donor.createMany({
        data: chunk
      });
    }
  }, {
    timeout: 30000 // Extended timeout to handle large bulk imports securely
  });

  // Map processed data for UI confirmation
  const results = processedData.map(d => ({
    name: d.name,
    phone: d.phone,
    claimToken: d.claimToken,
    donorRefId: d.donorRefId,
    tier: d.tier,
    status: 'SUCCESS'
  }));

  revalidatePath('/admin/donors');
  revalidatePath('/admin/bulk-import');
  return { success: true, results };
}
