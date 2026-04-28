import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPhone = '08000000000'; // Initial admin phone
  const adminPin = '1234'; // Initial admin PIN
  const hashedPin = await bcrypt.hash(adminPin, 10);

  const admin = await prisma.donor.upsert({
    where: { phone: adminPhone },
    update: {},
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

  console.log({ admin });

  // Seed Sample Donor
  const donorPhone = '09012345678';
  const donorPin = '1111';
  const donorHashedPin = await bcrypt.hash(donorPin, 10);

  await prisma.donor.upsert({
    where: { phone: donorPhone },
    update: {},
    create: {
      phone: donorPhone,
      pin: donorHashedPin,
      name: 'John Doe',
      tier: 'Nehemiah Builder',
      monthlyPledge: 100000,
      totalPledged: 2400000,
      role: 'DONOR',
      status: 'ACTIVE',
    },
  });

  console.log('Sample donor seeded');

  // Seed Milestones
  const milestones = [
    { title: 'Basement Phase', targetAmount: 150000000, currentAmount: 150000000, status: 'FUNDED', order: 1 },
    { title: 'Ground Floor Phase', targetAmount: 200000000, currentAmount: 50000000, status: 'IN_PROGRESS', order: 2 },
    { title: 'First Floor Phase', targetAmount: 300000000, currentAmount: 0, status: 'PENDING', order: 3 },
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

  console.log('Milestones seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
