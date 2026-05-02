'use client';

import { useState, useTransition, useRef } from 'react';
import { UserPlus, LogOut, CheckCircle2 } from 'lucide-react';
import { addDonor, logout } from '@/app/admin/actions';

interface Tier {
  name: string;
  amount: number;
}

const TIERS: Tier[] = [
  { name: 'Cornerstone Partner', amount: 1000000 },
  { name: 'Pillar Builder', amount: 500000 },
  { name: 'Foundation Stone', amount: 200000 },
  { name: 'Nehemiah Builder', amount: 100000 },
  { name: 'Covenant Partners', amount: 50000 },
  { name: 'Faithful Hand', amount: 20000 },
  { name: 'Open-Heart', amount: 10000 },
  { name: 'Willing Heart', amount: 5000 },
];

export default function OnboardPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{field: string; message: string}[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setSuccess(false);
    setValidationErrors([]);
    
    startTransition(async () => {
      try {
        await addDonor(formData);
        setSuccess(true);
        formRef.current?.reset();
        setTimeout(() => setSuccess(false), 5000);
      } catch (err: any) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.validationErrors) {
            setValidationErrors(parsed.validationErrors);
          } else {
            setError(parsed.message || err.message);
          }
        } catch {
          setError(err.message || 'Failed to add donor. Please try again.');
        }
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  // Get first validation error for a field
  const getFieldError = (field: string) => {
    return validationErrors.find(e => e.field === field)?.message;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--primary)', padding: 'var(--space-md)' }}>
      <header style={{
        maxWidth: '600px',
        margin: '0 auto var(--space-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserPlus color="var(--accent)" /> Onboard New Donor
        </h1>
        <button 
          onClick={handleLogout}
          disabled={isPending}
          style={{ background: 'transparent', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="glass-card">
          <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>
            Enter the details from the donor&apos;s paper card. All fields are required.
          </p>

          {error && (
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-md)' }}>
              <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p>
            </div>
          )}

          {success && (
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 color="#10b981" size={24} />
              <div>
                <p style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Donor Successfully Registered!</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', margin: 0 }}>You can now enter details for the next donor.</p>
              </div>
            </div>
          )}

          <form ref={formRef} action={handleSubmit as any} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Full Name</label>
              <input 
                name="name" 
                type="text" 
                placeholder="e.g. John Doe" 
                required 
                disabled={isPending}
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: getFieldError('name') ? '1px solid var(--danger)' : '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  outline: 'none',
                  opacity: isPending ? 0.6 : 1,
                }}
              />
              {getFieldError('name') && (
                <p style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{getFieldError('name')}</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Phone Number</label>
              <input 
                name="phone" 
                type="tel" 
                placeholder="e.g. 080XXXXXXXX" 
                required 
                disabled={isPending}
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: getFieldError('phone') ? '1px solid var(--danger)' : '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  outline: 'none',
                  opacity: isPending ? 0.6 : 1,
                }}
              />
              {getFieldError('phone') && (
                <p style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{getFieldError('phone')}</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Monthly Pledge Level</label>
              <select 
                name="monthlyPledge" 
                required 
                disabled={isPending}
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: getFieldError('monthlyPledge') ? '1px solid var(--danger)' : '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  outline: 'none',
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                <option value="" disabled style={{ color: '#666' }}>Select a tier...</option>
                {TIERS.map(t => (
                  <option key={t.name} value={t.amount} style={{ color: 'black' }}>
                    ₦{t.amount.toLocaleString()} - {t.name}
                  </option>
                ))}
              </select>
              {getFieldError('monthlyPledge') && (
                <p style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{getFieldError('monthlyPledge')}</p>
              )}
            </div>

            <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--accent)', textAlign: 'center' }}>
                Note: The donor's default login PIN will automatically be set to the <strong>last 4 digits of their phone number</strong>. Please inform them!
              </p>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isPending}
              style={{ 
                justifyContent: 'center', 
                marginTop: 'var(--space-sm)',
                opacity: isPending ? 0.7 : 1,
                cursor: isPending ? 'not-allowed' : 'pointer'
              }}
            >
              {isPending ? 'Saving...' : 'Add Donor to System'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}