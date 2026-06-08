const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = await bcrypt.hash(token, 10);

  await prisma.systemVariable.upsert({
    where: { key: 'pastor_magic_link_hash' },
    update: { value: hash },
    create: { key: 'pastor_magic_link_hash', value: hash }
  });

  const baseUrl = 'https://rccg-tkh-building.vercel.app';
  const magicLink = `${baseUrl}/api/auth/magic?t=${token}`;

  console.log('--- GENERATED MAGIC LINK ---');
  console.log(magicLink);
  console.log('----------------------------');
}

main().catch(console.error).finally(() => prisma.$disconnect());
