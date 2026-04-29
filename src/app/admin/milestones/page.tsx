export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Flag, Plus, CheckCircle, Clock } from 'lucide-react';
import { updateMilestone } from '@/app/admin/actions';

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

            <form action={updateMilestone} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="hidden" name="id" value={m.id} />
              <input 
                type="number" 
                name="currentAmount" 
                defaultValue={m.currentAmount}
                style={{
                  width: '120px',
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white'
                }}
              />
              <select 
                name="status" 
                defaultValue={m.status}
                style={{
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white'
                }}
              >
                <option value="PENDING" style={{ color: 'black' }}>PENDING</option>
                <option value="IN_PROGRESS" style={{ color: 'black' }}>IN_PROGRESS</option>
                <option value="FUNDED" style={{ color: 'black' }}>FUNDED</option>
              </select>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                Update
              </button>
            </form>
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
