'use client';

import { useState, useTransition } from 'react';
import { logUnmanagedFunds } from '@/app/admin/logUnmanagedFunds';
import styles from './UnmanagedFundsLogger.module.css';
import { Loader2, Zap } from 'lucide-react';

export default function UnmanagedFundsLogger() {
  const [amountStr, setAmountStr] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [narration, setNarration] = useState('');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digits
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setAmountStr('');
      return;
    }
    // Format with commas
    const formatted = new Intl.NumberFormat('en-US').format(parseInt(raw, 10));
    setAmountStr(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const rawAmount = amountStr.replace(/,/g, '');
    if (!rawAmount || parseInt(rawAmount, 10) <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('amount', rawAmount);
        formData.append('transferDate', transferDate);
        formData.append('narration', narration);

        await logUnmanagedFunds(formData);

        setMessage({ text: `Successfully injected ₦${amountStr} into the global pool!`, type: 'success' });
        
        // Reset
        setAmountStr('');
        setNarration('');
        setTransferDate(new Date().toISOString().split('T')[0]);
        
        setTimeout(() => setMessage(null), 5000);
      } catch (err: any) {
        setMessage({ text: err.message || 'Failed to inject funds', type: 'error' });
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Log Freewill / Unmanaged Funds</h2>
        <p className={styles.subtext}>
          Directly inject one-time donations into the global velocity tracker.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Amount (₦)</label>
          <input
            type="text"
            required
            value={amountStr}
            onChange={handleAmountChange}
            placeholder="0"
            className={styles.massiveInput}
            disabled={isPending}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Transfer Date</label>
          <input
            type="date"
            required
            value={transferDate}
            onChange={e => setTransferDate(e.target.value)}
            className={styles.standardInput}
            disabled={isPending}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Narration / Notes</label>
          <input
            type="text"
            value={narration}
            onChange={e => setNarration(e.target.value)}
            placeholder="e.g., Anonymous via GTBank"
            className={styles.standardInput}
            disabled={isPending}
          />
        </div>

        <button type="submit" className={styles.button} disabled={isPending || !amountStr}>
          {isPending ? (
            <><Loader2 size={20} className="animate-spin" /> Injecting...</>
          ) : (
            <><Zap size={20} /> Inject Funds to Global Pool</>
          )}
        </button>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
