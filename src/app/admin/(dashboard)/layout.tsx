'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Flag, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { logout } from '../actions';

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
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Mobile Header */}
      <header style={{
        display: 'none',
        padding: '12px var(--space-md)',
        background: 'var(--primary)',
        borderBottom: '1px solid var(--glass-border)',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }} className="mobile-only">
        <div>
          <h2 className="text-gradient" style={{ fontSize: '1rem', margin: 0 }}>Kingdom Builders</h2>
          <p style={{ fontSize: '0.6rem', opacity: 0.5, margin: 0 }}>ADMIN</p>
        </div>
        <button onClick={handleLogout} style={{ color: 'var(--danger)', padding: '8px' }}>
          <LogOut size={20} />
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar (Desktop) */}
        <aside style={{
          width: '260px',
          background: 'var(--primary)',
          borderRight: '1px solid var(--glass-border)',
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 50
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
          background: 'rgba(15, 23, 42, 0.5)',
          minHeight: '100vh'
        }} className="main-content">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--glass-border)',
        padding: '8px 4px',
        justifyContent: 'space-around',
        zIndex: 100,
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))'
      }} className="mobile-only bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px',
                color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
                flex: 1,
                fontSize: '0.65rem',
                fontWeight: isActive ? '600' : '400',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={22} style={{ transform: isActive ? 'translateY(-2px)' : 'none' }} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding-bottom: 80px !important; /* Space for bottom nav */
          }
          .bottom-nav {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
