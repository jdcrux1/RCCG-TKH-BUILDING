export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

import { UserPlus, Search, Download } from 'lucide-react';
import AddDonorModal from '@/components/AddDonorModal';
import DonorList from './DonorList';
import { getSession } from '@/lib/auth';
import styles from './donors.module.css';

const PAGE_SIZE = 50;

export default async function DonorManagement({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const session = await getSession();
  const role = session?.role || '';
  const isExecutive = role === 'LEAD_PASTOR' || role === 'COMMITTEE';

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const query = params.q || '';
  const skip = (page - 1) * PAGE_SIZE;

  const where = query 
    ? { role: 'DONOR', name: { contains: query, mode: 'insensitive' as const } }
    : { role: 'DONOR' };

  const [donors, total] = await Promise.all([
    prisma.donor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip,
      select: { id: true, name: true, phone: true, tier: true, monthlyPledge: true, totalPledged: true, status: true, createdAt: true },
    }),
    prisma.donor.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className={styles.dashboardShell}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.mainTitle}>Donor Intelligence</h1>
          <p className={styles.subtitle}>Executive read-only view of all campaign partners and pledges.</p>
        </div>
        <div className={styles.headerActions}>
          {!isExecutive && <AddDonorModal />}
        </div>
      </header>

      <DonorList 
        donors={donors.map(d => ({
          ...d,
          monthlyPledge: Number(d.monthlyPledge),
          totalPledged: Number(d.totalPledged)
        }))} 
        total={total}
        page={page}
        totalPages={totalPages}
        query={query}
      />
    </div>
  );
}