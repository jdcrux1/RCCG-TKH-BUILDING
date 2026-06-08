const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function extractStaffLinks() {
  const prisma = new PrismaClient();
  const staff = await prisma.staff.findMany({
    where: {
      role: { in: ['COMMITTEE', 'EXECUTIVE', 'LEAD_PASTOR'] }
    }
  });

  let output = '=== EXECUTIVE & COMMITTEE MAGIC LINKS ===\n\n';
  const domain = 'https://rccg-tkh-building.vercel.app'; 

  staff.forEach(s => {
    output += `Account: ${s.username} (Role: ${s.role})\n`;
    if (s.magicToken) {
      output += `Magic Login Link: ${domain}/api/auth/magic?token=${s.magicToken}\n`;
    } else {
      output += `Magic Login Link: [No Magic Token Found - Use Standard Login]\n`;
    }
    output += `--------------------------------------------------\n\n`;
  });

  fs.writeFileSync('committee_magic_links.txt', output);
  console.log('Done');
  await prisma.$disconnect();
}

extractStaffLinks().catch(console.error);
