'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Flag, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { logout } from './actions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Donors', href: '/admin/donors', icon: Users },
    { name: 'Ledger', href: '/admin/ledger', icon: CreditCard },
    { name: 'Milestones', href: '/admin/milestones', icon: Flag },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--primary)',
        borderRight: '1px solid var(--glass-border)',
        padding: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 50,
        transition: 'transform 0.3s ease',
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(0)', // In mobile we'll handle differently
      }} className="desktop-sidebar">
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 className="text-gradient" style={{ fontSize: '1.2rem' }}>Kingdom Builders</h2>
          <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>ADMIN PORTAL</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--glass-hover)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'white',
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            background: 'transparent',
            marginTop: 'auto'
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: '260px', 
        padding: 'var(--space-md)',
        background: 'rgba(15, 23, 42, 0.5)'
      }}>
        {children}
      </main>

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
