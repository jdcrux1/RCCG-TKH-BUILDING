const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanOldUploads() {
  try {
    const result = await prisma.donor.deleteMany({
      where: {
        isClaimed: false,
        claimToken: null,
        role: 'DONOR',
        pin: { not: null }
      }
    });
    console.log(`Successfully deleted ${result.count} old PIN-based test donors.`);
  } catch (error) {
    console.error('Error deleting donors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanOldUploads();
