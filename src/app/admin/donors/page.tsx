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
          <AddDonorModal />
          <button style={{ 
            padding: '0.5rem 1rem', 
            border: '1px solid var(--glass-border)', 
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem'
          }} className="hide-mobile">
            <Download size={18} /> Import CSV
          </button>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="glass-card responsive-filters" style={{ 
        marginBottom: 'var(--space-md)', 
        padding: '12px', 
        display: 'flex', 
        gap: 'var(--space-md)',
        flexDirection: 'row'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input 
            type="text" 
            placeholder="Search by name..." 
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
          fontSize: '0.9rem',
          whiteSpace: 'nowrap'
        }}>
          <Filter size={18} /> <span className="hide-mobile">Filter</span>
        </button>
      </div>

      {/* Donor Table (Desktop) */}
      <div className="glass-card hide-mobile" style={{ padding: 0, overflowX: 'auto' }}>
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
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {donor.name}
                    <a 
                      href={`https://wa.me/${donor.phone.replace(/^0/, '234')}?text=${encodeURIComponent(`Hello ${donor.name.split(' ')[0]}, you've been invited to the Kingdom Builders portal! \n\nLog in with your phone: ${donor.phone}\nTemporary PIN: 1234\n\nVisit: https://rccg-tkh-building.netlify.app/login`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#25D366', opacity: 0.8 }}
                      title="Invite via WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .081 5.391.079 11.99c0 2.112.553 4.177 1.601 6.011L0 24l6.149-1.613a11.815 11.815 0 005.9 1.532h.005c6.605 0 11.97-5.391 11.972-11.991a11.821 11.821 0 00-3.575-8.472"></path></svg>
                    </a>
                  </div>
                </td>
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
          </tbody>
        </table>
      </div>

      {/* Donor Cards (Mobile) */}
      <div className="mobile-only-list" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
        {donors.map((donor) => (
          <div key={donor.id} className="glass-card" style={{ padding: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1rem' }}>{donor.name}</h3>
                    <a 
                      href={`https://wa.me/${donor.phone.replace(/^0/, '234')}?text=${encodeURIComponent(`Hello ${donor.name.split(' ')[0]}, you've been invited to the Kingdom Builders portal! \n\nLog in with your phone: ${donor.phone}\nTemporary PIN: 1234\n\nVisit: https://rccg-tkh-building.netlify.app/login`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#25D366', display: 'flex', alignItems: 'center' }}
                      title="Invite via WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .081 5.391.079 11.99c0 2.112.553 4.177 1.601 6.011L0 24l6.149-1.613a11.815 11.815 0 005.9 1.532h.005c6.605 0 11.97-5.391 11.972-11.991a11.821 11.821 0 00-3.575-8.472"></path></svg>
                    </a>
                  </div>
                  <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>● {donor.status}</span>
                </div>
            <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '12px' }}>{donor.phone}</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span style={{ 
                fontSize: '0.7rem', 
                background: 'var(--secondary)', 
                padding: '2px 8px', 
                borderRadius: 'var(--radius-full)' 
              }}>
                {donor.tier}
              </span>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px', 
              paddingTop: '12px',
              borderTop: '1px solid var(--glass-border)'
            }}>
              <div>
                <p style={{ fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase' }}>Monthly</p>
                <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>₦{donor.monthlyPledge.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase' }}>Total</p>
                <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>₦{donor.totalPledged.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {donors.length === 0 && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
          No donors found. Click "Add Donor" to get started.
        </div>
      )}


    </div>
  );
}
