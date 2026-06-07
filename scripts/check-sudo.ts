import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const superAdmins = await prisma.superAdmin.findMany();
  console.log('SuperAdmins:', superAdmins);
  const userSessions = await prisma.userSession.findMany({ where: { userRole: 'SUPERADMIN' }});
  console.log('UserSessions for SuperAdmins:', userSessions.length);
}

check().catch(console.error).finally(() => prisma.$disconnect());
