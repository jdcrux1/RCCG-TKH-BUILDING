export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Calendar, CreditCard } from 'lucide-react';
import PendingClaims from '@/components/PendingClaims';
import LedgerEntryForm from '@/components/LedgerEntryForm';

export default async function ManualLedger({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string; q?: string }> 
}) {
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

  const [donors, contributions, total, pendingClaims] = await Promise.all([
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
    prisma.paymentClaim.findMany({
      where: { status: 'PENDING' },
      include: { donor: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="responsive-grid responsive-grid-2" style={{ gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 2fr)', animation: 'fadeIn 0.5s ease-out' }}>
      {/* Log Form Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <LedgerEntryForm donors={donors.map(d => ({
          ...d,
          monthlyPledge: Number(d.monthlyPledge),
          totalPledged: Number(d.totalPledged),
          totalContributed: Number(d.totalContributed)
        }))} initialQuery={query} />

        {/* Pending Claims Verification Panel */}
        <PendingClaims initialClaims={pendingClaims.map(c => ({
          ...c,
          amount: Number(c.amount)
        })) as any} />
      </div>

      {/* Transaction History Section */}
      <div className="glass-card tableResponsive">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Transaction Audit</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.5 }}>Full chronological history</p>
          </div>
          <div style={{ background: 'var(--success)20', color: 'var(--success)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700' }} className="desktop-only">
            {total} RECORDED
          </div>
        </div>

        <div className="tableResponsive">
          <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead className="desktop-only">
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Builder</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Details</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((c, idx) => (
                <tr key={c.id} style={{ 
                  borderBottom: idx === contributions.length - 1 ? 'none' : '1px solid var(--glass-border)',
                }} className="animate-fade-in">
                  <td style={{ padding: '20px 24px' }} data-label="Builder">
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{c.donor.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>{c.donor.phone}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }} data-label="Details">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <Calendar size={14} style={{ opacity: 0.5 }} />
                      {new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Ref: {c.reference || 'SYSTEM_LOG'}</span>
                      {c.isConcierge && (
                        <span style={{ background: 'var(--accent)20', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700' }}>
                          CONCIERGE
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }} data-label="Amount">
                    <div style={{ color: 'var(--success)', fontWeight: '800', fontSize: '1.1rem' }}>
                      +₦{(Number(c.amount) / 100).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {contributions.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3 }}>
              <CreditCard size={48} style={{ margin: '0 auto 16px' }} />
              <p>No historical records found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="responsive-header">
          <span style={{ opacity: 0.4, fontSize: '0.8rem' }}>Page {page} of {totalPages}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a 
              href={`/admin/ledger?page=${page - 1}${query ? `&q=${query}` : ''}`}
              className="btn-primary"
              style={{ 
                padding: '8px 16px', 
                background: page <= 1 ? 'rgba(255,255,255,0.05)' : 'var(--accent)', 
                color: page <= 1 ? '#666' : 'var(--primary)', 
                pointerEvents: page <= 1 ? 'none' : 'auto',
                fontSize: '0.8rem',
                minHeight: '44px'
              }}
            >
              Prev
            </a>
            <a 
              href={`/admin/ledger?page=${page + 1}${query ? `&q=${query}` : ''}`}
              className="btn-primary"
              style={{ 
                padding: '8px 16px', 
                background: page >= totalPages ? 'rgba(255,255,255,0.05)' : 'var(--accent)', 
                color: page >= totalPages ? '#666' : 'var(--primary)', 
                pointerEvents: page >= totalPages ? 'none' : 'auto',
                fontSize: '0.8rem',
                minHeight: '44px'
              }}
            >
              Next
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}

