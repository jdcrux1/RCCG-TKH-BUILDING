'use client';

import { useState } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { selfRecordContribution } from '@/app/dashboard/actions';

export default function QuickDonateModal({ donorId, donorName }: { donorId: string, donorName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary" 
        style={{ padding: '0.5rem 1rem' }}
      >
        <CreditCard size={18} /> Record Payment
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'var(--space-md)'
        }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', position: 'relative' }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent', color: 'white' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ marginBottom: 'var(--space-md)' }}>Record Payment</h2>
            
            <form 
              action={async (formData) => {
                setLoading(true);
                await selfRecordContribution(formData);
                setLoading(false);
                setIsOpen(false);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}
            >
              <input type="hidden" name="donorId" value={donorId} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Donor Name</label>
                <input 
                  type="text"
                  value={donorName}
                  disabled
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'white',
                    opacity: 0.7,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Amount Paid (₦)</label>
                <input 
                  name="amount" 
                  type="number"
                  required 
                  placeholder="e.g. 50000"
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
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Payment Date</label>
                <input 
                  name="date" 
                  type="date"
                  required 
                  defaultValue={new Date().toISOString().split('T')[0]}
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

              <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '8px' }}>
                Note: This payment will be recorded as pending until verified by the administration team.
              </p>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                style={{ justifyContent: 'center', marginTop: 'var(--space-sm)' }}
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Submit Payment Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
