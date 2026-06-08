import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import { verifySudoToken } from '@/lib/sudo-auth';
import { hashPin } from '@/lib/password';
import crypto from 'crypto';
import { revalidatePath } from "next/cache";
import { nairaToKobo, TIERS } from '@/lib/tiers';

export async function POST(request: NextRequest) {
  if (!await verifySudoToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { pledgeId, action } = await request.json();

    if (!pledgeId || !action) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const pledge = await prisma.pledgeRequest.findUnique({
      where: { id: pledgeId }
    });

    if (!pledge) {
      return NextResponse.json({ error: 'Pledge request not found' }, { status: 404 });
    }

    if (action === 'REJECT') {
      await prisma.pledgeRequest.update({
        where: { id: pledgeId },
        data: { status: 'REJECTED' }
      });
      return NextResponse.json({ success: true, message: 'Request rejected' });
    }

    if (action === 'APPROVE') {
      const tierInfo = TIERS.find(t => t.name === pledge.tier);
      const monthlyPledgeNaira = tierInfo ? tierInfo.min : 5000;
      const monthlyPledgeKobo = nairaToKobo(monthlyPledgeNaira);

      const existing = await prisma.donor.findUnique({
        where: { phone: pledge.phone }
      });

      if (existing) {
        return NextResponse.json({ error: 'Phone number already active as a Donor' }, { status: 400 });
      }

      const currentCount = await prisma.donor.count();
      const donorRefId = `KB-${(currentCount + 1).toString().padStart(3, '0')}`;
      
      const claimToken = crypto.randomBytes(32).toString('hex');
      const claimTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.$transaction([
        prisma.donor.create({
          data: {
            name: pledge.name,
            phone: pledge.phone,
            donorRefId,
            pin: null,
            tier: pledge.tier,
            monthlyPledge: monthlyPledgeKobo,
            totalPledged: monthlyPledgeKobo * BigInt(24),
            role: 'DONOR',
            isClaimed: false,
            claimToken,
            claimTokenExpires
          }
        }),
        prisma.pledgeRequest.update({
          where: { id: pledge.id },
          data: { status: 'APPROVED' }
        })
      ]);

      revalidatePath('/admin/donors');

      return NextResponse.json({ 
        success: true, 
        message: 'Approved successfully',
        donorInfo: {
          name: pledge.name,
          phone: pledge.phone,
          donorRefId,
          claimToken
        }
      });
    }

  } catch (error) {
    console.error('Approve pledge error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
