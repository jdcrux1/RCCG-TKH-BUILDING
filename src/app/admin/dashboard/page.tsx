export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Users, TrendingUp, Target, CreditCard } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import GrowthChart from '@/components/GrowthChart';

async function getStats() {
  const totalDonors = await prisma.donor.count({ where: { role: 'DONOR' } });
  const contributions = await prisma.contribution.aggregate({
    _sum: { amount: true }
  });
  const totalRaised = contributions._sum.amount || 0;
  const target = 650000000;
  const progressPercent = (totalRaised / target) * 100;

  // Monthly Trends (Last 6 Months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const monthlySum = await prisma.contribution.aggregate({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: { amount: true }
    });
    
    monthlyData.push({
      month: format(date, 'MMM'),
      amount: monthlySum._sum.amount || 0
    });
  }

  // Projection
  const last3Months = monthlyData.slice(-3);
  const avgMonthly = last3Months.reduce((sum, m) => sum + m.amount, 0) / 3;
  const remaining = target - totalRaised;
  const monthsToGoal = avgMonthly > 0 ? Math.ceil(remaining / avgMonthly) : Infinity;

  // Tier breakdown
  const donors = await prisma.donor.findMany({ where: { role: 'DONOR' } });
  const tierCounts: Record<string, number> = {};
  donors.forEach(d => {
    tierCounts[d.tier] = (tierCounts[d.tier] || 0) + 1;
  });

  return { totalDonors, totalRaised, progressPercent, tierCounts, target, monthlyData, monthsToGoal };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { title: 'Total Donors', value: stats.totalDonors, icon: Users, color: 'var(--secondary)' },
    { title: 'Total Raised', value: `₦${stats.totalRaised.toLocaleString()}`, icon: TrendingUp, color: 'var(--success)' },
    { title: 'Goal Progress', value: `${stats.progressPercent.toFixed(1)}%`, icon: Target, color: 'var(--accent)' },
    { title: 'Est. Completion', value: stats.monthsToGoal === Infinity ? 'TBD' : `${stats.monthsToGoal} Months`, icon: CreditCard, color: 'var(--primary-light)' },
  ];

  return (
    <div>
      <header style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Executive Dashboard</h1>
        <p style={{ opacity: 0.6 }}>Real-time overview of the Kingdom Builders campaign</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-lg)'
      }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div style={{ 
                background: card.color, 
                padding: '12px', 
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={24} color={card.color === 'var(--primary-light)' ? 'white' : 'white'} />
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '2px' }}>{card.title}</p>
                <h3 style={{ fontSize: '1.4rem' }}>{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-md)' }}>
        {/* Progress Chart Placeholder */}
        <div className="glass-card" style={{ minHeight: '300px' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Fulfillment Growth</h3>
          <GrowthChart data={stats.monthlyData} />
          <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.5, marginTop: '12px' }}>Monthly Contribution Trends</p>
        </div>

        {/* Tier Distribution */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Tier Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(stats.tierCounts).map(([tier, count]) => (
              <div key={tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem' }}>{tier}</span>
                <span style={{ 
                  background: 'var(--glass-hover)', 
                  padding: '2px 8px', 
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {count}
                </span>
              </div>
            ))}
            {Object.keys(stats.tierCounts).length === 0 && (
              <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>No donors yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
