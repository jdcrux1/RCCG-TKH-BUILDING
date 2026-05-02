import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 'var(--space-md)',
      textAlign: 'center'
    }}>
      <div className="glass-card" style={{ maxWidth: '600px', width: '100%' }}>
        <h1 className="text-gradient" style={{ fontSize: 'var(--space-lg)', marginBottom: 'var(--space-sm)' }}>
          Kingdom Builders
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--space-md)' }}>
          We&apos;re building a monument of faith, together. King&apos;s House Building Project Donor Management System. 
          Manage your pledges, track contributions, and witness our progress together.
        </p>
        
        <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
          <Link href="/login" className="btn-primary">
            Donor Login
          </Link>
          <Link href="/admin/login" style={{ 
            padding: '0.75rem 1.5rem', 
            border: '1px solid var(--glass-border)', 
            borderRadius: 'var(--radius-sm)',
            fontWeight: '600'
          }}>
            &apos;Building the Future, Together&apos;
          </Link>
        </div>
      </div>
      
      <footer style={{ marginTop: 'var(--space-xl)', opacity: 0.5, fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} RCCG The King's House Building Project. Built for Kingdom Advancement.
      </footer>
    </div>
  );
}
