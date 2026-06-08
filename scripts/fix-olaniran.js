const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixName() {
  try {
    const donors = await prisma.donor.findMany({
      where: {
        name: {
          contains: 'Olamiran',
          mode: 'insensitive'
        }
      }
    });

    console.log(`Found ${donors.length} donors matching 'Olamiran'`);

    for (const donor of donors) {
      console.log(`Current name: ${donor.name}`);
      const newName = donor.name.replace(/Olamiran/ig, 'Olaniran');
      
      const updated = await prisma.donor.update({
        where: { id: donor.id },
        data: { name: newName }
      });
      
      console.log(`Updated to: ${updated.name}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixName();
