export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { CreditCard, ArrowRight, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { logContribution, verifyContribution, rejectContribution } from '@/app/admin/actions';

export default async function ManualLedger() {
  const donors = await prisma.donor.findMany({
    where: { role: 'DONOR' },
    orderBy: { name: 'asc' }
  });

  const pendingContributions = await prisma.contribution.findMany({
    where: { status: 'PENDING' },
    orderBy: { date: 'desc' },
    include: { donor: true }
  });

  const recentContributions = await prisma.contribution.findMany({
    where: { status: { not: 'PENDING' } },
    take: 15,
    orderBy: { date: 'desc' },
    include: { donor: true }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

      {/* Pending Verification Queue */}
      {pendingContributions.length > 0 && (
        <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)' }}>
            <Clock size={20} /> Pending Verification ({pendingContributions.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingContributions.map((c) => (
              <div key={c.id} style={{ 
                padding: '12px', 
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem' }}>{c.donor.name}</h4>
                  <p style={{ fontSize: '0.75rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(c.date).toLocaleDateString()} • {c.reference || 'No reference'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '1.1rem' }}>₦{c.amount.toLocaleString()}</span>
                  <form action={verifyContribution} style={{ display: 'inline' }}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--success)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}>
                      <CheckCircle size={14} /> Verify
                    </button>
                  </form>
                  <form action={rejectContribution} style={{ display: 'inline' }}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: 'var(--danger)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-md)' }}>
        {/* Log Form */}
        <div className="glass-card">
          <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="var(--accent)" /> Log Contribution
          </h2>
          <p style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: 'var(--space-sm)' }}>
            New contributions are logged as PENDING and must be verified before they appear on donor dashboards.
          </p>
          
          <form action={logContribution} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Select Donor</label>
              <select 
                name="donorId" 
                required
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="" disabled selected>Choose a donor...</option>
                {donors.map(d => (
                  <option key={d.id} value={d.id} style={{ color: 'black' }}>{d.name} ({d.phone})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Amount (₦)</label>
              <input 
                type="number" 
                name="amount" 
                placeholder="e.g. 50000" 
                required
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Bank Reference / Narrative</label>
              <input 
                type="text" 
                name="reference" 
                placeholder="Bank Ref: TKH-XXXX" 
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Transaction Date</label>
              <input 
                type="date" 
                name="date" 
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: 'var(--space-sm)' }}>
              Log Payment <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Processed Entries */}
        <div className="glass-card">
          <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.2rem' }}>Processed Entries</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentContributions.map((c) => (
              <div key={c.id} style={{ 
                padding: '12px', 
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem' }}>{c.donor.name}</h4>
                  <p style={{ fontSize: '0.75rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(c.date).toLocaleDateString()} • {c.reference || 'No reference'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    color: c.status === 'VERIFIED' ? 'var(--success)' : 'var(--danger)', 
                    fontWeight: '700' 
                  }}>
                    {c.status === 'VERIFIED' ? '+' : '-'}₦{c.amount.toLocaleString()}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: c.status === 'VERIFIED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: c.status === 'VERIFIED' ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
            {recentContributions.length === 0 && (
              <p style={{ opacity: 0.5, textAlign: 'center', padding: '2rem' }}>No processed contributions yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
