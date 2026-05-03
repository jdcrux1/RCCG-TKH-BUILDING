'use client';

import { useState } from 'react';
import { Landmark, Copy, X, Info } from 'lucide-react';

export default function InstantDonate({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className={className}
        style={{ cursor: 'pointer', border: 'none' }}
      >
        <Landmark size={24} /> Instant Donation
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: '#111',
        border: '1px solid #333',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '500px',
        padding: '2rem',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <button 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: '#666',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'var(--tier-primary)', 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Landmark size={32} color="black" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Instant Bank Donation</h2>
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Thank you for your seed towards the building project.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#0a0a0a', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #222' }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.4, marginBottom: '4px' }}>Bank Name</p>
            <p style={{ fontWeight: '600' }}>Premium Trust Bank</p>
          </div>

          <div style={{ background: '#0a0a0a', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.4, marginBottom: '4px' }}>Account Number</p>
              <p style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>0040239581</p>
            </div>
            <button 
              onClick={() => copyToClipboard('0040239581')}
              style={{ background: 'transparent', border: 'none', color: 'var(--tier-primary)', cursor: 'pointer' }}
            >
              <Copy size={20} />
            </button>
          </div>

          <div style={{ background: '#0a0a0a', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #222' }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.4, marginBottom: '4px' }}>Account Name</p>
            <p style={{ fontWeight: '600' }}>RCCG The King&apos;s House Building Project</p>
          </div>

          <div style={{ 
            background: 'rgba(212, 175, 55, 0.1)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--tier-primary)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <Info size={20} color="var(--tier-primary)" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
              <strong>NARRATION:</strong> Please use <span style={{ color: 'var(--tier-primary)', fontWeight: 'bold' }}>&quot;GUEST&quot;</span> or your phone number as the narration for this transfer.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsOpen(false)}
          style={{
            width: '100%',
            padding: '1rem',
            background: 'var(--tier-primary)',
            color: 'black',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'bold',
            marginTop: '2rem',
            cursor: 'pointer'
          }}
        >
          I have made the transfer
        </button>
      </div>
    </div>
  );
}
