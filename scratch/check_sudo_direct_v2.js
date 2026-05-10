
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.uhufwycfuethmaqwjlhb:1404Mababy%21%40%C2%A3%24@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
    }
  }
});

async function checkSudo() {
  try {
    const sudos = await prisma.superAdmin.findMany();
    console.log(`Total SuperAdmins found: ${sudos.length}`);
    for (const s of sudos) {
      console.log(`- ID: ${s.id}, Created: ${s.createdAt}`);
    }
  } catch (err) {
    console.error('Error checking DB:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSudo();
