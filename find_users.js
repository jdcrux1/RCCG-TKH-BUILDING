const { PrismaClient } = require('@prisma/client');

async function findUsers() {
  const prisma = new PrismaClient();
  const staff = await prisma.staff.findMany();
  const donors = await prisma.donor.findMany({
    where: {
      name: { contains: 'Ayotunde' }
    }
  });

  console.log('STAFF:');
  console.log(JSON.stringify(staff, null, 2));

  console.log('DONORS MATCHING AYOTUNDE:');
  console.log(JSON.stringify(donors, null, 2));

  await prisma.$disconnect();
}

findUsers().catch(console.error);
