'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, Loader2, User } from 'lucide-react';

export default function DonorLogin() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin, role: 'DONOR' }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 'var(--space-md)'
    }}>
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
          <div style={{ 
            background: 'var(--secondary)', 
            width: '60px', 
            height: '60px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto var(--space-sm)'
          }}>
            <User size={30} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Kingdom Builder Login</h2>
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Access your personalized donor portal</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0, pointerEvents: 'none' }} />
            <input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ justifyContent: 'center', width: '100%', marginTop: 'var(--space-xs)' }}
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Access Dashboard <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
