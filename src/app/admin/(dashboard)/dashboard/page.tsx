export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Users, TrendingUp, Target, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import AreaChartCSS, { ProgressRing } from '@/components/GrowthChart';
import Link from 'next/link';
import styles from './dashboard.module.css';

async function getStats() {
  const TARGET_KOBO = BigInt(65000000000);

  const [totalDonors, contributionsSum, recentClaims] = await Promise.all([
    prisma.donor.count({ where: { role: 'DONOR' } }),
    prisma.contribution.aggregate({ _sum: { amount: true } }),
    prisma.paymentClaim.findMany({
      where: { status: { in: ['PENDING', 'APPROVED'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { donor: { select: { name: true, phone: true, tier: true } } }
    })
  ]);

  const totalRaised = BigInt(contributionsSum._sum.amount || 0);
  const progressPercent = (Number(totalRaised) / Number(TARGET_KOBO)) * 100;

  // Monthly Trends (Last 6 Months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const monthlySum = await prisma.contribution.aggregate({
      where: { date: { gte: start, lte: end } },
      _sum: { amount: true }
    });
    
    monthlyData.push({
      month: format(date, 'MMM'),
      amount: Number(monthlySum._sum.amount || BigInt(0))
    });
  }

  // Tier Breakdown Analytics (including Unmanaged/Anonymous)
  const allContributions = await prisma.contribution.findMany({
    include: { donor: { select: { tier: true } } }
  });

  const tierTotals: Record<string, bigint> = {};
  let unmanagedTotal = BigInt(0);

  allContributions.forEach(c => {
    if (c.isConcierge) {
      unmanagedTotal += BigInt(c.amount);
    } else {
      const tier = c.donor?.tier || 'Unknown';
      tierTotals[tier] = (tierTotals[tier] || BigInt(0)) + BigInt(c.amount);
    }
  });

  if (unmanagedTotal > BigInt(0)) {
    tierTotals['Unmanaged/Anonymous'] = unmanagedTotal;
  }

  // Calculate 30-day velocity
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const velocitySum = await prisma.contribution.aggregate({
    where: { date: { gte: thirtyDaysAgo } },
    _sum: { amount: true }
  });
  const currentMonthlyVelocity = BigInt(velocitySum._sum.amount || 0);
  const remainingBalance = TARGET_KOBO - totalRaised;

  let monthsToTargetStr = '';
  let velocitySubtext = '';
  let velocityPositive = true;

  if (currentMonthlyVelocity === BigInt(0)) {
    monthsToTargetStr = 'Stalled';
    velocitySubtext = 'Requires Action (₦0 this month)';
    velocityPositive = false;
  } else {
    // Prevent negative remaining balance returning negative months
    if (remainingBalance <= BigInt(0)) {
      monthsToTargetStr = 'Goal Reached!';
      velocitySubtext = `Based on ₦${(Number(currentMonthlyVelocity) / 100).toLocaleString()} raised this month`;
    } else {
      const months = Number(remainingBalance) / Number(currentMonthlyVelocity);
      monthsToTargetStr = `${Math.ceil(months)} Months`;
      velocitySubtext = `Based on ₦${(Number(currentMonthlyVelocity) / 100).toLocaleString()} raised this month`;
    }
  }

  return { 
    totalDonors, 
    totalRaised, 
    progressPercent, 
    tierTotals, 
    target: TARGET_KOBO, 
    monthlyData, 
    monthsToTargetStr,
    velocitySubtext,
    velocityPositive,
    recentClaims
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { title: 'Total Donors', value: stats.totalDonors, icon: Users, color: '#3b82f6', trend: 'Active participants', positive: true },
    { title: 'Total Raised', value: `₦${(Number(stats.totalRaised) / 100000000).toFixed(1)}M`, icon: TrendingUp, color: '#10b981', trend: 'Global accumulation', positive: true },
    { title: 'Goal Progress', value: `${stats.progressPercent.toFixed(1)}%`, icon: Target, color: '#f59e0b', trend: 'Approaching milestone', positive: true },
    { title: 'Est. Time to Goal', value: stats.monthsToTargetStr, icon: CreditCard, color: '#8b5cf6', trend: stats.velocitySubtext, positive: stats.velocityPositive },
  ];

  return (
    <div className={styles.dashboardShell}>
      {/* Header Section */}
      <header className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>Kingdom Builders / Campaign Analytics</div>
          <h1 className={styles.mainTitle}>Executive Overview</h1>
        </div>
        <div className={styles.targetPill}>
          <span className={styles.targetLabel}>Current Target</span>
          <span className={styles.targetAmount}>₦650,000,000</span>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <div className={styles.kpiStrip}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={styles.bentoCard}>
              <div className={styles.kpiLabel}>{card.title}</div>
              <div className={styles.kpiValue}>{card.value}</div>
              <div className={`${styles.kpiTrend} ${card.positive ? styles.kpiPositive : styles.kpiNegative}`}>
                {card.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{card.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.analyticsRow}>
        {/* Growth Analytics */}
        <div className={styles.bentoCard}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>Fulfillment Velocity</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#9CA3AF' }}>Net contributions analyzed over 6 months</p>
            </div>
            <Activity size={18} style={{ color: '#9CA3AF' }} />
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.chartWrapper}>
              <AreaChartCSS data={stats.monthlyData} />
            </div>
          </div>
        </div>

        {/* Goal Progress Ring */}
        <div className={styles.bentoCard}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#fff', textAlign: 'center' }}>Milestone Progress</h3>
          <div className={styles.radialWrapper}>
            <ProgressRing percentage={stats.progressPercent} size={180} strokeWidth={14} />
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>₦{(Number(stats.totalRaised) / 100).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dataTablesRow}>
        {/* Recent Transactions */}
        <div className={styles.bentoCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>Recent Transactions</h3>
            <Link href="/admin/ledger" style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600', textDecoration: 'none' }}>VIEW LEDGER</Link>
          </div>
          <table className={styles.cleanTable}>
            <thead>
              <tr>
                <th>Donor</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentClaims.map((claim) => (
                <tr key={claim.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#fff' }}>{claim.donor.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{claim.donor.tier}</div>
                  </td>
                  <td>
                    <span className={styles.tierBadge} style={{ 
                      background: claim.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: claim.status === 'APPROVED' ? '#10b981' : '#f59e0b',
                      border: claim.status === 'APPROVED' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'
                    }}>{claim.status}</span>
                  </td>
                  <td style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>
                    ₦{(Number(claim.amount) / 100).toLocaleString()}
                  </td>
                  <td style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                    {format(new Date(claim.createdAt), 'MMM dd, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tier Intelligence */}
        <div className={styles.bentoCard}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#fff' }}>Tier Analytics</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {Object.entries(stats.tierTotals)
              .sort(([, a], [, b]) => Number(b) - Number(a))
              .map(([tier, amount]) => {
                const percentage = stats.totalRaised > BigInt(0) ? (Number(amount) / Number(stats.totalRaised)) * 100 : 0;
                return (
                  <div key={tier} className={styles.progressRow}>
                    <div className={styles.progressLabel}>
                      <span className={styles.progressTierName}>{tier}</span>
                      <span className={styles.progressCount}>₦{(Number(amount) / 100).toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
            })}
            {Object.keys(stats.tierTotals).length === 0 && (
              <p style={{ color: '#9CA3AF', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>Data initialization pending...</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}


