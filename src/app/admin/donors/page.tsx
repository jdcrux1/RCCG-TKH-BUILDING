import { prisma } from '@/lib/prisma';
import { UserPlus, Search, Download, Filter } from 'lucide-react';
import AddDonorModal from '@/components/AddDonorModal';

export default async function DonorManagement() {
  const donors = await prisma.donor.findMany({
    where: { role: 'DONOR' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <header style={{ marginBottom: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Donor Management</h1>
          <p style={{ opacity: 0.6 }}>Manage Kingdom Builders profiles and pledges</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <AddDonorModal />
          <button style={{ 
            padding: '0.5rem 1rem', 
            border: '1px solid var(--glass-border)', 
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem'
          }}>
            <Download size={18} /> Import CSV
          </button>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-md)', padding: '12px', display: 'flex', gap: 'var(--space-md)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            style={{
              width: '100%',
              padding: '0.6rem 0.6rem 0.6rem 2.5rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'white',
              outline: 'none'
            }}
          />
        </div>
        <button style={{ 
          padding: '0.5rem 1rem', 
          border: '1px solid var(--glass-border)', 
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem'
        }}>
          <Filter size={18} /> Filter by Tier
        </button>
      </div>

      {/* Donor Table */}
      <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Phone</th>
              <th style={{ padding: '1rem' }}>Tier</th>
              <th style={{ padding: '1rem' }}>Monthly Pledge</th>
              <th style={{ padding: '1rem' }}>Total (24m)</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor) => (
              <tr key={donor.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}>{donor.name}</td>
                <td style={{ padding: '1rem', opacity: 0.7 }}>{donor.phone}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    background: 'var(--secondary)', 
                    padding: '2px 8px', 
                    borderRadius: 'var(--radius-full)' 
                  }}>
                    {donor.tier}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>₦{donor.monthlyPledge.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>₦{donor.totalPledged.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>● {donor.status}</span>
                </td>
              </tr>
            ))}
            {donors.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                  No donors found. Click "Add Donor" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
