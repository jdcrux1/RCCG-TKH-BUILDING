'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Flag, LogOut, Menu, X, Info } from 'lucide-react';
import { useState } from 'react';
import { logout } from '../actions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Claims & Verifications');

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => setIsGuideOpen(true)} 
            style={{ 
              color: 'var(--accent)', 
              padding: '8px', 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Info size={20} />
          </button>
          <button 
            onClick={handleLogout} 
            style={{ 
              color: 'var(--danger)', 
              padding: '8px', 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LogOut size={20} />
          </button>
        </div>
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

            {/* Custodian Guide Button */}
            <button 
              onClick={() => setIsGuideOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent)',
                background: 'rgba(0, 210, 255, 0.05)',
                border: '1px solid rgba(0, 210, 255, 0.1)',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginTop: 'var(--space-md)'
              }}
            >
              <Info size={20} />
              Custodian Guide
            </button>
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
          padding: '0',
          background: 'rgba(15, 23, 42, 0.5)',
          minHeight: '100vh',
          width: 'calc(100% - 260px)'
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

      {/* Custodian Interactive Guide Modal */}
      {isGuideOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }} onClick={() => setIsGuideOpen(false)}>
          <div style={{
            background: '#131924',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            position: 'relative',
            color: '#e0e6ed'
          }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsGuideOpen(false)}
              style={{
                position: 'absolute',
                top: '16px', right: '16px',
                background: 'transparent',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <Info size={24} style={{ color: 'var(--accent)' }} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Custodian Reference Guide</h3>
            </div>

            {/* Guide Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['Claims & Ledger', 'Pledges & Tiers', 'Bank Narration'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: activeTab === tab ? 'var(--accent)' : 'rgba(255, 255, 255, 0.08)',
                    background: activeTab === tab ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                    color: activeTab === tab ? 'var(--accent)' : '#aaa',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#b4c6ef', minHeight: '190px' }}>
              {activeTab === 'Claims & Ledger' && (
                <div>
                  <p style={{ margin: '0 0 12px 0' }}>
                    When donors make bank transfers, they submit a payment entry in their portal. This creates a <strong>Payment Claim</strong>.
                  </p>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.04)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <span style={{ display: 'inline-block', background: 'rgba(255, 179, 0, 0.15)', color: '#FFB300', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', marginRight: '8px' }}>PENDING CLAIM</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>
                        The builder completed the transfer on their end. Custodians must verify the receipt of funds in the bank account.
                      </p>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                      <span style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', marginRight: '8px' }}>APPROVED CLAIM</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>
                        A custodian verified the bank transaction and clicked "Verify & Log", which officially updates the contribution ledger and visual milestones.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Pledges & Tiers' && (
                <div>
                  <p style={{ margin: '0 0 12px 0' }}>
                    How member requests to join are processed:
                  </p>
                  <ul style={{ paddingLeft: '1.2rem', margin: '0 0 12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>
                      <strong>Pending Pledge</strong>: A sign-up from the website that has not yet been processed. Approve it on the dashboard to create their builder profile.
                    </li>
                    <li>
                      <strong>Active Builder</strong>: Fully registered donor with an assigned sequential reference ID (e.g. <code>KB-049</code>) and security login PIN.
                    </li>
                    <li>
                      <strong>Tiers</strong>: Builders are classified into tiers (e.g., <em>Willing Heart</em> at ₦5k, <em>Nehemiah Builder</em> at ₦100k) based on their self-selected monthly donation pledge.
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'Bank Narration' && (
                <div>
                  <p style={{ margin: '0 0 12px 0' }}>
                    The most critical operational rule for reconciliations:
                  </p>
                  <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '12px', borderRadius: '8px', color: '#f87171' }}>
                    <strong>⚠️ CRITICAL INSTRUCTION FOR DONORS:</strong>
                    <br />
                    When donors make bank transfers, they MUST use their unique <strong>Donor Reference ID</strong> (e.g., <code>KB-045</code>) in the bank transfer narration/memo field.
                    <br /><br />
                    Without this reference, it is extremely difficult for custodians to match incoming bank statement records to the correct builder profiles.
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsGuideOpen(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--accent)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '20px',
                transition: 'opacity 0.2s'
              }}
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

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
