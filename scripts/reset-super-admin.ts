import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full database user wipe...');

  // 1. Delete all user sessions and action logs
  await prisma.userSession.deleteMany();
  await prisma.actionLog.deleteMany();

  // 2. Delete all existing users
  await prisma.donor.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.superAdmin.deleteMany();

  console.log('✅ All Donor, Staff, and SuperAdmin records have been deleted.');

  // 3. Create fresh Super Admin
  const superPassphrase = "open sesame please";
  const superHash = await bcrypt.hash(superPassphrase.toLowerCase().replace(/\s+/g, ' '), 12);
  
  await prisma.superAdmin.create({
    data: { passphrase: superHash }
  });
  
  console.log('✅ Fresh SuperAdmin Created:');
  console.log('   Identifier: sudo');
  console.log(`   Passphrase: ${superPassphrase}`);
  console.log('---------------------------');
  console.log('You now have a clean slate! Only the Super Admin exists.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
