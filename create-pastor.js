const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = 'leadpastor';
  const password = 'PastorLogin2026';
  const hash = await bcrypt.hash(password, 10);

  const staff = await prisma.staff.upsert({
    where: { username },
    update: {
      password: hash,
      role: 'EXECUTIVE',
      isActive: true,
    },
    create: {
      username,
      password: hash,
      role: 'EXECUTIVE',
      isActive: true,
    }
  });

  console.log('Created EXECUTIVE user:', staff.username);
  console.log('Password:', password);
}

main().catch(console.error).finally(() => prisma.$disconnect());
