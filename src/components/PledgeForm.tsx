'use client';

import { useState } from 'react';
import { VALID_TIERS } from '@/lib/tiers';

export default function PledgeForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!name || !phone || !tier) {
      setError('Please fill out all fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/pledge-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, tier })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
        <h3 style={{ color: '#10b981', fontSize: '20px', marginBottom: '12px' }}>Request Received!</h3>
        <p style={{ color: '#aaa', fontSize: '14px' }}>
          Thank you for joining the Kingdom Builders! Your request has been sent to our team. You will receive a WhatsApp message shortly with your login credentials.
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.03)', 
      backdropFilter: 'blur(10px)', 
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      padding: '32px', 
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
    }}>
      <h3 style={{ fontSize: '24px', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>Become a Kingdom Builder</h3>
      <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>
        Fill out this form to request your unique Donor ID and start your monthly pledge.
      </p>

      {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="John Doe"
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'rgba(0,0,0,0.5)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>WhatsApp Number</label>
          <input 
            type="tel" 
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+234 800 000 0000"
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'rgba(0,0,0,0.5)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Select Your Tier</label>
          <select 
            value={tier}
            onChange={e => setTier(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'rgba(0,0,0,0.5)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px',
              appearance: 'none'
            }}
          >
            <option value="" disabled>-- Select a Tier --</option>
            {VALID_TIERS.map(t => (
              <option key={t} value={t} style={{ background: '#111' }}>{t}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            marginTop: '8px',
            background: isSubmitting ? '#444' : '#fff', 
            color: '#000', 
            padding: '16px', 
            borderRadius: '8px', 
            border: 'none', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s ease'
          }}
        >
          {isSubmitting ? 'SUBMITTING...' : 'JOIN THE VISION'}
        </button>
      </form>
    </div>
  );
}
