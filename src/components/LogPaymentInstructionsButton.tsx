'use client';
import { useState } from 'react';
import { Info, X, Upload, CheckCircle, FileText } from 'lucide-react';

export default function LogPaymentInstructionsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        <Info size={16} /> How to Log your Seed
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#111',
            border: '1px solid var(--glass-border)',
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
                top: '1rem', right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'white',
                opacity: 0.5,
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '0.5'}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info color="var(--tier-primary)" /> How to Log your Seed
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '10px', borderRadius: '50%', color: 'var(--tier-primary)' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '4px' }}>1. Sow Your Seed</h4>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Transfer your contribution to the official project account: <strong>RCCG The King&apos;s House (Haggai Mortgage Bank: 0130430547)</strong>. May the Lord bless your seed.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '10px', borderRadius: '50%', color: 'var(--tier-primary)' }}>
                  <Upload size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '4px' }}>2. Log Your Seed</h4>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Scroll down to the "Log your Seed" section. Faithfully enter the exact amount and date of your transfer so we can accurately account for your giving.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '10px', borderRadius: '50%', color: 'var(--tier-primary)' }}>
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '4px' }}>3. Await Verification</h4>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>The church admin will verify your seed against the bank statement. Once confirmed, your Kingdom Builders dashboard will instantly reflect your impact!</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--tier-primary)',
                color: 'black',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'bold',
                marginTop: '2rem',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </>
  );
}
