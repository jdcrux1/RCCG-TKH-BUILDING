'use client';

import { LogOut, Home, User } from 'lucide-react';
import { logout } from '@/app/admin/actions';

export default function DonorLayout({ children }: { children: React.ReactNode }) {

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--primary)' }}>
      {/* Top Nav */}
      <header style={{
        padding: '1rem var(--space-md)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: 'var(--accent)', 
            padding: '8px', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Home size={20} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1rem', fontWeight: '700' }}>Kingdom Builders</h2>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <button 
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: 'var(--danger)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main style={{ padding: 'var(--space-md)', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
