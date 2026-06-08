import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import { sanitizePhoneNumber, toTitleCase } from '@/lib/sanitize';
import { isValidTier } from '@/lib/tiers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, tier } = body;

    if (!name || !phone || !tier) {
      return NextResponse.json({ error: 'Name, phone, and tier are required' }, { status: 400 });
    }

    if (!isValidTier(tier)) {
      return NextResponse.json({ error: 'Invalid tier selected' }, { status: 400 });
    }

    const sanitizedPhone = sanitizePhoneNumber(String(phone));
    const sanitizedName = toTitleCase(String(name).trim());

    if (sanitizedPhone.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Check if phone exists in active donors
    const existingDonor = await prisma.donor.findUnique({
      where: { phone: sanitizedPhone }
    });

    if (existingDonor) {
      return NextResponse.json({ error: 'This phone number is already registered as a Kingdom Builder.' }, { status: 400 });
    }

    // Check if phone exists in pending pledge requests
    const existingPledge = await prisma.pledgeRequest.findUnique({
      where: { phone: sanitizedPhone }
    });

    if (existingPledge) {
      return NextResponse.json({ error: 'You have already submitted a request. Please wait for an Admin to verify your account.' }, { status: 400 });
    }

    // Create Pledge Request
    await prisma.pledgeRequest.create({
      data: {
        name: sanitizedName,
        phone: sanitizedPhone,
        tier: tier,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, message: 'Request submitted successfully' });

  } catch (error) {
    console.error('Pledge request error:', error);
    return NextResponse.json({ error: 'Server error while processing request' }, { status: 500 });
  }
}
