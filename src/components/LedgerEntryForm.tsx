'use client';

import { useState } from 'react';
import { logContribution } from '@/app/admin/actions';
import { CreditCard, ArrowRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DonorOption {
  id: string;
  name: string;
  phone: string;
}

export default function LedgerEntryForm({ 
  donors,
  initialQuery
}: { 
  donors: DonorOption[];
  initialQuery: string;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [query, setQuery] = useState(initialQuery);

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

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push(`/admin/ledger?q=${encodeURIComponent(query)}`);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await logContribution(formData);
      setSuccess(true);
      setAmount('');
      e.currentTarget.reset();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to authorize payment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card" style={{ borderLeft: '4px solid var(--accent)' }}>
      <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800' }}>
        <CreditCard size={24} color="var(--accent)" /> Ledger Entry
      </h2>

      {/* Search Bar for Donors */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: 'var(--space-md)', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search donor name or phone..." 
          className="responsive-input"
          style={{ paddingLeft: '2.5rem' }}
        />
        <button type="submit" style={{ display: 'none' }} />
      </form>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid var(--danger)', 
          color: 'var(--danger)', 
          borderRadius: 'var(--radius-sm)', 
          marginBottom: '1rem',
          fontSize: '0.85rem'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: '10px', 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid var(--success)', 
          color: 'var(--success)', 
          borderRadius: 'var(--radius-sm)', 
          marginBottom: '1rem',
          fontSize: '0.85rem'
        }}>
          Payment authorized and logged to ledger successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kingdom Builder</label>
          <select 
            name="donorId" 
            required
            className="responsive-input"
          >
            <option value="" disabled selected>Select donor...</option>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Paid (₦)</label>
            <input 
              type="number" 
              name="amount" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 73500" 
              required 
              min="1"
              max="100000000"
              className="responsive-input"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Presets</label>
            <select 
              onChange={(e) => {
                if (e.target.value) {
                  setAmount(e.target.value);
                }
              }}
              value=""
              className="responsive-input"
            >
              <option value="" disabled>Standard Tier...</option>
              {TIERS.map(t => (
                <option key={t.name} value={t.amount} style={{ color: 'black' }}>
                  ₦{t.amount.toLocaleString()} - {t.name.replace(' Partner', '').replace(' Builder', '').replace(' Stone', '').replace(' Partners', '')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Ref / Narrative / Check #</label>
          <input 
            type="text" 
            name="reference" 
            placeholder="e.g. Zenith Check #492019 / electronic transfer" 
            required
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

        <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', marginTop: 'var(--space-sm)', padding: '1rem', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Authorizing...' : 'Authorize Payment'} <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
