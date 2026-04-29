export const dynamic = 'force-dynamic';
import { UserPlus, LogOut } from 'lucide-react';
import { addDonor, logout } from '@/app/admin/actions';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function OnboardPage() {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'ONBOARDER')) {
    redirect('/admin/login');
  }

  const tiers = [
    { name: 'Cornerstone Partner', amount: 1000000 },
    { name: 'Pillar Builder', amount: 500000 },
    { name: 'Foundation Stone', amount: 200000 },
    { name: 'Nehemiah Builder', amount: 100000 },
    { name: 'Covenant Partners', amount: 50000 },
    { name: 'Faithful Hand', amount: 20000 },
    { name: 'Open-Heart', amount: 10000 },
    { name: 'Willing Heart', amount: 5000 },
    { name: 'Supporter', amount: 1000 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--primary)', padding: 'var(--space-md)' }}>
      <header style={{
        maxWidth: '600px',
        margin: '0 auto var(--space-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserPlus color="var(--accent)" /> Onboard New Donor
        </h1>
        <form action={logout}>
          <button type="submit" style={{ background: 'transparent', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </form>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="glass-card">
          <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>
            Enter the details from the donor's paper card. All fields are required.
          </p>

          <form action={addDonor} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Full Name</label>
              <input 
                name="name" 
                type="text" 
                placeholder="e.g. John Doe" 
                required 
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Phone Number</label>
              <input 
                name="phone" 
                type="tel" 
                placeholder="e.g. 080XXXXXXXX" 
                required 
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Monthly Pledge Level</label>
              <select 
                name="monthlyPledge" 
                required 
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="" disabled selected>Select a tier...</option>
                {tiers.map(t => (
                  <option key={t.name} value={t.amount} style={{ color: 'black' }}>
                    ₦{t.amount.toLocaleString()} - {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--accent)', textAlign: 'center' }}>
                The donor will receive a SMS/Notification with their login PIN once added.
              </p>
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: 'var(--space-sm)' }}>
              Add Donor to System
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
