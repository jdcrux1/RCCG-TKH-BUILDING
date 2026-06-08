const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateCovenantPartner() {
  try {
    const result = await prisma.donor.updateMany({
      where: { tier: 'Covenant Partners' },
      data: { tier: 'Covenant Partner' }
    });
    console.log(`Successfully migrated ${result.count} donors to 'Covenant Partner'.`);
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCovenantPartner();
