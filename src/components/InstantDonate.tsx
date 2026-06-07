'use client';

import { useState } from 'react';
import { Landmark, Copy, CheckCircle } from 'lucide-react';

export default function InstantDonate() {
  const [copied, setCopied] = useState(false);
  const accNumber = "0130430547";

  const handleCopy = () => {
    navigator.clipboard.writeText(accNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card" style={{
      marginTop: '2rem',
      maxWidth: '500px',
      width: '100%',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: 'var(--accent)',
        filter: 'blur(80px)',
        opacity: 0.2,
        borderRadius: '50%'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
        <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '8px' }}>
          <Landmark size={20} color="black" />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: 'white' }}>Quick Give (Bank Transfer)</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ opacity: 0.9, fontSize: '0.9rem', margin: 0, color: 'white' }}>Bank: <strong style={{ color: 'var(--accent)' }}>HAGGAI MORTGAGE BANK</strong></p>
        <p style={{ opacity: 0.9, fontSize: '0.9rem', margin: 0, color: 'white' }}>Account Name: <strong>RCCG The King&apos;s House</strong></p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'rgba(0,0,0,0.4)',
          padding: '12px 16px',
          borderRadius: '8px',
          marginTop: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--accent)' }}>
            {accNumber}
          </span>
          <button 
            onClick={handleCopy}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.2s',
              minHeight: '44px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {copied ? <CheckCircle size={16} color="var(--success)" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
