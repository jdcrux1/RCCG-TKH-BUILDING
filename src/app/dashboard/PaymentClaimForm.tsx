'use client';

import { useState } from 'react';
import { submitPaymentClaim } from './actions';

export default function PaymentClaimForm({ monthlyPledge, tierColor }: { monthlyPledge?: number; tierColor?: string }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitPaymentClaim(formData);

    setLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: 'Payment claim submitted successfully! An admin will verify it soon.' });
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to submit claim.' });
    }
  }

  return (
    <div className="glass-card" style={{ marginTop: 'var(--space-md)' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Log a New Payment</h3>
      
      {message && (
        <div style={{ 
          padding: '12px', 
          borderRadius: 'var(--radius-sm)', 
          marginBottom: '1rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? 'var(--success)' : '#ff6b6b',
          border: `1px solid ${message.type === 'success' ? 'var(--success)' : '#ff6b6b'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.85rem', opacity: 0.7 }}>Amount Paid (₦)</label>
          <input 
            name="amount" 
            type="number" 
            required 
            placeholder="e.g. 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              padding: '0.8rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'white',
              outline: 'none',
              marginBottom: monthlyPledge && monthlyPledge > 0 ? '4px' : '0'
            }}
          />
          {monthlyPledge && monthlyPledge > 0 && (
            <button 
              type="button"
              onClick={() => setAmount(Math.round(monthlyPledge / 100).toString())}
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--accent)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 16px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                alignSelf: 'flex-start',
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '6px'
              }}
            >
              Quick Select: ₦{Math.round(monthlyPledge / 100).toLocaleString()}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.85rem', opacity: 0.7 }}>Date of Transfer</label>
          <input 
            name="date" 
            type="date" 
            required 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              padding: '0.8rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'white',
              outline: 'none',
              colorScheme: 'dark',
              '--tier-accent': tierColor,
              '--tier-glow': tierColor ? `${tierColor}40` : undefined
            } as React.CSSProperties}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.85rem', opacity: 0.7 }}>Bank Transferred From</label>
          <input 
            name="bankName" 
            type="text" 
            required 
            placeholder="e.g. GTBank, Zenith"
            style={{
              padding: '0.8rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'white',
              outline: 'none'
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            marginTop: '0.5rem',
            padding: '1rem',
            background: 'var(--tier-primary)',
            color: 'var(--primary)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Payment Claim'}
        </button>
      </form>
    </div>
  );
}
