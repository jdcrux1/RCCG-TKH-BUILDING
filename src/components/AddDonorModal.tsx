'use client';

import { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { addDonor } from '@/app/admin/actions';

export default function AddDonorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    // Let the server action handle it via form action
    // But we'll use a small delay or state change to close the modal
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary" 
        style={{ padding: '0.5rem 1rem' }}
      >
        <UserPlus size={18} /> Add Donor
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
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', position: 'relative' }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent', color: 'white' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ marginBottom: 'var(--space-md)' }}>Register New Donor</h2>
            
            <form 
              action={async (formData) => {
                setLoading(true);
                await addDonor(formData);
                setLoading(false);
                setIsOpen(false);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Full Name</label>
                <input 
                  name="name" 
                  required 
                  placeholder="e.g. John Doe"
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
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Phone Number (Verified)</label>
                <input 
                  name="phone" 
                  required 
                  placeholder="e.g. 08012345678"
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
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Email Address</label>
                <input 
                  name="email" 
                  type="email"
                  placeholder="e.g. john@example.com"
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
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Monthly Pledge (₦)</label>
                <input 
                  name="monthlyPledge" 
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
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Login PIN (Default: 1234)</label>
                <input 
                  name="pin" 
                  type="password"
                  placeholder="1234"
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

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                style={{ justifyContent: 'center', marginTop: 'var(--space-sm)' }}
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Register Kingdom Builder'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
