import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ExecutiveDashboardClient from './ExecutiveDashboardClient';

export const dynamic = 'force-dynamic';

export default async function ExecutiveDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const session = await decrypt(token);

  console.log("Decrypted Session in /executive:", session);

  if (!session || session.role !== 'EXECUTIVE') {
    console.error("Redirecting because session invalid or role mismatch:", session);
    redirect('/login');
  }

  // Fetch all donors for tier breakdown
  const donors = await prisma.donor.findMany({
    select: {
      tier: true,
    }
  });

  const tierCounts: Record<string, number> = {};
  donors.forEach(d => {
    tierCounts[d.tier] = (tierCounts[d.tier] || 0) + 1;
  });

  // Prepare tier data for Pie Chart
  const tierData = Object.keys(tierCounts).map(tier => ({
    name: tier,
    value: tierCounts[tier]
  })).sort((a, b) => b.value - a.value);

  // Fetch contributions for total raised and monthly trends
  const contributions = await prisma.contribution.findMany({
    select: {
      amount: true,
      date: true
    },
    orderBy: {
      date: 'asc'
    }
  });

  let totalRaised = 0;
  const monthlyDataMap: Record<string, number> = {};

  contributions.forEach(c => {
    const amt = Number(c.amount) / 100; // stored in kobo
    totalRaised += amt;
    
    // Group by Month Year
    const date = new Date(c.date);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyDataMap[monthYear] = (monthlyDataMap[monthYear] || 0) + amt;
  });

  // Prepare monthly trend data for Bar Chart
  const trendData = Object.keys(monthlyDataMap).map(month => ({
    name: month,
    amount: monthlyDataMap[month]
  }));

  // Fetch overall target
  const targetVar = await prisma.systemVariable.findUnique({
    where: { key: 'totalTarget' }
  });
  
  const totalTarget = targetVar ? Number(targetVar.value) : 650000000; // default 650M

  const data = {
    totalRaised,
    totalTarget,
    totalDonors: donors.length,
    tierData,
    trendData,
    name: session.name as string
  };

  return <ExecutiveDashboardClient data={data} />;
}
