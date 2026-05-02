'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Key, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import styles from './login.module.css';

export default function UnifiedLogin() {
  // Step 1: Identifier
  const [identifier, setIdentifier] = useState('');
  
  // Step 2: Credential & Role
  const [credential, setCredential] = useState('');
  const [role, setRole] = useState<string | null>(null);
  
  // State
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const router = useRouter();

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (res.ok && data.role) {
        startTransition(() => {
          setRole(data.role);
          setStep(2);
          setCredential('');
        });
      } else {
        setError(data.error || 'Account not found');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim() || !role) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, credential, role }),
      });

      const data = await res.json();

      if (res.ok && data.redirectUrl) {
        startTransition(() => {
          router.push(data.redirectUrl);
        });
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    startTransition(() => {
      setStep(1);
      setRole(null);
      setCredential('');
      setError('');
    });
  };

  const renderStep2Input = () => {
    if (role === 'DONOR') {
      return (
        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Enter 4-Digit PIN"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
            className={styles.input}
            style={{ paddingLeft: '1rem', textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.2rem' }}
            maxLength={4}
            pattern="\d{4}"
          />
        </div>
      );
    }

    if (role === 'SUPERADMIN') {
      return (
        <div className={styles.inputGroup}>
          <Key size={18} className={styles.inputIcon} />
          <input
            type="password"
            placeholder="Enter 3-Word Passphrase"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
            className={styles.input}
          />
        </div>
      );
    }

    // ADMIN, VOLUNTEER
    return (
      <div className={styles.inputGroup}>
        <Lock size={18} className={styles.inputIcon} />
        <input
          type="password"
          placeholder="Enter Password"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          required
          className={styles.input}
        />
      </div>
    );
  };

  const getRoleTitle = () => {
    if (role === 'DONOR') return 'Donor Verification';
    if (role === 'SUPERADMIN') return 'Root Access';
    return 'Staff Authentication';
  };

  const getRoleSubtitle = () => {
    if (role === 'DONOR') return 'Enter your secure PIN to continue';
    if (role === 'SUPERADMIN') return 'Enter master passphrase';
    return 'Enter your password to continue';
  };

  const isBusy = loading || isPending;

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.brand}>The King&apos;s House</div>
        <h1 className={styles.heading}>Building a Legacy Together</h1>
        <p className={styles.message}>
          Partner with us as we lay the foundation for RCCG The King&apos;s House. 
          Your generous contributions are instrumental in transforming this vision into reality. 
          Log in to track your pledges, view milestones, and see the impact of your support.
        </p>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>₦650 Million</span>
            <span className={styles.statLabel}>Target Goal</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>100%</span>
            <span className={styles.statLabel}>Commitment</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper} data-role={role || 'DEFAULT'}>
            {role === 'SUPERADMIN' ? <Key size={30} color="white" /> : 
             role === 'DONOR' ? <User size={30} color="white" /> : 
             <Lock size={30} color="white" />}
          </div>
          <h2 className={styles.title}>
            {step === 1 ? 'Unified Portal' : getRoleTitle()}
          </h2>
          <p className={styles.subtitle}>
            {step === 1 ? 'Enter your identity to continue' : getRoleSubtitle()}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleIdentify} className={styles.form}>
            <div className={styles.inputGroup}>
              <User size={18} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Phone Number or Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className={styles.input}
                autoFocus
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button} disabled={isBusy}>
              {isBusy ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className={styles.form}>
            {renderStep2Input()}

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button} disabled={isBusy}>
              {isBusy ? <Loader2 className="animate-spin" /> : <>Access Dashboard <ArrowRight size={18} /></>}
            </button>
            
            <button type="button" onClick={handleBack} className={styles.backBtn} disabled={isBusy}>
              <ArrowLeft size={16} /> Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
