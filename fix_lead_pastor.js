const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');

async function fixLeadPastor() {
  const prisma = new PrismaClient();
  const token = crypto.randomUUID();
  
  try {
    await prisma.staff.update({
      where: { username: 'leadpastor' },
      data: { magicToken: token }
    });
    console.log('Lead pastor magic link generated.');
  } catch (err) {
    console.error('Error updating lead pastor:', err);
  }
  
  const staff = await prisma.staff.findMany({
    where: {
      role: { in: ['COMMITTEE', 'EXECUTIVE', 'LEAD_PASTOR'] }
    }
  });

  let output = '=== EXECUTIVE & COMMITTEE MAGIC LINKS ===\n\n';
  const domain = 'https://rccg-tkh-building.vercel.app'; 

  staff.forEach(s => {
    let name = s.username;
    if (s.username === 'leadpastor') name = 'Pastor Ayotunde Olumide';
    if (s.username.startsWith('pastor_')) name = s.username.replace('pastor_', 'Pastor ').replace('_', ' ');
    if (s.username.startsWith('mr_')) name = s.username.replace('mr_', 'Mr. ').replace('_', ' ');
    if (s.username === 'prince') name = 'Prince';
    
    // Capitalize words
    name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    output += `Account: ${name} (Role: ${s.role})\n`;
    if (s.magicToken) {
      output += `Magic Login Link: ${domain}/api/auth/magic?token=${s.magicToken}\n`;
    } else {
      output += `Magic Login Link: [No Magic Token Found - Use Standard Login]\n`;
    }
    output += `--------------------------------------------------\n\n`;
  });

  fs.writeFileSync('committee_magic_links.txt', output);
  console.log('Links successfully dumped to committee_magic_links.txt');
  await prisma.$disconnect();
}
fixLeadPastor();
