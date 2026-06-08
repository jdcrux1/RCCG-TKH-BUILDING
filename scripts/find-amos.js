const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAmos() {
  try {
    const donors = await prisma.donor.findMany({
      select: { id: true, name: true, donorRefId: true, phone: true }
    });

    const matches = donors.filter(d => 
      d.name.toLowerCase().includes('amo') || 
      d.name.toLowerCase().includes('mos')
    );

    console.log("Potential matches for 'Amos':");
    console.dir(matches, { depth: null });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findAmos();
