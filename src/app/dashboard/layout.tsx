import { Home, User, CreditCard } from 'lucide-react';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTierColor } from '@/lib/tiers';
import styles from './dashboard.module.css';
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
      <header className={styles.appHeader}>
        <div className={styles.brandCluster}>
          <div className={`${styles.homeIconWrapper} hide-mobile`}>
            <Home size={20} color="var(--primary-gold)" />
          </div>
          <h2 className={styles.brandText}>Kingdom Builders</h2>
        </div>

        <LogoutButton />
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
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
      }} className="mobile-only">
        {[
          { name: 'Home', icon: Home, href: '/dashboard' },
          { name: 'Profile', icon: User, href: '/dashboard#profile' },
          { name: 'History', icon: CreditCard, href: '/dashboard#history' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.name}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px',
                color: 'rgba(255,255,255,0.6)',
                flex: 1,
                fontSize: '0.65rem',
                transition: 'color 0.2s ease',
                minHeight: '44px'
              }}
            >
              <Icon size={22} />
              {item.name}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
