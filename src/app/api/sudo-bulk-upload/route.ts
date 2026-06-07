import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import { verifySudoToken } from '@/lib/sudo-auth';
import { nairaToKobo } from '@/lib/tiers';
import { recalculateMilestones } from '@/app/admin/actions';
import crypto from 'crypto';
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  if (!await verifySudoToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { transactions } = await request.json();

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    for (const txn of transactions) {
      try {
        const { date, amount, narrative, donorId } = txn;
        
        if (!donorId || !amount || !date) {
          errorCount++;
          continue;
        }

        const amtNumber = Number(amount);
        if (isNaN(amtNumber) || amtNumber <= 0) {
          errorCount++;
          continue;
        }

        const amountKobo = nairaToKobo(amtNumber);
        
        // Generate unique hash to prevent duplicates: SHA256(Date(YYYY-MM-DD) + AmountKobo + CleanNarrative)
        const dateStr = new Date(date).toISOString().split('T')[0];
        const cleanNarrative = String(narrative || '').trim().toLowerCase();
        const rawString = `${dateStr}_${amountKobo.toString()}_${cleanNarrative}`;
        const hash = crypto.createHash('sha256').update(rawString).digest('hex');
        const reference = `bulk_${hash}`;

        // Check for duplicates
        const existing = await prisma.contribution.findFirst({
          where: { reference }
        });

        if (existing) {
          duplicateCount++;
          continue;
        }

        // Execute transaction securely
        await prisma.$transaction([
          prisma.contribution.create({
            data: {
              donorId,
              amount: amountKobo,
              reference,
              narrative: `Bulk Upload: ${narrative || 'Bank Transfer'}`,
              isConcierge: true,
              date: new Date(date)
            }
          }),
          prisma.donor.update({
            where: { id: donorId },
            data: {
              totalContributed: { increment: amountKobo },
              status: 'ACTIVE'
            }
          }),
          prisma.actionLog.create({
            data: {
              userRole: 'SUPERADMIN',
              actionType: 'LOG_CONTRIBUTION',
              targetRecordId: donorId,
              details: JSON.stringify({ amount: amountKobo.toString(), method: 'BULK_CSV' })
            }
          })
        ]);

        successCount++;
      } catch (err) {
        console.error(err);
        errorCount++;
      }
    }

    if (successCount > 0) {
      await recalculateMilestones();
      revalidatePath('/admin/ledger');
      revalidatePath('/admin/dashboard');
      revalidatePath('/dashboard');
    }

    return NextResponse.json({ 
      success: true, 
      successCount, 
      duplicateCount, 
      errorCount 
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
