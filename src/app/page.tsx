import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import styles from './landing.module.css';
import InstantDonate from '@/components/InstantDonate';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Brand Logo */}
      <div className={styles.brand}>
        RCCG THE KING&apos;S HOUSE
      </div>

      <main>
        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <div className={styles.background}>
            <Image 
              src="/images/hero-building.png" 
              alt="The King&apos;s House Citadel" 
              fill
              className={styles.backgroundImg}
              priority
            />
            <div className={styles.overlay} />
          </div>

          <div className={styles.heroContent}>
            <span className={styles.label}>Building Project 2026-2028</span>
            
            <h1 className={styles.title}>
              Building a <br />
              <span className="text-gold">Sanctuary of Faith</span><br />
              Together.
            </h1>

            <p className={styles.subtitle}>
              Join us in our mission to build a monument for Kingdom Advancement.
            </p>

            <div className={styles.cta}>
              <Link href="/login" className={styles.primaryBtn}>
                Kingdom Builder Login <ArrowRight size={24} />
              </Link>
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

            <div className={styles.scrollIndicator}>
              <span className={styles.scrollText}>Discover the Vision</span>
              <div className={styles.scrollLine}></div>
            </div>
          </div>
        </section>

        {/* VISION SECTION (SCROLLYTELLING) */}
        <section className={styles.visionSection}>
          <div className={styles.visionContent}>
            <div className={styles.visionTextWrapper}>
              <span className={styles.label}>The Blueprint</span>
              <h2 className={styles.visionTitle}>The Future Citadel.</h2>
              <p className={styles.visionText}>
                By 2028, The King&apos;s House will open its doors to a state-of-the-art sanctuary. 
                Designed for absolute excellence, the new citadel features an expansive ground-floor auditorium for worship, 
                premium first-floor facilities tailored for children and youth, and a dedicated basement ensuring ample parking for all members and guests.
              </p>
              
              {/* Quick Give placed logically after the vision pitch */}
              <div style={{ marginTop: '3rem' }}>
                <InstantDonate />
              </div>
            </div>
            
            <div className={styles.visionImageWrapper}>
              <Image 
                src="/images/tkh-3d.jpg" 
                alt="The King&apos;s House 3D Render" 
                width={900}
                height={700}
                className={styles.visionImage}
                quality={100}
              />
            </div>
          </div>
        </section>
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
