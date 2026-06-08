import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import styles from './landing.module.css';
import PledgeForm from '@/components/PledgeForm';
import RevealOnScroll from '@/components/RevealOnScroll';
import LiveVelocityTracker from '@/components/LiveVelocityTracker';
import QuickGiveDrawer from '@/components/QuickGiveDrawer';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const targetGoal = 650000000;
  
  // Calculate total raised
  const totalContributions = await prisma.contribution.aggregate({ _sum: { amount: true } });
  const currentRaised = Number(totalContributions._sum.amount || 0) / 100;

  // Calculate 30-day velocity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentContributions = await prisma.contribution.aggregate({
    where: { date: { gte: thirtyDaysAgo } },
    _sum: { amount: true }
  });
  const monthlyVelocity = Number(recentContributions._sum.amount || 0) / 100;

  return (
    <div className={styles.container}>
      {/* FLOATING PILL NAVIGATION */}
      <div className={styles.navWrapper}>
        <nav className={styles.navPill}>
          <Link href="/" className={styles.brand}>
            TKH
          </Link>
          <a href="#vision" className={styles.pillLink}>The Vision</a>
          <a href="#pledge" className={styles.pillLink}>Pledge Now</a>
          <Link href="/login" className={styles.pillLogin}>Login</Link>
        </nav>
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
            <div className={styles.heroLeft}>
              
              <RevealOnScroll>
                <h1 className={styles.title}>
                  Building a <br />
                  <span className="text-gold">Sanctuary of Faith</span><br />
                  Together.
                </h1>
              </RevealOnScroll>

              <RevealOnScroll threshold={0.5}>
                <p className={styles.subtitle}>
                  Join us in our mission to build a monument for Kingdom Advancement.
                </p>
              </RevealOnScroll>

              <RevealOnScroll threshold={0.8}>
                <div className={styles.cta}>
                  <Link href="/login" className={`${styles.primaryBtn} magneticButton`}>
                    Kingdom Builder Login <ArrowRight size={24} />
                  </Link>
                  <QuickGiveDrawer />
                </div>
              </RevealOnScroll>

              <RevealOnScroll threshold={0.9}>
                <LiveVelocityTracker 
                  currentRaised={currentRaised} 
                  targetGoal={targetGoal} 
                  monthlyVelocity={monthlyVelocity} 
                />
              </RevealOnScroll>

              <RevealOnScroll>
                <div className={styles.statsGrid}>
                  <div className={`${styles.statItem} liftCard`}>
                    <span className={styles.statValue}>₦650M</span>
                    <span className={styles.statLabel}>Campaign Goal</span>
                  </div>
                  <div className={`${styles.statItem} liftCard`}>
                    <span className={styles.statValue}>1,000+</span>
                    <span className={styles.statLabel}>Target Partners</span>
                  </div>
                  <div className={`${styles.statItem} liftCard`}>
                    <span className={styles.statValue}>24</span>
                    <span className={styles.statLabel}>Month Journey</span>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            <div className={styles.scrollIndicator}>
              <div className={styles.scrollLine}></div>
              <span className={styles.scrollText}>Discover the Vision</span>
            </div>
          </div>
        </section>

        {/* VISION SECTION (SCROLLYTELLING) */}
        <section id="vision" className={styles.visionSection}>
          <div className={styles.visionContent}>
            <RevealOnScroll className={styles.visionTextWrapper}>
              <span className={styles.label}>The Blueprint</span>
              <h2 className={styles.visionTitle}>The Future Citadel.</h2>
              <div className={styles.visionText}>
                <p style={{ marginBottom: '1.5rem', fontStyle: 'italic', opacity: 0.9 }}>
                  &quot;Unless the Lord builds the house, the builders labor in vain.&quot; &mdash; Psalm 127:1
                </p>
                <p>
                  By God&apos;s grace and our collective faith, we are praying toward opening the doors of our new sanctuary by 2028. Relying entirely on Him, this state-of-the-art citadel is being built with divine purpose: an expansive ground-floor auditorium for powerful worship encounters, premium first-floor facilities to equip our youth for the future, and a dedicated basement ensuring seamless hospitality for every member and guest.
                </p>
              </div>
            </RevealOnScroll>
            
            <RevealOnScroll className={styles.visionImageWrapper} threshold={0.3}>
              <Image 
                src="/images/tkh-3d.jpg" 
                alt="The King&apos;s House 3D Render" 
                width={900}
                height={700}
                className={`${styles.visionImage} liftCard`}
                quality={100}
              />
            </RevealOnScroll>
          </div>
        </section>

        {/* PLEDGE CAPTURE SECTION */}
        <section id="pledge" className={styles.pledgeSection}>
          <RevealOnScroll style={{ width: '100%', maxWidth: '600px' }}>
            <PledgeForm />
          </RevealOnScroll>
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
