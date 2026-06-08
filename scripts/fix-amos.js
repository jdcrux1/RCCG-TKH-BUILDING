const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAmos() {
  try {
    const donor = await prisma.donor.findUnique({
      where: { id: '493b07b3-82fa-493f-af44-2f655ea57014' }
    });

    if (donor) {
      console.log(`Current name: ${donor.name}`);
      const newName = donor.name.replace('Amoj', 'Amos');
      
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

fixAmos();
