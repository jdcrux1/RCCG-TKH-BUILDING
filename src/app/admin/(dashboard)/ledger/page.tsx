export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { CreditCard, ArrowRight, Calendar, Search } from 'lucide-react';
import { logContribution } from '@/app/admin/actions';

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

  // Filter donors if search query exists
  const donorsWhere = query 
    ? { role: 'DONOR', name: { contains: query, mode: 'insensitive' as const } }
    : { role: 'DONOR' };

  const [donors, contributions, total] = await Promise.all([
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
  ]);

  const TIERS = [
    { name: 'Cornerstone Partner', amount: 1000000 },
    { name: 'Pillar Builder', amount: 500000 },
    { name: 'Foundation Stone', amount: 200000 },
    { name: 'Nehemiah Builder', amount: 100000 },
    { name: 'Covenant Partners', amount: 50000 },
    { name: 'Faithful Hand', amount: 20000 },
    { name: 'Open-Heart', amount: 10000 },
    { name: 'Willing Heart', amount: 5000 },
  ];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="responsive-grid responsive-grid-2" style={{ gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 2fr)', animation: 'fadeIn 0.5s ease-out' }}>
      {/* Log Form Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800' }}>
            <CreditCard size={24} color="var(--accent)" /> Ledger Entry
          </h2>

          {/* Search Bar for Donors */}
          <form method="GET" style={{ marginBottom: 'var(--space-md)', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              type="text" 
              name="q" 
              defaultValue={query}
              placeholder="Search donor name..." 
              className="responsive-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </form>
          
          <form action={logContribution} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kingdom Builder</label>
              <select 
                name="donorId" 
                required
                className="responsive-input"
              >
                <option value="" disabled selected>Select from search results...</option>
                {donors.map(d => (
                  <option key={d.id} value={d.id} style={{ color: 'black' }}>{d.name} ({d.phone})</option>
                ))}
              </select>
              {query && (
                <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '4px' }}>
                  Showing {donors.length} results matching &quot;{query}&quot;
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Donation Amount (Tier Level)</label>
              <select 
                name="amount" 
                required
                className="responsive-input"
              >
                <option value="" disabled selected>Select tier level...</option>
                {TIERS.map(t => (
                  <option key={t.name} value={t.amount} style={{ color: 'black' }}>
                    {t.name} (₦{t.amount.toLocaleString()})
                  </option>
                ))}
                <option value="custom" style={{ color: 'black' }}>Custom Amount...</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Ref / Narrative</label>
              <input 
                type="text" 
                name="reference" 
                placeholder="Reference Number (Optional)" 
                className="responsive-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contribution Date</label>
              <input 
                type="date" 
                name="date" 
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                className="responsive-input"
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: 'var(--space-sm)', padding: '1rem' }}>
              Authorize Payment <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Transaction Audit</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.5 }}>Full chronological history</p>
          </div>
          <div style={{ background: 'var(--success)20', color: 'var(--success)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700' }} className="desktop-only">
            {total} RECORDED
          </div>
        </div>

        <div style={{ overflowX: 'hidden' }}>
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
                    <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '4px' }}>
                      Ref: {c.reference || 'SYSTEM_LOG'}
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

