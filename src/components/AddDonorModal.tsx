'use client';

import { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { addDonor } from '@/app/admin/actions';
import { useToast } from '@/components/Toast';
import styles from './AddDonorModal.module.css';

export default function AddDonorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
                  await addDonor(formData);
                  showToast('Donor Saved');
                  setIsOpen(false);
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
                  <option value="1000" className={styles.selectOption}>Supporter (₦1,000)</option>
                </select>
              </div>



              <button 
                type="submit" 
                className={`btn-primary ${styles.submitButton}`}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Register Kingdom Builder'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
