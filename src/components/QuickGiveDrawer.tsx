'use client';

import { useState, useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import InstantDonate from './InstantDonate';
import styles from './QuickGiveDrawer.module.css';

export default function QuickGiveDrawer() {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      <button className={styles.triggerBtn} onClick={() => setIsOpen(true)}>
        Quick Give (Transfer)
      </button>

      <div className={`${styles.drawerOverlay} ${isOpen ? styles.open : ''}`} onClick={() => setIsOpen(false)} />
      
      <div className={`${styles.drawerContent} ${isOpen ? styles.open : ''}`}>
        <div className={styles.closeHeader}>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <InstantDonate />
      </div>
    </>
  );
}
