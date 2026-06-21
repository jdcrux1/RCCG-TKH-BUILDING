import { prisma } from '@/lib/prisma';
import ClaimForm from './ClaimForm';
import styles from './claim.module.css';

export default async function ClaimPage({ searchParams }: { searchParams: { token?: string } }) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token;

  if (!token) {
    return (
      <div className={styles.claimPage}>
        <div className={styles.bentoCard}>
          <div className={styles.errorState}>
            <h2 className={styles.errorText}>Invalid Link</h2>
            <p className={styles.errorDesc}>This claim link is invalid or missing the secure token.</p>
          </div>
        </div>
      </div>
    );
  }

  const donor = await prisma.donor.findUnique({
    where: { claimToken: token }
  });

  if (!donor || donor.isClaimed || !donor.claimTokenExpires || donor.claimTokenExpires < new Date()) {
    return (
      <div className={styles.claimPage}>
        <div className={styles.bentoCard}>
          <div className={styles.errorState}>
            <h2 className={styles.errorText}>Link Expired or Already Claimed</h2>
            <p className={styles.errorDesc} style={{ marginBottom: '1.5rem' }}>
              This invitation link has either expired (links are valid for 90 days) or has already been used to set up your account.
            </p>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#10B981', margin: '0 0 0.5rem 0', fontWeight: 600 }}>Already Set Up Your Password?</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', lineHeight: 1.4 }}>
                If you have already claimed this link and set up your private login password/PIN, you do not need a new link. Simply click below to go to the login portal and enter your credentials to access your dashboard.
              </p>
            </div>

            <a 
              href="/login" 
              style={{
                display: 'inline-block',
                background: '#10B981',
                color: '#000',
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'background 0.2s'
              }}
            >
              Go to Login Portal
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.claimPage}>
      <ClaimForm token={token} name={donor.name} />
    </div>
  );
}
