const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAmosFull() {
  try {
    const updated = await prisma.donor.update({
      where: { id: '493b07b3-82fa-493f-af44-2f655ea57014' },
      data: { name: 'Amos Favour Chinyere' }
    });
    console.log(`Updated to full name: ${updated.name}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAmosFull();
