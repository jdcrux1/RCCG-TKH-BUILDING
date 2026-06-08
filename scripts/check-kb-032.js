const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndUpdateDonor() {
  try {
    const donorByRef = await prisma.donor.findUnique({
      where: { donorRefId: 'KB-032' }
    });
    console.log("Donor by Ref KB-032:", donorByRef);

    const donorByPhone = await prisma.donor.findUnique({
      where: { phone: '+2348077953890' }
    });
    console.log("Donor by Phone +2348077953890:", donorByPhone);

    // If we find the donor, let's update her name correctly.
    if (donorByRef) {
      const updated = await prisma.donor.update({
        where: { id: donorByRef.id },
        data: { name: 'Olowookere Oluwapelumi' }
      });
      console.log("Successfully updated donor name to:", updated.name);
      console.log("Current claimToken status:", {
        isClaimed: updated.isClaimed,
        claimToken: updated.claimToken,
        expires: updated.claimTokenExpires
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndUpdateDonor();
