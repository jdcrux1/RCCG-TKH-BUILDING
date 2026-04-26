import { prisma } from '@/lib/prisma';
import { Users, TrendingUp, Target, CreditCard } from 'lucide-react';

async function getStats() {
  const totalDonors = await prisma.donor.count({ where: { role: 'DONOR' } });
  const contributions = await prisma.contribution.aggregate({
    _sum: { amount: true }
  });
  const totalRaised = contributions._sum.amount || 0;
  const target = 650000000;
  const progressPercent = (totalRaised / target) * 100;

  // Tier breakdown
  const donors = await prisma.donor.findMany({ where: { role: 'DONOR' } });
  const tierCounts: Record<string, number> = {};
  donors.forEach(d => {
    tierCounts[d.tier] = (tierCounts[d.tier] || 0) + 1;
  });

  return { totalDonors, totalRaised, progressPercent, tierCounts, target };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { title: 'Total Donors', value: stats.totalDonors, icon: Users, color: 'var(--secondary)' },
    { title: 'Total Raised', value: `₦${stats.totalRaised.toLocaleString()}`, icon: TrendingUp, color: 'var(--success)' },
    { title: 'Goal Progress', value: `${stats.progressPercent.toFixed(1)}%`, icon: Target, color: 'var(--accent)' },
    { title: 'Target', value: `₦${stats.target.toLocaleString()}`, icon: CreditCard, color: 'var(--primary-light)' },
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
          <div style={{ 
            height: '200px', 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '10px', 
            padding: '20px 0' 
          }}>
            {/* Mock chart bars */}
            {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
              <div key={i} style={{ 
                flex: 1, 
                height: `${h}%`, 
                background: 'linear-gradient(to top, var(--secondary), transparent)', 
                borderRadius: '4px 4px 0 0' 
              }} />
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.5 }}>Monthly Contribution Trends</p>
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
