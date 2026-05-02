export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

import { UserPlus, Search, Download } from 'lucide-react';
import AddDonorModal from '@/components/AddDonorModal';
import DonorList from './DonorList';

const PAGE_SIZE = 50;

export default async function DonorManagement({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
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
    <div>
      <header style={{ 
        marginBottom: 'var(--space-lg)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '16px'
      }} className="responsive-header">
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Donor Management</h1>
          <p style={{ opacity: 0.6 }}>Manage Kingdom Builders profiles and pledges</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', width: 'auto' }} className="header-actions">
        </div>
      </header>

      <DonorList 
        donors={donors} 
        total={total}
        page={page}
        totalPages={totalPages}
        query={query}
      />
    </div>
  );
}