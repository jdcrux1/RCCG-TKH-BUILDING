'use client';

import { useState, useTransition } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './claim.module.css';
import { claimAccount } from './actions';
import { useRouter } from 'next/navigation';

export default function ClaimForm({ token, name }: { token: string, name: string }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    setError('');

    startTransition(async () => {
      try {
        await claimAccount(token, password);
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to claim account');
      }
    });
  };

  return (
    <div className={styles.bentoCard}>
      <h1 className={styles.welcomeTitle}>Welcome, {name.split(' ')[0]}!</h1>
      <p className={styles.welcomeText}>
        Set up your private password to secure your Kingdom Builders dashboard.
      </p>

      {error && <p style={{ color: '#EF4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Create Password</label>
          <div className={styles.inputWrapper}>
            <input 
              type={showPassword ? "text" : "password"} 
              className={styles.darkInput}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className={styles.toggleBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm Password</label>
          <div className={styles.inputWrapper}>
            <input 
              type={showPassword ? "text" : "password"} 
              className={styles.darkInput}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isPending}>
          {isPending ? 'Securing Account...' : 'Set Password & Login'}
        </button>
      </form>
    </div>
  );
}
