import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // CLEAN SLATE: Only one admin account as requested
  const adminPhone = '08052039446'; 
  const adminPin = '0414'; 
  const hashedPin = await bcrypt.hash(adminPin, 10);

  const admin = await prisma.donor.upsert({
    where: { phone: adminPhone },
    update: {
      pin: hashedPin,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      phone: adminPhone,
      pin: hashedPin,
      name: 'Super Admin',
      tier: 'ADMIN',
      monthlyPledge: 0,
      totalPledged: 0,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('Database cleaned. Admin account created:', adminPhone);

  // Keep milestones but reset their progress for a fresh start
  const milestones = [
    { title: 'Basement', targetAmount: 50000000, currentAmount: 0, status: 'PENDING' as const, order: 1 },
    { title: 'Ground Floor', targetAmount: 300000000, currentAmount: 0, status: 'PENDING' as const, order: 2 },
    { title: 'First Floor', targetAmount: 300000000, currentAmount: 0, status: 'PENDING' as const, order: 3 },
  ];

  for (const m of milestones) {
    await prisma.milestone.upsert({
      where: { id: m.title.replace(/\s+/g, '-').toLowerCase() },
      update: m,
      create: {
        id: m.title.replace(/\s+/g, '-').toLowerCase(),
        ...m
      }
    });
  }

  console.log('System milestones reset.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
