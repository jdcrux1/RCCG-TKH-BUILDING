'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, CheckCircle, Heart } from 'lucide-react';
import styles from './QuickGiveModal.module.css';

export default function QuickGiveModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const accNumber = "0130430547";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
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
        <Heart size={20} color="#F59E0B" /> Quick Give
      </button>

      {mounted && typeof document !== 'undefined' && createPortal(
        <div className={`${styles.modalOverlay} ${isOpen ? styles.open : ''}`} onClick={() => setIsOpen(false)}>
          <div className={styles.modalShell} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.header}>
              <h2 className={styles.modalTitle}>Quick Give</h2>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <span className={styles.scripture}>
              "God loves a cheerful giver." — 2 Cor 9:7
            </span>

            <p className={styles.microCopy}>
              Every seed matters. Use the details below for a direct, one-time freewill offering to support the vision.
            </p>

            <div className={styles.accountCard}>
              <div className={styles.bankDetails}>
                <span className={styles.bankName}>HAGGAI MORTGAGE BANK</span>
                <span className={styles.accountName}>RCCG The King's House</span>
              </div>

              <div className={styles.numberStrip}>
                <span className={styles.accountNumber}>{accNumber}</span>
                <button className={styles.copyBtn} onClick={handleCopy}>
                  {copied ? <CheckCircle size={18} color="#10B981" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.narrationNote}>
              Note: Please use "Freewill" as your transfer narration.
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
