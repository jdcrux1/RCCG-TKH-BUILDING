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
            <h2 className={styles.errorText}>Expired or Invalid Link</h2>
            <p className={styles.errorDesc}>This link has already been used or has expired. Please contact an administrator for a new invite.</p>
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
