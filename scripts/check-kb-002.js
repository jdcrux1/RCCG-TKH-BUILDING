const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDonor() {
  const donor = await prisma.donor.findUnique({
    where: { phone: '+2348169003751' }
  });
  if (!donor) {
    const donorByRef = await prisma.donor.findUnique({
      where: { donorRefId: 'KB-002' }
    });
    console.log("Donor by Ref:", donorByRef);
  } else {
    console.log("Donor by Phone:", donor);
  }
}
checkDonor().finally(() => prisma.$disconnect());
