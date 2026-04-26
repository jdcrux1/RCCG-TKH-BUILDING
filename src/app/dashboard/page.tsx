import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TrendingUp, Target, Award, CheckCircle2 } from 'lucide-react';

async function getDonorData() {
  const session = await getSession();
  if (!session) redirect('/login');

  const donor = await prisma.donor.findUnique({
    where: { id: session.userId },
    include: { contributions: true }
  });

  if (!donor) redirect('/login');

  const totalContributed = donor.contributions.reduce((sum, c) => sum + c.amount, 0);
  const fulfillmentRate = donor.totalPledged > 0 ? (totalContributed / donor.totalPledged) * 100 : 0;

  // Global Stats
  const globalContributions = await prisma.contribution.aggregate({
    _sum: { amount: true }
  });
  const totalRaised = globalContributions._sum.amount || 0;
  const target = 650000000;
  const globalProgress = (totalRaised / target) * 100;

  // Personal contribution vs Global Target
  const personalToGlobalRate = (totalContributed / target) * 100;

  return { donor, totalContributed, fulfillmentRate, totalRaised, target, globalProgress, personalToGlobalRate };
}

export default async function DonorDashboard() {
  const { donor, totalContributed, fulfillmentRate, totalRaised, target, globalProgress, personalToGlobalRate } = await getDonorData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Welcome Section */}
      <section>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome, <span className="text-gold">{donor.name}</span></h1>
        <p style={{ opacity: 0.6 }}>Thank you for being a part of the Kingdom Builders family.</p>
      </section>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 'var(--space-md)' 
      }}>
        {/* Personal Stats */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <div>
              <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Personal Pledge Tier</p>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>{donor.tier}</h3>
            </div>
            <Award size={32} color="var(--accent)" />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Monthly Pledge:</span>
              <span style={{ fontWeight: '600' }}>₦{donor.monthlyPledge.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Total Contributed:</span>
              <span style={{ fontWeight: '600', color: 'var(--success)' }}>₦{totalContributed.toLocaleString()}</span>
            </div>
            
            <div style={{ marginTop: 'var(--space-xs)', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '4px' }}>
                {donor.name.split(' ')[0]}&apos;s Impact on Total Project
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent)' }}>{personalToGlobalRate.toFixed(4)}%</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>of ₦650M Goal</span>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                <span>Pledge Fulfillment</span>
                <span>{fulfillmentRate.toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                <div style={{ 
                  width: `${Math.min(fulfillmentRate, 100)}%`, 
                  height: '100%', 
                  background: 'var(--accent)', 
                  borderRadius: '4px',
                  boxShadow: '0 0 10px var(--accent)'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <div>
              <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Global Church Goal</p>
              <h3 style={{ fontSize: '1.2rem' }}>₦{target.toLocaleString()}</h3>
            </div>
            <Target size={32} color="var(--secondary)" />
          </div>

          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <h4 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{globalProgress.toFixed(1)}%</h4>
            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Funds Raised: ₦{totalRaised.toLocaleString()}</p>
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', marginTop: '12px' }}>
              <div style={{ 
                width: `${Math.min(globalProgress, 100)}%`, 
                height: '100%', 
                background: 'linear-gradient(to right, var(--secondary), var(--accent))', 
                borderRadius: '6px'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Construction Milestones */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Construction Milestones</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'Basement Phase', status: 'FUNDED', target: '₦150M' },
              { name: 'Ground Floor', status: 'IN PROGRESS', target: '₦200M' },
              { name: 'First Floor', status: 'PENDING', target: '₦300M' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={24} color={m.status === 'FUNDED' ? 'var(--success)' : m.status === 'IN PROGRESS' ? 'var(--accent)' : 'rgba(255,255,255,0.2)'} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{m.name}</p>
                  <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Target: {m.target}</p>
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '2px 8px', 
                  borderRadius: 'var(--radius-full)', 
                  background: 'var(--glass-hover)',
                  opacity: 0.8
                }}>{m.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Recent Updates</h3>
          <div style={{ opacity: 0.5, textAlign: 'center', padding: '2rem' }}>
            <TrendingUp size={40} style={{ marginBottom: '12px' }} />
            <p>Stay tuned for project updates and milestones.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
