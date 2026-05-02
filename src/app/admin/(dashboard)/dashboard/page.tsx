export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Users, TrendingUp, Target, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import AreaChartCSS, { ProgressRing, ProgressBar } from '@/components/GrowthChart';
import Link from 'next/link';

async function getStats() {
  const [totalDonors, contributionsSum, milestones, recentDonors] = await Promise.all([
    prisma.donor.count({ where: { role: 'DONOR' } }),
    prisma.contribution.aggregate({ _sum: { amount: true } }),
    prisma.milestone.findMany({ orderBy: { order: 'asc' } }),
    prisma.donor.findMany({ 
      where: { role: 'DONOR' }, 
      orderBy: { createdAt: 'desc' }, 
      take: 5,
      select: { id: true, name: true, phone: true, tier: true, createdAt: true, monthlyPledge: true }
    })
  ]);

  const totalRaised = BigInt(contributionsSum._sum.amount || 0);
  const target = milestones.reduce((sum, m) => sum + BigInt(m.targetAmount), BigInt(0)) || BigInt(650000000);
  const progressPercent = target > BigInt(0) ? (Number(totalRaised) / Number(target)) * 100 : 0;

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

  // Projection
  const last3Months = monthlyData.slice(-3);
  const avgMonthly = last3Months.reduce((sum, m) => sum + m.amount, 0) / 3;
  const remaining = target - totalRaised;
  const monthsToGoal = avgMonthly > 0 ? Math.ceil(Number(remaining) / avgMonthly) : Infinity;

  // Tier breakdown
  const tierCounts: Record<string, number> = {};
  const allDonors = await prisma.donor.findMany({ where: { role: 'DONOR' }, select: { tier: true } });
  allDonors.forEach(d => {
    tierCounts[d.tier] = (tierCounts[d.tier] || 0) + 1;
  });

  return { 
    totalDonors, 
    totalRaised, 
    progressPercent, 
    tierCounts, 
    target, 
    monthlyData, 
    monthsToGoal, 
    recentDonors,
    milestones 
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { title: 'Total Donors', value: stats.totalDonors, icon: Users, color: '#3b82f6', trend: '+12% this month', positive: true },
    { title: 'Total Raised', value: `₦${(Number(stats.totalRaised) / 100000000).toFixed(1)}M`, icon: TrendingUp, color: '#10b981', trend: '+8.4% growth', positive: true },
    { title: 'Goal Progress', value: `${stats.progressPercent.toFixed(1)}%`, icon: Target, color: '#f59e0b', trend: 'Approaching milestone', positive: true },
    { title: 'Est. Time', value: stats.monthsToGoal === Infinity ? 'TBD' : `${stats.monthsToGoal} Mo`, icon: CreditCard, color: '#8b5cf6', trend: 'Based on velocity', positive: true },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ 
        marginBottom: 'var(--space-lg)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(90deg, rgba(30,41,59,0.5) 0%, rgba(30,41,59,0) 100%)',
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        borderLeft: '4px solid var(--accent)'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.025em', margin: 0 }}>Executive Intelligence</h1>
          <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '4px' }}>Kingdom Builders Campaign Strategy & Analytics</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 'bold', textTransform: 'uppercase' }}>Current Target</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>₦650,000,000</div>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-lg)'
      }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card" style={{ 
              position: 'relative', 
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.title}</p>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>{card.value}</h3>
                </div>
                <div style={{ 
                  background: `${card.color}20`, 
                  padding: '10px', 
                  borderRadius: '12px',
                  color: card.color
                }}>
                  <Icon size={24} />
                </div>
              </div>
              <div style={{ 
                marginTop: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                fontSize: '0.75rem',
                color: card.positive ? '#10b981' : '#ef4444'
              }}>
                {card.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span style={{ fontWeight: '600' }}>{card.trend}</span>
              </div>
              {/* Background Accent */}
              <div style={{ 
                position: 'absolute', 
                bottom: '-20px', 
                right: '-20px', 
                width: '80px', 
                height: '80px', 
                background: card.color, 
                opacity: 0.03, 
                borderRadius: '50%' 
              }} />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        {/* Growth Analytics */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Fulfillment Velocity</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.5 }}>Net contributions analyzed over 6 months</p>
            </div>
            <Activity size={20} style={{ opacity: 0.3 }} />
          </div>
          <div style={{ height: '300px' }}>
            <AreaChartCSS data={stats.monthlyData} />
          </div>
        </div>

        {/* Goal Progress Ring */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.1rem', fontWeight: '700' }}>Overall Milestone Progress</h3>
          <ProgressRing percentage={stats.progressPercent} size={180} strokeWidth={12} />
          <div style={{ marginTop: '24px' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₦{(Number(stats.totalRaised) / 100).toLocaleString()}</div>
          </div>
          <div style={{ width: '100%', marginTop: '24px' }}>
             <ProgressBar percentage={stats.progressPercent} height={12} />
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '8px', opacity: 0.5 }}>
               <span>START</span>
               <span>TARGET: ₦650M</span>
             </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
        {/* Recent Enrollments */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Recent Enrollments</h3>
            <Link href="/admin/donors" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold' }}>VIEW ALL</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '12px 24px', opacity: 0.5, fontWeight: '500' }}>DONOR</th>
                  <th style={{ padding: '12px 24px', opacity: 0.5, fontWeight: '500' }}>TIER</th>
                  <th style={{ padding: '12px 24px', opacity: 0.5, fontWeight: '500' }}>DATE</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentDonors.map((donor, idx) => (
                  <tr key={donor.id} style={{ borderBottom: idx === stats.recentDonors.length - 1 ? 'none' : '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '600' }}>{donor.name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{donor.phone}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        background: 'rgba(99,102,241,0.1)', 
                        color: 'var(--accent)', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        {donor.tier}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', opacity: 0.7 }}>
                      {format(new Date(donor.createdAt), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tier Intelligence */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '700' }}>Tier Analytics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(stats.tierCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([tier, count]) => (
              <div key={tier}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{tier}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent)' }}>{count}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(count / stats.totalDonors) * 100}%`, 
                    height: '100%', 
                    background: 'var(--accent)',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
            {Object.keys(stats.tierCounts).length === 0 && (
              <p style={{ opacity: 0.5, fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>Data initialization pending...</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

