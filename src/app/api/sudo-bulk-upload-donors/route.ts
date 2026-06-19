import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import { verifySudoToken } from '@/lib/sudo-auth';
import { hashPin } from '@/lib/password';
import { sanitizePhoneNumber, toTitleCase } from '@/lib/sanitize';
import crypto from 'crypto';
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  if (!await verifySudoToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { donors } = await request.json();

    if (!donors || !Array.isArray(donors)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const results = [];
    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    // Get current count to generate sequence IDs securely
    let currentCount = await prisma.donor.count();

    for (const d of donors) {
      try {
        if (!d.name || !d.phone) {
          errorCount++;
          continue;
        }

        const sanitizedPhone = sanitizePhoneNumber(String(d.phone));
        const sanitizedName = toTitleCase(String(d.name).trim());

        if (sanitizedPhone.length < 10) {
          errorCount++;
          continue;
        }

        const existing = await prisma.donor.findUnique({
          where: { phone: sanitizedPhone }
        });

        if (existing) {
          duplicateCount++;
          continue;
        }

        currentCount++;
        const donorRefId = `KB-${currentCount.toString().padStart(3, '0')}`;
        const claimToken = crypto.randomBytes(32).toString('hex');
        const claimTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await prisma.donor.create({
          data: {
            name: sanitizedName,
            phone: sanitizedPhone,
            donorRefId,
            pin: null,
            tier: 'SUPPORTER',
            monthlyPledge: BigInt(0),
            totalPledged: BigInt(0),
            role: 'DONOR',
            isClaimed: false,
            claimToken,
            claimTokenExpires
          }
        });

        results.push({
          name: sanitizedName,
          phone: sanitizedPhone,
          donorRefId,
          claimToken,
          tier: 'SUPPORTER'
        });

        successCount++;
      } catch (err) {
        console.error(err);
        errorCount++;
      }
    }

    if (successCount > 0) {
      revalidatePath('/admin/donors');
    }

    return NextResponse.json({ 
      success: true, 
      successCount, 
      duplicateCount, 
      errorCount,
      results
    });

  } catch (error) {
    console.error('Bulk upload donors error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
