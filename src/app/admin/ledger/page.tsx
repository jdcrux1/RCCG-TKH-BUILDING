import { prisma } from '@/lib/prisma';
import { CreditCard, Search, ArrowRight, Calendar } from 'lucide-react';
import { logContribution } from '@/app/admin/actions';

export default async function ManualLedger() {
  const donors = await prisma.donor.findMany({
    where: { role: 'DONOR' },
    orderBy: { name: 'asc' }
  });

  const recentContributions = await prisma.contribution.findMany({
    take: 10,
    orderBy: { date: 'desc' },
    include: { donor: true }
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-md)' }}>
      {/* Log Form */}
      <div className="glass-card">
        <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={20} color="var(--accent)" /> Log Contribution
        </h2>
        
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

      {/* Recent Ledger Entries */}
      <div className="glass-card">
        <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.2rem' }}>Recent Entries</h2>
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
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--success)', fontWeight: '700' }}>+₦{c.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
          {recentContributions.length === 0 && (
            <p style={{ opacity: 0.5, textAlign: 'center', padding: '2rem' }}>No contributions logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
