import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight } from 'lucide-react';
import styles from './landing.module.css';
import InstantDonate from '@/components/InstantDonate';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Brand Logo */}
      <div className={styles.brand}>
        RCCG THE KING&apos;S HOUSE
      </div>

      <main className={styles.hero}>
        {/* Background Image Container */}
        <div className={styles.background}>
          <Image 
            src="/images/hero-building.png" 
            alt="The King's House Citadel" 
            fill
            className={styles.backgroundImg}
            priority
          />
          <div className={styles.overlay} />
        </div>

        {/* Content Section */}
        <div className={styles.content}>
          <span className={styles.label}>Building Project 2024-2026</span>
          
          <h1 className={styles.title}>
            Building a <br />
            <span className="text-gold">Sanctuary of Faith</span><br />
            Together.
          </h1>

          <p className={styles.subtitle}>
            Join us in our mission to build a monument for Kingdom Advancement. 
            A state-of-the-art citadel featuring a dedicated basement, expansive ground floor sanctuary, 
            and premium first-floor facilities with ample parking space.
          </p>

          <div className={styles.cta}>
            <Link href="/login" className={styles.primaryBtn}>
              Become a Kingdom Builder <ArrowRight size={24} />
            </Link>
            <InstantDonate />
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>₦650M</span>
              <span className={styles.statLabel}>Campaign Goal</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>1,000+</span>
              <span className={styles.statLabel}>Target Partners</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>24</span>
              <span className={styles.statLabel}>Month Journey</span>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div>© {new Date().getFullYear()} RCCG TKH BUILDING PROJECT</div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <span>Faith</span>
          <span>Commitment</span>
          <span>Legacy</span>
        </div>
        <div className="hide-mobile">Next Generation Church Citadel</div>
      </footer>
    </div>
  );
}
