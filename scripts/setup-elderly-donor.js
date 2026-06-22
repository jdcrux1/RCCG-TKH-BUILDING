const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

if (!process.env.DIRECT_URL) {
  console.error("Error: DIRECT_URL is not set in environment.");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

const name = "Ladipo Josephine Kayode";
const rawPhone = "08055340369";
const domain = "https://rccg-tkh-building.vercel.app";

function sanitizePhoneNumber(num) {
  let clean = num.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '234' + clean.substring(1);
  }
  if (!clean.startsWith('234')) {
    clean = '234' + clean;
  }
  return '+' + clean;
}

async function main() {
  const sanitizedPhone = sanitizePhoneNumber(rawPhone);
  console.log(`Sanitized Phone: ${sanitizedPhone}`);

  // Check if donor already exists
  let donor = await prisma.donor.findUnique({
    where: { phone: sanitizedPhone }
  });

  if (donor) {
    console.log(`Donor with phone ${sanitizedPhone} already exists. Updating their record...`);
    
    // Generate new claim token if they don't have one, or use existing
    const token = donor.claimToken || crypto.randomUUID();
    const expires = new Date('2076-06-22T00:00:00.000Z');

    donor = await prisma.donor.update({
      where: { phone: sanitizedPhone },
      data: {
        name,
        tier: "Nehemiah Builder",
        monthlyPledge: 10000000n, // 100,000 Naira in kobo
        totalPledged: 240000000n,  // 2,400,000 Naira in kobo
        claimToken: token,
        claimTokenExpires: expires,
        isClaimed: false, // Keep it false so they appear in Sudo list as unclaimed and bypass normal PIN login
        status: "ACTIVE"
      }
    });

    console.log("Donor updated successfully.");
  } else {
    console.log("Creating new donor record...");
    const count = await prisma.donor.count();
    const donorRefId = `KB-${(count + 1).toString().padStart(3, '0')}`;
    const token = crypto.randomUUID();
    const expires = new Date('2076-06-22T00:00:00.000Z');

    donor = await prisma.donor.create({
      data: {
        phone: sanitizedPhone,
        name,
        donorRefId,
        tier: "Nehemiah Builder",
        monthlyPledge: 10000000n, // 100,000 Naira in kobo
        totalPledged: 240000000n,  // 2,400,000 Naira in kobo
        claimToken: token,
        claimTokenExpires: expires,
        isClaimed: false,
        status: "ACTIVE",
        role: "DONOR"
      }
    });

    console.log(`Donor created successfully with Ref ID: ${donorRefId}`);
  }

  // Create action log
  await prisma.actionLog.create({
    data: {
      userRole: 'SUPERADMIN',
      actionType: 'CREATE_ELDERLY_DONOR_MAGIC',
      targetRecordId: donor.id,
      details: `Created elderly donor ${name} with persistent auto-login magic link`
    }
  });

  const magicLink = `${domain}/api/auth/donor-magic?token=${donor.claimToken}`;
  console.log("\n==================================================");
  console.log("SETUP SUCCESSFUL");
  console.log("--------------------------------------------------");
  console.log(`Donor Name:   ${donor.name}`);
  console.log(`Ref ID:       ${donor.donorRefId}`);
  console.log(`Phone:        ${donor.phone}`);
  console.log(`Tier:         ${donor.tier} (₦100,000/month)`);
  console.log(`Magic Link:   ${magicLink}`);
  console.log("==================================================\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
