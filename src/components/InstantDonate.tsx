'use client';

import { useState } from 'react';
import { Landmark, Copy, CheckCircle } from 'lucide-react';
import styles from './InstantDonate.module.css';

export default function InstantDonate() {
  const [copied, setCopied] = useState(false);
  const accNumber = "0130430547";

  const handleCopy = () => {
    navigator.clipboard.writeText(accNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.quickGiveCard}>
      <div className={styles.glow} />

      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          <Landmark size={20} color="black" />
        </div>
        <h3 className={styles.title}>Quick Give (Direct Transfer)</h3>
      </div>
      
      <span className={styles.scripture}>
        &quot;God loves a cheerful giver.&quot; &mdash; 2 Cor 9:7
      </span>
      
      <p className={styles.microCopy}>
        Every seed matters. Use the details below for a direct, one-time freewill offering to support the vision. We are incredibly grateful for your generosity!
      </p>

      <div className={styles.details}>
        <p className={styles.detailRow}>Bank: <strong className={styles.highlight}>HAGGAI MORTGAGE BANK</strong></p>
        <p className={styles.detailRow}>Account Name: <strong>RCCG The King&apos;s House</strong></p>
        
        <div className={styles.accountBox}>
          <span className={styles.accountNumber}>
            {accNumber}
          </span>
          <button 
            onClick={handleCopy}
            className={styles.copyBtn}
          >
            {copied ? <CheckCircle size={16} color="var(--success)" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      
      <span className={styles.narrationNote}>
        Note: Please use &quot;Freewill&quot; as your transfer narration.
      </span>
    </div>
  );
}
