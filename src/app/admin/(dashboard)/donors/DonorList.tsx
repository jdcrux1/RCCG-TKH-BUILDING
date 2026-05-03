'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { memo, useState, useTransition, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  'Cornerstone Partner': { bg: '#713f12', text: '#fbbf24' },
  'Pillar Builder': { bg: '#581c87', text: '#e9d5ff' },
  'Foundation Stone': { bg: '#7c2d12', text: '#fdba74' },
  'Nehemiah Builder': { bg: '#1e3a8a', text: '#dbeafe' },
  'Covenant Partners': { bg: '#1e3a8a', text: '#dbeafe' },
  'Faithful Hand': { bg: '#14532d', text: '#bbf7d0' },
  'Open-Heart': { bg: '#134e4a', text: '#ccfbf1' },
  'Willing Heart': { bg: '#713f12', text: '#fef08a' },
  'Supporter': { bg: '#f3f4f6', text: '#1f2937' },
};

function formatWhatsAppLink(phone: string, name: string): string {
  const cleanPhone = phone.replace(/^0/, '234').replace(/\D/g, '');
  const firstName = name.split(' ')[0] || 'Brother/Sister';
  const message = `Hello ${firstName}, you've been invited to the Kingdom Builders portal!\n\nLog in with your phone: ${phone}\n\nPlease check with the committee for your unique login PIN.\n\nVisit: https://rccg-tkh-building.vercel.app/login`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

type Donor = {
  id: string;
  name: string;
  phone: string;
  tier: string;
  monthlyPledge: bigint;
  totalPledged: bigint;
  status: string;
};

function DonorListComponent({ 
  donors, 
  total, 
  page, 
  totalPages,
  query 
}: { 
  donors: Donor[]; 
  total: number;
  page: number;
  totalPages: number;
  query: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(query);
  const [, startTransition] = useTransition();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef(search);

  const doSearch = useCallback((value: string) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (value) params.set('q', value);
      params.set('page', '1');
      router.push(`/admin/donors?${params.toString()}`);
    });
  }, [router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    searchRef.current = value;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => doSearch(searchRef.current), 300);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    doSearch(search);
  };

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/admin/donors?${params.toString()}`);
  };

  return (
    <>
      <form onSubmit={handleSearch} style={{ 
        marginBottom: 'var(--space-md)', 
        padding: '12px', 
        display: 'flex', 
        gap: 'var(--space-md)',
        flexDirection: 'row',
        background: 'var(--glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={search}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '0.6rem 0.6rem 0.6rem 2.5rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'white',
              outline: 'none',
              minHeight: '44px'
            }}
          />
        </div>
        <button type="submit" style={{ 
          padding: '0.5rem 1rem', 
          border: '1px solid var(--glass-border)', 
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          whiteSpace: 'nowrap',
          background: 'var(--accent)',
          color: 'var(--primary)',
          cursor: 'pointer',
          minHeight: '44px'
        }}>
          Search
        </button>
      </form>

      <div style={{ padding: 0, overflowX: 'auto', background: 'var(--glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
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
                      href={formatWhatsAppLink(donor.phone, donor.name)}
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    background: TIER_COLORS[donor.tier]?.bg || TIER_COLORS['Supporter'].bg,
                    color: TIER_COLORS[donor.tier]?.text || TIER_COLORS['Supporter'].text,
                  }}>
                    {donor.tier}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>₦{(Number(donor.monthlyPledge) / 100).toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>₦{(Number(donor.totalPledged) / 100).toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>● {donor.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
        <span style={{ opacity: 0.6, fontSize: '0.85rem' }}>Showing {donors.length} of {total} donors</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => goToPage(page - 1)} 
            disabled={page <= 1}
            style={{ padding: '6px 12px', border: '1px solid var(--glass-border)', background: page <= 1 ? 'transparent' : 'var(--accent)', color: page <= 1 ? '#444' : 'var(--primary)', cursor: page <= 1 ? 'not-allowed' : 'pointer', minHeight: '44px' }}
          >
            Prev
          </button>
          <span style={{ padding: '6px 12px', opacity: 0.6 }}>{page} / {totalPages}</span>
          <button 
            onClick={() => goToPage(page + 1)} 
            disabled={page >= totalPages}
            style={{ padding: '6px 12px', border: '1px solid var(--glass-border)', background: page >= totalPages ? 'transparent' : 'var(--accent)', color: page >= totalPages ? '#444' : 'var(--primary)', cursor: page >= totalPages ? 'not-allowed' : 'pointer', minHeight: '44px' }}
          >
            Next
          </button>
        </div>
      </div>

      {donors.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', opacity: 0.5 }}>
          No donors found. Click "Add Donor" to get started.
        </div>
      )}
    </>
  );
}

export default memo(DonorListComponent);