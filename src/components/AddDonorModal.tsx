'use client';

import { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { addDonor } from '@/app/admin/actions';
import { useToast } from '@/components/Toast';
import styles from './AddDonorModal.module.css';

export default function AddDonorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{pin: string, donorRefId: string} | null>(null);
  const { showToast } = useToast();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary" 
        style={{ padding: '0.5rem 1rem' }}
      >
        <UserPlus size={18} /> Add Donor
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`glass-card ${styles.modalContent}`}>
            <button 
              onClick={() => !loading && setIsOpen(false)}
              disabled={loading}
              className={styles.closeButton}
            >
              <X size={24} />
            </button>

            <h2 className={styles.title}>Register New Donor</h2>
            
            <form 
              action={async (formData) => {
                setLoading(true);
                try {
                  const result = await addDonor(formData);
                  if (result?.success) {
                    setSuccessData({ pin: result.pin, donorRefId: result.donorRefId });
                    showToast('Donor Registered Successfully');
                  }
                } catch (e: unknown) {
                  showToast((e as Error).message || 'Error saving donor', 'error');
                } finally {
                  setLoading(false);
                }
              }}
              className={styles.form}
            >
              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name</label>
                <input 
                  name="name" 
                  required 
                  placeholder="e.g. John Doe"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Phone Number (Verified)</label>
                <input 
                  name="phone" 
                  required 
                  placeholder="e.g. 08012345678"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Monthly Pledge Tier</label>
                <select 
                  name="monthlyPledge" 
                  required 
                  defaultValue=""
                  className={styles.input}
                >
                  <option value="" disabled className={styles.selectOption}>Select a pledge tier</option>
                  <option value="1000000" className={styles.selectOption}>Cornerstone Partner (₦1,000,000)</option>
                  <option value="500000" className={styles.selectOption}>Pillar Builder (₦500,000)</option>
                  <option value="200000" className={styles.selectOption}>Foundation Stone (₦200,000)</option>
                  <option value="100000" className={styles.selectOption}>Nehemiah Builder (₦100,000)</option>
                  <option value="50000" className={styles.selectOption}>Covenant Partners (₦50,000)</option>
                  <option value="20000" className={styles.selectOption}>Faithful Hand (₦20,000)</option>
                  <option value="10000" className={styles.selectOption}>Open-Heart (₦10,000)</option>
                  <option value="5000" className={styles.selectOption}>Willing Heart (₦5,000)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem', padding: '12px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent)', textAlign: 'center', margin: 0 }}>
                  Note: A random login PIN will be generated automatically.
                </p>
              </div>



              <button 
                type="submit" 
                className={`btn-primary ${styles.submitButton}`}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Register Kingdom Builder'}
              </button>
            </form>

            {successData && (
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid #10b981', 
                borderRadius: 'var(--radius-sm)' 
              }}>
                <h4 style={{ color: '#10b981', marginBottom: '8px' }}>Success! Credentials:</h4>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                    <span>Donor ID:</span>
                    <span style={{ fontWeight: 'bold' }}>{successData.donorRefId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                    <span>Login PIN:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent)', letterSpacing: '2px' }}>{successData.pin}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSuccessData(null);
                    setIsOpen(false);
                  }}
                  style={{ width: '100%', marginTop: '12px', padding: '8px', background: 'transparent', border: '1px solid #10b981', color: '#10b981', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
