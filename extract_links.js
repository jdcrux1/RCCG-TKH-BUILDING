const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function extractLinks() {
  const prisma = new PrismaClient();
  const donors = await prisma.donor.findMany({
    where: {
      isClaimed: false,
      claimToken: { not: null }
    }
  });

  let output = '=== NEWLY CREATED MAGIC CLAIM LINKS ===\n\n';
  const domain = 'https://rccg-tkh-building.vercel.app'; // Production URL

  donors.forEach(d => {
    output += `Name: ${d.name}\n`;
    output += `Phone: ${d.phone}\n`;
    output += `Claim Link: ${domain}/claim?token=${d.claimToken}\n`;
    output += `--------------------------------------------------\n\n`;
  });

  fs.writeFileSync('magic_links.txt', output);
  console.log(`Successfully exported ${donors.length} unclaimed links to magic_links.txt`);
  await prisma.$disconnect();
}

extractLinks().catch(console.error);
