import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestDonor() {
  const name = "Test Donor Senior";
  const phone = "+2348012345678";
  const pin = "1234";
  const monthlyPledgeNaira = 1000000; // 1 Million Naira
  
  const hashedPin = await bcrypt.hash(pin, 10);
  const monthlyPledgeKobo = BigInt(monthlyPledgeNaira * 100);
  const totalPledgedKobo = monthlyPledgeKobo * BigInt(24);
  const tier = "Cornerstone Partner";

  try {
    // Delete if exists
    await prisma.donor.deleteMany({ 
      where: { 
        OR: [
          { phone },
          { donorRefId: "KB-TEST" }
        ]
      } 
    });

    const donor = await prisma.donor.create({
      data: {
        name,
        phone,
        pin: hashedPin,
        tier,
        monthlyPledge: monthlyPledgeKobo,
        totalPledged: totalPledgedKobo,
        donorRefId: "KB-TEST",
        status: "ACTIVE",
        role: "DONOR"
      }
    });

    console.log("Test Donor Created Successfully!");
    console.log("Phone:", phone);
    console.log("PIN:", pin);
    console.log("Tier:", tier);
    console.log("Reference ID:", donor.donorRefId);
  } catch (error) {
    console.error("Error creating test donor:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestDonor();
