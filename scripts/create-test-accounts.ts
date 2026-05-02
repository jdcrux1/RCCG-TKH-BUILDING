import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating Test Accounts for Unified Portal...');

  // 1. Super Admin
  const superPassphrase = "open sesame please";
  const superHash = await bcrypt.hash(superPassphrase.toLowerCase().replace(/\s+/g, ' '), 12);
  
  // Wipe existing SuperAdmins for testing since there's only one allowed usually
  await prisma.superAdmin.deleteMany();
  await prisma.superAdmin.create({
    data: { passphrase: superHash }
  });
  console.log('✅ SuperAdmin Created:');
  console.log('   Identifier: sudo');
  console.log(`   Passphrase: ${superPassphrase}`);
  console.log('---------------------------');

  // 2. Staff Admin
  const adminPassword = "password123";
  const adminHash = await bcrypt.hash(adminPassword, 10);
  
  await prisma.staff.upsert({
    where: { username: 'testadmin' },
    update: { password: adminHash, role: 'ADMIN', isActive: true },
    create: { username: 'testadmin', password: adminHash, role: 'ADMIN', isActive: true }
  });
  console.log('✅ Staff Admin Created:');
  console.log('   Username: testadmin');
  console.log(`   Password: ${adminPassword}`);
  console.log('---------------------------');

  // 3. Staff Volunteer
  const volunteerPassword = "password123";
  const volunteerHash = await bcrypt.hash(volunteerPassword, 10);
  
  await prisma.staff.upsert({
    where: { username: 'testvolunteer' },
    update: { password: volunteerHash, role: 'VOLUNTEER', isActive: true },
    create: { username: 'testvolunteer', password: volunteerHash, role: 'VOLUNTEER', isActive: true }
  });
  console.log('✅ Staff Volunteer Created:');
  console.log('   Username: testvolunteer');
  console.log(`   Password: ${volunteerPassword}`);
  console.log('---------------------------');

  // 4. Regular Donor
  const donorPhone = "08012345678";
  const donorPin = "1234";
  const donorPinHash = await bcrypt.hash(donorPin, 10);

  await prisma.donor.upsert({
    where: { phone: donorPhone },
    update: { pin: donorPinHash, role: 'DONOR', status: 'ACTIVE' },
    create: {
      phone: donorPhone,
      pin: donorPinHash,
      name: 'Test Donor',
      tier: 'BRONZE',
      monthlyPledge: 100000,
      totalPledged: 2400000,
      role: 'DONOR',
      status: 'ACTIVE'
    }
  });
  console.log('✅ Regular Donor Created:');
  console.log(`   Phone: ${donorPhone}`);
  console.log(`   PIN: ${donorPin}`);
  console.log('---------------------------');

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
