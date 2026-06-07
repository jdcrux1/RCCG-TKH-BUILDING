'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Clipboard, ArrowRight } from 'lucide-react';
import { approvePaymentClaimAdmin, rejectPaymentClaimAdmin } from '@/app/admin/actions';
import { useToast } from '@/components/Toast';

type Donor = {
  name: string;
  donorRefId: string | null;
  phone: string;
};

type PaymentClaim = {
  id: string;
  amount: number;
  date: Date;
  bankName: string | null;
  status: string;
  donor: Donor;
};

export default function PendingClaims({ initialClaims }: { initialClaims: PaymentClaim[] }) {
  const [claims, setClaims] = useState<PaymentClaim[]>(initialClaims);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  const handleApprove = async (claimId: string) => {
    if (!confirm('Approve this payment claim? This will automatically update the ledger and recalculate milestones.')) return;
    setProcessingId(claimId);
    try {
      const res = await approvePaymentClaimAdmin(claimId);
      if (res.success) {
        showToast('Payment Claim Approved Successfully');
        setClaims(prev => prev.filter(c => c.id !== claimId));
        router.refresh();
      } else {
        showToast(res.error || 'Failed to approve claim', 'error');
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (claimId: string) => {
    if (!confirm('Reject this payment claim?')) return;
    setProcessingId(claimId);
    try {
      const res = await rejectPaymentClaimAdmin(claimId);
      if (res.success) {
        showToast('Payment Claim Rejected', 'success');
        setClaims(prev => prev.filter(c => c.id !== claimId));
        router.refresh();
      } else {
        showToast(res.error || 'Failed to reject claim', 'error');
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="glass-card" style={{ marginTop: 'var(--space-md)' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}></span>
        Pending Verifications
      </h3>
      <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: 'var(--space-md)' }}>
        Verify bank receipts against incoming bank statement records.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
        {claims.length > 0 ? claims.map((claim) => (
          <div 
            key={claim.id} 
            style={{ 
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              opacity: processingId === claim.id ? 0.6 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{claim.donor.name}</h4>
                <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>ID: {claim.donor.donorRefId || 'N/A'} • {claim.donor.phone}</p>
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                ₦{(Number(claim.amount) / 100).toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.75rem', opacity: 0.6, background: 'rgba(0,0,0,0.1)', padding: '6px 10px', borderRadius: '4px' }}>
              <span><strong>Bank:</strong> {claim.bankName || 'N/A'}</span>
              <span><strong>Date:</strong> {new Date(claim.date).toLocaleDateString()}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                disabled={processingId !== null}
                onClick={() => handleReject(claim.id)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  border: '1px solid var(--danger)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  gap: '4px',
                  minHeight: '44px',
                  cursor: 'pointer'
                }}
              >
                <X size={14} /> Reject
              </button>
              <button
                disabled={processingId !== null}
                onClick={() => handleApprove(claim.id)}
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--success)',
                  border: '1px solid var(--success)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  gap: '4px',
                  minHeight: '44px',
                  cursor: 'pointer'
                }}
              >
                <Check size={14} /> Verify & Log
              </button>
            </div>
          </div>
        )) : (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', opacity: 0.3, border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ fontSize: '0.85rem' }}>All verifications clear! No pending claims.</p>
          </div>
        )}
      </div>
    </div>
  );
}
