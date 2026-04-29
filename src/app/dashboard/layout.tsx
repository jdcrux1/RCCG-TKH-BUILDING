import { Home, User, CreditCard } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTierColor } from '@/lib/tiers';
import { redirect } from 'next/navigation';

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const donor = await prisma.donor.findUnique({
    where: { id: session.userId }
  });

  if (!donor) redirect('/login');

  const tierColor = getTierColor(donor.tier);

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        background: 'var(--primary)', 
        display: 'flex', 
        flexDirection: 'column',
        // Inject Tier CSS Variables
        '--tier-primary': tierColor,
        '--tier-glow': `${tierColor}40`, // 25% opacity for glows
        '--tier-accent': tierColor,
      } as React.CSSProperties}
    >
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
            background: 'var(--tier-primary)', 
            padding: '8px', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--tier-glow)'
          }} className="hide-mobile">
            <Home size={20} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Kingdom Builders</h2>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <LogoutButton />
        </div>
      </header>

      <main style={{ padding: 'var(--space-md)', maxWidth: '1200px', margin: '0 auto', flex: 1, width: '100%' }} className="main-content">
        {children}
      </main>

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
      }} className="mobile-only">
        {[
          { name: 'Home', icon: Home, href: '/dashboard' },
          { name: 'Profile', icon: User, href: '/dashboard/profile' },
          { name: 'History', icon: CreditCard, href: '/dashboard/history' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px',
                color: 'rgba(255,255,255,0.6)',
                flex: 1,
                fontSize: '0.65rem'
              }}
            >
              <Icon size={22} />
              {item.name}
            </div>
          );
        })}
      </nav>


    </div>
  );
}
