export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import styles from './milestones.module.css';

export default async function MilestoneManagement() {
  const milestones = await prisma.milestone.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <div className={styles.dashboardShell}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.mainTitle}>Construction Milestones</h1>
          <p className={styles.subtitle}>Executive read-only view of structural phases and funding progress.</p>
        </div>
      </header>

      <div className={styles.milestonesBentoCard}>
        {milestones.map((m) => {
          const current = Number(m.currentAmount) / 100;
          const target = Number(m.targetAmount) / 100;
          const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

          const statusClass =
            m.status === 'FUNDED' ? styles.statusFunded
            : m.status === 'IN_PROGRESS' ? styles.statusActive
            : styles.statusPending;

          const fillClass =
            m.status === 'FUNDED' ? styles.fillFunded
            : m.status === 'IN_PROGRESS' ? styles.fillActive
            : styles.fillDefault;

          return (
            <div key={m.id} className={styles.milestoneRow}>
              {/* Column 1: Phase Name + Status Pill */}
              <div className={styles.phaseInfo}>
                <h3 className={styles.phaseName}>{m.title}</h3>
                <span className={`${styles.statusPill} ${statusClass}`}>
                  {m.status.replace('_', ' ')}
                </span>
              </div>

              {/* Column 2: Visual Progress Bar */}
              <div className={styles.progressColumn}>
                <span className={styles.progressLabel}>{percentage.toFixed(1)}%</span>
                <div className={styles.progressTrack}>
                  <div
                    className={`${styles.progressFill} ${fillClass}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Column 3: Financials */}
              <div className={styles.financials}>
                <span className={styles.currentAmount}>₦{current.toLocaleString()}</span>
                <span className={styles.goalAmount}>of ₦{target.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
        {milestones.length === 0 && (
          <div className={styles.emptyState}>
            No milestones defined. Seed the database to get started.
          </div>
        )}
      </div>
    </div>
  );
}
