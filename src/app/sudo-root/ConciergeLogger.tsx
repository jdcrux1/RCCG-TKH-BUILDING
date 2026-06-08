'use client';

import { useState, useTransition } from 'react';
import { Search, Loader2, CheckCircle2, User, CreditCard } from 'lucide-react';
import { searchDonorsForConcierge, logConciergeContribution } from '@/app/admin/actions';
import { useToast } from '@/components/Toast';

type DonorResult = {
  id: string;
  name: string;
  donorRefId: string | null;
  phone: string;
  bankAccountName: string | null;
};

export default function ConciergePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DonorResult[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<DonorResult | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const [isLogging, startLoggingTransition] = useTransition();
  
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [narrative, setNarrative] = useState('');
  
  const { showToast } = useToast();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.trim().length >= 2) {
      startSearchTransition(async () => {
        const donors = await searchDonorsForConcierge(val);
        setResults(donors);
      });
    } else {
      setResults([]);
    }
  };

  const handleSelect = (donor: DonorResult) => {
    setSelectedDonor(donor);
    setQuery('');
    setResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonor || !amount || !date) return;

    startLoggingTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('donorId', selectedDonor.id);
        formData.append('amount', amount);
        formData.append('date', date);
        formData.append('narrative', narrative);

        await logConciergeContribution(formData);
        
        showToast(`Successfully logged ₦${Number(amount).toLocaleString()} for ${selectedDonor.name}`);
        
        // Reset form
        setSelectedDonor(null);
        setAmount('');
        setNarrative('');
        setDate(new Date().toISOString().split('T')[0]);
      } catch (err) {
        showToast('Failed to log contribution', 'error');
      }
    });
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Concierge Logger</h1>
        <p style={{ opacity: 0.6 }}>
          Quickly map bank statement transfers directly to Donors. Use fuzzy search to find donors by their registered name, bank account name, or phone number.
        </p>
      </div>

      <div className="glass-card" style={{ marginBottom: 'var(--space-lg)', position: 'relative' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={20} /> Smart Search
        </h2>
        
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Type name, phone, or bank account name..."
            value={query}
            onChange={handleSearch}
            className="input"
            style={{ width: '100%', paddingLeft: '40px', fontSize: '1.1rem', minHeight: '50px' }}
          />
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '15px', opacity: 0.4 }} />
          {isSearching && <Loader2 size={20} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '15px', color: 'var(--accent)' }} />}
        </div>

        {results.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'var(--bg-main)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            zIndex: 50,
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {results.map(donor => (
              <div 
                key={donor.id}
                onClick={() => handleSelect(donor)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{donor.name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>ID: {donor.donorRefId || 'N/A'} • {donor.phone}</div>
                  {donor.bankAccountName && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '4px' }}>
                      Bank Name: {donor.bankAccountName}
                    </div>
                  )}
                </div>
                <div style={{ background: 'var(--accent)20', color: 'var(--accent)', padding: '4px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: '600' }}>
                  Select
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDonor && (
        <div className="glass-card animate-fade-in" style={{ border: '1px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="var(--accent)" /> Selected Donor
            </h2>
            <button 
              onClick={() => setSelectedDonor(null)}
              style={{ background: 'transparent', color: 'var(--danger)', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Clear Selection
            </button>
          </div>

          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{selectedDonor.name}</div>
            <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>{selectedDonor.donorRefId || 'No ID'} • {selectedDonor.phone}</div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Amount (₦)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input"
                  placeholder="e.g. 50000"
                  style={{ fontSize: '1.2rem', fontWeight: '700' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Date on Bank Statement</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Narrative / Remarks (Optional)</label>
              <input
                type="text"
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                className="input"
                placeholder="e.g. Transfer from GTBank..."
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isLogging}
              style={{ marginTop: 'var(--space-sm)', minHeight: '50px', fontSize: '1.1rem', justifyContent: 'center', gap: '8px' }}
            >
              {isLogging ? <Loader2 size={20} className="animate-spin" /> : <><CheckCircle2 size={20} /> Log Concierge Payment</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
