import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const committeeMembers = [
  { name: 'Pastor Tosin Olalere' },
  { name: 'Pastor Tunji Omotosho' },
  { name: 'Mr Matthew Johnson' },
  { name: 'Mr Micheal Adebayo' },
  { name: 'Mr Femi Julius' },
  { name: 'Mr Falemi' },
  { name: 'Prince' },
];

async function main() {
  console.log('Seeding Committee Members...');

  const results = [];

  for (const member of committeeMembers) {
    const username = member.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const magicToken = crypto.randomUUID();
    
    // Check if member already exists
    let staff = await prisma.staff.findUnique({
      where: { username }
    });

    if (!staff) {
      staff = await prisma.staff.create({
        data: {
          username,
          password: crypto.randomUUID(), // Unused random password, they use magic links
          role: 'COMMITTEE',
          isActive: true,
          magicToken,
        }
      });
    } else {
      // Update existing with new token and role
      staff = await prisma.staff.update({
        where: { id: staff.id },
        data: {
          role: 'COMMITTEE',
          magicToken,
        }
      });
    }

    const magicLink = `http://localhost:3000/api/auth/magic?token=${staff.magicToken}`;
    
    results.push({
      Name: member.name,
      Username: username,
      MagicLink: magicLink
    });
  }

  console.log('\n--- SEEDING COMPLETE ---');
  console.log('Distribute these secure links to the committee:\n');
  
  results.forEach(r => {
    console.log(`${r.Name}: \n${r.MagicLink}\n`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
