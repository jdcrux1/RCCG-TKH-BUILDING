
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.uhufwycfuethmaqwjlhb:1404Mababy%21%40%C2%A3%24@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function checkSudo() {
  try {
    const count = await prisma.superAdmin.count();
    console.log(`Total SuperAdmins found: ${count}`);
    if (count > 0) {
      const sudos = await prisma.superAdmin.findMany({ take: 1 });
      console.log(`First SuperAdmin ID: ${sudos[0].id}, CreatedAt: ${sudos[0].createdAt}`);
    }
  } catch (err) {
    console.error('Error checking DB:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSudo();
