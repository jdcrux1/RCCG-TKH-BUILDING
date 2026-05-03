import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { sanitizePhoneNumber } from '../src/lib/sanitize';

const prisma = new PrismaClient();

const TIERS = [
  { name: 'Cornerstone Partner', amount: 1000000 },
  { name: 'Pillar Builder', amount: 500000 },
  { name: 'Foundation Stone', amount: 200000 },
  { name: 'Nehemiah Builder', amount: 100000 },
  { name: 'Covenant Partners', amount: 50000 },
  { name: 'Faithful Hand', amount: 20000 },
  { name: 'Open-Heart', amount: 10000 },
  { name: 'Willing Heart', amount: 5000 },
  { name: 'Supporter', amount: 2500 }, // Legacy/Lower
  { name: 'Partner', amount: 15000 },   // Custom
];

async function generateTestDonors() {
  const donorsList = [];
  const testData = [];

  console.log("Generating 10 test donors...");

  for (let i = 1; i <= 10; i++) {
    const name = `Presentation Donor ${i}`;
    const phone = `070100000${i.toString().padStart(2, '0')}`;
    const sanitizedPhone = sanitizePhoneNumber(phone);
    const pin = crypto.randomInt(1000, 10000).toString();
    const hashedPin = await bcrypt.hash(pin, 10);
    
    const tierData = TIERS[i - 1] || TIERS[0];
    const monthlyPledgeKobo = BigInt(tierData.amount * 100);
    const totalPledgedKobo = monthlyPledgeKobo * BigInt(24);
    const donorRefId = `PRES-${i.toString().padStart(3, '0')}`;

    testData.push({
      name,
      phone,
      sanitizedPhone,
      pin,
      tier: tierData.name,
      donorRefId,
      monthlyPledge: tierData.amount
    });

    // Upsert into database
    await prisma.donor.upsert({
      where: { phone: sanitizedPhone },
      update: {
        name,
        pin: hashedPin,
        tier: tierData.name,
        monthlyPledge: monthlyPledgeKobo,
        totalPledged: totalPledgedKobo,
        donorRefId,
        status: "ACTIVE"
      },
      create: {
        name,
        phone: sanitizedPhone,
        pin: hashedPin,
        tier: tierData.name,
        monthlyPledge: monthlyPledgeKobo,
        totalPledged: totalPledgedKobo,
        donorRefId,
        status: "ACTIVE",
        role: "DONOR"
      }
    });
  }

  // Generate Text File Content
  let fileContent = "--- KINGDOM BUILDERS PRESENTATION LOGINS ---\n";
  fileContent += "Portal URL: https://rccg-tkh-building.vercel.app/login\n\n";
  fileContent += "Use these credentials to test the Donor Portal.\n";
  fileContent += "----------------------------------------------\n\n";

  testData.forEach((d, idx) => {
    fileContent += `${idx + 1}. [${d.tier}]\n`;
    fileContent += `   Name: ${d.name}\n`;
    fileContent += `   Phone: ${d.phone}\n`;
    fileContent += `   PIN: ${d.pin}\n`;
    fileContent += `   Donor ID: ${d.donorRefId}\n`;
    fileContent += `   Monthly Pledge: ₦${d.monthlyPledge.toLocaleString()}\n`;
    fileContent += "----------------------------------------------\n";
  });

  const filePath = path.join(process.cwd(), 'presentation-logins.txt');
  fs.writeFileSync(filePath, fileContent);

  console.log(`Successfully created 10 donors and saved to ${filePath}`);
}

generateTestDonors()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
