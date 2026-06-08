'use client';

import { TIERS, getTierColor } from '@/lib/tiers';
import styles from './PartnershipTiers.module.css';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PartnershipTiers() {
  // Filter out the 'One-Time Giver' or any 0-tier if it exists for the public list
  const displayTiers = TIERS.filter(t => t.min > 0);

  return (
    <section className={styles.section} id="partnership">
      <div className={styles.glow} />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Partnership Context</span>
          <h2 className={styles.title}>Ways to Partner</h2>
          <p className={styles.subtitle}>
            Choose a monthly commitment that aligns with your faith and capacity. 
            Every seed counts toward our collective goal.
          </p>
        </div>

        <div className={styles.grid}>
          {displayTiers.map((tier) => (
            <div 
              key={tier.name} 
              className={styles.card}
              style={{ '--tierColor': getTierColor(tier.name) } as React.CSSProperties}
            >
              <h3 className={styles.tierName}>{tier.name}</h3>
              <div className={styles.amount}>
                ₦{tier.min.toLocaleString()}
              </div>
              <div className={styles.frequency}>per month for 24 months</div>
              
              <Link href="#pledge" className={styles.cta}>
                Become a {tier.name} <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
