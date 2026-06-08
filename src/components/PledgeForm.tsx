'use client';

import { useState } from 'react';
import { VALID_TIERS } from '@/lib/tiers';
import styles from './PledgeForm.module.css';

export default function PledgeForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!name || !phone || !tier) {
      setError('Please fill out all fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/pledge-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, tier })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.successBox}>
        <h3 className={styles.successTitle}>Request Received!</h3>
        <p className={styles.successText}>
          Thank you for joining the Kingdom Builders! Your request has been sent to our team. You will receive a WhatsApp message shortly with your login credentials.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.heading}>Become a Kingdom Builder</h3>
      <p className={styles.subheading}>
        Fill out this form to request your unique Donor ID and start your monthly pledge.
      </p>

      {error && <div className={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="John Doe"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>WhatsApp Number</label>
          <input 
            type="tel" 
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+234 800 000 0000"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Select Your Tier</label>
          <select 
            value={tier}
            onChange={e => setTier(e.target.value)}
            className={styles.input}
          >
            <option value="" disabled>-- Select a Tier --</option>
            {VALID_TIERS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`${styles.submitBtn} magneticButton`}
        >
          {isSubmitting ? 'SUBMITTING...' : 'JOIN THE VISION'}
        </button>
      </form>
    </div>
  );
}
