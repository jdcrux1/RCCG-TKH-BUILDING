export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Flag, Plus, CheckCircle, Clock } from 'lucide-react';


export default async function MilestoneManagement() {
  const milestones = await prisma.milestone.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <div>
      <header style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Construction Milestones</h1>
        <p style={{ opacity: 0.6 }}>Track and update funding for key project phases</p>
      </header>

      <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
        {milestones.map((m) => (
          <div key={m.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                background: m.status === 'FUNDED' ? 'var(--success)' : m.status === 'IN_PROGRESS' ? 'var(--accent)' : 'var(--primary-light)',
                padding: '10px',
                borderRadius: '8px'
              }}>
                <Flag size={20} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>{m.title}</h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Goal: ₦{m.targetAmount.toLocaleString()} • Current: ₦{m.currentAmount.toLocaleString()}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ 
                padding: '0.2rem 0.6rem', 
                borderRadius: 'var(--radius-sm)', 
                fontSize: '0.8rem',
                background: m.status === 'FUNDED' ? 'rgba(var(--success-rgb), 0.2)' : m.status === 'IN_PROGRESS' ? 'rgba(var(--accent-rgb), 0.2)' : 'rgba(255,255,255,0.1)',
                color: m.status === 'FUNDED' ? 'var(--success)' : m.status === 'IN_PROGRESS' ? 'var(--accent)' : 'white',
              }}>
                {m.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
        {milestones.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
            <p>No milestones defined. Seed the database to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
