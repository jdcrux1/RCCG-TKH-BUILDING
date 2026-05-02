import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { getActiveSessions, getActionLogs } from '@/lib/sudo-auth';
import SudoDashboard from './SudoDashboard';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');

async function verifySudo(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('sudo_token')?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role === 'SUPERADMIN';
  } catch {
    return false;
  }
}

async function getData() {
  const [contributions, donors, sessions, actionLogs, staff, milestones] = await Promise.all([
    prisma.contribution.findMany({ 
      include: { donor: true },
      orderBy: { date: 'desc' },
    }),
    prisma.donor.findMany({ orderBy: { createdAt: 'desc' } }),
    getActiveSessions(),
    getActionLogs(100),
    prisma.staff.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.milestone.findMany({ orderBy: { order: 'asc' } }),
  ]);

  const totalTarget = await prisma.systemVariable.findUnique({ where: { key: 'totalTarget' } });
  const basementTarget = await prisma.systemVariable.findUnique({ where: { key: 'basementTarget' } });
  const groundFloorTarget = await prisma.systemVariable.findUnique({ where: { key: 'groundFloorTarget' } });

  return { 
    contributions, 
    donors, 
    sessions, 
    actionLogs, 
    staff,
    milestones,
    systemVariables: {
      totalTarget: totalTarget?.value || '500000000',
      basementTarget: basementTarget?.value || '150000000',
      groundFloorTarget: groundFloorTarget?.value || '350000000',
    }
  };
}

export default async function SudoRootPage() {
  const isAuthorized = await verifySudo();
  if (!isAuthorized) {
    redirect('/login');
  }

  const data = await getData();

  return <SudoDashboard data={data} />;
}