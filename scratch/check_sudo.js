
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSudo() {
  try {
    const sudos = await prisma.superAdmin.findMany();
    console.log(`Total SuperAdmins found: ${sudos.length}`);
    if (sudos.length > 0) {
      console.log('SuperAdmin record exists.');
    } else {
      console.log('No SuperAdmin record found. The next login as "sudo" will set the passphrase.');
    }
  } catch (err) {
    console.error('Error checking DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkSudo();
