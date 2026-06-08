export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Calendar, CreditCard, Search, CalendarDays, Filter } from 'lucide-react';
import LedgerEntryForm from '@/components/LedgerEntryForm';
import { getSession } from '@/lib/auth';
import styles from './ledger.module.css';

export default async function ManualLedger({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string; q?: string }> 
}) {
  const session = await getSession();
  const role = session?.role || '';
  const isExecutive = role === 'LEAD_PASTOR' || role === 'COMMITTEE';

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const query = params.q || '';
  const PAGE_SIZE = 50;
  const skip = (page - 1) * PAGE_SIZE;

  // Ensure central "General Congregation / One-Off Givers" donor profile exists in the DB so admins can always select it
  await prisma.donor.upsert({
    where: { phone: '08000000000' },
    update: {},
    create: {
      phone: '08000000000',
      pin: '0000',
      name: 'General Congregation / One-Off Givers',
      tier: 'Supporter',
      monthlyPledge: 0,
      totalPledged: 0,
      role: 'DONOR',
      status: 'ACTIVE',
      donorRefId: 'KB-GEN'
    }
  });

  // Filter donors if search query exists
  const donorsWhere = query 
    ? { 
        role: 'DONOR', 
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { phone: { contains: query } }
        ]
      }
    : { role: 'DONOR' };

  const [donors, contributions, total, volumeAgg] = await Promise.all([
    prisma.donor.findMany({
      where: donorsWhere as any,
      orderBy: { name: 'asc' },
      take: 100 // Limit dropdown to 100 results for performance
    }),
    prisma.contribution.findMany({
      take: PAGE_SIZE,
      skip,
      orderBy: { date: 'desc' },
      include: { donor: true }
    }),
    prisma.contribution.count(),
    prisma.contribution.aggregate({
      _sum: {
        amount: true
      }
    })
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const totalVolume = Number(volumeAgg._sum.amount || 0) / 100;

  return (
    <div className={styles.dashboardShell}>
      {/* Master Header Container */}
      <div className={styles.headerWrapper}>
        <div>
          <h1 className={styles.mainTitle}>Transaction Audit</h1>
          <p className={styles.subtitle}>Full chronological history of all campaign inflows</p>
        </div>
        <div className={styles.metricsStrip}>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Total Transactions</span>
            <span className={styles.metricValue}>{total.toLocaleString()}</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Total Volume</span>
            <span className={`${styles.metricValue} ${styles.metricAccent}`}>₦{totalVolume.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Log Form Section */}
      {!isExecutive && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <LedgerEntryForm donors={donors.map(d => ({
            ...d,
            monthlyPledge: Number(d.monthlyPledge),
            totalPledged: Number(d.totalPledged),
            totalContributed: Number(d.totalContributed)
          }))} initialQuery={query} />
        </div>
      )}

      {/* Transaction History Section */}
      <div className={styles.ledgerBentoCard}>
        <div className={styles.ledgerToolbar}>
          <form className={styles.searchContainer} action="/admin/ledger">
            <Search size={18} className={styles.searchIcon} />
            <input 
              name="q"
              type="text" 
              placeholder="Search by Donor Name or Phone..." 
              defaultValue={query}
              className={styles.searchInput}
            />
          </form>
          <div className={styles.filterGroup}>
            <div className={styles.filterPill}>
              <CalendarDays size={14} />
              <span>Date Range</span>
            </div>
            <div className={styles.filterPill}>
              <Filter size={14} />
              <span>Status: All</span>
            </div>
          </div>
        </div>

        <div className={styles.ledgerTableContainer}>
          <table className={styles.fintechTable}>
            <thead>
              <tr>
                <th>Builder</th>
                <th>Details</th>
                <th>Status</th>
                <th className={styles.amountHeader}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((c) => (
                <tr key={c.id} className={styles.tableRow}>
                  <td data-label="Builder">
                    <div className={styles.builderName}>{c.donor.name}</div>
                    <div className={styles.builderPhone}>{c.donor.phone}</div>
                  </td>
                  <td data-label="Details">
                    <div className={styles.detailsDate}>
                      <Calendar size={14} style={{ opacity: 0.5 }} />
                      {new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div>
                      <span className={styles.monospaceRef}>Ref: {c.reference || 'SYSTEM_LOG'}</span>
                      {c.isConcierge && (
                        <span className={styles.conciergePill}>CONCIERGE</span>
                      )}
                    </div>
                  </td>
                  <td data-label="Status">
                    <span className={styles.statusApproved}>
                      ● APPROVED
                    </span>
                  </td>
                  <td data-label="Amount" className={styles.tabularAmount}>
                    +₦{(Number(c.amount) / 100).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {contributions.length === 0 && (
            <div className={styles.emptyState}>
              <CreditCard size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p>No historical records found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className={styles.paginationFooter}>
          <span className={styles.paginationText}>
            Showing {total === 0 ? 0 : skip + 1} to {Math.min(skip + PAGE_SIZE, total)} of {total} entries
          </span>
          <div className={styles.paginationControls}>
            <a 
              href={`/admin/ledger?page=${page - 1}${query ? `&q=${query}` : ''}`}
              className={`${styles.ghostButton} ${page <= 1 ? styles.disabled : ''}`}
            >
              PREV
            </a>
            <a 
              href={`/admin/ledger?page=${page + 1}${query ? `&q=${query}` : ''}`}
              className={`${styles.ghostButton} ${page >= totalPages ? styles.disabled : ''}`}
            >
              NEXT
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

