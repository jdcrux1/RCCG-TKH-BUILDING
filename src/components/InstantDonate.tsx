'use client';

import { useState } from 'react';
import { Landmark, Copy, CheckCircle, Send, ArrowRight } from 'lucide-react';
import styles from './InstantDonate.module.css';
import { submitFastTrackSeed } from '@/app/fast-track-actions';

export default function InstantDonate() {
  const [copied, setCopied] = useState(false);
  const [isFastTrackOpen, setIsFastTrackOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accNumber = "0130430547";

  const handleCopy = () => {
    navigator.clipboard.writeText(accNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitFastTrackSeed(formData);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'An error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.quickGiveCard}>
      <div className={styles.glow} />

      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          <Landmark size={20} color="black" />
        </div>
        <h3 className={styles.title}>Direct Transfer</h3>
      </div>
      
      <span className={styles.scripture}>
        &quot;God loves a cheerful giver.&quot; &mdash; 2 Cor 9:7
      </span>
      
      <p className={styles.microCopy}>
        Use the details below to securely transfer your seed. We are incredibly grateful for your generosity!
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
      
      {!isFastTrackOpen && (
        <button 
          onClick={() => setIsFastTrackOpen(true)}
          className={styles.fastTrackToggle}
        >
          I have made a transfer <ArrowRight size={16} />
        </button>
      )}

      {isFastTrackOpen && (
        <div className={styles.fastTrackContainer}>
          <h4 className={styles.fastTrackTitle}>Fast-Track Seed Log</h4>
          <p className={styles.fastTrackDesc}>Securely log your transfer without logging in. Just enter your registered phone number.</p>
          
          {success ? (
            <div className={styles.successMessage}>
              <CheckCircle size={32} color="var(--success)" />
              <p>Your seed has been logged securely and is pending verification. God bless you!</p>
              <button type="button" className={styles.closeBtn} onClick={() => { setIsFastTrackOpen(false); setSuccess(false); }}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.fastTrackForm}>
              {error && <div className={styles.errorMessage}>{error}</div>}
              
              <div className={styles.inputGroup}>
                <label>Registered Phone Number</label>
                <input type="tel" name="phone" placeholder="e.g. 08012345678" required />
              </div>

              <div className={styles.inputGroup}>
                <label>Amount Transferred (₦)</label>
                <input type="number" name="amount" placeholder="e.g. 50000" min="100" required />
              </div>

              <div className={styles.inputGroup}>
                <label>Date of Transfer</label>
                <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Logging...' : <><Send size={16} /> Log Seed Securely</>}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
