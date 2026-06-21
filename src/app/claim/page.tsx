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
              <h3 style={{ fontSize: '0.95rem', color: '#10B981', margin: '0 0 0.5rem 0', fontWeight: 600 }}>What should you do next?</h3>
              <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#aaa', lineHeight: '1.5' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>If you have already set up your password:</strong> You are ready to log in! Simply click the button below to go to the login portal and sign in with your phone number and password.
                </li>
                <li>
                  <strong>If you have not set up your password:</strong> Your link has expired. Please click the support link below to message our Admin Support on WhatsApp for a new invite.
                </li>
              </ul>
              
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#888' }}>
                📞 <strong>Need Help?</strong> Contact Admin Support: {' '}
                <a 
                  href="https://wa.me/2348052039445?text=Hello%20RCCG%20TKH%20Building%20Support%2C%20my%20builder%20activation%20link%20has%20expired.%20Kindly%20help%20me%20generate%20a%20new%20one."
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#10B981', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  Message Support on WhatsApp
                </a>
              </div>
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
