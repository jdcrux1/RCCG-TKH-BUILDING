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
];

async function generateAllTestAccounts() {
  console.log("Generating test accounts...");
  const output = [];
  
  output.push("=== KINGDOM BUILDERS SYSTEM TEST ACCOUNTS ===");
  output.push(`Generated on: ${new Date().toLocaleString()}`);
  output.push(`Portal: https://rccg-tkh-building.vercel.app/login`);
  output.push("==============================================\n");

  // 1. New Sudo User
  const sudoPass = "it is well";
  const sudoHash = await bcrypt.hash(sudoPass.toLowerCase().trim().replace(/\s+/g, ' '), 12);
  await prisma.superAdmin.create({ data: { passphrase: sudoHash } });
  output.push("--- SUPER ADMIN (SUDO) ---");
  output.push(`Identifier: sudo`);
  output.push(`Passphrase: ${sudoPass}`);
  output.push("--------------------------\n");

  // 2. Test Admins (Staff)
  output.push("--- STAFF: ADMINS ---");
  for (let i = 1; i <= 2; i++) {
    const user = `admin_test_${i}`;
    const pass = `adminpass${i}`;
    const hash = await bcrypt.hash(pass, 10);
    await prisma.staff.upsert({
      where: { username: user },
      update: { password: hash, role: 'ADMIN', isActive: true },
      create: { username: user, password: hash, role: 'ADMIN', isActive: true }
    });
    output.push(`${i}. User: ${user} | Pass: ${pass}`);
  }
  output.push("----------------------\n");

  // 3. Test Volunteers (Staff)
  output.push("--- STAFF: VOLUNTEERS ---");
  for (let i = 1; i <= 5; i++) {
    const user = `volunteer_test_${i}`;
    const pass = `volpass${i}`;
    const hash = await bcrypt.hash(pass, 10);
    await prisma.staff.upsert({
      where: { username: user },
      update: { password: hash, role: 'VOLUNTEER', isActive: true },
      create: { username: user, password: hash, role: 'VOLUNTEER', isActive: true }
    });
    output.push(`${i}. User: ${user} | Pass: ${pass}`);
  }
  output.push("--------------------------\n");

  // 4. Test Donors
  output.push("--- TEST DONORS ---");
  for (let i = 1; i <= 10; i++) {
    const name = `Test Donor ${i}`;
    const phone = `090100000${i.toString().padStart(2, '0')}`;
    const sanitized = sanitizePhoneNumber(phone);
    const pin = crypto.randomInt(1000, 10000).toString();
    const pinHash = await bcrypt.hash(pin, 10);
    const tier = TIERS[(i - 1) % TIERS.length];
    const monthlyKobo = BigInt(tier.amount * 100);

    await prisma.donor.upsert({
      where: { phone: sanitized },
      update: {
        name, pin: pinHash, tier: tier.name, monthlyPledge: monthlyKobo, totalPledged: monthlyKobo * BigInt(24),
        donorRefId: `TEST-${i.toString().padStart(3, '0')}`, status: 'ACTIVE'
      },
      create: {
        name, phone: sanitized, pin: pinHash, tier: tier.name, monthlyPledge: monthlyKobo, totalPledged: monthlyKobo * BigInt(24),
        donorRefId: `TEST-${i.toString().padStart(3, '0')}`, status: 'ACTIVE', role: 'DONOR'
      }
    });
    output.push(`${i}. [${tier.name}]`);
    output.push(`   Name: ${name}`);
    output.push(`   Phone: ${phone}`);
    output.push(`   PIN: ${pin}`);
    output.push(`   ID: TEST-${i.toString().padStart(3, '0')}`);
  }
  output.push("-------------------\n");

  const filePath = path.join(process.cwd(), 'system-test-logins.txt');
  fs.writeFileSync(filePath, output.join('\n'));
  console.log(`Success! Logins saved to ${filePath}`);
}

generateAllTestAccounts()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
