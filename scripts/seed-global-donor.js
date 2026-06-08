const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function seedGlobalDonor() {
  try {
    const phone = '+00000000000';
    const existing = await prisma.donor.findUnique({
      where: { phone }
    });

    if (existing) {
      console.log('Global profile already exists:', existing.id);
      return;
    }

    const claimToken = crypto.randomBytes(32).toString('hex');
    const claimTokenExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    const globalDonor = await prisma.donor.create({
      data: {
        name: 'General Congregation / One-Off Givers',
        phone: phone,
        donorRefId: 'KB-GLOBAL',
        tier: 'SUPPORTER',
        monthlyPledge: 0,
        totalPledged: 0,
        role: 'DONOR',
        status: 'ACTIVE',
        isClaimed: false,
        claimToken: claimToken,
        claimTokenExpires: claimTokenExpires
      }
    });

    console.log('Created Global Profile:', globalDonor.id);
  } catch (error) {
    console.error('Seed Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedGlobalDonor();
