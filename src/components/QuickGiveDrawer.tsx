'use client';

import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Info } from 'lucide-react';
import styles from './QuickGiveDrawer.module.css';

export default function QuickGiveDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const accNumber = "0130430547";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(accNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button className={styles.triggerBtn} onClick={() => setIsOpen(true)}>
        Quick Give (Transfer)
      </button>

      <div className={`${styles.drawerOverlay} ${isOpen ? styles.open : ''}`} onClick={() => setIsOpen(false)} />
      
      <div className={`${styles.drawerContent} ${isOpen ? styles.open : ''}`}>
        
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Direct<br />Transfer</h2>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <span className={styles.scripture}>
          "God loves a cheerful giver." — 2 Cor 9:7
        </span>

        <p className={styles.bodyText}>
          Every seed matters. Use the details below for a direct, one-time freewill offering to support the vision. We are incredibly grateful for your generosity.
        </p>

        <div className={styles.accountCard}>
          <div className={styles.bankDetailsGrid}>
            <div>
              <span className={styles.label}>Bank Name</span>
              <span className={styles.value}>HAGGAI MORTGAGE BANK</span>
            </div>
            <div>
              <span className={styles.label}>Account Name</span>
              <span className={styles.value}>RCCG The King's House</span>
            </div>
          </div>

          <div className={styles.accountNumberStrip}>
            <span className={styles.accountNumber}>{accNumber}</span>
            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? <CheckCircle size={18} color="#10B981" /> : <Copy size={18} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className={styles.infoCallout}>
          <Info size={24} color="#C5A059" style={{ flexShrink: 0 }} />
          <span className={styles.infoText}>
            <strong>Crucial:</strong> Please use "Freewill" as your transfer narration so our system can log it correctly.
          </span>
        </div>

      </div>
    </>
  );
}
